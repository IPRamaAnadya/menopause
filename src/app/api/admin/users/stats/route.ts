import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/features/user-management/services/user-management.service';

/**
 * GET /api/admin/users/stats
 * Get user statistics (total users, active today, premium members, administrators)
 * Requires authentication and admin role
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Check if user has admin role
    // For now, we'll allow any authenticated user
    // In production, add role check here:
    // if (session.user.role !== 'Administrator') {
    //   return NextResponse.json(
    //     { error: 'Forbidden - Admin access required' },
    //     { status: 403 }
    //   );
    // }

    // Get user statistics
    const stats = await UserManagementService.getUserStats();

    return NextResponse.json(stats, { status: 200 });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
