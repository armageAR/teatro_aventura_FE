'use client';

import {
  ArrowRightOnRectangleIcon,
  CalendarIcon,
  ChartBarIcon,
  PlayIcon,
  PlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';

import ProtectedRoute from '@/components/ProtectedRoute';

import CapabilitiesByRole from '@/app/components/users/CapabilitiesByRole';
import LimitationsByRole from '@/app/components/users/LimitationsByRole';
import { useAuth } from '@/contexts/AuthContext';

interface ProducerDashboardData {
  message: string;
  user: string;
  capabilities: string[];
  limitations: string[];
}

export default function ProducerDashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<ProducerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await authAPI.getProducerDashboard();
        setDashboardData(data);
      } catch (error: unknown) {
        setError('Error al cargar los datos del dashboard');
        // eslint-disable-next-line no-console
        console.error('Error fetching producer dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-red-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600'></div>
        <span className='ml-3 text-gray-600'>Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['productor']}>
      <div className='min-h-screen bg-red-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b-4 border-red-500'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <div className='flex items-center'>
                <div className='text-3xl mr-3'>🎭</div>
                <div>
                  <h1 className='text-2xl font-bold text-red-800'>
                    Dashboard Productor
                  </h1>
                  <p className='text-red-600'>Bienvenido, {user?.name}</p>
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
              <div className='bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-red-500'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  {dashboardData.message}
                </h2>
                <p className='text-gray-600'>
                  Crea y gestiona tus obras teatrales interactivas
                </p>
              </div>

              {/* Quick Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-red-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <PlayIcon className='h-8 w-8 text-red-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Mis Obras
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>3</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-orange-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <CalendarIcon className='h-8 w-8 text-orange-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Funciones
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>12</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <UsersIcon className='h-8 w-8 text-blue-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Directores
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>8</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <ChartBarIcon className='h-8 w-8 text-green-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Espectadores
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>245</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Acciones Rápidas
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <button className='p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left group'>
                    <div className='flex items-center mb-2'>
                      <PlusIcon className='h-5 w-5 text-red-600 mr-2 group-hover:scale-110 transition-transform' />
                      <span className='font-medium text-red-800'>
                        Nueva Obra
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Crear una nueva obra teatral interactiva
                    </p>
                  </button>

                  <button className='p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-left group'>
                    <div className='flex items-center mb-2'>
                      <CalendarIcon className='h-5 w-5 text-orange-600 mr-2 group-hover:scale-110 transition-transform' />
                      <span className='font-medium text-orange-800'>
                        Programar Función
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Crear nuevas fechas y horarios
                    </p>
                  </button>

                  <button className='p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left group'>
                    <div className='flex items-center mb-2'>
                      <UsersIcon className='h-5 w-5 text-blue-600 mr-2 group-hover:scale-110 transition-transform' />
                      <span className='font-medium text-blue-800'>
                        Asignar Director
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Gestionar equipo de directores
                    </p>
                  </button>
                </div>
              </div>

              {/* Recent Activity */}
              <div className='mt-8 bg-white rounded-lg shadow-sm p-6 mb-8'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Actividad Reciente
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
                        <PlayIcon className='h-4 w-4 text-red-600' />
                      </div>
                    </div>
                    <div className='ml-3 flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        Obra "El Misterio del Teatro" creada
                      </p>
                      <p className='text-xs text-gray-500'>Hace 2 horas</p>
                    </div>
                  </div>

                  <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
                        <CalendarIcon className='h-4 w-4 text-orange-600' />
                      </div>
                    </div>
                    <div className='ml-3 flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        Función programada para el 15 de Enero
                      </p>
                      <p className='text-xs text-gray-500'>Ayer</p>
                    </div>
                  </div>

                  <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
                    <div className='flex-shrink-0'>
                      <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                        <UsersIcon className='h-4 w-4 text-blue-600' />
                      </div>
                    </div>
                    <div className='ml-3 flex-1'>
                      <p className='text-sm font-medium text-gray-900'>
                        Director María García asignada
                      </p>
                      <p className='text-xs text-gray-500'>Hace 3 días</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <CapabilitiesByRole capabilities={dashboardData.capabilities} />
                <LimitationsByRole limitations={dashboardData.limitations} />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
