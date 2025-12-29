import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { MembershipLevelService } from '@/features/membership/services/membership-level.service';

// GET /api/admin/membership-levels - Get all membership levels (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') as 'priority' | 'price' | 'name' | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    const levels = await MembershipLevelService.getMembershipLevels({
      sortBy: sortBy || undefined,
      sortOrder: sortOrder || undefined,
    });

    return successResponse(levels);
  } catch (error) {
    console.error('Error fetching membership levels:', error);
    return ApiErrors.internal('Failed to fetch membership levels');
  }
}

// POST /api/admin/membership-levels - Create a new membership level (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const priority = parseInt(formData.get('priority') as string);
    const price = parseFloat(formData.get('price') as string);
    const duration_days = parseInt(formData.get('duration_days') as string);

    if (!name || !slug || isNaN(priority) || isNaN(price) || isNaN(duration_days)) {
      return ApiErrors.validation(
        { fields: 'All fields are required and must be valid' },
        'Invalid input data'
      );
    }

    if (price < 0) {
      return ApiErrors.validation({ price: 'Price must be a positive number' });
    }

    if (duration_days < 1) {
      return ApiErrors.validation({ duration_days: 'Duration must be at least 1 day' });
    }

    const level = await MembershipLevelService.createMembershipLevel({
      name,
      slug,
      priority,
      price,
      duration_days,
    });

    return successResponse(level, 201);
  } catch (error: any) {
    console.error('Error creating membership level:', error);
    if (error.message.includes('already exists')) {
      return ApiErrors.alreadyExists(error.message);
    }
    return ApiErrors.internal('Failed to create membership level');
  }
}
