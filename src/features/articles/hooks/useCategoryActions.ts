import { useState } from 'react';
import { toast } from 'react-toastify';
import { CreateCategoryDTO } from '../types';

export function useCategoryActions(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const createCategory = async (data: CreateCategoryDTO) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to create category');

      toast.success('Category created successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Failed to create category');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, data: CreateCategoryDTO) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to update category');

      toast.success('Category updated successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');

      toast.success('Category deleted successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createCategory, updateCategory, deleteCategory, loading };
}
