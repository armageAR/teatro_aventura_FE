'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

export interface FormField {
  name: string;
  label: string;
  type:
    | 'text'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'checkbox'
    | 'date'
    | 'time'
    | 'datetime-local'
    | 'url';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string | number; label: string }>;
  rows?: number;
  className?: string;
  description?: string;
  value?: string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
}

interface FormModalProps<
  T extends Record<string, string | number | boolean | undefined>,
> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  formData: T;
  onChange: (field: string, value: string | number | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  cancelText?: string;
  isSubmitting?: boolean;
  maxWidth?: string;
  icon?: string;
}

export function FormModal<
  T extends Record<string, string | number | boolean | undefined>,
>({
  isOpen,
  onClose,
  title,
  fields,
  formData,
  onChange,
  onSubmit,
  submitText,
  cancelText = 'Cancelar',
  isSubmitting = false,
  maxWidth = 'max-w-2xl',
  icon,
}: FormModalProps<T>) {
  if (!isOpen) return null;

  const renderField = (field: FormField) => {
    const baseClassName =
      'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            value={(formData[field.name] as string) || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            rows={field.rows || 3}
            placeholder={field.placeholder}
            className={`${baseClassName} ${field.className || ''}`}
            required={field.required}
          />
        );

      case 'select':
        return (
          <select
            value={(formData[field.name] as string) || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            className={`${baseClassName} ${field.className || ''}`}
            required={field.required}
          >
            <option value=''>Seleccionar...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className='flex items-center'>
            <input
              type='checkbox'
              checked={(formData[field.name] as boolean) || false}
              onChange={(e) => onChange(field.name, e.target.checked)}
              className='mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
            />
            <span className='text-sm text-gray-700'>{field.label}</span>
          </label>
        );

      default:
        return (
          <input
            type={field.type}
            value={(formData[field.name] as string) || ''}
            onChange={(e) => onChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={`${baseClassName} ${field.className || ''}`}
            required={field.required}
          />
        );
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
      <div
        className={`bg-white rounded-lg p-6 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}
      >
        <div className='flex justify-between items-center mb-4'>
          <div className='flex items-center'>
            {icon && <span className='text-2xl mr-3'>{icon}</span>}
            <h2 className='text-xl font-bold text-gray-900'>{title}</h2>
          </div>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-gray-600'
          >
            <XMarkIcon className='h-6 w-6' />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {fields.map((field) => (
              <div
                key={field.name}
                className={
                  field.type === 'textarea' || field.type === 'checkbox'
                    ? 'md:col-span-2'
                    : ''
                }
              >
                {field.type !== 'checkbox' && (
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    {field.label}
                    {field.required && (
                      <span className='text-red-500 ml-1'>*</span>
                    )}
                  </label>
                )}
                {renderField(field)}
                {field.description && (
                  <p className='text-xs text-gray-500 mt-1'>
                    {field.description}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className='flex justify-end space-x-3 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              {cancelText}
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
            >
              {isSubmitting ? 'Guardando...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
