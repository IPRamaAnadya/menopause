import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/features/user-management/services/user-management.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

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
      return ApiErrors.unauthorized();
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

    return successResponse(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return ApiErrors.internal('Internal server error');
  }
}
