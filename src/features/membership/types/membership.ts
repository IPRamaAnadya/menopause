export interface Membership {
  id: number;
  user_id: number;
  membership_level_id: number;
  start_date: Date | string;
  end_date: Date | string;
  status: MembershipStatus;
  created_at: Date | string;
  updated_at: Date | string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  membership_level?: {
    id: number;
    name: string;
    slug: string;
    price: number;
    duration_days: number;
  };
}

export enum MembershipStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  STOPPED = 'STOPPED',
}

export interface CreateMembershipInput {
  user_id: number;
  membership_level_id: number;
  start_date?: Date | string;
  end_date?: Date | string;
}

export interface UpdateMembershipInput {
  membership_level_id?: number;
  start_date?: Date | string;
  end_date?: Date | string;
  status?: MembershipStatus;
}
