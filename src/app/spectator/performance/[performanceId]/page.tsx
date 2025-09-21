'use client';

import {
  ArrowLeftIcon,
  BoltIcon,
  ChevronDownIcon,
  ClockIcon,
  PaperAirplaneIcon,
  PlayCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import {
  formatPerformanceTime,
  parsePerformanceDateTime,
} from '@/lib/director/performance-utils';
import type { Performance } from '@/lib/types/performance';

import { Spinner } from '@/components/ui/Spinner';

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

type SpectatorQuestion = {
  id: number;
  title: string;
  body: string | null;
  options: Array<{ id?: number; text: string }>;
};

const normalizeQuestions = (raw: unknown): SpectatorQuestion[] => {
  const source = (() => {
    if (Array.isArray(raw)) return raw;
    if (raw && typeof raw === 'object') {
      const obj = raw as Record<string, unknown>;
      if (Array.isArray(obj.questions)) return obj.questions;
      if (Array.isArray(obj.data)) return obj.data;
    }
    return [];
  })();

  return source.map((item) => {
    const record = item as Record<string, unknown>;
    const rawOptions =
      (record.options as unknown[]) ?? (record.answers as unknown[]) ?? [];
    return {
      id: Number(record.id) || 0,
      title:
        (record.title as string) ||
        (record.question as string) ||
        `Pregunta ${(record.id as number) ?? ''}`,
      body:
        typeof record.body === 'string'
          ? record.body
          : ((record.description as string) ?? null),
      options: rawOptions.map((opt) => {
        const optionRecord = opt as Record<string, unknown>;
        const text =
          (optionRecord.text as string) ||
          (optionRecord.answer as string) ||
          '';
        const rawId = optionRecord.id;
        const parsedId =
          typeof rawId === 'number'
            ? rawId
            : typeof rawId === 'string'
              ? Number(rawId)
              : undefined;
        return {
          id: Number.isFinite(parsedId) ? (parsedId as number) : undefined,
          text,
        };
      }),
    };
  });
};

const SpectatorPerformancePage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const performanceId = Number(params.performanceId);

  const [performance, setPerformance] = useState<Performance | null>(null);
  const [questions, setQuestions] = useState<SpectatorQuestion[]>([]);
  const [expandedQuestions, setExpandedQuestions] = useState<
    Record<number, boolean>
  >({});
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [sessionUuid, setSessionUuid] = useState<string | null>(null);
  const [submittingId, setSubmittingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(performanceId)) {
      setError('Identificador de función inválido');
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const performanceResp = await authAPI.getPerformance(performanceId);
        const perf = extractPerformance(performanceResp);
        if (!perf) throw new Error('Performance no encontrada');

        setPerformance(perf);

        const storageKey = `spectator_session_uuid_${perf.id}`;
        if (typeof window !== 'undefined') {
          const storedSession = window.localStorage.getItem(storageKey);
          if (storedSession) setSessionUuid(storedSession);
        }

        const questionsResp = await authAPI.getQuestions(perf.play_id);
        const normalized = normalizeQuestions(questionsResp);
        setQuestions(normalized);
        setExpandedQuestions((prev) => {
          if (Object.keys(prev).length > 0) return prev;
          return normalized.reduce<Record<number, boolean>>((acc, q, idx) => {
            acc[q.id] = idx === 0;
            return acc;
          }, {});
        });
      } catch (err) {
        console.error('Error cargando datos de la función', err);
        setError('No se pudo cargar la función. Intenta más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [performanceId]);

  useEffect(() => {
    if (!performance) return;
    const interval = setInterval(async () => {
      try {
        const questionsResp = await authAPI.getQuestions(performance.play_id);
        const normalized = normalizeQuestions(questionsResp);
        setQuestions(normalized);
        setExpandedQuestions((prev) => {
          const next = { ...prev };
          normalized.forEach((q, index) => {
            if (!(q.id in next)) next[q.id] = index === 0;
          });
          Object.keys(next).forEach((key) => {
            const numericId = Number(key);
            if (!normalized.some((q) => q.id === numericId)) {
              delete next[numericId];
            }
          });
          return next;
        });
        setAnswers((prev) => {
          const normalizedIds = new Set(normalized.map((q) => q.id));
          const next = { ...prev };
          Object.keys(next).forEach((key) => {
            const numericId = Number(key);
            if (!normalizedIds.has(numericId)) {
              delete next[numericId];
            }
          });
          return next;
        });
      } catch (err) {
        console.error('Error actualizando preguntas', err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [performance]);

  const startedAt = useMemo(() => {
    if (!performance?.started_at) return null;
    const parsed = new Date(performance.started_at);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }, [performance?.started_at]);

  const scheduledAt = useMemo(() => {
    if (!performance) return null;
    return parsePerformanceDateTime(performance);
  }, [performance]);

  const handleToggle = (questionId: number) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  };

  const handleAnswer = async (questionId: number, answerId?: number) => {
    if (!performance) return;
    if (!sessionUuid) {
      toast.error(
        'No se pudo registrar tu sesión. Reingresa con el código QR.',
      );
      return;
    }
    if (!answerId) {
      toast.error('Esta opción no está disponible para responder.');
      return;
    }
    if (answers[questionId]) {
      toast('Ya respondiste esta pregunta.');
      return;
    }

    setSubmittingId(questionId);
    try {
      await authAPI.submitAnswer({
        question_id: questionId,
        answer_id: answerId,
        performance_id: performance.id,
        spectator_session_uuid: sessionUuid,
      });
      toast.success('Respuesta enviada ✅');
      setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
    } catch (err) {
      console.error('Error enviando respuesta', err);
      toast.error('No se pudo enviar tu respuesta.');
    } finally {
      setSubmittingId(null);
    }
  };

  const goBack = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center'>
        <Spinner color='blue' />
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col items-center justify-center px-4 text-center'>
        <div className='text-6xl mb-4'>🎭</div>
        <p className='text-xl font-semibold text-gray-900 mb-2'>{error}</p>
        <p className='text-gray-600 mb-6'>
          Intenta acceder nuevamente desde tu código QR.
        </p>
        <button
          onClick={goBack}
          className='inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
        >
          <ArrowLeftIcon className='h-5 w-5' /> Volver al inicio
        </button>
      </div>
    );
  }

  const startedLabel = startedAt
    ? startedAt.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Aún no inicia';
  const scheduledLabel = scheduledAt
    ? scheduledAt.toLocaleDateString('es-ES', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      })
    : 'Fecha no disponible';
  const scheduledTime = performance ? formatPerformanceTime(performance) : '';

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-purple-50'>
      <header className='bg-white shadow-sm'>
        <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <PlayCircleIcon className='h-8 w-8 text-blue-600' />
            <div>
              <h1 className='text-xl font-semibold text-gray-900'>
                {performance.play?.title ?? `Función ${performance.id}`}
              </h1>
              <p className='text-xs uppercase tracking-wide text-gray-500'>
                Experiencia interactiva para espectadores
              </p>
            </div>
          </div>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700'
          >
            <ArrowLeftIcon className='h-4 w-4' /> Salir
          </Link>
        </div>
      </header>

      <main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8'>
        <section className='bg-white rounded-xl shadow-md p-6'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div className='bg-blue-50 rounded-lg p-4 flex items-start gap-3'>
              <ClockIcon className='h-6 w-6 text-blue-600 mt-1' />
              <div>
                <p className='text-xs uppercase tracking-wide text-blue-600'>
                  Horario
                </p>
                <p className='text-sm text-gray-700 capitalize'>
                  {scheduledLabel}
                </p>
                <p className='text-sm text-gray-500'>
                  Programada: {scheduledTime ? `${scheduledTime} hs` : '—'}
                </p>
                <p className='text-sm text-gray-500'>
                  Inicio real: {startedLabel}
                </p>
              </div>
            </div>
            <div className='bg-green-50 rounded-lg p-4 flex items-start gap-3'>
              <BoltIcon className='h-6 w-6 text-green-600 mt-1' />
              <div>
                <p className='text-xs uppercase tracking-wide text-green-600'>
                  Estado
                </p>
                <p className='text-sm text-gray-700'>
                  {performance.is_active ? 'En vivo' : 'Esperando comienzo'}
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  Sigue atento a las preguntas que aparezcan.
                </p>
              </div>
            </div>
            <div className='bg-purple-50 rounded-lg p-4 flex items-start gap-3'>
              <UsersIcon className='h-6 w-6 text-purple-600 mt-1' />
              <div>
                <p className='text-xs uppercase tracking-wide text-purple-600'>
                  Participación
                </p>
                <p className='text-sm text-gray-700'>
                  {questions.length} preguntas disponibles
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  Responde cada pregunta para influir en la historia.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className='bg-white rounded-xl shadow-md p-6'>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Preguntas interactivas
          </h2>
          {questions.length === 0 ? (
            <p className='text-sm text-gray-500'>
              Aún no hay preguntas disponibles. Mantente atento, aparecerán aquí
              cuando el elenco las envíe al público.
            </p>
          ) : (
            <ul className='space-y-3'>
              {questions.map((question, index) => {
                const isExpanded = expandedQuestions[question.id];
                const answeredOption = answers[question.id];
                return (
                  <li
                    key={question.id}
                    className='border border-gray-200 rounded-lg overflow-hidden'
                  >
                    <button
                      type='button'
                      onClick={() => handleToggle(question.id)}
                      className='w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 text-left'
                    >
                      <div>
                        <span className='text-xs text-gray-400 mr-2'>
                          #{index + 1}
                        </span>
                        <span className='font-medium text-gray-900'>
                          {question.title}
                        </span>
                      </div>
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
                          {question.options.length === 0 ? (
                            <p className='text-xs text-gray-500'>
                              Esta pregunta no tiene opciones configuradas.
                            </p>
                          ) : (
                            question.options.map((option) => {
                              const optionId = option.id;
                              const isAnswered = answeredOption === optionId;
                              return (
                                <button
                                  key={option.id ?? option.text}
                                  type='button'
                                  onClick={() =>
                                    handleAnswer(question.id, optionId)
                                  }
                                  disabled={
                                    submittingId === question.id ||
                                    Boolean(answeredOption) ||
                                    !optionId
                                  }
                                  className={`w-full text-left px-4 py-2 rounded-md border transition-colors ${
                                    isAnswered
                                      ? 'border-green-500 bg-green-50 text-green-800'
                                      : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
                                  } ${
                                    !optionId
                                      ? 'opacity-60 cursor-not-allowed'
                                      : ''
                                  }`}
                                >
                                  {option.text}
                                </button>
                              );
                            })
                          )}
                        </div>
                        {answeredOption ? (
                          <p className='text-xs text-green-600'>
                            ¡Respuesta registrada! Espera la siguiente pregunta.
                          </p>
                        ) : (
                          <p className='text-xs text-gray-500 flex items-center gap-2'>
                            <PaperAirplaneIcon className='h-4 w-4' />
                            Selecciona una opción para enviarla al elenco.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};

export default SpectatorPerformancePage;
