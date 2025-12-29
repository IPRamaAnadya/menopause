import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderService } from '@/features/orders';
import { OrderStatus } from '@/generated/prisma';
import { successResponse, ApiErrors } from '@/lib/api-response';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return ApiErrors.unauthorized('Please login to view orders');
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return ApiErrors.badRequest('Invalid user ID');
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as OrderStatus | null;
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await orderService.getUserOrders(userId, {
      status: status || undefined,
      limit,
      offset,
    });

    return successResponse(result);
  } catch (error: any) {
    console.error('Get user orders error:', error);
    return ApiErrors.internal(error.message || 'Failed to get orders');
  }
}
