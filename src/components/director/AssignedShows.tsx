import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import type { FormPerformanceData, Performance } from '@/lib/types/performance';
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
  const [shows, setShows] = useState<
    (AssignedShow & { id: number; play: Play })[]
  >([]);

  // Modal state
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedPlay, setSelectedPlay] = useState<Play | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Data inside modal
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [questions, setQuestions] = useState<
    Array<{
      id: number;
      title: string;
      body: string | null;
      options?: Array<{ id?: number; text: string; is_correct?: boolean }>;
    }>
  >([]);

  // Forms state for performance
  const [isPerfFormOpen, setIsPerfFormOpen] = useState(false);
  const [isPerfEditing, setIsPerfEditing] = useState(false);
  const [currentPerformanceId, setCurrentPerformanceId] = useState<
    number | null
  >(null);
  const [perfForm, setPerfForm] = useState<FormPerformanceData>({});

  // Forms state for question
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [isQuestionEditing, setIsQuestionEditing] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState<number | null>(
    null,
  );
  const [questionTitle, setQuestionTitle] = useState('');
  const [questionBody, setQuestionBody] = useState('');
  const [answerOptions, setAnswerOptions] = useState<
    Array<{ text: string; is_correct?: boolean }>
  >([{ text: '' }, { text: '' }]);

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

        const mapped = plays.map((p) => ({
          id: p.id,
          play: p,
          title: p.title,
          subtitle: p.description,
          status: 'active' as ShowStatus,
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

  // Modal actions
  const openManageModal = async (play: Play) => {
    setSelectedPlay(play);
    setIsManageOpen(true);
    await refreshModalData(play.id);
  };

  const refreshModalData = async (playId: number) => {
    try {
      setIsModalLoading(true);
      // Performances by play
      const perfResp = await authAPI.getPlayPerformances(playId);
      const perfList = (() => {
        if (typeof perfResp === 'object' && perfResp !== null) {
          const obj = perfResp as unknown as Record<string, unknown>;
          const p = obj.performances as unknown;
          if (Array.isArray(p)) return p as Performance[];
        }
        if (Array.isArray(perfResp)) return perfResp as Performance[];
        return [] as Performance[];
      })();
      setPerformances(perfList);

      // Questions by play
      const qResp = await authAPI.getQuestions(playId);
      const questionsArray = (() => {
        if (typeof qResp === 'object' && qResp !== null) {
          const obj = qResp as unknown as Record<string, unknown>;
          const q = obj.questions as unknown;
          if (Array.isArray(q)) return q as unknown[];
          const d = obj.data as unknown;
          if (Array.isArray(d)) return d as unknown[];
        }
        return [] as unknown[];
      })();
      const normalized = questionsArray.map((q) => {
        const rec = q as Record<string, unknown>;
        const options =
          (rec.options as unknown[]) || (rec.answers as unknown[]) || [];
        return {
          id: rec.id as number,
          title: (rec.title as string) || ((rec.question as string) ?? ''),
          body: (rec.body as string) || null,
          options: options.map((o) => {
            const or = o as Record<string, unknown>;
            return {
              id: (or.id as number) || undefined,
              text: (or.text as string) || ((or.answer as string) ?? ''),
              is_correct: (or.is_correct as boolean) || undefined,
            };
          }),
        };
      });
      setQuestions(normalized);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error loading modal data', err);
      toast.error('No se pudieron cargar los datos de la obra');
    } finally {
      setIsModalLoading(false);
    }
  };

  // Performance form handlers
  const openCreatePerformance = (playId: number) => {
    setIsPerfEditing(false);
    setCurrentPerformanceId(null);
    setPerfForm({ play_id: playId, date: '', time: '', location: '' });
    setIsPerfFormOpen(true);
  };

  const openEditPerformance = (perf: Performance) => {
    setIsPerfEditing(true);
    setCurrentPerformanceId(perf.id);
    setPerfForm({
      play_id: perf.play_id,
      date: formatDateForInput(perf),
      time: formatTimeForInput(perf),
      location: perf.location,
      is_active: perf.is_active,
    });
    setIsPerfFormOpen(true);
  };

  const handleDeletePerformance = async (perf: Performance) => {
    if (!selectedPlay) return;
    const ok = window.confirm(
      '¿Eliminar esta función? Esta acción es irreversible.',
    );
    if (!ok) return;
    try {
      await authAPI.deletePerformance(perf.id);
      toast.success('Función eliminada');
      await refreshModalData(selectedPlay.id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete performance error', err);
      toast.error('No se pudo eliminar la función');
    }
  };

  const submitPerformanceForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlay) return;
    try {
      const payload = {
        ...perfForm,
        time: normalizeTimeForApi(perfForm.time),
      } as FormPerformanceData;

      if (isPerfEditing && currentPerformanceId) {
        await authAPI.updatePerformance(currentPerformanceId, payload);
        toast.success('Función actualizada');
      } else {
        await authAPI.createPerformance({
          ...payload,
          play_id: selectedPlay.id,
        });
        toast.success('Función creada');
      }
      setIsPerfFormOpen(false);
      await refreshModalData(selectedPlay.id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Save performance error', err);
      toast.error('No se pudo guardar la función');
    }
  };

  // Questions form handlers
  const openCreateQuestion = () => {
    setIsQuestionEditing(false);
    setCurrentQuestionId(null);
    setQuestionTitle('');
    setQuestionBody('');
    setAnswerOptions([{ text: '' }, { text: '' }]);
    setIsQuestionFormOpen(true);
  };

  const openEditQuestion = (q: {
    id: number;
    title: string;
    body: string | null;
    options?: Array<{ id?: number; text: string; is_correct?: boolean }>;
  }) => {
    setIsQuestionEditing(true);
    setCurrentQuestionId(q.id);
    setQuestionTitle(q.title);
    setQuestionBody(q.body || '');
    setAnswerOptions(
      (q.options || []).map((o) => {
        const r = o as Record<string, unknown>;
        return {
          text: (r.text as string) || ((r.answer as string) ?? ''),
          is_correct: (r.is_correct as boolean) || false,
        };
      }),
    );
    setIsQuestionFormOpen(true);
  };

  const handleDeleteQuestion = async (q: { id: number }) => {
    if (!selectedPlay) return;
    const ok = window.confirm('¿Eliminar esta pregunta?');
    if (!ok) return;
    try {
      await authAPI.deleteQuestion(q.id);
      toast.success('Pregunta eliminada');
      await refreshModalData(selectedPlay.id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Delete question error', err);
      toast.error('No se pudo eliminar la pregunta');
    }
  };

  const submitQuestionForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlay) return;
    const payload = {
      title: questionTitle,
      body: questionBody || null,
      answer_options: answerOptions.filter((o) => o.text.trim().length > 0),
    };
    try {
      if (isQuestionEditing && currentQuestionId) {
        await authAPI.updateQuestion(currentQuestionId, payload);
        toast.success('Pregunta actualizada');
      } else {
        await authAPI.createQuestion(selectedPlay.id, payload);
        toast.success('Pregunta creada');
      }
      setIsQuestionFormOpen(false);
      await refreshModalData(selectedPlay.id);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Save question error', err);
      toast.error('No se pudo guardar la pregunta');
    }
  };
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
          {shows.map((show) => (
            <ShowCard
              key={show.id}
              title={show.title}
              subtitle={show.subtitle}
              status={show.status}
              actionLabel={show.actionLabel}
              onAction={() => openManageModal(show.play)}
            />
          ))}
        </div>
      )}
      {isManageOpen && selectedPlay && (
        <ManagePlayModal
          play={selectedPlay}
          isLoading={isModalLoading}
          performances={performances}
          questions={questions}
          onClose={() => setIsManageOpen(false)}
          onCreatePerformance={openCreatePerformance}
          onEditPerformance={openEditPerformance}
          onDeletePerformance={handleDeletePerformance}
          onCreateQuestion={openCreateQuestion}
          onEditQuestion={openEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
        />
      )}
      {/* Performance form modal */}
      {isPerfFormOpen && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-xl'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='text-lg font-semibold'>
                {isPerfEditing ? 'Editar función' : 'Nueva función'}
              </h4>
              <button onClick={() => setIsPerfFormOpen(false)}>✕</button>
            </div>
            <form onSubmit={submitPerformanceForm} className='space-y-3'>
              <div>
                <label className='text-sm text-gray-700'>Fecha</label>
                <input
                  type='date'
                  className='w-full border rounded px-3 py-2'
                  value={(perfForm.date as string) || ''}
                  onChange={(e) =>
                    setPerfForm((f) => ({ ...f, date: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className='text-sm text-gray-700'>Hora</label>
                <input
                  type='time'
                  className='w-full border rounded px-3 py-2'
                  value={(perfForm.time as string) || ''}
                  onChange={(e) =>
                    setPerfForm((f) => ({ ...f, time: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className='text-sm text-gray-700'>Ubicación</label>
                <input
                  type='text'
                  className='w-full border rounded px-3 py-2'
                  value={(perfForm.location as string) || ''}
                  onChange={(e) =>
                    setPerfForm((f) => ({ ...f, location: e.target.value }))
                  }
                />
              </div>
              <div className='flex justify-end gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => setIsPerfFormOpen(false)}
                  className='px-3 py-2 border rounded'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-3 py-2 rounded bg-purple-600 text-white'
                >
                  {isPerfEditing ? 'Guardar cambios' : 'Crear función'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question form modal */}
      {isQuestionFormOpen && (
        <div className='fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4'>
          <div className='bg-white rounded-lg p-6 w-full max-w-2xl'>
            <div className='flex items-center justify-between mb-4'>
              <h4 className='text-lg font-semibold'>
                {isQuestionEditing ? 'Editar pregunta' : 'Nueva pregunta'}
              </h4>
              <button onClick={() => setIsQuestionFormOpen(false)}>✕</button>
            </div>
            <form onSubmit={submitQuestionForm} className='space-y-3'>
              <div>
                <label className='text-sm text-gray-700'>Pregunta</label>
                <input
                  type='text'
                  className='w-full border rounded px-3 py-2'
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className='text-sm text-gray-700'>
                  Descripción (opcional)
                </label>
                <textarea
                  className='w-full border rounded px-3 py-2'
                  value={questionBody}
                  onChange={(e) => setQuestionBody(e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <div className='flex items-center justify-between mb-2'>
                  <label className='text-sm text-gray-700'>
                    Opciones de respuesta
                  </label>
                  <button
                    type='button'
                    className='px-2 py-1 text-sm border rounded'
                    onClick={() =>
                      setAnswerOptions((opts) => [...opts, { text: '' }])
                    }
                  >
                    + Agregar opción
                  </button>
                </div>
                <div className='space-y-2'>
                  {answerOptions.map((opt, idx) => (
                    <div key={idx} className='flex items-center gap-2'>
                      <input
                        type='text'
                        placeholder={`Opción ${idx + 1}`}
                        className='flex-1 border rounded px-3 py-2'
                        value={opt.text}
                        onChange={(e) =>
                          setAnswerOptions((arr) => {
                            const copy = [...arr];
                            copy[idx] = { ...copy[idx], text: e.target.value };
                            return copy;
                          })
                        }
                        required
                      />
                      <label className='text-xs text-gray-700 flex items-center gap-1'>
                        <input
                          type='checkbox'
                          checked={!!opt.is_correct}
                          onChange={(e) =>
                            setAnswerOptions((arr) => {
                              const copy = [...arr];
                              copy[idx] = {
                                ...copy[idx],
                                is_correct: e.target.checked,
                              };
                              return copy;
                            })
                          }
                        />
                        Correcta
                      </label>
                      <button
                        type='button'
                        className='px-2 py-1 text-xs border rounded text-red-600'
                        onClick={() =>
                          setAnswerOptions((arr) =>
                            arr.filter((_, i) => i !== idx),
                          )
                        }
                      >
                        Quitar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className='flex justify-end gap-2 pt-2'>
                <button
                  type='button'
                  onClick={() => setIsQuestionFormOpen(false)}
                  className='px-3 py-2 border rounded'
                >
                  Cancelar
                </button>
                <button
                  type='submit'
                  className='px-3 py-2 rounded bg-blue-600 text-white'
                >
                  {isQuestionEditing ? 'Guardar cambios' : 'Crear pregunta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedShows;

// Helper and child components
function parsePerformanceDate(p: Performance): Date {
  const hasISOTime = typeof p.date === 'string' && p.date.includes('T');
  if (hasISOTime) {
    const dt = new Date(p.date);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  if (p.time) {
    const dt = new Date(`${p.date}T${p.time}`);
    if (!Number.isNaN(dt.getTime())) return dt;
  }
  const fallback = new Date(p.date);
  return fallback;
}

function isFuturePerformance(p: Performance): boolean {
  const dt = parsePerformanceDate(p);
  return !Number.isNaN(dt.getTime()) && dt.getTime() > Date.now();
}

function getPerformanceTimeDisplay(p: Performance): string {
  if (p.time && String(p.time).trim().length > 0) return p.time as string;
  const dt = parsePerformanceDate(p);
  if (Number.isNaN(dt.getTime())) return '';
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function formatDateForInput(p: Performance): string {
  if (typeof p.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.date)) {
    return p.date;
  }
  const dt = parsePerformanceDate(p);
  if (Number.isNaN(dt.getTime())) return '';
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatTimeForInput(p: Performance): string {
  if (p.time && typeof p.time === 'string') {
    const t = p.time.trim();
    if (/^\d{2}:\d{2}(:\d{2})?$/.test(t)) return t.slice(0, 5);
    if (/^\d{4}$/.test(t)) return `${t.slice(0, 2)}:${t.slice(2, 4)}`;
  }
  const dt = parsePerformanceDate(p);
  if (Number.isNaN(dt.getTime())) return '';
  const hh = String(dt.getHours()).padStart(2, '0');
  const mm = String(dt.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function normalizeTimeForApi(value: unknown): string | undefined {
  if (!value) return undefined;
  const t = String(value).trim();
  if (t.length === 0) return undefined;
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;
  if (/^\d{4}$/.test(t)) return `${t.slice(0, 2)}:${t.slice(2, 4)}:00`;
  return t;
}

interface ManagePlayModalProps {
  play: Play;
  isLoading: boolean;
  performances: Performance[];
  questions: Array<{
    id: number;
    title: string;
    body: string | null;
    options?: Array<{ id?: number; text: string; is_correct?: boolean }>;
  }>;
  onClose: () => void;
  onCreatePerformance: (playId: number) => void;
  onEditPerformance: (perf: Performance) => void;
  onDeletePerformance: (perf: Performance) => Promise<void>;
  onCreateQuestion: () => void;
  onEditQuestion: (q: {
    id: number;
    title: string;
    body: string | null;
    options?: Array<{ id?: number; text: string; is_correct?: boolean }>;
  }) => void;
  onDeleteQuestion: (q: { id: number }) => Promise<void>;
}

const SectionTitle: React.FC<{ title: string; icon?: string }> = ({
  title,
  icon,
}) => (
  <h4 className='text-md font-semibold text-gray-900 mb-3 flex items-center gap-2'>
    {icon && <span className='text-lg'>{icon}</span>}
    {title}
  </h4>
);

const ManagePlayModal: React.FC<ManagePlayModalProps> = ({
  play,
  isLoading,
  performances,
  questions,
  onClose,
  onCreatePerformance,
  onEditPerformance,
  onDeletePerformance,
  onCreateQuestion,
  onEditQuestion,
  onDeleteQuestion,
}) => {
  const futurePerformances = useMemo(
    () =>
      performances
        .filter(isFuturePerformance)
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [performances],
  );
  const pastPerformances = useMemo(
    () =>
      performances
        .filter((p) => !isFuturePerformance(p))
        .sort(
          (a, b) =>
            parsePerformanceDate(b).getTime() -
            parsePerformanceDate(a).getTime(),
        ),
    [performances],
  );

  return (
    <div className='fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50'>
      <div className='bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[92vh] overflow-y-auto'>
        <div className='p-6 border-b flex items-center justify-between'>
          <div>
            <h3 className='text-xl font-bold text-gray-900'>
              Gestionar: {play.title}
            </h3>
            <p className='text-sm text-gray-600'>ID: {play.id}</p>
          </div>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700'
          >
            ✕
          </button>
        </div>
        <div className='p-6 space-y-8'>
          {/* Play info */}
          <div className='bg-gray-50 rounded-lg p-4 border'>
            <SectionTitle title='Datos de la obra' icon='🎭' />
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700'>
              <div>
                <div className='text-gray-500'>Título</div>
                <div className='font-medium'>{play.title}</div>
              </div>
              <div>
                <div className='text-gray-500'>Estreno</div>
                <div className='font-medium'>
                  {new Date(play.release_date).toLocaleDateString('es-ES')}
                </div>
              </div>
              <div>
                <div className='text-gray-500'>ID Compañía</div>
                <div className='font-medium'>{play.company_id ?? '—'}</div>
              </div>
            </div>
            {play.description && (
              <p className='mt-3 text-gray-700 text-sm'>{play.description}</p>
            )}
          </div>

          {/* Future performances */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <SectionTitle title='Próximas funciones' icon='🎪' />
              <button
                onClick={() => onCreatePerformance(play.id)}
                className='px-3 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700'
              >
                + Nueva función
              </button>
            </div>
            {isLoading ? (
              <div className='py-8'>
                <Spinner color='purple' />
              </div>
            ) : futurePerformances.length === 0 ? (
              <div className='text-sm text-gray-600 bg-gray-50 border rounded p-4'>
                No hay funciones futuras programadas.
              </div>
            ) : (
              <div className='space-y-2'>
                {futurePerformances.map((p) => (
                  <div
                    key={p.id}
                    className='flex items-center justify-between border rounded p-3'
                  >
                    <div className='text-sm'>
                      <div className='font-medium text-gray-900'>
                        {new Date(p.date).toLocaleDateString('es-ES')} —{' '}
                        {getPerformanceTimeDisplay(p)}
                      </div>
                      <div className='text-gray-600'>
                        Ubicación: {p.location || '—'}
                      </div>
                    </div>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => onEditPerformance(p)}
                        className='px-2 py-1 text-sm border rounded hover:bg-gray-50'
                      >
                        Modificar
                      </button>
                      <button
                        onClick={() => onDeletePerformance(p)}
                        className='px-2 py-1 text-sm border rounded text-red-600 hover:bg-red-50'
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past performances */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <SectionTitle title='Funciones pasadas' icon='🕰️' />
            </div>
            {isLoading ? (
              <div className='py-6'>
                <Spinner color='blue' />
              </div>
            ) : pastPerformances.length === 0 ? (
              <div className='text-sm text-gray-600 bg-gray-50 border rounded p-4'>
                No hay funciones pasadas.
              </div>
            ) : (
              <div className='space-y-2'>
                {pastPerformances.map((p) => (
                  <div
                    key={`past-${p.id}`}
                    className='flex items-center justify-between border rounded p-3 opacity-90'
                  >
                    <div className='text-sm'>
                      <div className='font-medium text-gray-900'>
                        {new Date(p.date).toLocaleDateString('es-ES')} —{' '}
                        {getPerformanceTimeDisplay(p)}
                      </div>
                      <div className='text-gray-600'>
                        Ubicación: {p.location || '—'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Questions */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <SectionTitle title='Preguntas de la obra' icon='❓' />
              <button
                onClick={() => onCreateQuestion()}
                className='px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700'
              >
                + Nueva pregunta
              </button>
            </div>
            {isLoading ? (
              <div className='py-6'>
                <Spinner color='blue' />
              </div>
            ) : questions.length === 0 ? (
              <div className='text-sm text-gray-600 bg-gray-50 border rounded p-4'>
                No hay preguntas registradas.
              </div>
            ) : (
              <div className='space-y-2'>
                {questions.map((q) => (
                  <details key={q.id} className='border rounded'>
                    <summary className='cursor-pointer px-3 py-2 flex items-center justify-between'>
                      <span className='font-medium text-gray-900'>
                        {q.title}
                      </span>
                      <span className='flex gap-2'>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            onEditQuestion(q);
                          }}
                          className='px-2 py-1 text-xs border rounded hover:bg-gray-50'
                        >
                          Editar
                        </button>
                        <button
                          onClick={async (e) => {
                            e.preventDefault();
                            await onDeleteQuestion(q);
                          }}
                          className='px-2 py-1 text-xs border rounded text-red-600 hover:bg-red-50'
                        >
                          Eliminar
                        </button>
                      </span>
                    </summary>
                    <div className='px-3 pb-3 text-sm'>
                      {q.body && <p className='text-gray-700 mb-2'>{q.body}</p>}
                      <div className='space-y-1'>
                        {(q.options || []).map((opt, idx) => (
                          <div key={idx} className='flex items-center gap-2'>
                            <span className='text-gray-700'>• {opt.text}</span>
                            {opt.is_correct ? (
                              <span className='text-xs px-2 py-0.5 rounded bg-green-100 text-green-800'>
                                correcta
                              </span>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
