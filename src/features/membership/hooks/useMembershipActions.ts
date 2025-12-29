'use client';

import { useState } from 'react';
import { toast } from 'react-toastify';
import { CreateMembershipInput, UpdateMembershipInput } from '../types';

export function useMembershipActions(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const createMembership = async (data: CreateMembershipInput) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/memberships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create membership');
      }

      toast.success('Membership created successfully');
      onSuccess?.();
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create membership';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateMembership = async (id: number, data: UpdateMembershipInput) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/memberships/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update membership');
      }

      toast.success('Membership updated successfully');
      onSuccess?.();
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update membership';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteMembership = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/memberships/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to delete membership');
      }

      toast.success('Membership deleted successfully');
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete membership';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelMembership = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/memberships/${id}/cancel`, {
        method: 'POST',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to cancel membership');
      }

      toast.success('Membership cancelled successfully');
      onSuccess?.();
      return result.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to cancel membership';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createMembership,
    updateMembership,
    deleteMembership,
    cancelMembership,
    loading,
  };
}
