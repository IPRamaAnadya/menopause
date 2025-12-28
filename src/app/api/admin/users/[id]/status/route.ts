import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/features/user-management/services/user-management.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * PATCH /api/admin/users/[id]/status
 * Update user status (ACTIVE/SUSPENDED)
 * Requires authentication and admin role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return ApiErrors.validation({ id }, 'Invalid user ID');
    }

    const body = await request.json();
    const { status } = body;

    if (!status || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      return ApiErrors.validation({ status }, 'Invalid status. Must be ACTIVE or SUSPENDED');
    }

    const user = await UserManagementService.updateUserStatus(userId, status);

    return successResponse({ success: true, user });
  } catch (error) {
    console.error('Error updating user status:', error);
    return ApiErrors.internal('Internal server error');
  }
}
