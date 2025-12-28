import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReviewService } from '@/features/reviews/services/review.service';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from '@/lib/rate-limit';

// GET /api/reviews/[id] - Get a single review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await ReviewService.getReviewById(parseInt(id));

    if (!review) {
      return ApiErrors.notFound('Review');
    }

    return successResponse(review);
  } catch (error) {
    console.error('Error fetching review:', error);
    return ApiErrors.internal('Failed to fetch review');
  }
}

// PUT /api/reviews/[id] - Update a review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiErrors.unauthorized('You must be logged in to update a review');
    }

    const userId = session.user.id;

    // Check rate limit
    const rateLimitResult = checkRateLimit({
      identifier: getClientIdentifier(request, userId),
      action: 'update-review',
      maxRequests: RATE_LIMITS.UPDATE_REVIEW.maxRequests,
      windowMs: RATE_LIMITS.UPDATE_REVIEW.windowMs,
    });

    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.resetTime - Date.now();
      const minutes = Math.ceil(retryAfter / 60000);
      return ApiErrors.rateLimit(
        `Too many update requests. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
        retryAfter
      );
    }

    const { id } = await params;
    const body = await request.json();

    const review = await ReviewService.updateReview(
      parseInt(id),
      {
        content: body.content,
        rating: body.rating,
      },
      parseInt(userId)
    );

    return successResponse(review);
  } catch (error) {
    console.error('Error updating review:', error);
    const message = error instanceof Error ? error.message : 'Failed to update review';
    return ApiErrors.badRequest(message);
  }
}

// DELETE /api/reviews/[id] - Delete a review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return ApiErrors.unauthorized('You must be logged in to delete a review');
    }

    const userId = session.user.id;

    // Check rate limit
    const rateLimitResult = checkRateLimit({
      identifier: getClientIdentifier(request, userId),
      action: 'delete-review',
      maxRequests: RATE_LIMITS.DELETE_REVIEW.maxRequests,
      windowMs: RATE_LIMITS.DELETE_REVIEW.windowMs,
    });

    if (!rateLimitResult.allowed) {
      const retryAfter = rateLimitResult.resetTime - Date.now();
      const minutes = Math.ceil(retryAfter / 60000);
      return ApiErrors.rateLimit(
        `Too many delete requests. Please try again in ${minutes} minute${minutes > 1 ? 's' : ''}.`,
        retryAfter
      );
    }

    const { id } = await params;
    await ReviewService.deleteReview(parseInt(id), parseInt(userId));

    return successResponse({ deleted: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete review';
    return ApiErrors.badRequest(message);
  }
}
