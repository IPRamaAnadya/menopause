import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/features/user-management/services/user-management.service';

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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { resetPassword } = body;

    if (typeof resetPassword !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid resetPassword value. Must be boolean' },
        { status: 400 }
      );
    }

    const user = await UserManagementService.setPasswordReset(userId, resetPassword);

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Error setting password reset:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
