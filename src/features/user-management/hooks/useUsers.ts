'use client';

import { useState, useEffect } from 'react';
import { User, UserFilters, PaginatedUsers } from '../types';

export function useUsers(initialFilters: UserFilters = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialFilters.page || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);

  const fetchUsers = async (currentFilters: UserFilters) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (currentFilters.search) params.append('search', currentFilters.search);
      if (currentFilters.role) params.append('role', currentFilters.role);
      if (currentFilters.status) params.append('status', currentFilters.status);
      if (currentFilters.page) params.append('page', currentFilters.page.toString());
      if (currentFilters.limit) params.append('limit', currentFilters.limit.toString());

      const response = await fetch(`/api/admin/users?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: PaginatedUsers = await response.json();
      
      setUsers(data.users);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(filters);
  }, [filters]);

  const updateFilters = (newFilters: Partial<UserFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const nextPage = () => {
    if (page < totalPages) {
      setFilters((prev) => ({ ...prev, page: page + 1 }));
    }
  };

  const previousPage = () => {
    if (page > 1) {
      setFilters((prev) => ({ ...prev, page: page - 1 }));
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setFilters((prev) => ({ ...prev, page: pageNumber }));
    }
  };

  const refresh = () => {
    fetchUsers(filters);
  };

  return {
    users,
    total,
    page,
    totalPages,
    loading,
    error,
    filters,
    updateFilters,
    nextPage,
    previousPage,
    goToPage,
    refresh,
  };
}
