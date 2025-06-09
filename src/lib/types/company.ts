import { User } from '@/lib/types/user';

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
