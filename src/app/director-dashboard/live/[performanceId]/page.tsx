'use client';

import {
  ArrowLeftIcon,
  ChartBarIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
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

const LivePerformancePage: React.FC<LivePerformancePageProps> = ({
  params,
}) => {
  const router = useRouter();
  const [performance, setPerformance] = useState<Performance | null>(null);
  const [questionsCount, setQuestionsCount] = useState<number>(0);
  const [spectatorsCount, setSpectatorsCount] = useState<number>(0);
  const [questions, setQuestions] = useState<
    Array<{
      id: number;
      title: string;
      body: string | null;
      options: Array<{ id?: number; text: string }>;
    }>
  >([]);
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<number, boolean>
  >({});
  const [sendingQuestionId, setSendingQuestionId] = useState<number | null>(
    null,
  );
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

        const [questionsResp, spectators] = await Promise.all([
          authAPI.getQuestions(perf.play_id).catch(() => ({ questions: [] })),
          authAPI.getPerformanceSpectatorsCount(perf.id).catch(() => 0),
        ]);

        const normalizeQuestions = (raw: unknown): typeof questions => {
          const arraySource = (() => {
            if (Array.isArray(raw)) return raw;
            if (raw && typeof raw === 'object') {
              const obj = raw as Record<string, unknown>;
              if (Array.isArray(obj.questions)) return obj.questions;
              if (Array.isArray(obj.data)) return obj.data;
            }
            return [];
          })();

          return arraySource.map((item) => {
            const rec = item as Record<string, unknown>;
            const rawOptions =
              (rec.options as unknown[]) ?? (rec.answers as unknown[]) ?? [];
            return {
              id: Number(rec.id) || 0,
              title:
                (rec.title as string) ||
                (rec.question as string) ||
                `Pregunta ${(rec.id as number) ?? ''}`,
              body:
                typeof rec.body === 'string'
                  ? rec.body
                  : ((rec.description as string) ?? null),
              options: rawOptions.map((opt) => {
                const optionRecord = opt as Record<string, unknown>;
                const text =
                  (optionRecord.text as string) ||
                  (optionRecord.answer as string) ||
                  '';
                return {
                  id: optionRecord.id as number | undefined,
                  text,
                };
              }),
            };
          });
        };

        const questionArray = normalizeQuestions(questionsResp);

        setQuestions(questionArray);
        setExpandedQuestions((prev) => {
          if (Object.keys(prev).length > 0) return prev;
          return questionArray.reduce<Record<number, boolean>>((acc, q) => {
            acc[q.id] = false;
            return acc;
          }, {});
        });

        setQuestionsCount(questionArray.length);
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

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleSendQuestion = async (questionId: number) => {
    if (!performance) return;
    setSendingQuestionId(questionId);
    try {
      await authAPI.sendLiveQuestion(performance.id, questionId);
      toast.success('Pregunta enviada al público');
    } catch (err) {
      console.error('Error enviando pregunta en vivo', err);
      toast.error('No se pudo enviar la pregunta');
    } finally {
      setSendingQuestionId(null);
    }
  };

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

          <div className='bg-white rounded-xl shadow-md p-6 my-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              Preguntas disponibles
            </h2>
            {questions.length === 0 ? (
              <p className='text-sm text-gray-500'>
                No hay preguntas configuradas para esta obra.
              </p>
            ) : (
              <ul className='space-y-3'>
                {questions.map((question) => {
                  const isExpanded = expandedQuestions[question.id];
                  const options = question.options || [];
                  return (
                    <li
                      key={question.id}
                      className='border border-gray-200 rounded-lg overflow-hidden'
                    >
                      <button
                        onClick={() => toggleQuestion(question.id)}
                        className='w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left'
                      >
                        <span className='font-medium text-gray-900'>
                          {question.title}
                        </span>
                        <ChevronDownIcon
                          className={`h-5 w-5 text-gray-500 transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      {isExpanded ? (
                        <div className='px-4 py-3 space-y-3 bg-white'>
                          {question.body ? (
                            <p className='text-sm text-gray-700'>
                              {question.body}
                            </p>
                          ) : null}
                          <div className='space-y-2'>
                            {options.length === 0 ? (
                              <p className='text-xs text-gray-500'>
                                Esta pregunta no tiene opciones configuradas.
                              </p>
                            ) : (
                              options.map((option) => {
                                const optionText =
                                  option.text ??
                                  (option as { answer?: string }).answer ??
                                  '';
                                return (
                                  <div
                                    key={option.id ?? optionText}
                                    className='flex items-start gap-2 text-sm text-gray-700'
                                  >
                                    <span className='mt-1 h-2 w-2 rounded-full bg-gray-400'></span>
                                    <span>{optionText}</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                          <div className='flex justify-end'>
                            <button
                              onClick={() => handleSendQuestion(question.id)}
                              disabled={sendingQuestionId === question.id}
                              className='inline-flex items-center gap-2 px-3 py-2 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed'
                            >
                              <PaperAirplaneIcon className='h-4 w-4' />
                              {sendingQuestionId === question.id
                                ? 'Enviando...'
                                : 'Enviar al público'}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default LivePerformancePage;
