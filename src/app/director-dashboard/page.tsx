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
import constants from '@/lib/constants';

import LiveSessionStatus from '@/components/director/LiveSessionStatus';
import ShowCard from '@/components/director/ShowCard';
import ProtectedRoute from '@/components/ProtectedRoute';
import QuickActions, { QuickAction } from '@/components/QuickActions';
import DashboardHeader from '@/components/ui/DashboardHeader';
import ErrorAlert from '@/components/ui/ErrorAlert';
import InfoBanner from '@/components/ui/InfoBanner';
import { Spinner } from '@/components/ui/Spinner';
import StatsGrid from '@/components/ui/StatsGrid';

import CapabilitiesByRole from '@/app/components/users/CapabilitiesByRole';
import LimitationsByRole from '@/app/components/users/LimitationsByRole';
import { useAuth } from '@/contexts/AuthContext';

interface DirectorDashboardData {
  message: string;
  user: string;
  capabilities: string[];
  limitations: string[];
}

export default function DirectorDashboard() {
  useAuth();
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
      <div className={`min-h-screen ${constants.roles.ui.background.director}`}>
        {/* Header */}
        <DashboardHeader
          icon={constants.roles.emojis.director}
          title='Dashboard Director'
          color={constants.roles.ui.colorKeyByRole.director}
        />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {error ? (
            <ErrorAlert message={error} />
          ) : dashboardData ? (
            <>
              {/* Welcome Message */}
              <InfoBanner
                title={dashboardData.message}
                description='Dirige funciones interactivas en tiempo real'
                color={constants.roles.ui.colorKeyByRole.director}
              />

              {/* Quick Stats */}
              <StatsGrid
                items={[
                  {
                    icon: <FilmIcon className='h-5 w-5' />,
                    title: 'Obras Asignadas',
                    value: 5,
                    color: 'blue',
                  },
                  {
                    icon: <QuestionMarkCircleIcon className='h-5 w-5' />,
                    title: 'Preguntas Creadas',
                    value: 42,
                    color: 'green',
                  },
                  {
                    icon: <EyeIcon className='h-5 w-5' />,
                    title: 'Funciones Dirigidas',
                    value: 18,
                    color: 'purple',
                  },
                  {
                    icon: <DocumentArrowDownIcon className='h-5 w-5' />,
                    title: 'Reportes PDF',
                    value: 12,
                    color: 'orange',
                  },
                ]}
              />

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
