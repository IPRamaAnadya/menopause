import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReviewService } from '@/features/reviews/services/review.service';
import { successResponse, paginatedResponse, ApiErrors } from '@/lib/api-response';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

// GET /api/articles/[id]/reviews - Get all reviews for an article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const { reviews, total } = await ReviewService.getArticleReviews(
      parseInt(id),
      page,
      limit
    );

    return paginatedResponse(reviews, page, limit, total);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return ApiErrors.internal('Failed to fetch reviews');
  }
}

// POST /api/articles/[id]/reviews - Create a new review
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiErrors.unauthorized('You must be logged in to post a review');
    }

    const userId = session.user.id;
    const { id } = await params;
    const body = await request.json();

    // Determine if this is a review or a reply
    const isReply = !!body.parent_id;
    const rateConfig = isReply ? RATE_LIMITS.CREATE_REPLY : RATE_LIMITS.CREATE_REVIEW;

    // Check rate limit
    const rateLimitResult = checkRateLimit({
      identifier: getClientIdentifier(request, userId),
      action: isReply ? 'create-reply' : 'create-review',
      maxRequests: rateConfig.maxRequests,
      windowMs: rateConfig.windowMs,
    });

    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.resetTime - Date.now();
      const minutes = Math.ceil(retryAfter / 60000);
      return ApiErrors.rateLimit(
        `Too many ${isReply ? 'replies' : 'reviews'}. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
        retryAfter
      );
    }

    const review = await ReviewService.createReview(
      {
        article_id: parseInt(id),
        content: body.content,
        rating: body.rating,
        parent_id: body.parent_id,
      },
      parseInt(userId)
    );

    return successResponse(review, 201);
  } catch (error) {
    console.error('Error creating review:', error);
    const message = error instanceof Error ? error.message : 'Failed to create review';
    return ApiErrors.badRequest(message);
  }
}
