import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CategoryService } from '@/features/articles/services/category.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/admin/categories/[id] - Get single category
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
    const locale = request.headers.get('locale') || undefined;
    
    const category = await CategoryService.getCategoryById(parseInt(id), locale);

    if (!category) {
      return ApiErrors.notFound('Category');
    }

    return successResponse(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return ApiErrors.internal('Failed to fetch category');
  }
}

// PUT /api/admin/categories/[id] - Update category
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
    const body = await request.json();
    const category = await CategoryService.updateCategory(parseInt(id), body);
    return successResponse(category);
  } catch (error) {
    console.error('Error updating category:', error);
    return ApiErrors.internal('Failed to update category');
  }
}

// DELETE /api/admin/categories/[id] - Delete category
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
    await CategoryService.deleteCategory(parseInt(id));
    return successResponse({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return ApiErrors.internal('Failed to delete category');
  }
}
