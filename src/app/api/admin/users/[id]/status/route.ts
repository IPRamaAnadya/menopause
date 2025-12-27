import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/features/user-management/services/user-management.service';

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
    const { status } = body;

    if (!status || !['ACTIVE', 'SUSPENDED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be ACTIVE or SUSPENDED' },
        { status: 400 }
      );
    }

    const user = await UserManagementService.updateUserStatus(userId, status);

    return NextResponse.json({ success: true, user }, { status: 200 });
  } catch (error) {
    console.error('Error updating user status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
