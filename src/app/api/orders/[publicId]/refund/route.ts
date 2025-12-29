import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderService } from '@/features/orders';
import { successResponse, ApiErrors } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiErrors.unauthorized('Please login to refund order');
    }

    const userId = parseInt(session.user.id);
    const body = await req.json();
    const { reason } = body;

    // Verify user owns this order (or is admin - add role check if needed)
    const order = await orderService.getOrder(params.publicId);
    if (order.userId !== userId) {
      return ApiErrors.forbidden('You do not have access to this order');
    }

    const result = await orderService.refundOrder(params.publicId, reason);

    return successResponse(result);
  } catch (error: any) {
    console.error('Refund order error:', error);
    return ApiErrors.internal(error.message || 'Failed to refund order');
  }
}
