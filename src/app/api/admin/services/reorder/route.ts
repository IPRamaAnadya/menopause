import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ServicesService } from '@/features/services/services/services.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// POST /api/admin/services/reorder - Bulk update service order (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();

    if (!body.services || !Array.isArray(body.services)) {
      return ApiErrors.validation({ services: 'Must be an array' }, 'Services array is required');
    }

    // Validate that each item has id and order
    const isValid = body.services.every(
      (item: any) => typeof item.id === 'number' && typeof item.order === 'number'
    );

    if (!isValid) {
      return ApiErrors.validation({ services: 'Each service must have id and order' });
    }

    await ServicesService.bulkUpdateOrder(body.services);

    return successResponse({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error updating service order:', error);
    return ApiErrors.internal('Failed to update service order');
  }
}
