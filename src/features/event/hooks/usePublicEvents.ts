import { useState, useEffect } from 'react';
import { EventCardData } from '../types';

interface UsePublicEventsOptions {
  locale: string;
  page?: number;
  pageSize?: number;
  search?: string;
  timeFilter?: string;
  locationFilter?: string;
  paymentFilter?: string;
  highlighted?: boolean;
  limit?: number;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export function usePublicEvents(options: UsePublicEventsOptions) {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('locale', options.locale);
      if (options.page) params.append('page', String(options.page));
      if (options.pageSize) params.append('pageSize', String(options.pageSize));
      if (options.search) params.append('search', options.search);
      if (options.timeFilter) params.append('timeFilter', options.timeFilter);
      if (options.locationFilter) params.append('locationFilter', options.locationFilter);
      if (options.paymentFilter) params.append('paymentFilter', options.paymentFilter);
      if (options.highlighted !== undefined) params.append('highlighted', String(options.highlighted));
      if (options.limit) params.append('limit', String(options.limit));

      const response = await fetch(`/api/events?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const result = await response.json();
      setEvents(result.data || []);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [options.locale, options.page, options.pageSize, options.search, options.timeFilter, options.locationFilter, options.paymentFilter, options.highlighted, options.limit]);

  return {
    events,
    pagination,
    loading,
    error,
    refresh: fetchEvents,
  };
}
