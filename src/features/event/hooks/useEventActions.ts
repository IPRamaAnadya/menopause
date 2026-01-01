import { useState } from 'react';
import { useRouter } from '@/i18n/routing';

export function useEventActions(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const deleteEvent = async (id: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete event');
      }

      if (onSuccess) {
        onSuccess();
      }

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (data: any) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      
      // Add image if provided
      if (data.image) {
        formData.append('image', data.image);
      }
      
      // Add basic fields
      formData.append('slug', data.slug);
      formData.append('start_date', data.start_date);
      formData.append('end_date', data.end_date);
      
      if (data.start_time) formData.append('start_time', data.start_time);
      if (data.end_time) formData.append('end_time', data.end_time);
      
      formData.append('is_online', data.is_online ? 'true' : 'false');
      if (data.meeting_url) formData.append('meeting_url', data.meeting_url);
      
      if (data.latitude !== null && data.latitude !== undefined) {
        formData.append('latitude', data.latitude.toString());
      }
      if (data.longitude !== null && data.longitude !== undefined) {
        formData.append('longitude', data.longitude.toString());
      }
      
      formData.append('is_paid', data.is_paid ? 'true' : 'false');
      if (data.capacity) formData.append('capacity', data.capacity.toString());
      formData.append('is_public', data.is_public ? 'true' : 'false');
      formData.append('is_highlighted', data.is_highlighted ? 'true' : 'false');
      formData.append('status', data.status);
      
      // Add translations as JSON
      formData.append('translations', JSON.stringify(data.translations));
      
      // Add prices if any
      if (data.prices && data.prices.length > 0) {
        formData.append('prices', JSON.stringify(data.prices));
      }

      const response = await fetch('/api/admin/events', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create event');
      }

      const result = await response.json();
      
      if (onSuccess) {
        onSuccess();
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (id: number, data: any) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      
      // Add image if provided
      if (data.image) {
        formData.append('image', data.image);
      }
      
      // Add basic fields
      formData.append('slug', data.slug);
      formData.append('start_date', data.start_date);
      formData.append('end_date', data.end_date);
      
      if (data.start_time) formData.append('start_time', data.start_time);
      if (data.end_time) formData.append('end_time', data.end_time);
      
      formData.append('is_online', data.is_online ? 'true' : 'false');
      if (data.meeting_url) formData.append('meeting_url', data.meeting_url);
      
      if (data.latitude !== null && data.latitude !== undefined) {
        formData.append('latitude', data.latitude.toString());
      }
      if (data.longitude !== null && data.longitude !== undefined) {
        formData.append('longitude', data.longitude.toString());
      }
      
      formData.append('is_paid', data.is_paid ? 'true' : 'false');
      if (data.capacity) formData.append('capacity', data.capacity.toString());
      formData.append('is_public', data.is_public ? 'true' : 'false');
      formData.append('is_highlighted', data.is_highlighted ? 'true' : 'false');
      formData.append('status', data.status);
      
      // Add translations as JSON
      formData.append('translations', JSON.stringify(data.translations));
      
      // Add prices if any
      if (data.prices && data.prices.length > 0) {
        formData.append('prices', JSON.stringify(data.prices));
      }

      const response = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update event');
      }

      const result = await response.json();
      
      if (onSuccess) {
        onSuccess();
      }

      return result.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    deleteEvent,
    createEvent,
    updateEvent,
  };
}
