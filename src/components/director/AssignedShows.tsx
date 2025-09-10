import React, { useEffect, useState } from 'react';

import { authAPI } from '@/lib/api';
import { Play } from '@/lib/types/play';
import { cn } from '@/lib/utils';

import ShowCard, { ShowStatus } from '@/components/director/ShowCard';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { Spinner } from '@/components/ui/Spinner';

import { useAuth } from '@/contexts/AuthContext';

export type AssignedShow = {
  title: string;
  subtitle: string;
  status: ShowStatus;
  actionLabel: string;
};

export type AssignedShowsProps = {
  title?: string;
  className?: string;
};

const AssignedShows: React.FC<AssignedShowsProps> = ({
  title = 'Obras Asignadas',
  className,
}) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shows, setShows] = useState<AssignedShow[]>([]);

  useEffect(() => {
    const extractPlays = (data: unknown): Play[] => {
      if (Array.isArray(data)) return data as Play[];
      if (typeof data === 'object' && data !== null) {
        const obj = data as Record<string, unknown>;
        if (Array.isArray(obj.plays)) return obj.plays as Play[];
        if (Array.isArray(obj.data)) return obj.data as Play[];
      }
      return [];
    };

    const fetchAssigned = async () => {
      try {
        setIsLoading(true);
        const data = await authAPI.getPlays();
        const plays = extractPlays(data);

        const mapped: AssignedShow[] = plays.map((p) => ({
          title: p.title,
          subtitle: p.description,
          status: 'active',
          actionLabel: 'Gestionar',
        }));
        setShows(mapped);
      } catch (e) {
        setError('Error al cargar las obras asignadas');
        // eslint-disable-next-line no-console
        console.error('Error fetching director assigned plays:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAssigned();
  }, [user?.id]);
  return (
    <div className={cn('mt-8 bg-white rounded-lg shadow-sm p-6', className)}>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>{title}</h3>
      {isLoading ? (
        <Spinner color='blue' />
      ) : error ? (
        <ErrorAlert message={error} />
      ) : shows.length === 0 ? (
        <p className='text-gray-600'>No tienes obras asignadas.</p>
      ) : (
        <div className='space-y-4'>
          {shows.map((show, idx) => (
            <ShowCard
              key={`${show.title}-${idx}`}
              title={show.title}
              subtitle={show.subtitle}
              status={show.status}
              actionLabel={show.actionLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignedShows;
