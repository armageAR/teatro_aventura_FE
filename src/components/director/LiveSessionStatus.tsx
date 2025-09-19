'use client';

import { ClockIcon, PlayIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';

import { authAPI } from '@/lib/api';
import {
  extractPerformancesFromResponse,
  formatPerformanceTime,
  parsePerformanceDateTime,
} from '@/lib/director/performance-utils';
import type { Performance } from '@/lib/types/performance';

import { useAuth } from '@/contexts/AuthContext';

interface NextPerformanceInfo {
  performance: Performance;
  playTitle: string;
  questionsCount: number;
  spectatorsCount: number;
}

interface LiveSessionStatusProps {
  onManagePlay?: (playId: number) => void;
}

export const LiveSessionStatus: React.FC<LiveSessionStatusProps> = ({
  onManagePlay,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPerf, setNextPerf] = useState<NextPerformanceInfo | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadNextPerformance = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await authAPI.getPerformances();
        const performances = extractPerformancesFromResponse(response);

        const nowTimestamp = Date.now();
        const upcomingCandidates = performances
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
            } =>
              Boolean(item) &&
              !item.performance.is_active &&
              item.scheduledAt.getTime() >= nowTimestamp,
          )
          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

        if (upcomingCandidates.length === 0) {
          if (isMounted) setNextPerf(null);
          return;
        }

        const [next] = upcomingCandidates;

        const qResp = await authAPI.getQuestions(next.performance.play_id);
        const questionsCount = (() => {
          if (qResp && typeof qResp === 'object') {
            const obj = qResp as Record<string, unknown>;
            if (Array.isArray(obj.questions)) return obj.questions.length;
            if (Array.isArray(obj.data)) return obj.data.length;
          }
          return 0;
        })();

        const spectatorsCount = await authAPI.getPerformanceSpectatorsCount(
          next.performance.id,
        );

        if (isMounted) {
          setNextPerf({
            performance: next.performance,
            playTitle:
              next.performance.play?.title ||
              `Obra ${next.performance.play_id}`,
            questionsCount,
            spectatorsCount,
          });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error loading next performance', e);
        if (isMounted) {
          setError('No se pudo cargar la próxima función');
          setNextPerf(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadNextPerformance();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const countdown = useMemo(() => {
    if (!nextPerf) return null;
    const scheduled = parsePerformanceDateTime(nextPerf.performance);
    if (!scheduled) return null;
    const target = scheduled.getTime();
    const diff = Math.max(0, target - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  }, [nextPerf, now]);

  const scheduledAt = nextPerf
    ? parsePerformanceDateTime(nextPerf.performance)
    : null;
  const dateLabel = scheduledAt
    ? scheduledAt.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : null;
  const timeLabel = nextPerf ? formatPerformanceTime(nextPerf.performance) : '';
  const locationLabel = nextPerf?.performance.location?.trim() ?? '';

  const handleStart = async () => {
    if (!nextPerf) return;
    try {
      await authAPI.startPerformance(nextPerf.performance.id);
      window.location.reload();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Error al iniciar función', e);
      alert('No se pudo iniciar la función');
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
          <div className='bg-white bg-opacity-20 rounded-lg p-4 md:col-span-2'>
            <p className='text-sm opacity-90'>Obra</p>
            <p className='font-semibold text-lg'>{nextPerf.playTitle}</p>
            <p className='text-sm opacity-75 capitalize'>
              {dateLabel ?? 'Fecha no disponible'} •{' '}
              {timeLabel ? `${timeLabel} hs` : 'Horario no definido'}
              {locationLabel ? ` · ${locationLabel}` : ''}
            </p>
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg p-4'>
            <p className='text-sm opacity-90'>Cuenta regresiva</p>
            {countdown ? (
              <p className='font-semibold text-lg'>
                {countdown.days}d {countdown.hours}h {countdown.minutes}m{' '}
                {countdown.seconds}s
              </p>
            ) : (
              <p className='font-semibold text-lg'>—</p>
            )}
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg p-4'>
            <p className='text-sm opacity-90'>Preguntas</p>
            <p className='font-semibold text-2xl'>{nextPerf.questionsCount}</p>
          </div>
          <div className='bg-white bg-opacity-20 rounded-lg p-4'>
            <p className='text-sm opacity-90'>Espectadores</p>
            <p className='font-semibold text-2xl'>{nextPerf.spectatorsCount}</p>
          </div>
          <div className='md:col-span-4 flex gap-3'>
            <button
              onClick={handleStart}
              className='inline-flex items-center px-4 py-2 rounded bg-green-500 hover:bg-green-600 text-white font-medium'
            >
              <PlayIcon className='h-5 w-5 mr-2' /> Iniciar función
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

export default LiveSessionStatus;
