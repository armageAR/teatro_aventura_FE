'use client';

import { ClockIcon, PlayIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';

import { authAPI } from '@/lib/api';
import type { Performance } from '@/lib/types/performance';
import type { Play } from '@/lib/types/play';

interface NextPerformanceInfo {
  performance: Performance;
  playTitle: string;
  questionsCount: number;
  spectatorsCount: number;
}

interface LiveSessionStatusProps {
  onManagePlay?: (playId: number) => void;
}

function parseDate(p: Performance): Date {
  const hasT = typeof p.date === 'string' && p.date.includes('T');
  if (hasT) {
    const d = new Date(p.date);
    if (!Number.isNaN(d.getTime())) return d;
  }
  if (p.time) {
    const d = new Date(`${p.date}T${p.time}`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date(p.date);
}

function timeForDisplay(p: Performance): string {
  if (p.time && String(p.time).trim()) return String(p.time).slice(0, 5);
  const d = parseDate(p);
  if (Number.isNaN(d.getTime())) return '';
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export const LiveSessionStatus: React.FC<LiveSessionStatusProps> = ({
  onManagePlay,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPerf, setNextPerf] = useState<NextPerformanceInfo | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const loadNextPerformance = async () => {
      try {
        setIsLoading(true);
        const playsResp = await authAPI.getPlays();
        const plays = (() => {
          if (Array.isArray(playsResp)) return playsResp as Play[];
          if (playsResp && typeof playsResp === 'object') {
            const obj = playsResp as unknown as Record<string, unknown>;
            if (Array.isArray(obj.plays)) return obj.plays as Play[];
            if (Array.isArray(obj.data)) return obj.data as Play[];
          }
          return [] as Play[];
        })();

        const candidateLists = await Promise.all(
          plays.map(async (p: Play) => {
            const listResp = await authAPI.getPlayPerformances(p.id);
            const perfs = (() => {
              if (Array.isArray(listResp)) return listResp as Performance[];
              if (listResp && typeof listResp === 'object') {
                const obj = listResp as unknown as Record<string, unknown>;
                if (Array.isArray(obj.performances))
                  return obj.performances as Performance[];
              }
              return [] as Performance[];
            })();
            return perfs
              .filter(
                (pf) =>
                  pf && !pf.is_active && parseDate(pf).getTime() > Date.now(),
              )
              .map((pf) => ({ perf: pf, play: p }));
          }),
        );
        const candidates = candidateLists.flat();
        if (candidates.length === 0) {
          setNextPerf(null);
          return;
        }

        const next = candidates.sort(
          (a, b) => parseDate(a.perf).getTime() - parseDate(b.perf).getTime(),
        )[0];

        const qResp = await authAPI.getQuestions(next.play.id);
        const questionsCount = (() => {
          if (qResp && typeof qResp === 'object') {
            const obj = qResp as Record<string, unknown>;
            if (Array.isArray(obj.questions)) return obj.questions.length;
            if (Array.isArray(obj.data)) return obj.data.length;
          }
          return 0;
        })();

        const spectatorsCount = await authAPI.getPerformanceSpectatorsCount(
          next.perf.id,
        );

        setNextPerf({
          performance: next.perf,
          playTitle: next.play.title || `Obra ${next.play.id}`,
          questionsCount,
          spectatorsCount,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Error loading next performance', e);
        setError('No se pudo cargar la próxima función');
      } finally {
        setIsLoading(false);
      }
    };

    loadNextPerformance();
  }, []);

  const countdown = useMemo(() => {
    if (!nextPerf) return null;
    const target = parseDate(nextPerf.performance).getTime();
    const diff = Math.max(0, target - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  }, [nextPerf, now]);

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
            <p className='text-sm opacity-75'>
              {new Date(nextPerf.performance.date).toLocaleDateString('es-ES')}{' '}
              • {timeForDisplay(nextPerf.performance)}
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
