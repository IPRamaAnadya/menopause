import { useState } from 'react';
import { toast } from 'react-toastify';
import { ArticleReview, CreateReviewDTO, UpdateReviewDTO } from '../types';
import { ApiResponse } from '@/types/api';

export function useReviewActions(articleId?: number, onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const createReview = async (data: CreateReviewDTO) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/articles/${data.article_id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<ArticleReview> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to post review');
      }

      toast.success(data.parent_id ? 'Reply posted successfully' : 'Review posted successfully');
      onSuccess?.();
      return result.data;
    } catch (error) {
      console.error('Error creating review:', error);
      const message = error instanceof Error ? error.message : 'Failed to post review';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateReview = async (id: number, data: UpdateReviewDTO) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result: ApiResponse<ArticleReview> = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to update review');
      }

      toast.success('Review updated successfully');
      onSuccess?.();
      return result.data;
    } catch (error) {
      console.error('Error updating review:', error);
      const message = error instanceof Error ? error.message : 'Failed to update review';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteReview = async (id: number) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      const result: ApiResponse = await response.json();
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to delete review');
      }

      toast.success('Review deleted successfully');
      onSuccess?.();
    } catch (error) {
      console.error('Error deleting review:', error);
      const message = error instanceof Error ? error.message : 'Failed to delete review';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createReview, updateReview, deleteReview, loading };
}
