'use client';

import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';
import {
  extractPerformancesFromResponse,
  parsePerformanceDateTime,
} from '@/lib/director/performance-utils';

import ErrorAlert from '@/components/ui/ErrorAlert';
import { Spinner } from '@/components/ui/Spinner';

import { useAuth } from '@/contexts/AuthContext';

type UpcomingPerformanceItem = {
  id: number;
  playTitle: string;
  location: string;
  scheduledAt: Date;
  dateLabel: string;
  timeLabel: string;
};

const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
});

const timeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
});

const UpcomingPerformances: React.FC = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<UpcomingPerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUpcomingPerformances = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const performancesResponse = await authAPI.getPerformances();
        const performanceList =
          extractPerformancesFromResponse(performancesResponse);

        const now = new Date();
        const upcoming = performanceList
          .map((performance) => {
            const scheduledAt = parsePerformanceDateTime(performance);
            if (!scheduledAt) return null;
            return {
              id: performance.id,
              playTitle:
                performance.play?.title ?? `Obra ${performance.play_id}`,
              location: performance.location || 'Sin ubicación definida',
              scheduledAt,
            };
          })
          .filter(
            (
              item,
            ): item is Omit<
              UpcomingPerformanceItem,
              'dateLabel' | 'timeLabel'
            > => {
              if (!item) return false;
              return item.scheduledAt.getTime() >= now.getTime();
            },
          )
          .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())
          .map((item) => ({
            ...item,
            dateLabel: dateFormatter.format(item.scheduledAt),
            timeLabel: timeFormatter.format(item.scheduledAt),
          }));

        if (isMounted) {
          setItems(upcoming);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError('Error al cargar las próximas funciones');
        }
        // eslint-disable-next-line no-console
        console.error('Error fetching upcoming performances', fetchError);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUpcomingPerformances();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  return (
    <section className='bg-white border border-gray-200 rounded-lg shadow-sm p-6'>
      <div className='flex items-center justify-between mb-4'>
        <h2 className='text-lg font-semibold text-gray-900'>
          Próximas Funciones
        </h2>
      </div>

      {isLoading ? (
        <div className='flex justify-center py-8'>
          <Spinner color='blue' />
        </div>
      ) : error ? (
        <ErrorAlert message={error} className='mb-0' />
      ) : items.length === 0 ? (
        <p className='text-sm text-gray-500'>
          No hay funciones próximas programadas.
        </p>
      ) : (
        <ul className='space-y-4'>
          {items.map((item) => (
            <li
              key={item.id}
              className='border border-gray-100 rounded-md px-4 py-3 flex flex-col gap-1'
            >
              <span className='text-base font-medium text-gray-900'>
                {item.playTitle}
              </span>
              <span className='text-sm text-gray-600 capitalize'>
                {item.dateLabel}
              </span>
              <span className='text-sm text-gray-600'>
                {item.timeLabel} hs · {item.location}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default UpcomingPerformances;
