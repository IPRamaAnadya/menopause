export interface FAQTranslation {
  id: number;
  faq_id: number;
  locale: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  is_active: boolean;
  order: number;
  created_at: string;
  updated_at: string;
  translations?: FAQTranslation[];
}

export interface CreateFAQDTO {
  is_active?: boolean;
  order?: number;
  translations: Array<{
    locale: string;
    question: string;
    answer: string;
  }>;
}

export interface UpdateFAQDTO extends Partial<CreateFAQDTO> {}

export interface FAQFilters {
  activeOnly?: boolean;
  locale?: string;
}
