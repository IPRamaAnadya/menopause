import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { SubscriptionService } from '@/features/membership/services/subscription.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiErrors.unauthorized('Not authenticated');
    }

    if (session.user.role !== 'Administrator' && session.user.role !== 'Moderator') {
      return ApiErrors.forbidden('Insufficient permissions');
    }

    const stats = await SubscriptionService.getSubscriptionStats();
    return successResponse(stats);
  } catch (error) {
    console.error('Error fetching subscription stats:', error);
    return ApiErrors.internal('Failed to fetch subscription stats');
  }
}
