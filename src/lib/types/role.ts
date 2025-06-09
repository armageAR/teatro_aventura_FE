import { UserWithRoles } from '@/lib/types/user';

export interface Role {
  id?: number;
  name: string;
  display_name?: string;
  description?: string;
}

export interface UserRoles {
  user: string;
  roles: string[];
  permissions: string[];
}

export interface ChangeRoleData {
  role: string;
}

export interface ChangeRoleResponse {
  message: string;
  user: UserWithRoles;
}

export interface ChangeRoleData {
  role: string;
}

export interface ChangeRoleResponse {
  message: string;
  user: UserWithRoles;
}
