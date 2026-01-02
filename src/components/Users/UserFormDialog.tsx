import { XMarkIcon } from '@heroicons/react/24/outline';
import React from 'react';

import type { Company } from '@/lib/types/company';
import { Role } from '@/lib/types/role';
import { CreateUserData } from '@/lib/types/user';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {
  isOpen: boolean;
  isEditing: boolean;
  isCreating: boolean;
  roles: Role[];
  companies: Company[];
  formData: CreateUserData;
  onChange: (data: Partial<CreateUserData>) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function UserFormDialog({
  isOpen,
  isEditing,
  isCreating,
  roles,
  companies,
  formData,
  onChange,
  onSubmit,
  onClose,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <div className='flex justify-between items-center'>
            <div>
              <DialogTitle>
                {isEditing ? 'Editar Usuario' : 'Crear Usuario'}
              </DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los datos del usuario.'
                  : 'Ingresa los datos para crear un nuevo usuario.'}
              </DialogDescription>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600'
            >
              <XMarkIcon className='h-6 w-6' />
            </button>
          </div>
        </DialogHeader>
        <form onSubmit={onSubmit} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Nombre
            </label>
            <input
              type='text'
              required
              minLength={2}
              maxLength={255}
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Email
            </label>
            <input
              type='email'
              required
              value={formData.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Contraseña{' '}
              {isEditing && (
                <span className='text-xs text-gray-500'>(opcional)</span>
              )}
            </label>
            <input
              type='password'
              required={!isEditing}
              minLength={8}
              value={formData.password}
              onChange={(e) => onChange({ password: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Confirmar Contraseña{' '}
              {isEditing && (
                <span className='text-xs text-gray-500'>(opcional)</span>
              )}
            </label>
            <input
              type='password'
              required={!isEditing}
              value={formData.password_confirmation}
              onChange={(e) =>
                onChange({ password_confirmation: e.target.value })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Rol
            </label>
            <select
              required
              value={formData.role}
              onChange={(e) => onChange({ role: e.target.value })}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              <option value=''>Seleccionar rol...</option>
              {roles.map((role) => (
                <option key={role.name} value={role.name}>
                  {role.display_name || role.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Compañía
            </label>
            <select
              value={formData.company_id || ''}
              onChange={(e) =>
                onChange({
                  company_id: e.target.value
                    ? parseInt(e.target.value)
                    : undefined,
                })
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              <option value=''>Sin compañía asignada</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter className='flex justify-end space-x-3 pt-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={isCreating}
              className='px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
            >
              {isCreating
                ? isEditing
                  ? 'Actualizando...'
                  : 'Creando...'
                : isEditing
                  ? 'Actualizar Usuario'
                  : 'Crear Usuario'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
