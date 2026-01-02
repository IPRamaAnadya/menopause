import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderService } from '@/features/orders/services/order.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    const { id: publicId } = await params;

    const order = await orderService.getOrder(publicId);

    if (!order) {
      return NextResponse.json(
        { success: false, error: { message: 'Order not found' } },
        { status: 404 }
      );
    }

    // Verify ownership
    if (order.userId !== userId) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 403 }
      );
    }

    // Transform data for JSON serialization
    const serializedOrder = {
      id: order.id,
      public_id: order.publicId,
      order_number: order.orderNumber,
      type: order.type,
      status: order.status,
      gross_amount: Number(order.grossAmount),
      currency: order.currency,
      breakdown: order.breakdown,
      reference_type: order.referenceType,
      reference_id: order.referenceId,
      created_at: order.createdAt?.toISOString(),
      updated_at: order.updatedAt?.toISOString(),
      paid_at: order.paidAt?.toISOString(),
      expires_at: order.expiresAt?.toISOString(),
      payments: order.payments.map(payment => ({
        id: payment.id,
        provider: payment.provider,
        status: payment.status,
        payment_method: payment.paymentMethod,
      })),
    };

    return NextResponse.json({
      success: true,
      data: serializedOrder,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' },
      },
      { status: 500 }
    );
  }
}
