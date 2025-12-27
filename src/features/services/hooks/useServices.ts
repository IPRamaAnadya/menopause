'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Service, ServiceFilters } from '../types';
import { useFetch } from '@/hooks/useFetch';

export function useServices(filters: ServiceFilters = {}) {
  const locale = useLocale(); // Get current locale from next-intl (defaults to 'en')
  const { data, loading, error, fetchData } = useFetch<Service[]>(
    '/api/admin/services' + (filters.activeOnly ? '?active=true' : ''),
    {
      headers: { locale },
    }
  );

  useEffect(() => {
    fetchData();
  }, [filters.activeOnly, locale]);

  return {
    services: data || [],
    loading,
    error,
    refresh: fetchData,
  };
}
