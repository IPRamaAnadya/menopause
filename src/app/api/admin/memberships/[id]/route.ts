import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { MembershipService } from '@/features/membership/services/membership.service';

export async function PUT(
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

    const body = await req.json();
    const { membership_level_id, start_date, end_date, status } = body;

    const membership = await MembershipService.updateMembership(membershipId, {
      ...(membership_level_id && { membership_level_id: parseInt(membership_level_id) }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      ...(status && { status }),
    });

    return successResponse(membership);
  } catch (error) {
    console.error('Error updating membership:', error);
    const message = error instanceof Error ? error.message : 'Failed to update membership';
    
    if (message === 'Membership not found') {
      return ApiErrors.notFound(message);
    }
    
    return ApiErrors.badRequest(message);
  }
}

export async function DELETE(
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

    await MembershipService.deleteMembership(membershipId);

    return successResponse({ message: 'Membership deleted successfully' });
  } catch (error) {
    console.error('Error deleting membership:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete membership';
    
    if (message === 'Membership not found') {
      return ApiErrors.notFound(message);
    }
    
    return ApiErrors.badRequest(message);
  }
}
