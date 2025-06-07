'use client';

import {
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';

import ProtectedRoute from '@/components/ProtectedRoute';

import { useAuth } from '@/contexts/AuthContext';

interface AdminDashboardData {
  message: string;
  user: string;
  statistics: {
    total_users: number;
    total_roles: number;
    total_permissions: number;
    users_by_role: Array<{ role: string; count: number }>;
  };
  capabilities: string[];
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await authAPI.getAdminDashboard();
        setDashboardData(data);
      } catch (error: unknown) {
        setError('Error al cargar los datos del dashboard');
        // eslint-disable-next-line no-console
        console.error('Error fetching admin dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-purple-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
        <span className='ml-3 text-gray-600'>Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <div className='min-h-screen bg-purple-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b-4 border-purple-500'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <div className='flex items-center'>
                <div className='text-3xl mr-3'>👑</div>
                <div>
                  <h1 className='text-2xl font-bold text-purple-800'>
                    Dashboard Administrador
                  </h1>
                  <p className='text-purple-600'>Bienvenido, {user?.name}</p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <button
                  onClick={() => (window.location.href = '/')}
                  className='text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm'
                >
                  Inicio
                </button>
                <button
                  onClick={logout}
                  className='bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center'
                >
                  <ArrowRightOnRectangleIcon className='h-4 w-4 mr-2' />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {error ? (
            <div className='bg-red-50 border border-red-200 rounded-md p-4 mb-6'>
              <p className='text-red-800'>{error}</p>
            </div>
          ) : dashboardData ? (
            <>
              {/* Welcome Message */}
              <div className='bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-purple-500'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  {dashboardData.message}
                </h2>
                <p className='text-gray-600'>
                  Control total del sistema Teatro de Aventura
                </p>
              </div>

              {/* Statistics Cards */}
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-purple-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <UsersIcon className='h-8 w-8 text-purple-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Total Usuarios
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {dashboardData.statistics.total_users}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <UserGroupIcon className='h-8 w-8 text-blue-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Total Roles
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {dashboardData.statistics.total_roles}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <CogIcon className='h-8 w-8 text-green-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Permisos
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>
                        {dashboardData.statistics.total_permissions}
                      </p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-yellow-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <ChartBarIcon className='h-8 w-8 text-yellow-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Estadísticas
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>100%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Users by Role */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Usuarios por Rol
                  </h3>
                  <div className='space-y-4'>
                    {dashboardData.statistics.users_by_role.map(
                      (roleData, index) => {
                        const roleEmojis: Record<string, string> = {
                          administrador: '👑',
                          productor: '🎭',
                          director: '🎬',
                          espectador: '👤',
                        };

                        const roleColors: Record<string, string> = {
                          administrador: 'bg-purple-100 text-purple-800',
                          productor: 'bg-red-100 text-red-800',
                          director: 'bg-blue-100 text-blue-800',
                          espectador: 'bg-green-100 text-green-800',
                        };

                        return (
                          <div
                            key={index}
                            className='flex items-center justify-between p-3 rounded-lg bg-gray-50'
                          >
                            <div className='flex items-center'>
                              <span className='text-2xl mr-3'>
                                {roleEmojis[roleData.role] || '🎭'}
                              </span>
                              <span className='font-medium capitalize'>
                                {roleData.role}
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                roleColors[roleData.role] ||
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {roleData.count} usuarios
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* Capabilities */}
                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Capacidades del Administrador
                  </h3>
                  <div className='space-y-3'>
                    {dashboardData.capabilities.map((capability, index) => (
                      <div key={index} className='flex items-start'>
                        <div className='flex-shrink-0 mt-1'>
                          <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
                        </div>
                        <p className='ml-3 text-gray-700'>{capability}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Acciones Rápidas
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <button className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left'>
                    <div className='flex items-center mb-2'>
                      <UsersIcon className='h-5 w-5 text-purple-600 mr-2' />
                      <span className='font-medium'>Gestionar Usuarios</span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Crear, editar y eliminar usuarios del sistema
                    </p>
                  </button>

                  <button className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left'>
                    <div className='flex items-center mb-2'>
                      <CogIcon className='h-5 w-5 text-purple-600 mr-2' />
                      <span className='font-medium'>Configurar Sistema</span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Ajustar configuraciones generales
                    </p>
                  </button>

                  <button className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left'>
                    <div className='flex items-center mb-2'>
                      <ChartBarIcon className='h-5 w-5 text-purple-600 mr-2' />
                      <span className='font-medium'>Ver Reportes</span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Análisis completo del sistema
                    </p>
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
