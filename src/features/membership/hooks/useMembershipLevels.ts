import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export interface MembershipLevel {
  id: number;
  name: string;
  priority: number;
  price: number;
  duration_days: number;
  slug: string;
  created_at: string;
  updated_at: string;
}

export function useMembershipLevels() {
  const [levels, setLevels] = useState<MembershipLevel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLevels = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/membership-levels');
      if (!response.ok) throw new Error('Failed to fetch membership levels');
      const data = await response.json();
      setLevels(data.data || []);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch membership levels');
      console.error('Error fetching membership levels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, []);

  return { levels, loading, refresh: fetchLevels };
}

export function useMembershipLevelActions(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const createLevel = async (data: FormData) => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/membership-levels', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to create membership level');
      }

      toast.success('Membership level created successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create membership level');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateLevel = async (id: number, data: FormData) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/membership-levels/${id}`, {
        method: 'PUT',
        body: data,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update membership level');
      }

      toast.success('Membership level updated successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update membership level');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteLevel = async (id: number) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/membership-levels/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to delete membership level');
      }

      toast.success('Membership level deleted successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete membership level');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { createLevel, updateLevel, deleteLevel, loading };
}
