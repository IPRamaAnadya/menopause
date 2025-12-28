import { useState, useEffect } from 'react';
import { Category } from '../types';

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const result = await response.json();
      
      // Handle new API response structure
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

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, refresh: fetchCategories };
}
