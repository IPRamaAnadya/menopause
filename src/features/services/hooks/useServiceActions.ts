'use client';

import { useState } from 'react';
import { CreateServiceDTO, UpdateServiceDTO } from '../types';
import { toast } from 'react-toastify';

export function useServiceActions(onSuccess?: () => void) {
  const [loading, setLoading] = useState(false);

  const createService = async (formData: FormData) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/services', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create service');
      }

      const service = await response.json();
      toast.success('Service created successfully');
      onSuccess?.();
      return service;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create service';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateService = async (id: number, formData: FormData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update service');
      }

      const service = await response.json();
      toast.success('Service updated successfully');
      onSuccess?.();
      return service;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update service';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm('Are you sure you want to delete this service?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/services/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete service');
      }

      toast.success('Service deleted successfully');
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete service';
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    createService,
    updateService,
    deleteService,
    loading,
  };
}
