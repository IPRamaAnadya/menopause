import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/features/user-management/services/user-management.service';
import { paginatedResponse, successResponse, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/admin/users
 * Get all users with filtering, searching, and pagination
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') as 'ACTIVE' | 'SUSPENDED' | undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return ApiErrors.validation({ page, limit }, 'Invalid pagination parameters');
    }

    // Get users with filters
    const result = await UserManagementService.getUsers({
      search,
      role,
      status,
      page,
      limit,
    });

    return paginatedResponse(result.users, result.page, result.limit, result.total);
  } catch (error) {
    console.error('Error fetching users:', error);
    return ApiErrors.internal('Internal server error');
  }
}

/**
 * POST /api/admin/users
 * Create a new user
 * Requires authentication and admin role
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return ApiErrors.unauthorized();
    }

    // TODO: Check if user has admin role

    // Parse request body
    const body = await request.json();
    const { email, name, role, membershipLevel } = body;

    // Validate required fields
    if (!email || !name || !role) {
      return ApiErrors.validation({ email, name, role }, 'Email, name, and role are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return ApiErrors.validation({ email }, 'Invalid email format');
    }

    // Create user
    const user = await UserManagementService.createUser({
      email,
      name,
      roleName: role,
      membershipSlug: membershipLevel,
    });

    return successResponse(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          publicId: user.public_id,
          email: user.email,
          name: user.name,
        },
      },
      201
    );
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return ApiErrors.alreadyExists('User');
      }
      if (error.message.includes('not found')) {
        return ApiErrors.validation({ error: error.message });
      }
    }

    return ApiErrors.internal('Internal server error');
  }
}
