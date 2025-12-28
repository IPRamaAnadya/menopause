import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ArticleService } from '@/features/articles/services/article.service';
import { prisma } from '@/lib/prisma';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/public/articles - Get published articles
export async function GET(request: NextRequest) {
  try {
    const locale = request.headers.get('locale') || undefined;
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search') || undefined;
    const highlightedOnly = searchParams.get('highlighted') === 'true';
    
    // Get session to check user membership for visibility filtering
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
            priority: 'desc', // Get highest priority membership (4 is highest)
          },
        },
      });

      if (activeMembership) {
        userMaxPriority = activeMembership.membership_levels.priority;
      }
    }
    
    const result = await ArticleService.getPublishedArticles({ 
      highlightedOnly,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      search,
      locale,
      userMaxPriority,
    });

    return successResponse(result.articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return ApiErrors.internal('Failed to fetch articles');
  }
}
