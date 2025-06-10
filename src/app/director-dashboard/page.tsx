'use client';

import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  FilmIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';

import ProtectedRoute from '@/components/ProtectedRoute';
import DashboardHeader from '@/components/ui/DashboardHeader';
import QuickActions, { QuickAction } from '@/components/QuickActions';
import StatCard from '@/components/StatCard';
import LiveSessionStatus from '@/components/director/LiveSessionStatus';
import ShowCard from '@/components/director/ShowCard';
import CapabilitiesByRole from '@/app/components/users/CapabilitiesByRole';
import LimitationsByRole from '@/app/components/users/LimitationsByRole';
import { Spinner } from '@/components/ui/Spinner';

import { useAuth } from '@/contexts/AuthContext';

interface DirectorDashboardData {
  message: string;
  user: string;
  capabilities: string[];
  limitations: string[];
}

export default function DirectorDashboard() {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] =
    useState<DirectorDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const actions: QuickAction[] = [
    {
      icon: <QuestionMarkCircleIcon className='h-5 w-5' />,
      title: 'Crear Pregunta',
      description: 'Diseñar nueva pregunta interactiva',
      color: 'blue',
    },
    {
      icon: <EyeIcon className='h-5 w-5' />,
      title: 'Iniciar Función',
      description: 'Comenzar sesión en vivo',
      color: 'green',
    },
    {
      icon: <ChartBarIcon className='h-5 w-5' />,
      title: 'Ver Resultados',
      description: 'Analizar respuestas en tiempo real',
      color: 'purple',
    },
  ];

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
    return <Spinner color='blue' />;
  }

  return (
    <ProtectedRoute allowedRoles={['director']}>
      <div className='min-h-screen bg-blue-50'>
        {/* Header */}
        <DashboardHeader icon='🎬' title='Dashboard Director' color='blue' />

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
                <StatCard
                  icon={<FilmIcon className='h-5 w-5' />}
                  title='Obras Asignadas'
                  value={5}
                  color='blue'
                />
                <StatCard
                  icon={<QuestionMarkCircleIcon className='h-5 w-5' />}
                  title='Preguntas Creadas'
                  value={42}
                  color='green'
                />
                <StatCard
                  icon={<EyeIcon className='h-5 w-5' />}
                  title='Funciones Dirigidas'
                  value={18}
                  color='purple'
                />
                <StatCard
                  icon={<DocumentArrowDownIcon className='h-5 w-5' />}
                  title='Reportes PDF'
                  value={12}
                  color='orange'
                />
              </div>

              {/* Main Content Grid */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                <CapabilitiesByRole capabilities={dashboardData.capabilities} />
                <LimitationsByRole limitations={dashboardData.limitations} />
              </div>

              {/* Live Session Status */}
              <LiveSessionStatus
                play='"Romeo y Julieta 2.0"'
                showTime='Hoy, 20:00'
                expectedViewers={156}
                questionCount={8}
              />

              {/* Quick Actions */}
              <QuickActions actions={actions} />

              {/* Assigned Shows */}
              <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Obras Asignadas
                </h3>
                <div className='space-y-4'>
                  <ShowCard
                    title='Romeo y Julieta 2.0'
                    subtitle='Drama interactivo • 8 preguntas'
                    status='active'
                    actionLabel='Gestionar'
                  />
                  <ShowCard
                    title='El Misterio del Teatro'
                    subtitle='Misterio • 12 preguntas'
                    status='preparation'
                    actionLabel='Gestionar'
                  />
                  <ShowCard
                    title='La Casa Encantada'
                    subtitle='Terror • 6 preguntas'
                    status='finished'
                    actionLabel='Ver Reporte'
                  />
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </ProtectedRoute>
  );
}
