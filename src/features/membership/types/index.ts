export interface MembershipLevel {
  id: number;
  name: string;
  slug: string;
  priority: number;
  price: number;
  duration_days: number;
  created_at: string;
  updated_at: string;
}

export interface MembershipLevelFilters {
  sortBy?: 'priority' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateMembershipLevelDTO {
  name: string;
  slug: string;
  priority: number;
  price: number;
  duration_days: number;
}

export interface UpdateMembershipLevelDTO {
  name?: string;
  slug?: string;
  priority?: number;
  price?: number;
  duration_days?: number;
}

export * from './membership';
export * from './subscription-activity';
