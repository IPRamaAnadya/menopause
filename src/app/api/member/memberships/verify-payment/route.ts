import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { apiResponse } from '@/lib/api-response';
import { MembershipService } from '@/features/membership/services/membership.service';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        apiResponse.error('Unauthorized'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        apiResponse.error('session_id is required'),
        { status: 400 }
      );
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);

    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json(
        apiResponse.error('Payment not completed'),
        { status: 400 }
      );
    }

    const metadata = checkoutSession.metadata;
    if (!metadata) {
      return NextResponse.json(
        apiResponse.error('Invalid session metadata'),
        { status: 400 }
      );
    }

    const { user_id } = metadata;

    // Verify user
    if (user_id !== session.user.id) {
      return NextResponse.json(
        apiResponse.error('Invalid user'),
        { status: 403 }
      );
    }

    // Get the user's updated membership (webhook should have already processed it)
    const membership = await MembershipService.getUserActiveMembership(
      parseInt(user_id)
    );

    return NextResponse.json(
      apiResponse.success({
        membership,
        payment_status: checkoutSession.payment_status,
        message: 'Payment verified successfully. Membership processed by webhook.',
      })
    );
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      apiResponse.error(error.message || 'Failed to verify payment'),
      { status: 500 }
    );
  }
}
