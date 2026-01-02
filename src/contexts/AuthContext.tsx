'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import constants from '@/lib/constants';
import { AuthState, LoginCredentials } from '@/lib/types/auth';
import { UserRole } from '@/lib/types/user';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    roles: [],
    permissions: [],
    isAuthenticated: false,
    isLoading: true,
  });

  const login = async (credentials: LoginCredentials) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      const authResponse = await authAPI.login(credentials);

      // Guardar token
      localStorage.setItem('token', authResponse.access_token);

      // Obtener roles del usuario
      if (!authResponse.user.id) {
        throw new Error('El usuario del login no tiene ID válido');
      }

      const userRoles = await authAPI.getUserRoles(authResponse.user.id);

      setAuthState({
        user: authResponse.user,
        token: authResponse.access_token,
        roles: userRoles.roles,
        permissions: userRoles.permissions,
        isAuthenticated: true,
        isLoading: false,
      });

      // Redirigir según el rol principal
      const primaryRole = userRoles.roles[0] as UserRole;
      const redirectRoute = constants.roles.routes[primaryRole];

      if (redirectRoute) {
        window.location.href = redirectRoute;
      } else {
        toast.error('Rol no reconocido');
      }

      toast.success(`¡Bienvenido, ${authResponse.user.name}!`);
    } catch (error: unknown) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));

      // eslint-disable-next-line no-console
      console.error('Error en login:', error);

      // Manejo específico de errores
      const errorCode =
        error && typeof error === 'object' && 'code' in error
          ? (error as { code: string }).code
          : '';
      const errorResponse =
        error && typeof error === 'object' && 'response' in error
          ? (
              error as {
                response?: { status?: number; data?: { message?: string } };
              }
            ).response
          : undefined;
      const errorMessage = error instanceof Error ? error.message : '';

      if (errorCode === 'ERR_NETWORK') {
        toast.error(
          'No se puede conectar al servidor. Verifica que esté funcionando en puerto 8008.',
        );
      } else if (errorResponse?.status === 401) {
        toast.error('Credenciales inválidas');
      } else if (errorResponse?.status === 422) {
        toast.error('Datos de login inválidos');
      } else if (errorResponse?.status === 419) {
        toast.error(
          'Error de seguridad (CSRF). Configura el backend correctamente.',
        );
      } else if (errorResponse?.status === 0) {
        toast.error(
          'Error CORS. Configura el backend para permitir origen localhost:3000',
        );
      } else {
        toast.error(
          `Error: ${
            errorResponse?.data?.message || errorMessage || 'Error desconocido'
          }`,
        );
      }
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthState({
      user: null,
      token: null,
      roles: [],
      permissions: [],
      isAuthenticated: false,
      isLoading: false,
    });
    window.location.href = '/';
    toast.success('Sesión cerrada exitosamente');
  };

  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setAuthState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const user = await authAPI.getCurrentUser();

      if (!user.id) {
        throw new Error('El usuario no tiene ID válido');
      }

      const userRoles = await authAPI.getUserRoles(user.id);

      setAuthState({
        user,
        token,
        roles: userRoles.roles,
        permissions: userRoles.permissions,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: unknown) {
      // eslint-disable-next-line no-console
      console.error('Error verificando autenticación:', error);
      localStorage.removeItem('token');
      setAuthState({
        user: null,
        token: null,
        roles: [],
        permissions: [],
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
