'use client';

import React, { useEffect } from 'react';

import { UserRole } from '@/lib/types/user';

import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/',
}) => {
  const { isAuthenticated, isLoading, roles } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = redirectTo;
    }
  }, [isAuthenticated, isLoading, redirectTo]);

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        <span className='ml-3 text-gray-600'>Verificando autenticación...</span>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (la redirección ya ocurrió)
  if (!isAuthenticated) {
    return null;
  }

  // Si hay roles permitidos especificados, verificar que el usuario tenga al menos uno
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = roles.some((role) =>
      allowedRoles.includes(role as UserRole),
    );

    if (!hasPermission) {
      return (
        <div className='flex flex-col justify-center items-center min-h-screen p-4'>
          <div className='text-center max-w-md'>
            <div className='text-6xl mb-4'>🚫</div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>
              Acceso Denegado
            </h1>
            <p className='text-gray-600 mb-4'>
              No tienes permisos para acceder a esta página.
            </p>
            <p className='text-sm text-gray-500 mb-6'>
              Tu rol actual:{' '}
              <span className='font-medium'>
                {roles.length > 0 ? roles.join(', ') : 'No hay roles asignados'}
              </span>
            </p>
            <p className='text-xs text-gray-400 mb-6'>
              Roles permitidos:{' '}
              {allowedRoles?.join(', ') || 'Ninguno especificado'}
            </p>
            <p className='text-xs text-gray-400 mb-6'>
              Debug: roles={JSON.stringify(roles)} | allowedRoles=
              {JSON.stringify(allowedRoles)}
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
            >
              Volver al Inicio
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
