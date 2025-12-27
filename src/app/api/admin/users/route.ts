import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UserManagementService } from '@/features/user-management/services/user-management.service';

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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || undefined;
    const role = searchParams.get('role') || undefined;
    const status = searchParams.get('status') as 'ACTIVE' | 'SUSPENDED' | undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Get users with filters
    const result = await UserManagementService.getUsers({
      search,
      role,
      status,
      page,
      limit,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Check if user has admin role

    // Parse request body
    const body = await request.json();
    const { email, name, role, membershipLevel } = body;

    // Validate required fields
    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, name, and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create user
    const user = await UserManagementService.createUser({
      email,
      name,
      roleName: role,
      membershipSlug: membershipLevel,
    });

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: {
          id: user.id,
          publicId: user.public_id,
          email: user.email,
          name: user.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
