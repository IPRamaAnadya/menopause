import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/public/membership-levels - Get all membership levels (public)
export async function GET(request: NextRequest) {
  try {
    const membershipLevels = await prisma.membership_levels.findMany({
      orderBy: {
        priority: 'asc',
      },
      select: {
        id: true,
        name: true,
        priority: true,
        price: true,
        duration_days: true,
        slug: true,
      },
    });

    return successResponse(membershipLevels);
  } catch (error) {
    console.error('Error fetching membership levels:', error);
    return ApiErrors.internal('Failed to fetch membership levels');
  }
}
