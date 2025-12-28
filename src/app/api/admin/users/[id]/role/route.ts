import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/features/user-management/services/user-management.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * PATCH /api/admin/users/[id]/role
 * Update user role
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
    const { role } = body;

    if (!role || !['Administrator', 'Moderator', 'Content Creator', 'Member'].includes(role)) {
      return ApiErrors.validation({ role }, 'Invalid role');
    }

    await UserManagementService.updateUserRole(userId, role);

    return successResponse({ success: true });
  } catch (error) {
    console.error('Error updating user role:', error);
    return ApiErrors.internal(error instanceof Error ? error.message : 'Internal server error');
  }
}
