import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';

export interface EventTicket {
  id: number;
  public_id: string;
  event_id: number;
  user_id?: number;
  membership_level_id?: number;
  price: number;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'ATTENDED';
  registered_at: string;
  event?: {
    id: number;
    title: string | null;
    short_description: string | null;
    description?: string | null;
    start_date: string;
    start_time: string | null;
    end_date: string;
    end_time: string | null;
    is_online: boolean;
    place_name: string | null;
    place_detail: string | null;
    meeting_url: string | null;
    image_url: string | null;
  };
  user?: {
    id: number;
    name: string | null;
    email: string;
  };
  guest?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
}

export function useTickets() {
  const [tickets, setTickets] = useState<EventTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/member/tickets?locale=${locale}`);
      const result = await response.json();

      if (result.success) {
        setTickets(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [locale]);

  return {
    tickets,
    loading,
    error,
    refetch: fetchTickets,
  };
}

export function useTicketDetail(publicId: string) {
  const [ticket, setTicket] = useState<EventTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const locale = useLocale();

  const fetchTicket = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/member/tickets/${publicId}?locale=${locale}`);
      const result = await response.json();

      if (result.success) {
        setTicket(result.data);
      } else {
        setError(result.error?.message || 'Failed to fetch ticket');
      }
    } catch (err) {
      console.error('Error fetching ticket:', err);
      setError('Failed to fetch ticket');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (publicId) {
      fetchTicket();
    }
  }, [publicId, locale]);

  return {
    ticket,
    loading,
    error,
    refetch: fetchTicket,
  };
}
