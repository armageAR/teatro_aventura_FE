'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { API_BASE_URL } from '@/lib/types/auth';

import { Spinner } from '@/components/ui/Spinner';

const JoinPerformancePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const qrCodeParam = params.qrCode;

  const qrCode = Array.isArray(qrCodeParam) ? qrCodeParam[0] : qrCodeParam;

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const joinPerformance = async () => {
      if (!qrCode) {
        setError('Código QR inválido.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const joinResponse = await fetch(
          `${API_BASE_URL.replace(/\/$/, '')}/join-performance/${qrCode}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
          },
        );

        if (!joinResponse.ok) {
          throw new Error('Respuesta inválida del servidor');
        }

        const payload = await joinResponse.json();
        const performance = payload?.performance;
        const performanceId = performance?.id;
        if (!performanceId) {
          throw new Error('Performance no encontrada');
        }
        const spectatorSession =
          payload?.spectator_session_uuid || payload?.session_uuid;
        if (spectatorSession && typeof window !== 'undefined') {
          const storageKey = `spectator_session_uuid_${performanceId}`;
          window.localStorage.setItem(storageKey, spectatorSession);
        }
        router.replace(`/spectator/performance/${performanceId}`);
      } catch (err) {
        console.error('Error uniendo a la función por QR', err);
        setError('No se pudo acceder a la función. Verifica el código QR.');
        toast.error('Código QR inválido o expirado');
        setIsLoading(false);
      }
    };

    joinPerformance();
  }, [qrCode, router]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center'>
        <Spinner color='blue' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center px-4 text-center gap-6'>
        <div className='text-6xl'>🎭</div>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900 mb-2'>
            No se pudo abrir la función
          </h1>
          <p className='text-gray-600 max-w-sm'>{error}</p>
        </div>
        <button
          onClick={() => router.push('/')}
          className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
        >
          <ArrowLeftIcon className='h-5 w-5' /> Volver al inicio
        </button>
      </div>
    );
  }

  return null;
};

export default JoinPerformancePage;
