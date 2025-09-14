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
import type { Performance } from '@/lib/types/performance';
import type { Play } from '@/lib/types/play';

import AssignedShows from '@/components/director/AssignedShows';
import LiveSessionStatus from '@/components/director/LiveSessionStatus';
import ManagePlayModal from '@/components/director/ManagePlayModal';
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
  // Manage modal (shared with LiveSessionStatus)
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [questions, setQuestions] = useState<
    Array<{
      id: number;
      title: string;
      body: string | null;
      options?: Array<{ id?: number; text: string }>;
    }>
  >([]);
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
                onManagePlay={async (playId: number) => {
                  try {
                    setIsModalLoading(true);
                    setIsManageOpen(true);
                    const playResp = await authAPI.getPlay(playId);
                    const play = (() => {
                      if (playResp && typeof playResp === 'object') {
                        const obj = playResp as unknown as Record<
                          string,
                          unknown
                        >;
                        if (obj.data && typeof obj.data === 'object')
                          return obj.data as Play;
                        if (obj.obra && typeof obj.obra === 'object')
                          return obj.obra as Play;
                      }
                      return {
                        id: playId,
                        title: `Obra ${playId}`,
                        description: '',
                        release_date: '',
                        created_at: '',
                        updated_at: '',
                      } as unknown as Play;
                    })();
                    setSelectedPlay(play);
                    const perfResp = await authAPI.getPlayPerformances(playId);
                    const perfs = (() => {
                      if (Array.isArray(perfResp))
                        return perfResp as Performance[];
                      if (perfResp && typeof perfResp === 'object') {
                        const obj = perfResp as unknown as Record<
                          string,
                          unknown
                        >;
                        if (Array.isArray(obj.performances))
                          return obj.performances as Performance[];
                      }
                      return [] as Performance[];
                    })();
                    setPerformances(perfs);
                    const qResp = await authAPI.getQuestions(playId);
                    type RawOption = { text?: string; answer?: string };
                    type RawQuestion = {
                      id: number;
                      title?: string;
                      question?: string;
                      body?: string | null;
                      options?: RawOption[];
                      answers?: RawOption[];
                    };
                    const qsSource: RawQuestion[] = (() => {
                      if (qResp && typeof qResp === 'object') {
                        const obj = qResp as Record<string, unknown>;
                        if (Array.isArray(obj.questions))
                          return obj.questions as RawQuestion[];
                        if (Array.isArray(obj.data))
                          return obj.data as RawQuestion[];
                      }
                      return [] as RawQuestion[];
                    })();
                    const qs = qsSource.map((q) => ({
                      id: q.id,
                      title: q.title ?? q.question ?? '',
                      body: q.body ?? null,
                      options: (q.options ?? q.answers ?? []).map((o) => ({
                        text: o.text ?? o.answer ?? '',
                      })),
                    }));
                    setQuestions(qs);
                  } catch (e) {
                    console.error('Error abriendo gestión de obra', e);
                  } finally {
                    setIsModalLoading(false);
                  }
                }}
              />

              {/* Assigned Shows */}
              <div className='my-8'>
                <AssignedShows />
              </div>

              {isManageOpen && selectedPlay && (
                <ManagePlayModal
                  play={selectedPlay}
                  isLoading={isModalLoading}
                  performances={performances}
                  questions={questions}
                  onClose={() => setIsManageOpen(false)}
                  onCreatePerformance={() =>
                    alert(
                      'Crear función desde dashboard no implementado. Usa Obras Asignadas.',
                    )
                  }
                  onEditPerformance={() =>
                    alert(
                      'Editar función desde dashboard no implementado. Usa Obras Asignadas.',
                    )
                  }
                  onDeletePerformance={async () =>
                    alert(
                      'Eliminar función desde dashboard no implementado. Usa Obras Asignadas.',
                    )
                  }
                  onCreateQuestion={() =>
                    alert(
                      'Crear pregunta desde dashboard no implementado. Usa Obras Asignadas.',
                    )
                  }
                  onEditQuestion={() =>
                    alert(
                      'Editar pregunta desde dashboard no implementado. Usa Obras Asignadas.',
                    )
                  }
                  onDeleteQuestion={async () =>
                    alert(
                      'Eliminar pregunta desde dashboard no implementado. Usa Obras Asignadas.',
                    )
                  }
                />
              )}

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
