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

    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await SubscriptionService.getSubscriptionActivity({
      page,
      limit,
      status,
      search,
    });
    
    return successResponse(result);
  } catch (error) {
    console.error('Error fetching subscription activity:', error);
    return ApiErrors.internal('Failed to fetch subscription activity');
  }
}
