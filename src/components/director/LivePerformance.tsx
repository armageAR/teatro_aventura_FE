'use client';

import { PlayIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { authAPI } from '@/lib/api';
import {
  extractPerformancesFromResponse,
  formatPerformanceTime,
  parsePerformanceDateTime,
} from '@/lib/director/performance-utils';
import type { Performance } from '@/lib/types/performance';

import QRCodeModal from '@/components/director/PerformanceQRCodeModal';

import { useAuth } from '@/contexts/AuthContext';

interface PerformanceDashboardInfo {
  performance: Performance;
  playTitle: string;
  questionsCount: number;
  spectatorsCount: number;
  scheduledAt: Date | null;
  startedAt: Date | null;
}

interface LivePerformanceProps {
  refreshKey?: number;
}

const LivePerformance: React.FC<LivePerformanceProps> = ({ refreshKey }) => {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePerf, setActivePerf] = useState<PerformanceDashboardInfo | null>(
    null,
  );
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const isMountedRef = useRef(true);

  const extractQuestionsCount = useCallback((resp: unknown): number => {
    if (resp && typeof resp === 'object') {
      const obj = resp as Record<string, unknown>;
      if (Array.isArray(obj.questions)) return obj.questions.length;
      if (Array.isArray(obj.data)) return obj.data.length;
    }
    return 0;
  }, []);

  const buildPerformanceInfo = useCallback(
    async (performance: Performance): Promise<PerformanceDashboardInfo> => {
      const [questionsCount, spectatorsCount] = await Promise.all([
        authAPI
          .getQuestions(performance.play_id)
          .then(extractQuestionsCount)
          .catch(() => 0),
        authAPI.getPerformanceSpectatorsCount(performance.id).catch(() => 0),
      ]);

      const scheduledAt = parsePerformanceDateTime(performance);
      const startedAt = performance.started_at
        ? (() => {
            const parsed = new Date(performance.started_at as string);
            return Number.isNaN(parsed.getTime()) ? null : parsed;
          })()
        : null;

      return {
        performance,
        playTitle: performance.play?.title ?? `Obra ${performance.play_id}`,
        questionsCount,
        spectatorsCount,
        scheduledAt,
        startedAt,
      };
    },
    [extractQuestionsCount],
  );

  const loadActivePerformance = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.getPerformances({ is_active: true });
      const performances = extractPerformancesFromResponse(response);
      const activeCandidate = performances[0];

      if (!activeCandidate) {
        if (isMountedRef.current) setActivePerf(null);
        return;
      }

      const info = await buildPerformanceInfo(activeCandidate);
      if (isMountedRef.current) setActivePerf(info);
    } catch (err) {
      console.error('Error loading active performance', err);
      if (isMountedRef.current) {
        setError('No se pudo obtener la función activa');
        setActivePerf(null);
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [buildPerformanceInfo]);

  useEffect(() => {
    isMountedRef.current = true;
    loadActivePerformance();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadActivePerformance, user?.id, refreshKey]);

  const handleOpenLiveRoom = () => {
    if (!activePerf) return;
    router.push(`/director-dashboard/live/${activePerf.performance.id}`);
  };

  const activeDateLabel = useMemo(() => {
    if (!activePerf?.scheduledAt) return null;
    return activePerf.scheduledAt.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  }, [activePerf?.scheduledAt]);

  const activeTimeLabel = useMemo(() => {
    if (!activePerf) return '';
    return formatPerformanceTime(activePerf.performance);
  }, [activePerf]);

  const activeStartedLabel = useMemo(() => {
    if (!activePerf?.startedAt) return 'Esperando inicio';
    return `Inició a las ${activePerf.startedAt.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }, [activePerf?.startedAt]);

  const locationLabel = activePerf?.performance.location?.trim() ?? '';

  return (
    <div className='mt-8 bg-white border border-gray-200 rounded-lg shadow-sm p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>Función en vivo</h2>
        {activePerf ? (
          <span className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium'>
            <span className='inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse'></span>
            En vivo
          </span>
        ) : null}
      </div>

      {activePerf ? (
        <QRCodeModal
          isOpen={isQRModalOpen}
          onClose={() => setIsQRModalOpen(false)}
          performance={activePerf.performance}
        />
      ) : null}

      {isLoading ? (
        <p className='text-sm text-gray-500'>Cargando estado de funciones…</p>
      ) : error ? (
        <p className='text-sm text-red-600'>{error}</p>
      ) : !activePerf ? (
        <p className='text-sm text-gray-500'>
          No hay funciones activas en este momento.
        </p>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-5 gap-4'>
          <div className='md:col-span-2 flex flex-col gap-1'>
            <p className='text-sm text-gray-500 uppercase tracking-wide'>
              Obra
            </p>
            <p className='text-xl font-semibold text-gray-900'>
              {activePerf.playTitle}
            </p>
            <p className='text-sm text-gray-600 capitalize'>
              {activeDateLabel ?? 'Fecha no disponible'} •
              {activeTimeLabel
                ? ` ${activeTimeLabel} hs`
                : ' Horario no definido'}
              {locationLabel ? ` · ${locationLabel}` : ''}
            </p>
            <p className='text-sm text-gray-500'>{activeStartedLabel}</p>
          </div>
          <div className='bg-blue-50 rounded-lg p-4 text-center'>
            <p className='text-xs uppercase tracking-wide text-blue-600'>
              Preguntas
            </p>
            <p className='text-2xl font-semibold text-gray-900'>
              {activePerf.questionsCount}
            </p>
          </div>
          <div className='bg-purple-50 rounded-lg p-4 text-center'>
            <p className='text-xs uppercase tracking-wide text-purple-600'>
              Espectadores
            </p>
            <p className='text-2xl font-semibold text-gray-900'>
              {activePerf.spectatorsCount}
            </p>
          </div>
          <div className='flex items-center justify-center md:justify-end gap-3'>
            <button
              onClick={() => setIsQRModalOpen(true)}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors'
            >
              <QrCodeIcon className='h-5 w-5' /> Mostrar QR
            </button>
            <button
              onClick={handleOpenLiveRoom}
              className='inline-flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors'
            >
              <PlayIcon className='h-5 w-5' /> Abrir sala en vivo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LivePerformance;
