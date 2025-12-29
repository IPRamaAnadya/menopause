'use client';

import { useState, useEffect } from 'react';
import { Membership } from '../types';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface UseMembershipsOptions {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export function useMemberships(options?: UseMembershipsOptions) {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = async (fetchOptions?: UseMembershipsOptions) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      const currentOptions = fetchOptions || options || {};
      
      if (currentOptions.page) params.append('page', currentOptions.page.toString());
      if (currentOptions.limit) params.append('limit', currentOptions.limit.toString());
      if (currentOptions.status) params.append('status', currentOptions.status);
      if (currentOptions.search) params.append('search', currentOptions.search);

      const response = await fetch(`/api/admin/memberships?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch memberships');
      }
      const result = await response.json();
      setMemberships(result.data?.data || []);
      setPagination(result.data?.pagination || {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, [options?.page, options?.limit, options?.status, options?.search]);

  return {
    memberships,
    pagination,
    loading,
    error,
    refresh: fetchMemberships,
  };
}
