import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/admin/membership-levels - Get all membership levels
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Allow any authenticated user to view membership levels
    if (!session?.user) {
      return ApiErrors.unauthorized();
    }

    const membershipLevels = await prisma.membership_levels.findMany({
      orderBy: {
        priority: 'asc', // Order by priority ascending
      },
    });

    return successResponse(membershipLevels);
  } catch (error) {
    console.error('Error fetching membership levels:', error);
    return ApiErrors.internal('Failed to fetch membership levels');
  }
}
