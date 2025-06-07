'use client';

import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  PlayIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';

import ProtectedRoute from '@/components/ProtectedRoute';

import { useAuth } from '@/contexts/AuthContext';

interface SpectatorHistoryData {
  message: string;
  user: string;
  capabilities: string[];
  note: string;
}

export default function MyHistory() {
  const { user, logout } = useAuth();
  const [historyData, setHistoryData] = useState<SpectatorHistoryData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const data = await authAPI.getMyHistory();
        setHistoryData(data);
      } catch (error: unknown) {
        setError('Error al cargar el historial');
        // eslint-disable-next-line no-console
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, []);

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-green-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600'></div>
        <span className='ml-3 text-gray-600'>Cargando historial...</span>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['espectador']}>
      <div className='min-h-screen bg-green-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b-4 border-green-500'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <div className='flex items-center'>
                <div className='text-3xl mr-3'>👤</div>
                <div>
                  <h1 className='text-2xl font-bold text-green-800'>
                    Mi Historial Teatral
                  </h1>
                  <p className='text-green-600'>Bienvenido, {user?.name}</p>
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
          ) : historyData ? (
            <>
              {/* Welcome Message */}
              <div className='bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 border-green-500'>
                <h2 className='text-xl font-semibold text-gray-900 mb-2'>
                  {historyData.message}
                </h2>
                <p className='text-gray-600'>
                  Revive tus experiencias teatrales interactivas
                </p>
                <div className='mt-4 p-3 bg-green-50 rounded-md'>
                  <p className='text-sm text-green-800 font-medium'>
                    📝 {historyData.note}
                  </p>
                </div>
              </div>

              {/* Quick Stats */}
              <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-green-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <PlayIcon className='h-8 w-8 text-green-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Funciones Asistidas
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>7</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-blue-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <ClockIcon className='h-8 w-8 text-blue-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Horas de Teatro
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>14</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-purple-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <StarIcon className='h-8 w-8 text-purple-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Participaciones
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>156</p>
                    </div>
                  </div>
                </div>

                <div className='bg-white rounded-lg shadow-sm p-6 border-t-4 border-orange-500'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <DocumentTextIcon className='h-8 w-8 text-orange-600' />
                    </div>
                    <div className='ml-4'>
                      <p className='text-sm font-medium text-gray-500'>
                        Informes
                      </p>
                      <p className='text-2xl font-bold text-gray-900'>7</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Capabilities */}
              <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                  <span className='text-xl mr-2'>✨</span>
                  Características del Espectador
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='space-y-3'>
                    {historyData.capabilities.map((capability, index) => (
                      <div key={index} className='flex items-start'>
                        <div className='flex-shrink-0 mt-1'>
                          <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                        </div>
                        <p className='ml-3 text-gray-700'>{capability}</p>
                      </div>
                    ))}
                  </div>

                  <div className='bg-green-50 rounded-lg p-4'>
                    <h4 className='font-medium text-green-900 mb-2'>
                      💡 ¿Sabías que...?
                    </h4>
                    <p className='text-sm text-green-800'>
                      Como espectador registrado, puedes acceder a todos los
                      informes finales de las funciones en las que participaste,
                      ver tus respuestas y comparar resultados con otros
                      espectadores.
                    </p>
                  </div>
                </div>
              </div>

              {/* Recent Functions */}
              <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Funciones Recientes
                </h3>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200'>
                    <div className='flex items-center'>
                      <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4'>
                        <PlayIcon className='h-6 w-6 text-green-600' />
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          Romeo y Julieta 2.0
                        </h4>
                        <p className='text-sm text-gray-600'>
                          15 de Enero, 2025 • 20:00 hrs
                        </p>
                        <p className='text-xs text-green-700'>
                          Participaste en 8 decisiones
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'>
                        Completada
                      </span>
                      <button className='text-green-600 hover:text-green-800 text-sm font-medium'>
                        Ver Informe
                      </button>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200'>
                    <div className='flex items-center'>
                      <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4'>
                        <PlayIcon className='h-6 w-6 text-blue-600' />
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          El Misterio del Teatro
                        </h4>
                        <p className='text-sm text-gray-600'>
                          10 de Enero, 2025 • 19:30 hrs
                        </p>
                        <p className='text-xs text-blue-700'>
                          Participaste en 12 decisiones
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full'>
                        Completada
                      </span>
                      <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                        Ver Informe
                      </button>
                    </div>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200'>
                    <div className='flex items-center'>
                      <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4'>
                        <PlayIcon className='h-6 w-6 text-purple-600' />
                      </div>
                      <div>
                        <h4 className='font-medium text-gray-900'>
                          La Casa Encantada
                        </h4>
                        <p className='text-sm text-gray-600'>
                          5 de Enero, 2025 • 21:00 hrs
                        </p>
                        <p className='text-xs text-purple-700'>
                          Participaste en 6 decisiones
                        </p>
                      </div>
                    </div>
                    <div className='flex items-center space-x-2'>
                      <span className='px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full'>
                        Completada
                      </span>
                      <button className='text-purple-600 hover:text-purple-800 text-sm font-medium'>
                        Ver Informe
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Acciones Disponibles
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <button className='p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left group'>
                    <div className='flex items-center mb-2'>
                      <CalendarDaysIcon className='h-5 w-5 text-green-600 mr-2 group-hover:scale-110 transition-transform' />
                      <span className='font-medium text-green-800'>
                        Ver Calendario
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Consultar próximas funciones disponibles
                    </p>
                  </button>

                  <button className='p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left group'>
                    <div className='flex items-center mb-2'>
                      <DocumentTextIcon className='h-5 w-5 text-blue-600 mr-2 group-hover:scale-110 transition-transform' />
                      <span className='font-medium text-blue-800'>
                        Mis Informes
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Descargar todos los informes finales
                    </p>
                  </button>

                  <button className='p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left group'>
                    <div className='flex items-center mb-2'>
                      <EyeIcon className='h-5 w-5 text-purple-600 mr-2 group-hover:scale-110 transition-transform' />
                      <span className='font-medium text-purple-800'>
                        Mis Respuestas
                      </span>
                    </div>
                    <p className='text-sm text-gray-600'>
                      Ver estadísticas de participación
                    </p>
                  </button>
                </div>
              </div>

              {/* Access Reminder */}
              <div className='mt-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg p-6 text-white'>
                <h3 className='text-lg font-semibold mb-2 flex items-center'>
                  📱 Acceso Rápido
                </h3>
                <p className='mb-4'>
                  ¿Vas al teatro? Recuerda que puedes acceder directamente
                  escaneando el código QR sin necesidad de hacer login.
                </p>
                <div className='flex items-center'>
                  <div className='bg-white bg-opacity-20 rounded-lg p-3 mr-4'>
                    <span className='text-2xl'>📱</span>
                  </div>
                  <p className='text-sm opacity-90'>
                    Escanea el código QR en el teatro para participar
                    instantáneamente
                  </p>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
