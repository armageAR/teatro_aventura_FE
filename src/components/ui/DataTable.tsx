'use client';

import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { Pagination } from '@/lib/types/pagination';

export interface Column<T> {
  key: keyof T | 'actions';
  header: string;
  render?: (item: T, value: T[keyof T]) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  pagination?: Pagination;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  emptyState?: {
    icon: string;
    title: string;
    description: string;
  };
  actions?: (item: T) => React.ReactNode;
  searchTerm?: string;
  onSearchChange?: (search: string) => void;
  filters?: React.ReactNode;
  title?: string;
  count?: number;
}

export function DataTable<T extends { id: number }>({
  data,
  columns,
  pagination,
  onPageChange,
  loading = false,
  emptyState,
  actions,
  searchTerm,
  onSearchChange,
  filters,
  title,
  count,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='px-6 py-12 text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto'></div>
          <p className='mt-2 text-gray-500'>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
      {/* Header */}
      <div className='px-6 py-4 border-b border-gray-200'>
        <div className='flex justify-between items-center'>
          <div>
            {title && (
              <h2 className='text-lg font-semibold text-gray-900'>
                {title} {count !== undefined && `(${count})`}
              </h2>
            )}
          </div>
          <div className='flex space-x-4 items-center'>
            {onSearchChange && (
              <input
                type='text'
                placeholder='Buscar...'
                value={searchTerm || ''}
                onChange={(e) => onSearchChange(e.target.value)}
                className='px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500'
              />
            )}
            {filters}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className='overflow-x-auto'>
        <table className='min-w-full divide-y divide-gray-200'>
          <thead className='bg-gray-50'>
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.className || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-200'>
            {data.length > 0 ? (
              data.map((item) => (
                <tr key={item.id} className='hover:bg-gray-50'>
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={`px-6 py-4 whitespace-nowrap ${
                        column.className || ''
                      }`}
                    >
                      {column.key === 'actions' && actions
                        ? actions(item)
                        : column.render
                          ? column.render(item, item[column.key as keyof T])
                          : String(item[column.key as keyof T] || '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className='px-6 py-12 text-center text-gray-500'
                >
                  {emptyState ? (
                    <div className='flex flex-col items-center'>
                      <div className='text-4xl mb-2'>{emptyState.icon}</div>
                      <p className='text-lg font-medium mb-1'>
                        {emptyState.title}
                      </p>
                      <p className='text-sm'>{emptyState.description}</p>
                    </div>
                  ) : (
                    'No hay datos disponibles'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && onPageChange && pagination.last_page > 1 && (
        <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
          <div className='text-sm text-gray-700'>
            Mostrando {pagination.from} a {pagination.to} de {pagination.total}{' '}
            resultados
          </div>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => onPageChange(pagination.current_page - 1)}
              disabled={pagination.current_page === 1}
              className='p-2 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ChevronLeftIcon className='h-4 w-4' />
            </button>

            <div className='flex space-x-1'>
              {Array.from(
                { length: pagination.last_page },
                (_, i) => i + 1,
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    page === pagination.current_page
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => onPageChange(pagination.current_page + 1)}
              disabled={pagination.current_page === pagination.last_page}
              className='p-2 rounded-md border border-gray-300 text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              <ChevronRightIcon className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
