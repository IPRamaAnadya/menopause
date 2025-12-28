import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * GET /api/auth/me
 * Get current user information including role and reset password flag
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return ApiErrors.unauthorized();
    }

    return successResponse({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
      role: (session.user as any).role || 'Member',
      isResetPassword: (session.user as any).isResetPassword || false,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    return ApiErrors.internal('Internal server error');
  }
}
