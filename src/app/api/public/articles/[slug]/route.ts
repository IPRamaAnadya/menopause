import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArticleService } from '@/features/articles/services/article.service';
import { prisma } from '@/lib/prisma';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/public/articles/[slug] - Get single published article by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const locale = request.headers.get('locale') || undefined;
    
    const article = await ArticleService.getArticleBySlug(slug, locale);

    if (!article) {
      return ApiErrors.notFound('Article');
    }

    // Check if article is published
    if (!article.is_published) {
      return ApiErrors.notFound('Article');
    }

    // Check visibility permissions
    const session = await getServerSession(authOptions);
    
    // Get user's highest membership priority if logged in
    let userMaxPriority = 0;
    if (session?.user?.id) {
      const activeMembership = await prisma.memberships.findFirst({
        where: {
          user_id: parseInt(session.user.id),
          status: 'ACTIVE',
          end_date: {
            gte: new Date(),
          },
        },
        include: {
          membership_levels: true,
        },
        orderBy: {
          membership_levels: {
            priority: 'desc',
          },
        },
      });

      if (activeMembership) {
        userMaxPriority = activeMembership.membership_levels.priority;
      }
    }
    
    // Determine if content should be hidden/blurred
    let shouldHide = false;
    
    if (article.visibility === 'PUBLIC') {
      shouldHide = false;
    } else if (article.visibility === 'MEMBER') {
      shouldHide = userMaxPriority === 0;
    } else if (article.visibility === 'PRIORITY') {
      if (!article.required_priority) {
        shouldHide = userMaxPriority === 0;
      } else {
        shouldHide = userMaxPriority < article.required_priority;
      }
    }

    return successResponse({
      ...article,
      hide: shouldHide,
    });
  } catch (error) {
    console.error('Error fetching article:', error);
    return ApiErrors.internal('Failed to fetch article');
  }
}
