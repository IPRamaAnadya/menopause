import { useState, useEffect } from "react";

export interface EventRegistrationStatistics {
  total: number;
  paid: number;
  pending: number;
  cancelled: number;
  attended: number;
  revenue: number;
}

export interface TopEvent {
  event_id: number;
  event_title: string;
  count: number;
}

export interface RecentRegistration {
  id: number;
  public_id: string;
  event_id: number;
  user_id: number | null;
  price: number;
  status: string;
  registered_at: string;
  events: {
    id: number;
    slug: string;
    translations: Array<{
      title: string;
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
  } | null;
}

export function useEventRegistrationStats(eventId?: number) {
  const [statistics, setStatistics] = useState<EventRegistrationStatistics>({
    total: 0,
    paid: 0,
    pending: 0,
    cancelled: 0,
    attended: 0,
    revenue: 0,
  });
  const [topEvents, setTopEvents] = useState<TopEvent[]>([]);
  const [recentRegistrations, setRecentRegistrations] = useState<RecentRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (eventId) params.append("eventId", eventId.toString());

      const response = await fetch(`/api/event-registrations/statistics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await response.json();
      setStatistics(data.statistics);
      setTopEvents(data.topEvents || []);
      setRecentRegistrations(data.recentRegistrations || []);
    } catch (error) {
      console.error("Error fetching event registration statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [eventId]);

  return {
    statistics,
    topEvents,
    recentRegistrations,
    loading,
    refresh: fetchStatistics,
  };
}
