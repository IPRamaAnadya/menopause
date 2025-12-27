'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

export function useUserActions() {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (userId: number, status: 'ACTIVE' | 'SUSPENDED') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      toast.success(`User ${status === 'ACTIVE' ? 'activated' : 'suspended'} successfully`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (userId: number, role: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update role');
      }

      toast.success('User role updated successfully');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (userId: number) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/password-reset`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resetPassword: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to set password reset');
      }

      toast.success('Password reset flag set successfully');
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to set password reset');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateStatus,
    updateRole,
    resetPassword,
    loading,
  };
}
