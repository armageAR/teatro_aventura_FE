import constants from '@/lib/constants';
import { UserRole } from '@/lib/types/user';

// Función para obtener la ruta del dashboard según el rol
export const getDashboardRoute = (roles: string[]): string => {
  if (roles.length > 0) {
    const primaryRole = roles[0] as UserRole;
    return constants.roles.routes[primaryRole];
  }
  return '/';
};

// Función para obtener el emoji del rol principal
export const getRoleEmoji = (roles: string[]) => {
  if (roles.length > 0) {
    const primaryRole = roles[0] as UserRole;
    return constants.roles.emojis[primaryRole];
  }
  return '👤';
};

// Función para obtener el nombre del rol principal
export const getRoleName = (roles: string[]) => {
  if (roles.length > 0) {
    const primaryRole = roles[0] as UserRole;
    return primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1);
  }
  return 'Usuario';
};
