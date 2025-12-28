import { NextRequest } from 'next/server';
import { ReviewService } from '@/features/reviews/services/review.service';
import { successResponse, ApiErrors } from '@/lib/api-response';

// GET /api/articles/[id]/reviews/stats - Get review statistics for an article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stats = await ReviewService.getArticleReviewStats(parseInt(id));

    return successResponse(stats);
  } catch (error) {
    console.error('Error fetching review stats:', error);
    return ApiErrors.internal('Failed to fetch review statistics');
  }
}
