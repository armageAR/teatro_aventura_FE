'use client';

import {
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';
import constants from '@/lib/constants';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/ui/DashboardHeader';
import ErrorAlert from '@/components/ui/ErrorAlert';
import InfoBanner from '@/components/ui/InfoBanner';
import { Spinner } from '@/components/ui/Spinner';
import StatsGrid from '@/components/ui/StatsGrid';

import CapabilitiesByRole from '@/app/components/users/CapabilitiesByRole';
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
  useAuth();
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(
    null,
  );
  const [totalCompanies, setTotalCompanies] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [dashboardResponse, companiesResponse] = await Promise.all([
          authAPI.getAdminDashboard(),
          authAPI.getCompanies(),
        ]);

        setDashboardData(dashboardResponse);

        // Extraer el array de compañías y contar
        const companiesArray = companiesResponse.companies || companiesResponse;
        setTotalCompanies(
          Array.isArray(companiesArray) ? companiesArray.length : 0,
        );
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
    return <Spinner color='purple' />;
  }

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <div
        className={`min-h-screen ${constants.roles.ui.background.administrador}`}
      >
        <DashboardHeader
          icon={constants.roles.emojis.administrador}
          title='Dashboard Administrador'
          color={constants.roles.ui.colorKeyByRole.administrador}
        />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {error ? (
            <ErrorAlert message={error} />
          ) : dashboardData ? (
            <>
              {/* Welcome Message */}
              <InfoBanner
                title={dashboardData.message}
                description='Control total del sistema Teatro de Aventura'
                color={constants.roles.ui.colorKeyByRole.administrador}
              />

              {/* Statistics Cards */}
              <StatsGrid
                items={[
                  {
                    icon: <UsersIcon className='h-8 w-8' />,
                    title: 'Total Usuarios',
                    value: dashboardData.statistics.total_users,
                    color: 'purple',
                  },
                  {
                    icon: <UserGroupIcon className='h-8 w-8' />,
                    title: 'Total Roles',
                    value: dashboardData.statistics.total_roles,
                    color: 'blue',
                  },
                  {
                    icon: <CogIcon className='h-8 w-8' />,
                    title: 'Permisos',
                    value: dashboardData.statistics.total_permissions,
                    color: 'green',
                  },
                  {
                    icon: <BuildingOfficeIcon className='h-8 w-8' />,
                    title: 'Total Compañías',
                    value: totalCompanies,
                    color: 'orange',
                  },
                ]}
              />

              {/* Users by Role */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    Usuarios por Rol
                  </h3>
                  <div className='space-y-4'>
                    {dashboardData.statistics.users_by_role.map(
                      (roleData, index) => {
                        return (
                          <div
                            key={index}
                            className='flex items-center justify-between p-3 rounded-lg bg-gray-50'
                          >
                            <div className='flex items-center'>
                              <span className='text-2xl mr-3'>
                                {constants.roles.emojis[
                                  roleData.role as keyof typeof constants.roles.emojis
                                ] || '🎭'}
                              </span>
                              <span className='font-medium capitalize'>
                                {roleData.role}
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${
                                constants.roles.ui.badge[
                                  roleData.role as keyof typeof constants.roles.ui.badge
                                ] || 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {roleData.count} usuarios
                            </span>
                          </div>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* Capabilities */}
                <CapabilitiesByRole capabilities={dashboardData.capabilities} />
              </div>

              {/* Quick Actions */}
              <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Acciones Rápidas
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                  <button
                    onClick={() =>
                      (window.location.href = '/admin-dashboard/users')
                    }
                    className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left'
                  >
                    <div className='flex items-center mb-2'>
                      <UsersIcon className='h-5 w-5 text-purple-600 mr-2' />
                      <span className='font-medium'>Gestionar Usuarios</span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Crear, editar y eliminar usuarios del sistema
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      (window.location.href = '/admin-dashboard/companies')
                    }
                    className='p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left'
                  >
                    <div className='flex items-center mb-2'>
                      <BuildingOfficeIcon className='h-5 w-5 text-purple-600 mr-2' />
                      <span className='font-medium'>Gestionar Compañías</span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Administrar compañías de teatro del sistema
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
