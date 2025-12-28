"use client";

import { useState, useEffect } from 'react';
import { Article } from '../types';

interface UseRelatedArticlesParams {
  articleId: string;
  tags: string[];
  locale: string;
  limit?: number;
}

interface UseRelatedArticlesReturn {
  articles: Article[];
  loading: boolean;
  error: string | null;
}

export function useRelatedArticles({ 
  articleId, 
  tags, 
  locale, 
  limit = 3 
}: UseRelatedArticlesParams): UseRelatedArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (!tags || tags.length === 0) {
        setArticles([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch articles with the same tags
        const response = await fetch(`/api/public/articles`, {
          headers: {
            'locale': locale,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch related articles');
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          // Filter articles that share at least one tag and exclude current article
          const related = result.data
            .filter((article: Article) => 
              String(article.id) !== articleId && 
              article.tags?.some(tag => tags.includes(tag))
            )
            .slice(0, limit);
          
          setArticles(related);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch related articles');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedArticles();
  }, [articleId, tags, locale, limit]);

  return { articles, loading, error };
}
