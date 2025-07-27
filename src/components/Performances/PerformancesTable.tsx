import {
  EyeIcon,
  PencilIcon,
  QrCodeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

import type { Performance } from '@/lib/types/performance';
import { usePerformances } from '@/hooks/usePerformances';

import { Column, DataTable } from '@/components/ui/DataTable';

export interface PerformancesTableProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (performance: Performance) => void;
  onDelete: (id: number) => void;
  onViewResults: (id: number) => void;
  onViewQR: (qrCode: string) => void;
}

export function PerformancesTable({
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  onViewResults,
  onViewQR,
}: PerformancesTableProps) {
  const { data: performancesData, isLoading: isPerformancesLoading } =
    usePerformances();

  const performances = performancesData?.performances ?? [];

  const filteredPerformances = performances.filter((performance) => {
    const playTitle = performance.play?.title || '';
    return (
      playTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      performance.date.includes(searchTerm) ||
      performance.qr_code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns: Column<Performance>[] = [
    {
      key: 'play_id',
      header: 'Obra',
      render: (performance) => (
        <div className='flex items-center'>
          <div className='text-2xl mr-3'>🎭</div>
          <div>
            <div className='text-sm font-medium text-gray-900'>
              {performance.play?.title || `Obra ID: ${performance.play_id}`}
            </div>
            {performance.play?.description && (
              <div className='text-xs text-gray-500 max-w-xs truncate'>
                {performance.play.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Fecha y Hora',
      render: (performance) => (
        <div>
          <div className='text-sm font-medium text-gray-900'>
            {new Date(performance.date).toLocaleDateString('es-ES')}
          </div>
          <div className='text-xs text-gray-500'>{performance.time}</div>
        </div>
      ),
    },
    {
      key: 'qr_code',
      header: 'Código QR',
      render: (performance) => (
        <div className='flex items-center'>
          <span className='text-sm text-gray-900 font-mono'>
            {performance.qr_code}
          </span>
          <button
            onClick={() => onViewQR(performance.qr_code)}
            className='ml-2 text-purple-600 hover:text-purple-800'
            title='Ver QR'
          >
            <QrCodeIcon className='h-4 w-4' />
          </button>
        </div>
      ),
    },
    {
      key: 'is_active',
      header: 'Estado',
      render: (performance) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            performance.is_active
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {performance.is_active ? 'Activa' : 'Inactiva'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (performance) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => onViewResults(performance.id)}
            className='text-green-600 hover:text-green-800 p-1 rounded'
            title='Ver resultados'
          >
            <EyeIcon className='h-4 w-4' />
          </button>
          <button
            onClick={() => onEdit(performance)}
            className='text-blue-600 hover:text-blue-800 p-1 rounded'
            title='Editar'
          >
            <PencilIcon className='h-4 w-4' />
          </button>
          <button
            onClick={() => onDelete(performance.id)}
            className='text-red-600 hover:text-red-800 p-1 rounded'
            title='Eliminar'
          >
            <TrashIcon className='h-4 w-4' />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <DataTable
        data={filteredPerformances}
        columns={columns}
        loading={isPerformancesLoading}
        title='Funciones'
        count={filteredPerformances.length}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        emptyState={{
          icon: '🎪',
          title: 'No hay funciones programadas',
          description:
            'Crea tu primera función usando el botón "Nueva Función"',
        }}
      />
    </div>
  );
}
