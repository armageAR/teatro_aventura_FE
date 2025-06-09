import { Pagination } from '@/lib/types/pagination';
import { Role } from '@/lib/types/role';

export interface User {
  id: number;
  name: string;
  email: string;
  company_id: number | null;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UserWithRoles extends User {
  roles: Role[];
  company?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: string;
  company_id?: number;
}

export interface UpdateUserData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  company_id: number | undefined;
}

export interface UserRoles {
  user: string;
  roles: string[];
  permissions: string[];
}

// Interfaces para respuestas de las APIs de usuarios
export interface UsersListResponse {
  users: UserWithRoles[];
  pagination: Pagination;
  filters_applied: {
    role?: string;
    search?: string;
    company_id?: number;
  };
  can_view_all_companies: boolean;
}

export interface UserResponse {
  user: UserWithRoles;
  permissions?: string[];
}

export interface CreateUserResponse {
  message: string;
  user: UserWithRoles;
}

export interface UpdateUserResponse {
  message: string;
  user: UserWithRoles;
}

export interface DeleteUserResponse {
  message: string;
}

export interface UserStatistics {
  total_users?: number;
  company_name?: string;
  users_by_role: Array<{
    role: string;
    count: number;
  }>;
  users_by_company?: Array<{
    company: string;
    count: number;
  }>;
  recent_users: Array<{
    id: number;
    name: string;
    email: string;
    created_at: string;
    roles: Role[];
    company?: {
      name: string;
    };
  }>;
}

export interface SearchUsersResponse {
  users: UserWithRoles[];
  query: string;
  total_found: number;
}

export interface UserFilters {
  role?: string;
  company_id?: number;
  search?: string;
  per_page?: number;
  page?: number;
}
