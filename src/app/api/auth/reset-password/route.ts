import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare, hash } from 'bcryptjs';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * POST /api/auth/reset-password
 * Reset user password
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const { newPassword } = body;

    if (!newPassword) {
      return ApiErrors.validation({ newPassword: 'Required' }, 'New password is required');
    }

    if (newPassword.length < 6) {
      return ApiErrors.validation({ newPassword: 'Must be at least 6 characters' }, 'New password must be at least 6 characters');
    }

    // Get user from database
    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.user.id) },
    });

    if (!user) {
      return ApiErrors.notFound('User');
    }

    // Hash new password
    const hashedPassword = await hash(newPassword, 12);

    // Update password and reset flag
    await prisma.users.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        is_reset_password: false,
      },
    });

    return successResponse({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    return ApiErrors.internal('Internal server error');
  }
}
