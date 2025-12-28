import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/features/user-management/services/user-management.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * PATCH /api/admin/users/[id]/password-reset
 * Set user password reset flag
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
    const { resetPassword } = body;

    if (typeof resetPassword !== 'boolean') {
      return ApiErrors.validation({ resetPassword }, 'Invalid resetPassword value. Must be boolean');
    }

    const user = await UserManagementService.setPasswordReset(userId, resetPassword);

    return successResponse({ success: true, user });
  } catch (error) {
    console.error('Error setting password reset:', error);
    return ApiErrors.internal('Internal server error');
  }
}
