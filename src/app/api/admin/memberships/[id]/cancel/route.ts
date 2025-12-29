import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { MembershipService } from '@/features/membership/services/membership.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiErrors.unauthorized('Not authenticated');
    }

    if (session.user.role !== 'Administrator' && session.user.role !== 'Moderator') {
      return ApiErrors.forbidden('Insufficient permissions');
    }

    const { id } = await params;
    const membershipId = parseInt(id);

    const membership = await MembershipService.cancelMembership(membershipId);

    return successResponse(membership);
  } catch (error) {
    console.error('Error cancelling membership:', error);
    const message = error instanceof Error ? error.message : 'Failed to cancel membership';
    
    if (message === 'Membership not found') {
      return ApiErrors.notFound(message);
    }
    
    return ApiErrors.badRequest(message);
  }
}
