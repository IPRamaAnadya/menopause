import { useState, useEffect } from 'react';
import { Article } from '../types';
import { PaginatedApiResponse } from '@/types/api';

interface UseArticlesOptions {
  page?: number;
  limit?: number;
}

export function useArticles(options: UseArticlesOptions = {}) {
  const { page = 1, limit = 10 } = options;
  const [articles, setArticles] = useState<Article[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/admin/articles?page=${page}&limit=${limit}`);
      const result: PaginatedApiResponse<Article> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch articles');
      }
      
      setArticles(result.data);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, limit]);

  return { articles, total, loading, error, refresh: fetchArticles };
}
