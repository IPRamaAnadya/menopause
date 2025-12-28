import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArticleService } from '@/features/articles/services/article.service';
import { successResponse, paginatedResponse, ApiErrors } from '@/lib/api-response';

// GET /api/admin/articles - Get all articles (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const locale = request.headers.get('locale') || undefined;
    const { searchParams } = new URL(request.url);
    const publishedOnly = searchParams.get('published') === 'true';
    const categoryId = searchParams.get('categoryId');
    const visibility = searchParams.get('visibility') as any;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const result = await ArticleService.getArticles({ 
      publishedOnly, 
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      visibility,
      search,
      locale,
      page,
      limit,
    });

    return paginatedResponse(result.articles, page, limit, result.total);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return ApiErrors.internal('Failed to fetch articles');
  }
}

// POST /api/admin/articles - Create article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'Administrator') {
      return ApiErrors.unauthorized();
    }

    const formData = await request.formData();
    const image = formData.get('image') as File | null;
    const translationsStr = formData.get('translations') as string;
    const tagsStr = formData.get('tags') as string;
    const categoryId = parseInt(formData.get('category_id') as string);
    const slug = formData.get('slug') as string;
    const visibility = formData.get('visibility') as string;
    const requiredPriority = formData.get('required_priority') as string;
    const isPublished = formData.get('is_published') === 'true';
    const isHighlighted = formData.get('is_highlighted') === 'true';
    const publishedAt = formData.get('published_at') as string;

    const data = {
      category_id: categoryId,
      slug,
      image,
      tags: tagsStr ? JSON.parse(tagsStr) : [],
      visibility,
      required_priority: requiredPriority ? parseInt(requiredPriority) : undefined,
      is_published: isPublished,
      is_highlighted: isHighlighted,
      published_at: publishedAt || undefined,
      translations: JSON.parse(translationsStr),
    };

    const article = await ArticleService.createArticle(data, parseInt(session.user.id));
    return successResponse(article, 201);
  } catch (error) {
    console.error('Error creating article:', error);
    return ApiErrors.internal('Failed to create article');
  }
}
