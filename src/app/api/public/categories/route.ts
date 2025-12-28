import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/features/articles/services/category.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/public/categories - Get all active categories (public, no auth required)
export async function GET(request: NextRequest) {
  try {
    const locale = request.headers.get('locale') || undefined;
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    
    const categories = await CategoryService.getCategories({ 
      activeOnly: true,
      parentId: parentId ? parseInt(parentId) : undefined,
      locale 
    });

    return successResponse(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return ApiErrors.internal('Failed to fetch categories');
  }
}
