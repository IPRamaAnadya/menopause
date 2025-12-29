import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { MembershipService } from '@/features/membership/services/membership.service';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiErrors.unauthorized('Not authenticated');
    }

    // Check if user is admin or moderator
    if (session.user.role !== 'Administrator' && session.user.role !== 'Moderator') {
      return ApiErrors.forbidden('Insufficient permissions');
    }

    const { searchParams } = new URL(req.url);
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10;
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const result = await MembershipService.getAllMemberships({
      page,
      limit,
      status: status as any,
      search,
    });
    
    return successResponse(result);
  } catch (error) {
    console.error('Error fetching memberships:', error);
    return ApiErrors.internal('Failed to fetch memberships');
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiErrors.unauthorized('Not authenticated');
    }

    // Check if user is admin or moderator
    if (session.user.role !== 'Administrator' && session.user.role !== 'Moderator') {
      return ApiErrors.forbidden('Insufficient permissions');
    }

    const body = await req.json();
    const { user_id, membership_level_id, start_date, end_date } = body;

    // Validate required fields
    if (!user_id || !membership_level_id) {
      return ApiErrors.badRequest('User ID and Membership Level ID are required');
    }

    const membership = await MembershipService.createMembership({
      user_id: parseInt(user_id),
      membership_level_id: parseInt(membership_level_id),
      start_date,
      end_date,
    });

    return successResponse(membership, 201);
  } catch (error) {
    console.error('Error creating membership:', error);
    const message = error instanceof Error ? error.message : 'Failed to create membership';
    return ApiErrors.badRequest(message);
  }
}
