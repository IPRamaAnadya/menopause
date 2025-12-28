import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArticleService } from '@/features/articles/services/article.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/admin/articles/[id] - Get single article
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
    
    const article = await ArticleService.getArticleById(parseInt(id), locale);

    if (!article) {
      return ApiErrors.notFound('Article');
    }

    return successResponse(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return ApiErrors.internal('Failed to fetch article');
  }
}

// PUT /api/admin/articles/[id] - Update article
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
    const image = formData.get('image') as File | null;
    const translationsStr = formData.get('translations') as string;
    const tagsStr = formData.get('tags') as string;
    const categoryId = formData.get('category_id') as string;
    const slug = formData.get('slug') as string;
    const visibility = formData.get('visibility') as string;
    const requiredPriority = formData.get('required_priority') as string;
    const isPublished = formData.get('is_published') === 'true';
    const isHighlighted = formData.get('is_highlighted');
    const publishedAt = formData.get('published_at') as string;

    const data: any = {};
    if (image) data.image = image;
    if (translationsStr) data.translations = JSON.parse(translationsStr);
    if (tagsStr) data.tags = JSON.parse(tagsStr);
    if (categoryId) data.category_id = parseInt(categoryId);
    if (slug) data.slug = slug;
    if (visibility) data.visibility = visibility;
    if (requiredPriority) data.required_priority = parseInt(requiredPriority);
    if (isPublished !== undefined) data.is_published = isPublished;
    if (isHighlighted !== null) data.is_highlighted = isHighlighted === 'true';
    if (publishedAt) data.published_at = publishedAt;

    const article = await ArticleService.updateArticle(parseInt(id), data);
    return successResponse(article);
  } catch (error) {
    console.error('Error updating article:', error);
    return ApiErrors.internal('Failed to update article');
  }
}

// DELETE /api/admin/articles/[id] - Delete article
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
    await ArticleService.deleteArticle(parseInt(id));
    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return ApiErrors.internal('Failed to delete article');
  }
}
