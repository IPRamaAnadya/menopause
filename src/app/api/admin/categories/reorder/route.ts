import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CategoryService } from '@/features/articles/services/category.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// POST /api/admin/categories/reorder - Update categories order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const { categories } = await request.json();
    
    if (!Array.isArray(categories)) {
      return ApiErrors.validation({ categories: 'Must be an array' }, 'Invalid categories data');
    }

    await CategoryService.bulkUpdateOrder(categories);
    return successResponse({ success: true });
  } catch (error) {
    console.error('Error reordering categories:', error);
    return ApiErrors.internal('Failed to reorder categories');
  }
}
