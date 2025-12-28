export type ArticleVisibility = 'PUBLIC' | 'MEMBER' | 'PRIORITY';

export interface CategoryTranslation {
  id: number;
  category_id: number;
  locale: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  parent_id?: number;
  name: string;
  slug: string;
  description?: string;
  order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  translations?: CategoryTranslation[];
  children?: Category[];
  parent?: Category;
}

export interface ArticleTranslation {
  id: number;
  article_id: number;
  locale: string;
  title: string;
  excerpt?: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: number;
  public_id: string;
  category_id: number;
  author_id: number;
  title: string;
  slug: string;
  image_url?: string;
  excerpt?: string;
  description: string;
  tags: string[];
  visibility: ArticleVisibility;
  required_priority?: number;
  is_published: boolean;
  is_highlighted: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  hide?: boolean; // Indicates if content should be blurred for current user
  translations?: ArticleTranslation[];
  category?: Category;
  author?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface CreateCategoryDTO {
  parent_id?: number;
  slug: string;
  order?: number;
  is_active?: boolean;
  translations: Array<{
    locale: string;
    name: string;
    description?: string;
  }>;
}

export interface UpdateCategoryDTO extends Partial<CreateCategoryDTO> {}

export interface CreateArticleDTO {
  category_id: number;
  slug: string;
  image?: File | string;
  tags?: string[];
  visibility?: ArticleVisibility;
  required_priority?: number;
  is_published?: boolean;
  is_highlighted?: boolean;
  published_at?: string;
  translations: Array<{
    locale: string;
    title: string;
    excerpt?: string;
    description: string;
  }>;
}

export interface UpdateArticleDTO extends Partial<CreateArticleDTO> {}

export interface CategoryFilters {
  activeOnly?: boolean;
  parentId?: number;
  locale?: string;
}

export interface ArticleFilters {
  publishedOnly?: boolean;
  highlightedOnly?: boolean;
  categoryId?: number;
  visibility?: ArticleVisibility;
  authorId?: number;
  locale?: string;
  search?: string;
  page?: number;
  limit?: number;
}
