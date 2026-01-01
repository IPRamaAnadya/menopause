
import { EventStatus, EventRegistrationStatus } from "@/generated/prisma";


export interface EventTranslation {
  id: number;
  event_id: number;
  locale: string;
  title: string;
  short_description: string;
  description: string;
  place_name?: string;
  place_details?: string;
  created_at: string;
  updated_at: string;
}


export interface Event {
  id: number;
  image_url?: string;
  slug: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_online: boolean;
  meeting_url?: string;
  latitude?: number;
  longitude?: number;
  is_paid: boolean;
  capacity: number;
  is_public: boolean;
  status: EventStatus;
  created_by: number;
  created_at: string;
  updated_at: string;
  translations?: EventTranslation[];
  prices?: EventPrice[];
}

export interface EventPrice {
  id: number;
  event_id: number;
  membership_level_id?: number;
  price: number;
  quota?: number;
  is_active: boolean;
}

export interface CreateEventDTO {
  image?: File;
  image_url?: string;
  slug: string;
  start_date: Date | string;
  end_date: Date | string;
  start_time?: string;
  end_time?: string;
  is_online: boolean;
  meeting_url?: string;
  latitude?: number | null;
  longitude?: number | null;
  is_paid: boolean;
  capacity?: number;
  is_public?: boolean;
  is_highlighted?: boolean;
  status?: EventStatus;
  created_by: number;

  translations: Array<{
    locale: string;
    title: string;
    short_description: string;
    description: string;
    place_name?: string;
    place_details?: string;
  }>;

  prices?: Array<{
    membership_level_id?: number | null;
    price: number;
    quota?: number;
    is_active: boolean;
  }>;
}

export interface UpdateEventDTO extends Partial<CreateEventDTO> {}

export type EventTimeFilter = 'all' | 'upcoming' | 'ongoing' | 'passed';
export type EventLocationFilter = 'all' | 'online' | 'offline';
export type EventVisibilityFilter = 'all' | 'public' | 'private';
export type EventPaymentFilter = 'all' | 'paid' | 'free';

export interface EventFilters {
  status?: EventStatus;
  is_public?: boolean;
  upcomingOnly?: boolean;
  locale?: string;
  page?: number;
  pageSize?: number;
  // Enhanced filters
  timeFilter?: EventTimeFilter;
  locationFilter?: EventLocationFilter;
  visibilityFilter?: EventVisibilityFilter;
  paymentFilter?: EventPaymentFilter;
  highlighted?: boolean;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// Optimized type for event list cards - only includes fields displayed on cards
export interface EventCardData {
  id: number;
  slug: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  is_online: boolean;
  is_paid: boolean;
  capacity: number;
  status: EventStatus;
  is_public: boolean;
  is_highlighted: boolean;
  // Translated fields (from backend)
  title: string;
  short_description: string;
  place_name?: string;
  // Price information
  price_range?: {
    min: number;
    max: number;
  };
  has_member_price: boolean;
}

export interface EventWithTranslations {
  id: number;
  slug: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  is_online: boolean;
  meeting_url?: string;
  latitude?: number;
  longitude?: number;
  is_paid: boolean;
  capacity: number;
  is_public: boolean;
  is_highlighted: boolean;
  status: EventStatus;

  translations: {
    locale: string;
    title: string;
    short_description: string;
    description: string;
    place_name?: string;
    place_details?: string;
  }[];

  // Convenience properties for default translation (first in array)
  title?: string;
  short_description?: string;
  description?: string;
  place_name?: string;
  place_details?: string;

  prices?: {
    membership_level_id?: number;
    price: number;
    quota?: number;
    is_active: boolean;
  }[];

  creator: {
    name: string;
    email: string;
  };
}


export interface CreateEventRegistrationDTO {
  event_id: number;

  // NULL = guest
  user_id?: number;

  // NULL = public price
  membership_level_id?: number;

  guest?: {
    full_name: string;
    email: string;
    phone?: string;
  };
}

export interface EventRegistration {
  id: number;
  public_id: string;
  event_id: number;
  user_id?: number;
  membership_level_id?: number;
  price: number;
  status: EventRegistrationStatus;
  registered_at: string;
  event?: {
    id: number;
    title: string | null;
    short_description: string | null;
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
    email: string | null;
  };
  guest?: {
    full_name: string;
    email: string;
    phone: string | null;
  };
  order?: {
    id: number;
    public_id: string;
    order_number: string;
    status: string;
    gross_amount: number;
    currency: string;
    paid_at: string | null;
    created_at: string;
    payment?: {
      id: number;
      provider: string;
      status: string;
      amount: number;
    };
  };
}