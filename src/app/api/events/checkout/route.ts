import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { apiResponse } from '@/lib/api-response';
import { prisma } from '@/lib/prisma';
import { EventRegistrationService } from '@/features/event/services/event-registration.service';
import { orderService } from '@/features/orders/services/order.service';
import { OrderType, PaymentProvider, OrderStatus, PaymentStatus, EventRegistrationStatus } from '@/generated/prisma';

// POST /api/events/checkout - Create event checkout (public endpoint for both guest and member)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { event_id, membership_level_id, guest } = body;

    if (!event_id) {
      return NextResponse.json(
        apiResponse.error('event_id is required'),
        { status: 400 }
      );
    }

    // For guests, require guest info
    if (!session?.user && (!guest || !guest.full_name || !guest.email || !guest.phone)) {
      return NextResponse.json(
        apiResponse.error('Guest information is required for non-authenticated users'),
        { status: 400 }
      );
    }

    // Get base URL from request or environment
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
    const locale = request.headers.get('locale') || 'en';

    // Validate registration and get price
    const validationResult = await EventRegistrationService.validateRegistration({
      event_id: parseInt(event_id),
      user_id: session?.user?.id ? parseInt(session.user.id) : undefined,
      membership_level_id: membership_level_id ? parseInt(membership_level_id) : undefined,
      guest,
    });

    const { event, price } = validationResult;

    // Get event translation for display
    const translation = event.translations.find((t: any) => t.locale === 'en') 
      || event.translations[0];

    if (!translation) {
      return NextResponse.json(
        apiResponse.error('Event translation not found'),
        { status: 404 }
      );
    }

    // Check if price is 0 (free event)
    if (price === 0) {
      console.log('[Event Checkout] Free event detected, processing without payment gateway');
      
      // Create registration with PAID status immediately
      const registration = await EventRegistrationService.createRegistration({
        event_id: parseInt(event_id),
        user_id: session?.user?.id ? parseInt(session.user.id) : undefined,
        membership_level_id: membership_level_id ? parseInt(membership_level_id) : undefined,
        price: 0,
        status: EventRegistrationStatus.PAID,
        guest: !session?.user ? guest : undefined,
      });

      // For free events, only create order for authenticated users
      if (session?.user?.id) {
        // Create order and payment with PAID status for record keeping
        const orderResult = await orderService.createOrder({
          userId: parseInt(session.user.id),
          type: OrderType.EVENT,
          grossAmount: 0,
          currency: 'HKD',
          breakdown: {
            base: 0,
            tax: 0,
            discount: 0,
          },
          metadata: {
            event_id: event_id.toString(),
            registration_id: registration.id.toString(),
            registration_public_id: registration.public_id,
          },
          paymentProvider: PaymentProvider.ADMIN, // Free event uses ADMIN provider
        });

        // Import repositories to update order and payment status
        const { orderRepository } = await import('@/features/orders/repositories/order.repository');
        const { paymentRepository } = await import('@/features/orders/repositories/payment.repository');

        // Mark order as PAID immediately
        await orderRepository.updateStatus(orderResult.order.id, OrderStatus.PAID, new Date());

        // Mark payment as succeeded
        await paymentRepository.updateStatus(orderResult.payment.id, {
          status: PaymentStatus.SUCCEEDED,
          processedAt: new Date(),
        });
      }

      // Send confirmation email
      try {
        const registrationWithDetails = await EventRegistrationService.getRegistrationById(registration.id);
        if (registrationWithDetails) {
          await EventRegistrationService.sendRegistrationConfirmationEmail(registrationWithDetails);
        }
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      return NextResponse.json(
        apiResponse.success({
          registrationPublicId: registration.public_id,
          isFree: true,
        })
      );
    }

    // For paid events, create Stripe checkout session
    console.log('[Event Checkout] Creating Stripe checkout session for paid event');

    // Create pending registration first
    const registration = await EventRegistrationService.createRegistration({
      event_id: parseInt(event_id),
      user_id: session?.user?.id ? parseInt(session.user.id) : undefined,
      membership_level_id: membership_level_id ? parseInt(membership_level_id) : undefined,
      price,
      status: EventRegistrationStatus.PENDING,
      guest: !session?.user ? guest : undefined,
    });

    // Create order (only for authenticated users, guests don't get orders)
    let orderResult;
    if (session?.user?.id) {
      orderResult = await orderService.createOrder({
        userId: parseInt(session.user.id),
        type: OrderType.EVENT,
        grossAmount: price,
        currency: 'HKD',
        breakdown: {
          base: price,
          tax: 0,
          discount: 0,
        },
        metadata: {
          event_id: event_id.toString(),
          registration_id: registration.id.toString(),
          registration_public_id: registration.public_id,
        },
        paymentProvider: PaymentProvider.STRIPE,
      });
    }

    // Validate event slug
    if (!event.slug) {
      return NextResponse.json(
        apiResponse.error('Event slug not found'),
        { status: 400 }
      );
    }

    // Construct URLs
    const successUrl = `${baseUrl}/${locale}/events/${event.slug}/register/success?registration=${registration.public_id}`;
    const cancelUrl = `${baseUrl}/${locale}/events/${event.slug}/register?canceled=true`;

    // Ensure image URL is absolute for Stripe
    let imageUrl: string | undefined = undefined;
    if (event.image_url) {
      if (event.image_url.startsWith('http://') || event.image_url.startsWith('https://')) {
        imageUrl = event.image_url;
      } else if (event.image_url.startsWith('/')) {
        imageUrl = `${baseUrl}${event.image_url}`;
      }
    }

    console.log('[Event Checkout] Creating Stripe session with URLs:', {
      baseUrl,
      locale,
      slug: event.slug,
      successUrl,
      cancelUrl,
      imageUrl,
    });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            product_data: {
              name: translation.title || 'Event Registration',
              description: translation.short_description || 'Event registration fee',
              images: imageUrl ? [imageUrl] : undefined,
            },
            unit_amount: formatAmountForStripe(price, 'hkd'),
          },
          quantity: 1,
        },
      ],
      customer_email: session?.user?.email || guest?.email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        transaction_type: session?.user?.id ? 'event_member' : 'event_guest',
        order_id: orderResult?.order.id.toString() || '',
        payment_id: orderResult?.payment.id.toString() || '',
        registration_id: registration.id.toString(),
        registration_public_id: registration.public_id,
        event_id: event_id.toString(),
        user_id: session?.user?.id || 'guest',
        guest_email: guest?.email || '',
        guest_name: guest?.full_name || '',
      },
    });

    // Update payment with Stripe session ID (only if order exists for authenticated users)
    if (orderResult) {
      await prisma.payments.update({
        where: { id: orderResult.payment.id },
        data: {
          provider_ref: checkoutSession.id,
          provider_payload: {
            stripe_session_id: checkoutSession.id,
          } as any,
        },
      });
    }

    return NextResponse.json(
      apiResponse.success({
        url: checkoutSession.url,
        registrationPublicId: registration.public_id,
      })
    );
  } catch (error) {
    console.error('Error creating event checkout:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        apiResponse.error(error.message),
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      apiResponse.error('Failed to create checkout session'),
      { status: 500 }
    );
  }
}
