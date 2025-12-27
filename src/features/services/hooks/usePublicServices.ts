'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Service } from '../types';

/**
 * Hook for fetching active services from the public API (no authentication required)
 * Automatically uses the current locale from the route (e.g., /en/... or /zh-HK/...)
 * Use this hook in public-facing pages like the homepage ServiceSection
 */
export function usePublicServices() {
  const locale = useLocale(); // Get current locale from next-intl
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/public/services?locale=${locale}`;
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }

      const data: Service[] = await response.json();
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [locale]);

  const refresh = () => {
    fetchServices();
  };

  return {
    services,
    loading,
    error,
    refresh,
  };
}
