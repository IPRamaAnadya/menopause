import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { apiResponse } from '@/lib/api-response';
import { EventRegistrationService } from '@/features/event/services/event-registration.service';
import { orderService } from '@/features/orders/services/order.service';
import { OrderType, PaymentProvider, OrderStatus, PaymentStatus, EventRegistrationStatus } from '@/generated/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        apiResponse.error('Unauthorized'),
        { status: 401 }
      );
    }

    const body = await request.json();
    const { event_id, membership_level_id, guest } = body;

    if (!event_id) {
      return NextResponse.json(
        apiResponse.error('event_id is required'),
        { status: 400 }
      );
    }

    // Get base URL from request or environment
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // Validate registration and get price
    const validationResult = await EventRegistrationService.validateRegistration({
      event_id: parseInt(event_id),
      user_id: parseInt(session.user.id),
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
        user_id: parseInt(session.user.id),
        membership_level_id: membership_level_id ? parseInt(membership_level_id) : undefined,
        price: 0,
        status: EventRegistrationStatus.PAID,
        guest,
      });

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

      console.log('[Event Checkout] Order marked as PAID, sending confirmation email');

      // Send confirmation email
      try {
        const registrationWithDetails = await EventRegistrationService.getRegistrationById(registration.id);
        if (registrationWithDetails) {
          await EventRegistrationService.sendRegistrationConfirmationEmail(registrationWithDetails);
        }
      } catch (error) {
        console.error('[Event Checkout] Failed to send confirmation email:', error);
        // Continue anyway - registration is successful
      }

      // Return success response without Stripe URL
      return NextResponse.json(
        apiResponse.success({
          registrationId: registration.id,
          registrationPublicId: registration.public_id,
          orderId: orderResult.order.id,
          free: true,
          redirectUrl: `${baseUrl}/member/events/registration/success?free=true`,
        })
      );
    }

    // Create registration in PENDING status first
    const registration = await EventRegistrationService.createRegistration({
      event_id: parseInt(event_id),
      user_id: parseInt(session.user.id),
      membership_level_id: membership_level_id ? parseInt(membership_level_id) : undefined,
      price,
      status: EventRegistrationStatus.PENDING,
      guest,
    });

    console.log('[Event Checkout] Created registration:', {
      registrationId: registration.id,
      registrationPublicId: registration.public_id,
      price,
    });

    // Create order and payment record BEFORE creating checkout session
    const orderResult = await orderService.createOrder({
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

    console.log('[Event Checkout] Created order and payment:', {
      orderId: orderResult.order.id,
      paymentId: orderResult.payment.id,
      paymentPublicId: orderResult.payment.publicId,
    });

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'hkd',
            unit_amount: formatAmountForStripe(price, 'hkd'),
            product_data: {
              name: `Event Registration: ${translation.title}`,
              description: `${new Date(event.start_date).toLocaleDateString()} - ${translation.short_description || ''}`,
            },
          },
          quantity: 1,
        },
      ],
      client_reference_id: orderResult.order.id.toString(),
      payment_intent_data: {
        metadata: {
          orderId: orderResult.order.id.toString(),
          paymentPublicId: orderResult.payment.publicId,
          event_id: event_id.toString(),
          registration_id: registration.id.toString(),
          registration_public_id: registration.public_id,
          order_type: OrderType.EVENT,
        },
      },
      metadata: {
        order_id: orderResult.order.id.toString(),
        payment_public_id: orderResult.payment.publicId,
        user_id: session.user.id,
        event_id: event_id.toString(),
        registration_id: registration.id.toString(),
        registration_public_id: registration.public_id,
        order_type: OrderType.EVENT,
      },
      success_url: `${baseUrl}/member/events/registration/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/member/events/registration/cancel`,
      customer_email: session.user.email || undefined,
    });

    return NextResponse.json(
      apiResponse.success({
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
        orderId: orderResult.order.id,
        registrationId: registration.id,
        registrationPublicId: registration.public_id,
      })
    );
  } catch (error: any) {
    console.error('[Event Checkout] Error creating checkout session:', error);
    return NextResponse.json(
      apiResponse.error(error.message || 'Failed to create checkout session'),
      { status: 500 }
    );
  }
}
