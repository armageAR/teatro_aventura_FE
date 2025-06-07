'use client';

import {
  ArrowRightOnRectangleIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  FilmIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';

import ProtectedRoute from '@/components/ProtectedRoute';

import { useAuth } from '@/contexts/AuthContext';

interface DirectorDashboardData {
  message: string;
  user: string;
  capabilities: string[];
  limitations: string[];
}

export default function DirectorDashboard() {
  const { user, logout } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<DirectorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await authAPI.getDirectorDashboard();
        setDashboardData(data);
      } catch (error: unknown) {
        setError('Error al cargar los datos del dashboard');
        // eslint-disable-next-line no-console
        console.error('Error fetching director dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-blue-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        <span className='ml-3 text-gray-600'>Cargando dashboard...</span>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['director']}>
      <div className='min-h-screen bg-blue-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b-4 border-blue-500'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <div className='flex items-center'>
                <div className='text-3xl mr-3'>🎬</div>
                <div>
                  <h1 className='text-2xl font-bold text-blue-800'>
                    Dashboard Director
                  </h1>
                  <p className='text-blue-600'>Bienvenido, {user?.name}</p>
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
              <div className='bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-blue-500'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  {dashboardData.message}
                </h2>
                <p className='text-gray-600'>
                  Dirige funciones interactivas en tiempo real
                </p>
              </div>

              {/* Quick Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <FilmIcon className='h-8 w-8 text-blue-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Obras Asignadas
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>5</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <QuestionMarkCircleIcon className='h-8 w-8 text-green-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Preguntas Creadas
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>42</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-purple-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <EyeIcon className='h-8 w-8 text-purple-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Funciones Dirigidas
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>18</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-orange-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <DocumentArrowDownIcon className='h-8 w-8 text-orange-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Reportes PDF
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>12</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Grid */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                {/* Capabilities */}
                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                    <span className='text-xl mr-2'>🎯</span>
                    Capacidades del Director
                  </h3>
                  <div className='space-y-3'>
                    {dashboardData.capabilities.map((capability, index) => (
                      <div key={index} className='flex items-start'>
                        <div className='flex-shrink-0 mt-1'>
                          <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                        </div>
                        <p className='ml-3 text-gray-700'>{capability}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limitations */}
                <div className='bg-yellow-50 rounded-lg border border-yellow-200 p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                    <ExclamationTriangleIcon className='h-5 w-5 text-yellow-600 mr-2' />
                    Limitaciones
                  </h3>
                  <div className='space-y-3'>
                    {dashboardData.limitations.map((limitation, index) => (
                      <div key={index} className='flex items-start'>
                        <div className='flex-shrink-0 mt-1'>
                          <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
                        </div>
                        <p className='ml-3 text-yellow-800'>{limitation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Session Status */}
              <div className='mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white'>
                <h3 className='text-lg font-semibold mb-4 flex items-center'>
                  <ClockIcon className='h-5 w-5 mr-2' />
                  Estado de Sesión en Vivo
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='bg-white bg-opacity-20 rounded-lg p-4'>
                    <p className='text-sm opacity-90'>Próxima Función</p>
                    <p className='font-semibold text-lg'>
                      "Romeo y Julieta 2.0"
                    </p>
                    <p className='text-sm opacity-75'>Hoy, 20:00</p>
                  </div>
                  <div className='bg-white bg-opacity-20 rounded-lg p-4'>
                    <p className='text-sm opacity-90'>Espectadores Esperados</p>
                    <p className='font-semibold text-2xl'>156</p>
                  </div>
                  <div className='bg-white bg-opacity-20 rounded-lg p-4'>
                    <p className='text-sm opacity-90'>Preguntas Preparadas</p>
                    <p className='font-semibold text-2xl'>8</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Acciones Rápidas
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <button className='p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left group'>
                    <div className='flex items-center mb-2'>
                      <QuestionMarkCircleIcon className='h-5 w-5 text-blue-600 mr-2 group-hover:scale-110 transition-transform' />
                      <span className='font-medium text-blue-800'>
                        Crear Pregunta
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Diseñar nueva pregunta interactiva
                    </p>
                  </button>

                  <button className='p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left group'>
                    <div className='flex items-center mb-2'>
                      <EyeIcon className='h-5 w-5 text-green-600 mr-2 group-hover:scale-110 transition-transform' />
                      <span className='font-medium text-green-800'>
                        Iniciar Función
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Comenzar sesión en vivo
                    </p>
                  </button>

                  <button className='p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left group'>
                    <div className='flex items-center mb-2'>
                      <ChartBarIcon className='h-5 w-5 text-purple-600 mr-2 group-hover:scale-110 transition-transform' />
                      <span className='font-medium text-purple-800'>
                        Ver Resultados
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Analizar respuestas en tiempo real
                    </p>
                  </button>
                </div>
              </div>

              {/* Assigned Shows */}
              <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Obras Asignadas
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200'>
                    <div className='flex items-center'>
                      <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4'>
                        <FilmIcon className='h-6 w-6 text-blue-600' />
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          Romeo y Julieta 2.0
                        </h4>
                        <p className='text-sm text-gray-600'>
                          Drama interactivo • 8 preguntas
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                        Activa
                      </span>
                      <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                        Gestionar
                      </button>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <div className='flex items-center'>
                      <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4'>
                        <FilmIcon className='h-6 w-6 text-gray-600' />
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          El Misterio del Teatro
                        </h4>
                        <p className='text-sm text-gray-600'>
                          Misterio • 12 preguntas
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full'>
                        En preparación
                      </span>
                      <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                        Gestionar
                      </button>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <div className='flex items-center'>
                      <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4'>
                        <FilmIcon className='h-6 w-6 text-gray-600' />
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          La Casa Encantada
                        </h4>
                        <p className='text-sm text-gray-600'>
                          Terror • 6 preguntas
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full'>
                        Finalizada
                      </span>
                      <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                        Ver Reporte
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
