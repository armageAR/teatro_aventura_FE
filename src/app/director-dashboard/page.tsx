'use client';

import {
  ChartBarIcon,
  EyeIcon,
  FilmIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';
import constants from '@/lib/constants';

import AssignedShows from '@/components/director/AssignedShows';
import LiveSessionStatus from '@/components/director/LiveSessionStatus';
import ProtectedRoute from '@/components/ProtectedRoute';
import QuickActions, { QuickAction } from '@/components/QuickActions';
import DashboardHeader from '@/components/ui/DashboardHeader';
import ErrorAlert from '@/components/ui/ErrorAlert';
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
  const [assignedPlaysCount, setAssignedPlaysCount] = useState<number>(0);
  const [avgQuestionsPerPlay, setAvgQuestionsPerPlay] = useState<number>(0);
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
        const [dashboard, playsResponse] = await Promise.all([
          authAPI.getDirectorDashboard(),
          authAPI.getPlays(),
        ]);
        setDashboardData(dashboard);

        // Extract plays array in a tolerant way
        const extractPlays = (data: unknown) => {
          if (Array.isArray(data)) return data as Array<unknown>;
          if (data && typeof data === 'object') {
            const obj = data as Record<string, unknown>;
            if (Array.isArray(obj.plays)) return obj.plays as Array<unknown>;
            if (Array.isArray(obj.data)) return obj.data as Array<unknown>;
          }
          return [] as Array<unknown>;
        };
        const playsArray = extractPlays(playsResponse);
        setAssignedPlaysCount(playsArray.length);

        // Compute average questions per assigned play
        const playIds = playsArray
          .map((p) =>
            p && typeof p === 'object' ? (p as { id?: unknown }).id : undefined,
          )
          .filter((id): id is number => typeof id === 'number');

        if (playIds.length > 0) {
          const questionResponses = await Promise.all(
            playIds.map((id) => authAPI.getQuestions(id)),
          );
          const getQuestionsCount = (resp: unknown): number => {
            if (resp && typeof resp === 'object') {
              const obj = resp as Record<string, unknown>;
              if (Array.isArray(obj.questions)) return obj.questions.length;
              if (Array.isArray(obj.data)) return obj.data.length;
            }
            return 0;
          };
          const totalQuestions = questionResponses.reduce(
            (sum, r) => sum + getQuestionsCount(r),
            0,
          );
          const avg = totalQuestions / playIds.length;
          setAvgQuestionsPerPlay(
            Number.isFinite(avg) ? Number(avg.toFixed(1)) : 0,
          );
        } else {
          setAvgQuestionsPerPlay(0);
        }
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

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          {error ? (
            <ErrorAlert message={error} />
          ) : dashboardData ? (
            <>
              {/* Quick Actions */}
              <div className='mb-8'>
                <QuickActions actions={actions} />
              </div>

              {/* Quick Stats */}
              <StatsGrid
                items={[
                  {
                    icon: <FilmIcon className='h-5 w-5' />,
                    title: 'Obras Asignadas',
                    value: assignedPlaysCount,
                    color: 'blue',
                  },
                  {
                    icon: <QuestionMarkCircleIcon className='h-5 w-5' />,
                    title: 'Promedio Preguntas/Obra',
                    value: avgQuestionsPerPlay,
                    color: 'green',
                  },
                ]}
              />

              {/* Live Session Status */}
              <LiveSessionStatus
                play='"Romeo y Julieta 2.0"'
                showTime='Hoy, 20:00'
                expectedViewers={156}
                questionCount={8}
              />

              {/* Assigned Shows */}
              <div className='my-8'>
                <AssignedShows />
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
