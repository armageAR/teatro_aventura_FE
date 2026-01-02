'use client';

import { ClockIcon, PlayIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { toast } from 'react-hot-toast';

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
}

interface NextPerformanceProps {
  onManagePlay?: (playId: number) => void;
  onPerformanceStarted?: () => void;
  onPerformanceCancelled?: () => void;
}

const START_TOLERANCE_MS = 2 * 60 * 60 * 1000;

export const NextPerformance: React.FC<NextPerformanceProps> = ({
  onManagePlay,
  onPerformanceStarted,
  onPerformanceCancelled,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPerf, setNextPerf] = useState<PerformanceDashboardInfo | null>(
    null,
  );
  const [now, setNow] = useState<Date>(new Date());
  const [isStarting, setIsStarting] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

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

      return {
        performance,
        playTitle: performance.play?.title ?? `Obra ${performance.play_id}`,
        questionsCount,
        spectatorsCount,
        scheduledAt,
      };
    },
    [extractQuestionsCount],
  );

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authAPI.getPerformances();
      const performances = extractPerformancesFromResponse(response);

      const nowTimestamp = Date.now();
      const upcomingCandidates = performances
        .filter((perf) => !perf.is_active)
        .map((performance) => {
          const scheduledAt = parsePerformanceDateTime(performance);
          if (!scheduledAt) return null;
          return { performance, scheduledAt };
        })
        .filter(
          (
            item,
          ): item is {
            performance: Performance;
            scheduledAt: Date;
          } => {
            if (!item) return false;
            return (
              item.scheduledAt.getTime() >= nowTimestamp - START_TOLERANCE_MS
            );
          },
        )
        .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

      const upcomingInfo =
        upcomingCandidates.length > 0
          ? await buildPerformanceInfo(upcomingCandidates[0].performance)
          : null;

      if (!isMountedRef.current) return;
      setNextPerf(upcomingInfo);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error loading performances', e);
      if (isMountedRef.current) {
        setError('No se pudo cargar la próxima función');
        setNextPerf(null);
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [buildPerformanceInfo]);

  useEffect(() => {
    isMountedRef.current = true;
    loadStatus();
    return () => {
      isMountedRef.current = false;
    };
  }, [loadStatus, user?.id]);

  const countdown = useMemo(() => {
    if (!nextPerf || !nextPerf.scheduledAt)
      return { days: 0, hours: 0, minutes: 0, seconds: 0, overdue: false };
    const target = nextPerf.scheduledAt.getTime();
    const rawDiff = target - now.getTime();
    const diff = Math.max(0, rawDiff);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return {
      days,
      hours,
      minutes,
      seconds,
      overdue:
        rawDiff < 0 &&
        rawDiff >= -START_TOLERANCE_MS &&
        !nextPerf.performance.is_active,
    };
  }, [nextPerf, now]);

  const dateLabel = nextPerf?.scheduledAt
    ? nextPerf.scheduledAt.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : null;
  const timeLabel = nextPerf ? formatPerformanceTime(nextPerf.performance) : '';
  const locationLabel = nextPerf?.performance.location?.trim() ?? '';
  const isOverdue = countdown.overdue;

  const handleStart = async () => {
    if (!nextPerf || isStarting) return;
    const confirmed = window.confirm(
      '¿Confirmás que la obra está por comenzar? Esto activará la función y la marcará como en vivo.',
    );
    if (!confirmed) return;

    try {
      setIsStarting(true);
      await authAPI.startPerformance(nextPerf.performance.id);
      toast.success('Función iniciada correctamente');
      await loadStatus();
      onPerformanceStarted?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error al iniciar función', e);
      toast.error('No se pudo iniciar la función');
    } finally {
      setIsStarting(false);
    }
  };

  const handleCancel = async () => {
    if (!nextPerf || isStarting) return;
    const confirmed = window.confirm(
      '¿Cancelar esta función? Se eliminará y se pasará a la siguiente pendiente.',
    );
    if (!confirmed) return;

    try {
      setIsStarting(true);
      await authAPI.deletePerformance(nextPerf.performance.id);
      toast.success('Función cancelada');
      await loadStatus();
      onPerformanceCancelled?.();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error al cancelar la función', e);
      toast.error('No se pudo cancelar la función');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className='mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white'>
      <h3 className='text-lg font-semibold mb-4 flex items-center'>
        <ClockIcon className='h-5 w-5 mr-2' /> Próxima función
      </h3>
      {isLoading ? (
        <div className='text-white/90'>Cargando próxima función...</div>
      ) : error ? (
        <div className='text-white/90'>{error}</div>
      ) : !nextPerf ? (
        <div className='text-white/90'>
          No hay funciones próximas pendientes.
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {nextPerf ? (
            <QRCodeModal
              isOpen={isQRModalOpen}
              onClose={() => setIsQRModalOpen(false)}
              performance={nextPerf.performance}
            />
          ) : null}
          <div className='bg-white bg-opacity-20 rounded-lg p-4 md:col-span-2'>
            <p className='text-sm opacity-90'>Obra</p>
            <p className='font-semibold text-lg'>{nextPerf.playTitle}</p>
            <p className='text-sm opacity-75 capitalize'>
              {dateLabel ?? 'Fecha no disponible'} •{' '}
              {timeLabel ? `${timeLabel} hs` : 'Horario no definido'}
              {locationLabel ? ` · ${locationLabel}` : ''}
            </p>
            {isOverdue ? (
              <p className='text-sm text-red-200 mt-2 animate-pulse'>
                Inicio atrasado: la función debería haber comenzado.
              </p>
            ) : null}
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg p-4'>
            <p className='text-sm opacity-90'>Cuenta regresiva</p>
            <p
              className={`font-semibold text-lg ${
                isOverdue ? 'text-red-200 animate-pulse' : ''
              }`}
            >
              {countdown.days}d {countdown.hours}h {countdown.minutes}m{' '}
              {countdown.seconds}s
            </p>
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg p-4'>
            <p className='text-sm opacity-90'>Preguntas</p>
            <p className='font-semibold text-2xl'>{nextPerf.questionsCount}</p>
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg p-4'>
            <p className='text-sm opacity-90'>Espectadores</p>
            <p className='font-semibold text-2xl'>{nextPerf.spectatorsCount}</p>
          </div>
          <div className='md:col-span-4 flex flex-col gap-3 sm:flex-row'>
            <button
              onClick={handleStart}
              disabled={isStarting}
              className='inline-flex items-center gap-2 px-4 py-2 rounded bg-green-500 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors'
            >
              {isStarting ? (
                <span>Iniciando...</span>
              ) : (
                <>
                  <PlayIcon className='h-5 w-5' /> Iniciar función
                </>
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={isStarting}
              className='inline-flex items-center gap-2 px-4 py-2 rounded bg-red-500 hover:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors'
            >
              Cancelar función
            </button>
            <button
              onClick={() => setIsQRModalOpen(true)}
              disabled={isStarting}
              className='inline-flex items-center gap-2 px-4 py-2 rounded bg-blue-500 hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium transition-colors'
            >
              <QrCodeIcon className='h-5 w-5' /> Mostrar QR
            </button>
            <button
              onClick={() =>
                onManagePlay
                  ? onManagePlay(nextPerf.performance.play_id)
                  : window.scrollTo({ top: 0, behavior: 'smooth' })
              }
              className='px-4 py-2 rounded bg-white/20 hover:bg-white/30 text-white font-medium'
            >
              Gestionar obra
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NextPerformance;
