import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CategoryService } from '@/features/articles/services/category.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/admin/categories - Get all categories (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const locale = request.headers.get('locale') || undefined;
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const parentId = searchParams.get('parentId');
    
    const categories = await CategoryService.getCategories({ 
      activeOnly, 
      parentId: parentId ? parseInt(parentId) : undefined,
      locale 
    });

    return successResponse(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ApiErrors.internal('Failed to fetch categories');
  }
}

// POST /api/admin/categories - Create category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const category = await CategoryService.createCategory(body);
    return successResponse(category, 201);
  } catch (error) {
    console.error('Error creating category:', error);
    return ApiErrors.internal('Failed to create category');
  }
}
