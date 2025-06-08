export const API_BASE_URL = 'http://localhost:8008/api';

export interface User {
  id: number;
  name: string;
  email: string;
  company_id: number | null;
  email_verified_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface Role {
  id?: number;
  name: string;
  display_name?: string;
  description?: string;
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
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  company_id?: number;
}

// Interfaces para respuestas de las APIs de usuarios
export interface UsersListResponse {
  users: UserWithRoles[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
  };
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

export interface ChangeRoleData {
  role: string;
}

export interface ChangeRoleResponse {
  message: string;
  user: UserWithRoles;
}

export interface ResetPasswordData {
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResponse {
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

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface UserRoles {
  user: string;
  roles: string[];
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  roles: string[];
  permissions: string[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const ROLE_ROUTES = {
  administrador: '/admin-dashboard',
  productor: '/producer-dashboard',
  director: '/director-dashboard',
  espectador: '/my-history',
} as const;

export const ROLE_COLORS = {
  administrador: '#8B5CF6', // Purple-500
  productor: '#EF4444', // Red-500
  director: '#3B82F6', // Blue-500
  espectador: '#10B981', // Green-500
} as const;

export const ROLE_EMOJIS = {
  administrador: '👑',
  productor: '🎭',
  director: '🎬',
  espectador: '👤',
} as const;

export type UserRole = keyof typeof ROLE_ROUTES;

export interface CompanySettings {
  theme_color?: string;
  max_functions_per_day?: number;
  default_language?: string;
  [key: string]: unknown;
}

export interface Company {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  website: string | null;
  logo_url: string | null;
  is_active: boolean;
  settings: CompanySettings | null;
  created_at: string;
  updated_at: string;
  users: User[];
}

export interface CreateCompanyData {
  name: string;
  slug: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  is_active?: boolean;
  settings?: CompanySettings;
}

export interface UpdateCompanyData {
  name?: string;
  slug?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  logo_url?: string;
  is_active?: boolean;
  settings?: CompanySettings;
}

export interface CompaniesResponse {
  companies: Company[];
}

export interface CompanyResponse {
  company: Company;
}
