'use client';

import React, { useMemo } from 'react';

import type { Performance } from '@/lib/types/performance';
import type { Play } from '@/lib/types/play';

import { Spinner } from '@/components/ui/Spinner';

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
  return new Date(p.date);
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

const SectionTitle: React.FC<{ title: string; icon?: string }> = ({
  title,
  icon,
}) => (
  <h4 className='text-md font-semibold text-gray-900 mb-3 flex items-center gap-2'>
    {icon && <span className='text-lg'>{icon}</span>}
    {title}
  </h4>
);

export interface ManagePlayModalProps {
  play: Play;
  isLoading: boolean;
  performances: Performance[];
  questions: Array<{
    id: number;
    title: string;
    body: string | null;
    options?: Array<{ id?: number; text: string }>;
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
    options?: Array<{ id?: number; text: string }>;
  }) => void;
  onDeleteQuestion: (q: { id: number }) => Promise<void>;
}

export const ManagePlayModal: React.FC<ManagePlayModalProps> = ({
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
                onClick={onCreateQuestion}
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
                        {(q.options || []).map((opt, idx) => {
                          const o = opt as unknown as {
                            text?: string;
                            answer?: string;
                          };
                          return (
                            <div key={idx} className='flex items-center gap-2'>
                              <span className='text-gray-700'>
                                • {o.text || o.answer}
                              </span>
                            </div>
                          );
                        })}
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

export default ManagePlayModal;
