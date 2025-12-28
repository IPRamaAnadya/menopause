import { useState } from 'react';
import { toast } from 'react-toastify';
import { CreateArticleDTO } from '../types';
import { useRouter } from '@/i18n/routing';
import { ApiResponse } from '@/types/api';
import { toUTC } from '@/lib/datetime';

export function useArticleActions(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const createArticle = async (data: CreateArticleDTO) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('category_id', data.category_id.toString());
      formData.append('slug', data.slug);
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      formData.append('visibility', data.visibility || 'PUBLIC');
      if (data.required_priority) {
        formData.append('required_priority', data.required_priority.toString());
      }
      if (data.tags && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags));
      }
      formData.append('is_published', data.is_published ? 'true' : 'false');
      formData.append('is_highlighted', data.is_highlighted ? 'true' : 'false');
      if (data.published_at) {
        formData.append('published_at', data.published_at);
      }
      formData.append('translations', JSON.stringify(data.translations));

      const response = await fetch('/api/admin/articles', {
        method: 'POST',
        body: formData,
      });

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to create article');
      }

      toast.success('Article created successfully');
      onSuccess?.();
      router.push('/dashboard/articles');
    } catch (error) {
      console.error('Error creating article:', error);
      const message = error instanceof Error ? error.message : 'Failed to create article';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateArticle = async (id: number, data: CreateArticleDTO) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('category_id', data.category_id.toString());
      formData.append('slug', data.slug);
      if (data.image instanceof File) {
        formData.append('image', data.image);
      }
      formData.append('visibility', data.visibility || 'PUBLIC');
      if (data.required_priority) {
        formData.append('required_priority', data.required_priority.toString());
      }
      if (data.tags && data.tags.length > 0) {
        formData.append('tags', JSON.stringify(data.tags));
      }
      formData.append('is_published', data.is_published ? 'true' : 'false');
      formData.append('is_highlighted', data.is_highlighted ? 'true' : 'false');
      if (data.published_at) {
        const utcDate = toUTC(data.published_at);
        if (utcDate) formData.append('published_at', utcDate);
      }
      formData.append('translations', JSON.stringify(data.translations));

      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update article');
      }

      toast.success('Article updated successfully');
      onSuccess?.();
      router.push('/dashboard/articles');
    } catch (error) {
      console.error('Error updating article:', error);
      const message = error instanceof Error ? error.message : 'Failed to update article';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteArticle = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete article');
      }

      toast.success('Article deleted successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting article:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete article';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createArticle, updateArticle, deleteArticle, loading };
}
