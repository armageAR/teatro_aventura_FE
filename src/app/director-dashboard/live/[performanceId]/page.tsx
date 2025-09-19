'use client';

import {
  ArrowLeftIcon,
  ChartBarIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import {
  formatPerformanceTime,
  parsePerformanceDateTime,
} from '@/lib/director/performance-utils';
import type { Performance } from '@/lib/types/performance';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Spinner } from '@/components/ui/Spinner';

interface LivePerformancePageProps {
  params: {
    performanceId: string;
  };
}

const extractPerformance = (data: unknown): Performance | null => {
  if (!data) return null;
  if (Array.isArray(data)) return (data[0] || null) as Performance | null;
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    if (obj.performance && typeof obj.performance === 'object')
      return obj.performance as Performance;
    if (obj.data && typeof obj.data === 'object')
      return obj.data as Performance;
  }
  return data as Performance;
};

const extractQuestionsCount = (resp: unknown): number => {
  if (resp && typeof resp === 'object') {
    const obj = resp as Record<string, unknown>;
    if (Array.isArray(obj.questions)) return obj.questions.length;
    if (Array.isArray(obj.data)) return obj.data.length;
  }
  return 0;
};

const LivePerformancePage: React.FC<LivePerformancePageProps> = ({
  params,
}) => {
  const router = useRouter();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [spectatorsCount, setSpectatorsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPerformance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const performanceId = Number(params.performanceId);
        if (!Number.isFinite(performanceId)) {
          setError('Identificador de función inválido');
          setIsLoading(false);
          return;
        }

        const response = await authAPI.getPerformance(performanceId);
        const perf = extractPerformance(response);
        if (!perf) {
          setError('No se encontró la función solicitada');
          setIsLoading(false);
          return;
        }

        setPerformance(perf);

        const [qCount, spectators] = await Promise.all([
          authAPI
            .getQuestions(perf.play_id)
            .then(extractQuestionsCount)
            .catch(() => 0),
          authAPI.getPerformanceSpectatorsCount(perf.id).catch(() => 0),
        ]);
        setQuestionsCount(qCount);
        setSpectatorsCount(spectators);
      } catch (err) {
        console.error('Error loading live performance', err);
        setError('No se pudo cargar la función activa');
      } finally {
        setIsLoading(false);
      }
    };

    loadPerformance();
  }, [params.performanceId]);

  const handleBackToDashboard = () => {
    router.push('/director-dashboard');
  };

  const handleGoToResults = () => {
    if (!performance) return;
    router.push(`/performance/${performance.id}/results`);
  };

  const startedAt = performance?.started_at
    ? (() => {
        const parsed = new Date(performance.started_at as string);
        return Number.isNaN(parsed.getTime()) ? null : parsed;
      })()
    : null;
  const scheduledAt = performance
    ? parsePerformanceDateTime(performance)
    : null;
  const startedLabel = startedAt
    ? startedAt.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Sin inicio registrado';
  const scheduledLabel = scheduledAt
    ? scheduledAt.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : 'Fecha no disponible';
  const scheduledTime = performance ? formatPerformanceTime(performance) : '';

  if (isLoading) {
    return (
      <div className='min-h-screen bg-blue-50 flex items-center justify-center'>
        <Spinner color='blue' />
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className='min-h-screen bg-blue-50 flex items-center justify-center'>
        <div className='bg-white rounded-lg shadow p-8 text-center max-w-md'>
          <p className='text-4xl mb-4'>🎭</p>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
            {error ?? 'No se encontró la función'}
          </h1>
          <p className='text-gray-600 mb-6'>
            Revisa el estado de tus funciones o intenta recargar la página.
          </p>
          <button
            onClick={handleBackToDashboard}
            className='inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700'
          >
            <ArrowLeftIcon className='h-5 w-5' /> Volver al dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['director']}>
      <div className='min-h-screen bg-blue-50'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
          <div className='flex items-center justify-between mb-6'>
            <button
              onClick={handleBackToDashboard}
              className='inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white shadow hover:shadow-md text-gray-700'
            >
              <ArrowLeftIcon className='h-5 w-5' /> Volver
            </button>
            <span className='inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium'>
              En vivo
            </span>
          </div>

          <div className='bg-white rounded-xl shadow-md p-6 mb-6'>
            <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
              {performance.play?.title ?? `Obra ${performance.play_id}`}
            </h1>
            <p className='text-gray-600 mb-4'>
              {performance.play?.description ?? 'Sin descripción disponible.'}
            </p>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='bg-blue-50 rounded-lg p-4 flex items-center gap-3'>
                <UsersIcon className='h-6 w-6 text-blue-600' />
                <div>
                  <p className='text-sm text-blue-600 uppercase tracking-wide'>
                    Espectadores
                  </p>
                  <p className='text-xl font-semibold text-gray-900'>
                    {spectatorsCount}
                  </p>
                </div>
              </div>
              <div className='bg-purple-50 rounded-lg p-4 flex items-center gap-3'>
                <ChartBarIcon className='h-6 w-6 text-purple-600' />
                <div>
                  <p className='text-sm text-purple-600 uppercase tracking-wide'>
                    Preguntas activas
                  </p>
                  <p className='text-xl font-semibold text-gray-900'>
                    {questionsCount}
                  </p>
                </div>
              </div>
              <div className='bg-green-50 rounded-lg p-4'>
                <p className='text-sm text-green-600 uppercase tracking-wide mb-1'>
                  Horario
                </p>
                <p className='text-lg font-semibold text-gray-900 capitalize'>
                  {scheduledLabel}
                </p>
                <p className='text-sm text-gray-600'>
                  Programada: {scheduledTime ? `${scheduledTime} hs` : '—'}
                </p>
                <p className='text-sm text-gray-600'>
                  Inicio real: {startedLabel}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-xl shadow-md p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Acciones rápidas
            </h2>
            <div className='flex flex-col sm:flex-row gap-3'>
              <button
                onClick={handleGoToResults}
                className='inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700'
              >
                <ChartBarIcon className='h-5 w-5' /> Ver resultados parciales
              </button>
              <button
                onClick={() =>
                  toast('Vista de control en vivo aún no disponible')
                }
                className='inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gray-100 text-gray-700 font-medium hover:bg-gray-200'
              >
                Próximamente: Control en vivo
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LivePerformancePage;
