import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe, formatAmountForStripe } from '@/lib/stripe';
import { apiResponse } from '@/lib/api-response';
import { MembershipService } from '@/features/membership/services/membership.service';
import { orderService } from '@/features/orders/services/order.service';
import { OrderType, PaymentProvider } from '@/generated/prisma';

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
    const { membership_level_id, operation_type } = body;

    if (!membership_level_id) {
      return NextResponse.json(
        apiResponse.error('membership_level_id is required'),
        { status: 400 }
      );
    }

    if (!operation_type || !['EXTEND', 'UPGRADE', 'DOWNGRADE', 'NEW'].includes(operation_type)) {
      return NextResponse.json(
        apiResponse.error('operation_type must be EXTEND, UPGRADE, DOWNGRADE, or NEW'),
        { status: 400 }
      );
    }

    // Get the membership level
    const levels = await MembershipService.getAvailableMembershipLevels();
    const level = levels.find(l => l.id === parseInt(membership_level_id));

    if (!level) {
      return NextResponse.json(
        apiResponse.error('Membership level not found'),
        { status: 404 }
      );
    }

    // Validate operation
    if (operation_type !== 'NEW') {
      const currentMembership = await MembershipService.getUserActiveMembership(
        parseInt(session.user.id)
      );

      if (!currentMembership) {
        return NextResponse.json(
          apiResponse.error('No active membership found'),
          { status: 400 }
        );
      }

      // Validate upgrade/downgrade
      if (operation_type === 'UPGRADE' && level.priority <= currentMembership.membership_level.priority) {
        return NextResponse.json(
          apiResponse.error('Invalid upgrade: new level must be higher priority'),
          { status: 400 }
        );
      }

      if (operation_type === 'DOWNGRADE' && level.priority >= currentMembership.membership_level.priority) {
        return NextResponse.json(
          apiResponse.error('Invalid downgrade: new level must be lower priority'),
          { status: 400 }
        );
      }
    }

    // Determine order type based on operation
    let orderType: OrderType;
    if (operation_type === 'NEW') {
      orderType = OrderType.MEMBERSHIP_PURCHASE;
    } else if (operation_type === 'EXTEND') {
      orderType = OrderType.MEMBERSHIP_RENEWAL;
    } else {
      orderType = OrderType.MEMBERSHIP_UPGRADE;
    }

    // Get base URL from request or environment
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

    // Create order and payment record BEFORE creating checkout session
    // This allows the webhook to find and update the payment when it succeeds
    const orderResult = await orderService.createOrder({
      userId: parseInt(session.user.id),
      type: orderType,
      grossAmount: level.price,
      currency: 'HKD',
      breakdown: {
        base: level.price,
        tax: 0,
        discount: 0,
      },
      metadata: {
        membership_level_id: membership_level_id.toString(),
        operation_type,
      },
      paymentProvider: PaymentProvider.STRIPE,
    });

    console.log('Created order and payment:', {
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
            unit_amount: formatAmountForStripe(level.price, 'hkd'),
            product_data: {
              name: `${level.name} Membership`,
              description: `${operation_type.toLowerCase()} membership - ${level.duration_days} days`,
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
          membership_level_id: membership_level_id.toString(),
          operation_type,
          order_type: orderType,
        },
      },
      metadata: {
        order_id: orderResult.order.id.toString(),
        payment_public_id: orderResult.payment.publicId,
        user_id: session.user.id,
        membership_level_id: membership_level_id.toString(),
        operation_type,
        order_type: orderType,
      },
      success_url: `${baseUrl}/member/subscription/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/member/subscription/payment/cancel`,
      customer_email: session.user.email || undefined,
    });

    return NextResponse.json(
      apiResponse.success({
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
        orderId: orderResult.order.id,
      })
    );
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      apiResponse.error(error.message || 'Failed to create checkout session'),
      { status: 500 }
    );
  }
}
