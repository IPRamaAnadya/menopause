import { useState, useEffect } from 'react';
import { ArticleReview } from '../types';
import { PaginatedApiResponse } from '@/types/api';

export function useArticleReviews(articleId: number, autoFetch: boolean = true) {
  const [reviews, setReviews] = useState<ArticleReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async (pageNum: number = 1, append: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/articles/${articleId}/reviews?page=${pageNum}&limit=5`
      );
      const result: PaginatedApiResponse<ArticleReview> = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch reviews');
      }

      const newReviews = result.data || [];
      setReviews(append ? [...reviews, ...newReviews] : newReviews);
      setTotal(result.pagination.total);
      setHasMore(result.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reviews';
      setError(message);
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchReviews(page + 1, true);
    }
  };

  const refresh = () => {
    fetchReviews(1, false);
  };

  useEffect(() => {
    if (autoFetch && articleId) {
      fetchReviews(1);
    }
  }, [articleId, autoFetch]);

  return { reviews, loading, error, total, hasMore, loadMore, refresh, fetchReviews };
}
