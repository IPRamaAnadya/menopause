import { useState, useEffect } from "react";
import { EventRegistrationStatus } from "@/generated/prisma";

export interface EventRegistration {
  id: number;
  public_id: string;
  event_id: number;
  user_id: number | null;
  membership_level_id: number | null;
  price: number;
  status: EventRegistrationStatus;
  registered_at: string;
  updated_at: string;
  events: {
    id: number;
    slug: string;
    start_date: string;
    end_date: string;
    translations: Array<{
      title: string;
      short_description: string;
    }>;
  };
  users: {
    id: number;
    name: string;
    email: string;
  } | null;
  guests: {
    full_name: string;
    email: string;
    phone: string | null;
  } | null;
  membership_levels: {
    id: number;
    slug: string;
  } | null;
}

export interface EventRegistrationFilters {
  page?: number;
  limit?: number;
  eventId?: number;
  status?: string;
  search?: string;
}

export function useEventRegistrations(filters: EventRegistrationFilters = {}) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.eventId) params.append("eventId", filters.eventId.toString());
      if (filters.status && filters.status !== "all") params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const response = await fetch(`/api/event-registrations?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch registrations");
      }

      const data = await response.json();
      setRegistrations(data.registrations);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching event registrations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [filters.page, filters.limit, filters.eventId, filters.status, filters.search]);

  return {
    registrations,
    pagination,
    loading,
    refresh: fetchRegistrations,
  };
}
