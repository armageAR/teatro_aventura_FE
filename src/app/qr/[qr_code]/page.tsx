'use client';

import {
  ClockIcon,
  PlayIcon,
  QrCodeIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import { Performance } from '@/lib/types/performance';

interface FunctionData {
  performance: Performance;
  title: string;
  description: string;
  status: 'ready' | 'live' | 'ended';
  startTime: string;
  date: string;
  expectedDuration: string;
  currentParticipants: number;
  questions?: Array<{
    id: number;
    question: string;
    answers: Array<{
      id: number;
      answer: string;
    }>;
  }>;
}

export default function QRAccessPage() {
  const params = useParams();
  const qrCode = params.qr_code as string;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [functionData, setFunctionData] = useState<FunctionData | null>(null);

  useEffect(() => {
    const loadFunctionData = async () => {
      try {
        setIsLoading(true);

        // Try to join the performance by QR code
        const response = await authAPI.joinPerformanceByQR(qrCode);
        const performance = response.performance;

        if (performance) {
          // Determine status based on date/time
          const now = new Date();
          const performanceDate = new Date(
            `${performance.date} ${performance.time}`,
          );
          let status: 'ready' | 'live' | 'ended' = 'ready';

          if (now > performanceDate) {
            // Check if it's within the performance duration (assuming 2 hours)
            const endTime = new Date(
              performanceDate.getTime() + 2 * 60 * 60 * 1000,
            );
            status = now > endTime ? 'ended' : 'live';
          }

          setFunctionData({
            performance,
            title: performance.play?.title || 'Función Teatral',
            description:
              performance.play?.description ||
              'Experiencia teatral interactiva',
            status,
            startTime: performance.time,
            date: new Date(performance.date).toLocaleDateString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            expectedDuration: '2 horas',
            currentParticipants: Math.floor(Math.random() * 200) + 50, // Mock data
            questions: response.questions || [],
          });
        }
      } catch (error) {
        console.error('Error loading function data:', error);
        toast.error('No se pudo acceder a la función. Verifica el código QR.');
        setFunctionData(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (qrCode) {
      loadFunctionData();
    }
  }, [qrCode]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
          <p className='text-gray-600 text-lg'>Conectando con la función...</p>
          <p className='text-sm text-gray-500 mt-2'>Código QR: {qrCode}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50'>
      {/* Header */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <QrCodeIcon className='h-8 w-8 text-blue-600 mr-3' />
              <div>
                <h1 className='text-xl font-bold text-gray-900'>
                  Teatro de Aventura
                </h1>
                <p className='text-sm text-gray-600'>Acceso directo por QR</p>
              </div>
            </div>
            <div className='text-right'>
              <p className='text-sm text-gray-500'>Código QR</p>
              <p className='font-mono text-sm text-gray-700'>{qrCode}</p>
            </div>
          </div>
        </div>
      </header>

      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {functionData ? (
          <>
            {/* Welcome Section */}
            <div className='bg-white rounded-lg shadow-lg p-8 mb-8 text-center'>
              <div className='text-6xl mb-4'>🎭</div>
              <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                ¡Bienvenido a la Función!
              </h2>
              <h3 className='text-xl text-blue-600 font-semibold mb-2'>
                {functionData.title}
              </h3>
              <p className='text-gray-600 mb-6'>{functionData.description}</p>

              <div className='flex justify-center items-center space-x-6 text-sm text-gray-500 mb-6'>
                <div className='flex items-center'>
                  <ClockIcon className='h-5 w-5 mr-1' />
                  {functionData.date} • {functionData.startTime}
                </div>
                <div className='flex items-center'>
                  <UsersIcon className='h-5 w-5 mr-1' />
                  {functionData.currentParticipants} participantes
                </div>
              </div>

              {functionData.status === 'ready' && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6'>
                  <p className='text-yellow-800 font-medium'>
                    🕐 La función comenzará pronto
                  </p>
                  <p className='text-yellow-700 text-sm mt-1'>
                    Mantén esta pantalla abierta. Te notificaremos cuando
                    inicie.
                  </p>
                </div>
              )}

              {functionData.status === 'live' && (
                <div className='bg-green-50 border border-green-200 rounded-lg p-4 mb-6'>
                  <p className='text-green-800 font-medium'>
                    🎬 ¡La función está en vivo!
                  </p>
                  <p className='text-green-700 text-sm mt-1'>
                    Participa respondiendo las preguntas que aparezcan en
                    pantalla.
                  </p>
                </div>
              )}

              {functionData.status === 'ended' && (
                <div className='bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6'>
                  <p className='text-gray-800 font-medium'>
                    🎭 La función ha terminado
                  </p>
                  <p className='text-gray-700 text-sm mt-1'>
                    ¡Gracias por participar! Esperamos que hayas disfrutado la
                    experiencia.
                  </p>
                </div>
              )}

              <button
                onClick={() => {
                  if (!functionData || functionData.status === 'ended') return;
                  router.push(`/performance/${functionData.performance.id}`);
                }}
                className={`px-8 py-3 rounded-lg font-semibold text-white transition-all duration-200 ${
                  functionData.status === 'live'
                    ? 'bg-green-600 hover:bg-green-700 animate-pulse'
                    : functionData.status === 'ready'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={functionData.status === 'ended'}
              >
                <PlayIcon className='h-5 w-5 inline-block mr-2' />
                {functionData.status === 'live'
                  ? 'Participar Ahora'
                  : functionData.status === 'ready'
                    ? 'Esperando Inicio'
                    : 'Función Finalizada'}
              </button>
            </div>

            {/* Instructions */}
            <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                ¿Cómo Participar?
              </h3>
              <div className='grid md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-xl'>👀</span>
                  </div>
                  <h4 className='font-medium text-gray-900 mb-2'>1. Observa</h4>
                  <p className='text-sm text-gray-600'>
                    Sigue la historia en el escenario y mantente atento a las
                    señales.
                  </p>
                </div>

                <div className='text-center'>
                  <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-xl'>📱</span>
                  </div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    2. Interactúa
                  </h4>
                  <p className='text-sm text-gray-600'>
                    Cuando aparezcan preguntas en tu pantalla, responde para
                    influir en la historia.
                  </p>
                </div>

                <div className='text-center'>
                  <div className='w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                    <span className='text-xl'>🎉</span>
                  </div>
                  <h4 className='font-medium text-gray-900 mb-2'>
                    3. Disfruta
                  </h4>
                  <p className='text-sm text-gray-600'>
                    ¡Tu participación es parte del espectáculo! Cada decisión
                    cuenta.
                  </p>
                </div>
              </div>
            </div>

            {/* Technical Info */}
            <div className='bg-blue-50 rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-blue-900 mb-4'>
                Información Técnica
              </h3>
              <div className='grid md:grid-cols-2 gap-4 text-sm'>
                <div>
                  <p className='text-blue-800'>
                    <strong>Duración estimada:</strong>{' '}
                    {functionData.expectedDuration}
                  </p>
                  <p className='text-blue-800'>
                    <strong>Estado actual:</strong>
                    <span
                      className={`ml-1 px-2 py-1 rounded-full text-xs ${
                        functionData.status === 'live'
                          ? 'bg-green-100 text-green-800'
                          : functionData.status === 'ready'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {functionData.status === 'live'
                        ? 'En vivo'
                        : functionData.status === 'ready'
                          ? 'Listo'
                          : 'Finalizado'}
                    </span>
                  </p>
                </div>
                <div>
                  <p className='text-blue-800'>
                    <strong>Participantes actuales:</strong>{' '}
                    {functionData.currentParticipants}
                  </p>
                  <p className='text-blue-800'>
                    <strong>Acceso:</strong> Código QR válido
                  </p>
                </div>
              </div>
            </div>

            {/* Note for registration */}
            <div className='mt-8 bg-gray-50 rounded-lg p-6 text-center'>
              <h4 className='font-medium text-gray-900 mb-2'>
                ¿Quieres guardar tu historial?
              </h4>
              <p className='text-sm text-gray-600 mb-4'>
                Regístrate en Teatro de Aventura para acceder a informes finales
                y ver el historial de todas tus participaciones.
              </p>
              <button
                onClick={() => (window.location.href = '/')}
                className='text-blue-600 hover:text-blue-800 font-medium text-sm'
              >
                Crear cuenta gratis →
              </button>
            </div>
          </>
        ) : (
          <div className='bg-white rounded-lg shadow-sm p-8 text-center'>
            <div className='text-4xl mb-4'>❌</div>
            <h2 className='text-xl font-bold text-gray-900 mb-2'>
              Función No Encontrada
            </h2>
            <p className='text-gray-600 mb-4'>
              El código QR escaneado no corresponde a una función válida o
              activa.
            </p>
            <p className='text-sm text-gray-500 mb-6'>Código: {qrCode}</p>
            <button
              onClick={() => (window.location.href = '/')}
              className='bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700'
            >
              Ir al Inicio
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
