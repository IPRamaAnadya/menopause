import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { MembershipLevelService } from '@/features/membership/services/membership-level.service';

// GET /api/admin/membership-levels/[id] - Get a single membership level (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    const level = await MembershipLevelService.getMembershipLevelById(parseInt(id));

    if (!level) {
      return ApiErrors.notFound('Membership level');
    }

    return successResponse(level);
  } catch (error) {
    console.error('Error fetching membership level:', error);
    return ApiErrors.internal('Failed to fetch membership level');
  }
}

// PUT /api/admin/membership-levels/[id] - Update a membership level (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    const formData = await request.formData();
    
    const updateData: any = {};
    
    const name = formData.get('name') as string | null;
    const slug = formData.get('slug') as string | null;
    const priority = formData.get('priority') as string | null;
    const price = formData.get('price') as string | null;
    const duration_days = formData.get('duration_days') as string | null;

    if (name) updateData.name = name;
    if (slug) updateData.slug = slug;
    if (priority) {
      const parsedPriority = parseInt(priority);
      if (isNaN(parsedPriority)) {
        return ApiErrors.validation({ priority: 'Priority must be a valid number' });
      }
      updateData.priority = parsedPriority;
    }
    if (price) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        return ApiErrors.validation({ price: 'Price must be a valid positive number' });
      }
      updateData.price = parsedPrice;
    }
    if (duration_days) {
      const parsedDuration = parseInt(duration_days);
      if (isNaN(parsedDuration) || parsedDuration < 1) {
        return ApiErrors.validation({ duration_days: 'Duration must be at least 1 day' });
      }
      updateData.duration_days = parsedDuration;
    }

    const level = await MembershipLevelService.updateMembershipLevel(parseInt(id), updateData);

    return successResponse(level);
  } catch (error: any) {
    console.error('Error updating membership level:', error);
    if (error.message.includes('already exists')) {
      return ApiErrors.alreadyExists(error.message);
    }
    return ApiErrors.internal('Failed to update membership level');
  }
}

// DELETE /api/admin/membership-levels/[id] - Delete a membership level (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { id } = await params;
    await MembershipLevelService.deleteMembershipLevel(parseInt(id));

    return successResponse({ message: 'Membership level deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting membership level:', error);
    if (error.message.includes('active memberships')) {
      return ApiErrors.badRequest(error.message);
    }
    return ApiErrors.internal('Failed to delete membership level');
  }
}
