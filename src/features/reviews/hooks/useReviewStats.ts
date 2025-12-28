import { useState, useEffect } from 'react';

interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}

export function useReviewStats(articleId: number) {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/articles/${articleId}/reviews/stats`);
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch stats');
      }

      setStats(result.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      setError(message);
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (articleId) {
      fetchStats();
    }
  }, [articleId]);

  return { stats, loading, error, refresh: fetchStats };
}
