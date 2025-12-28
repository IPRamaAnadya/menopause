/**
 * Article Review types
 */

export interface ArticleReview {
  id: number;
  content: string;
  rating: number | null;
  created_at: string;
  updated_at: string;
  user: {
    id: number;
    name: string | null;
    image: string | null;
  };
  replies?: ArticleReview[];
}

export interface CreateReviewDTO {
  article_id: number;
  content: string;
  rating?: number;
  parent_id?: number;
}

export interface UpdateReviewDTO {
  content?: string;
  rating?: number;
}

export interface ReviewsResponse {
  reviews: ArticleReview[];
  total: number;
  hasMore: boolean;
}
