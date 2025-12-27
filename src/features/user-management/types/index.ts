export interface User {
  id: number;
  publicId: string;
  name: string | null;
  email: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED';
  membershipLevel: string | null;
  joinedDate: string;
  lastActive: string | null;
  image: string | null;
  isResetPassword: boolean;
}

export interface UserFilters {
  search?: string;
  role?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  page?: number;
  limit?: number;
}

export interface PaginatedUsers {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetUsersParams {
  search?: string;
  role?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  page?: number;
  limit?: number;
}
