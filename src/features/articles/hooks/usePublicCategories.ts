import { useState, useEffect } from 'react';
import { Category } from '../types';
import type { ApiResponse } from '@/types/api';

interface UsePublicCategoriesOptions {
  locale?: string;
}

export function usePublicCategories(options: UsePublicCategoriesOptions = {}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        
        const headers: HeadersInit = {};
        if (options.locale) {
          headers['locale'] = options.locale;
        }

        const response = await fetch('/api/public/categories', { headers });
        if (!response.ok) throw new Error('Failed to fetch categories');
        
        const result: ApiResponse<Category[]> = await response.json();
        
        if (result.success && result.data) {
          setCategories(result.data);
        } else {
          throw new Error(result.error?.message || 'Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [options.locale]);

  return { categories, loading };
}
