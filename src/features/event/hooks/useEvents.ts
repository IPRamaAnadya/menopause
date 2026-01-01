import { useState, useEffect } from 'react';
import { EventCardData } from '../types';

interface UseEventsOptions {
  status?: string;
  is_public?: boolean;
  upcomingOnly?: boolean;
  locale?: string;
  page?: number;
  pageSize?: number;
  timeFilter?: string;
  locationFilter?: string;
  visibilityFilter?: string;
  paymentFilter?: string;
  highlighted?: boolean;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function useEvents(options: UseEventsOptions = {}) {
  const [events, setEvents] = useState<EventCardData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.status) params.append('status', options.status);
      if (options.is_public !== undefined) params.append('is_public', String(options.is_public));
      if (options.upcomingOnly) params.append('upcomingOnly', 'true');
      if (options.locale) params.append('locale', options.locale);
      if (options.page) params.append('page', String(options.page));
      if (options.pageSize) params.append('pageSize', String(options.pageSize));
      if (options.timeFilter) params.append('timeFilter', options.timeFilter);
      if (options.locationFilter) params.append('locationFilter', options.locationFilter);
      if (options.visibilityFilter) params.append('visibilityFilter', options.visibilityFilter);
      if (options.paymentFilter) params.append('paymentFilter', options.paymentFilter);
      if (options.highlighted !== undefined) params.append('highlighted', String(options.highlighted));

      const response = await fetch(`/api/admin/events?${params.toString()}`);
      
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
  }, [options.status, options.is_public, options.upcomingOnly, options.locale, options.page, options.pageSize, options.timeFilter, options.locationFilter, options.visibilityFilter, options.paymentFilter]);

  return {
    events,
    pagination,
    loading,
    error,
    refresh: fetchEvents,
  };
}
