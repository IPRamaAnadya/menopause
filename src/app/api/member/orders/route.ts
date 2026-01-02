import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderService } from '@/features/orders/services/order.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }

    const userId = parseInt(session.user.id);
    
    // Get query parameters
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get('status');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');

    const result = await orderService.getUserOrders(userId, {
      status: status as any,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });

    // Transform data for JSON serialization
    const serializedOrders = result.orders.map(order => ({
      ...order,
      gross_amount: Number(order.grossAmount),
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        orders: serializedOrders,
        total: result.total,
      },
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: { message: error instanceof Error ? error.message : 'Internal server error' },
      },
      { status: 500 }
    );
  }
}
