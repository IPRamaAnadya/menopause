export interface ServiceTranslation {
  id: number;
  service_id: number;
  locale: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  image_url: string | null;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  // These come from translations based on locale
  title: string;
  description: string;
  translations?: ServiceTranslation[];
}

export interface ServiceFilters {
  activeOnly?: boolean;
  locale?: string;
}

export interface CreateServiceDTO {
  image_url?: string;
  is_active?: boolean;
  order?: number;
  translations: {
    locale: string;
    title: string;
    description: string;
  }[];
}

export interface UpdateServiceDTO {
  image_url?: string;
  is_active?: boolean;
  order?: number;
  translations?: {
    locale: string;
    title: string;
    description: string;
  }[];
}
