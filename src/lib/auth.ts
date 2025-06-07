export const API_BASE_URL = 'http://localhost:8008/api';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
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
