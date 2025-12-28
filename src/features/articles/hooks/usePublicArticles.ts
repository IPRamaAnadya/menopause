import { useState, useEffect } from 'react';
import { Article } from '../types';
import type { ApiResponse } from '@/types/api';

interface UsePublicArticlesOptions {
  categoryId?: number;
  search?: string;
  locale?: string;
  limit?: number;
  highlighted?: boolean;
}

export function usePublicArticles(options: UsePublicArticlesOptions = {}) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (options.categoryId) params.append('categoryId', options.categoryId.toString());
        if (options.search) params.append('search', options.search);
        if (options.highlighted) params.append('highlighted', 'true');

        const headers: HeadersInit = {};
        if (options.locale) {
          headers['locale'] = options.locale;
        }

        const response = await fetch(`/api/public/articles?${params.toString()}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to fetch articles');
        }

        const result: ApiResponse<Article[]> = await response.json();
        
        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to fetch articles');
        }

        const limitedData = options.limit ? result.data.slice(0, options.limit) : result.data;
        setArticles(limitedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [options.categoryId, options.search, options.locale, options.limit, options.highlighted]);

  return { articles, loading, error };
}
