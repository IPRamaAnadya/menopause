import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderService } from '@/features/orders';
import { successResponse, ApiErrors } from '@/lib/api-response';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ publicId: string }> }
) {
  try {
    const { publicId } = await params;
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiErrors.unauthorized('Please login to cancel order');
    }

    const userId = parseInt(session.user.id);
    
    // Verify user owns this order
    const order = await orderService.getOrder(publicId);
    if (order.userId !== userId) {
      return ApiErrors.forbidden('You do not have access to this order');
    }

    const result = await orderService.cancelOrder(publicId);

    return successResponse(result);
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return ApiErrors.internal(error.message || 'Failed to cancel order');
  }
}
