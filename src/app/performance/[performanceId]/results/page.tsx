'use client';

import {
  ArrowDownTrayIcon,
  ChartBarIcon,
  ClockIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import { PerformanceResults } from '@/lib/types/performance';

import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/ui/PageHeader';

interface Props {
  params: {
    performanceId: string;
  };
}

export default function PerformanceResultsPage({ params }: Props) {
  const [results, setResults] = useState<PerformanceResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      try {
        setIsLoading(true);
        const performanceId = parseInt(params.performanceId);
        const response = await authAPI.getPerformanceResults(performanceId);
        setResults(response.data || response);
      } catch (error) {
        console.error('Error loading performance results:', error);
        toast.error('Error al cargar los resultados de la función');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.performanceId) {
      loadResults();
    }
  }, [params.performanceId]);

  const handleDownloadResults = () => {
    if (!results) return;

    // Create CSV content
    const csvContent = [
      ['Pregunta', 'Respuesta', 'Votos', 'Porcentaje'],
      ...results.questions.flatMap((question) =>
        question.answers.map((answer) => [
          question.question,
          answer.answer,
          answer.count.toString(),
          `${answer.percentage.toFixed(1)}%`,
        ])
      ),
    ]
      .map((row) => row.join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `resultados-funcion-${params.performanceId}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast.success('Resultados descargados exitosamente');
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-purple-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
        <span className='ml-3 text-gray-600'>Cargando resultados...</span>
      </div>
    );
  }

  if (!results) {
    return (
      <div className='min-h-screen bg-purple-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>📊</div>
          <h2 className='text-2xl font-bold text-gray-900 mb-2'>
            No se encontraron resultados
          </h2>
          <p className='text-gray-600'>
            Esta función aún no tiene resultados disponibles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['productor', 'director', 'administrador']}>
      <div className='min-h-screen bg-purple-50'>
        <PageHeader
          title='Resultados de la Función'
          subtitle={`${results.performance.play?.titulo || 'Obra'} - ${new Date(
            results.performance.date
          ).toLocaleDateString('es-ES')}`}
          icon='📊'
          backTo='/producer-dashboard/performances'
          actions={[
            {
              label: 'Descargar Resultados',
              icon: ArrowDownTrayIcon,
              onClick: handleDownloadResults,
            },
          ]}
        />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Performance Info */}
          <div className='bg-white rounded-lg shadow-sm p-6 mb-8'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='flex items-center'>
                <div className='bg-purple-100 p-3 rounded-lg mr-4'>
                  <UsersIcon className='h-6 w-6 text-purple-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Total Participantes</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {results.total_participants}
                  </p>
                </div>
              </div>

              <div className='flex items-center'>
                <div className='bg-blue-100 p-3 rounded-lg mr-4'>
                  <ClockIcon className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Fecha y Hora</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {new Date(results.performance.date).toLocaleDateString(
                      'es-ES'
                    )}
                  </p>
                  <p className='text-sm text-gray-600'>
                    {results.performance.time}
                  </p>
                </div>
              </div>

              <div className='flex items-center'>
                <div className='bg-green-100 p-3 rounded-lg mr-4'>
                  <ChartBarIcon className='h-6 w-6 text-green-600' />
                </div>
                <div>
                  <p className='text-sm text-gray-500'>Preguntas</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {results.questions.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Questions and Results */}
          <div className='space-y-8'>
            {results.questions.map((question, questionIndex) => (
              <div
                key={question.id}
                className='bg-white rounded-lg shadow-sm p-6'
              >
                <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                  Pregunta {questionIndex + 1}: {question.question}
                </h3>

                <div className='space-y-4'>
                  {question.answers.map((answer, answerIndex) => (
                    <div key={answer.id} className='flex items-center'>
                      <div className='flex-1'>
                        <div className='flex justify-between items-center mb-1'>
                          <span className='text-sm font-medium text-gray-900'>
                            {answer.answer}
                          </span>
                          <span className='text-sm text-gray-500'>
                            {answer.count} votos ({answer.percentage.toFixed(1)}
                            %)
                          </span>
                        </div>

                        <div className='w-full bg-gray-200 rounded-full h-2'>
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              answerIndex === 0
                                ? 'bg-purple-600'
                                : answerIndex === 1
                                ? 'bg-blue-600'
                                : answerIndex === 2
                                ? 'bg-green-600'
                                : answerIndex === 3
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${answer.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Answer Summary */}
                <div className='mt-4 pt-4 border-t border-gray-200'>
                  <div className='text-sm text-gray-600'>
                    Total de respuestas para esta pregunta:{' '}
                    <span className='font-semibold'>
                      {question.answers.reduce(
                        (sum, answer) => sum + answer.count,
                        0
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Questions State */}
          {results.questions.length === 0 && (
            <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
              <div className='text-6xl mb-4'>❓</div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                No hay preguntas registradas
              </h3>
              <p className='text-gray-600'>
                Esta función no tiene preguntas interactivas configuradas.
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
