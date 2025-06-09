import {
  ArrowPathIcon,
  KeyIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

import { Company } from '@/lib/types/company';
import { Pagination } from '@/lib/types/pagination';
import { Role } from '@/lib/types/role';
import { UserWithRoles } from '@/lib/types/user';

export interface UsersTableProps {
  users: UserWithRoles[];
  roles: Role[];
  companies: Company[];
  pagination: Pagination;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedRole: string;
  setSelectedRole: (value: string) => void;
  selectedCompany: string;
  setSelectedCompany: (value: string) => void;
  openEditModal: (user: UserWithRoles) => void;
  handleChangeUserRole: (userId: number, role: string) => void;
  handleResetPassword: (userId: number, name: string) => void;
  handleDeleteUser: (userId: number) => void;
  setPagination: (pagination: Pagination) => void;
}

export function UsersTable({
  users,
  roles,
  companies,
  pagination,
  searchTerm,
  setSearchTerm,
  selectedRole,
  setSelectedRole,
  selectedCompany,
  setSelectedCompany,
  openEditModal,
  handleChangeUserRole,
  handleResetPassword,
  handleDeleteUser,
  setPagination,
}: UsersTableProps) {
  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      {/* Filters */}
      <div className='bg-white rounded-lg shadow-sm mb-6 p-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Buscar
            </label>
            <input
              type='text'
              placeholder='Buscar por nombre o email...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Filtrar por rol
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              <option value=''>Todos los roles</option>
              {Array.isArray(roles) &&
                roles.map((role) => (
                  <option key={`filter-${role.name}`} value={role.name}>
                    {role.display_name || role.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Filtrar por compañía
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              <option value=''>Todas las compañías</option>
              {Array.isArray(companies) &&
                companies.map((company) => (
                  <option
                    key={`filter-company-${company.id}`}
                    value={company.id}
                  >
                    {company.name}
                  </option>
                ))}
            </select>
          </div>
          <div className='flex items-end'>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRole('');
                setSelectedCompany('');
                setPagination({ ...pagination, current_page: 1 });
              }}
              className='px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500'
            >
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
        <div className='px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-900'>
            Usuarios ({pagination.total})
          </h2>
          <p className='text-sm text-gray-600 mt-1'>
            Mostrando {pagination.from || 0} - {pagination.to || 0} de{' '}
            {pagination.total} usuarios
          </p>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full divide-y divide-gray-200'>
            <thead className='bg-gray-50'>
              <tr>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Usuario
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Email
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Compañía
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Roles
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Fecha de Creación
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className='bg-white divide-y divide-gray-200'>
              {users.map((user) => (
                <tr key={user.id} className='hover:bg-gray-50'>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex items-center'>
                      <div className='text-2xl mr-3'>👤</div>
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.name}
                        </div>
                        <div className='text-sm text-gray-500'>
                          ID: {user.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='text-sm text-gray-900'>{user.email}</div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    {user.company ? (
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.company.name}
                        </div>
                        <div className='text-xs text-gray-500'>
                          ID: {user.company.id} • {user.company.slug}
                        </div>
                      </div>
                    ) : (
                      <div className='text-sm text-gray-500 italic'>
                        Sin compañía asignada
                      </div>
                    )}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap'>
                    <div className='flex flex-wrap gap-1'>
                      {user.roles.map((role) => (
                        <span
                          key={`${user.id}-${role.name}`}
                          className='px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800'
                        >
                          {role.display_name || role.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                    {new Date(user.created_at).toLocaleDateString('es-ES')}
                  </td>
                  <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                    <div className='flex space-x-2'>
                      <button
                        onClick={() => openEditModal(user)}
                        className='text-purple-600 hover:text-purple-800 p-1 rounded'
                        title='Editar usuario'
                      >
                        <PencilIcon className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() =>
                          handleChangeUserRole(
                            user.id,
                            user.roles[0]?.name || ''
                          )
                        }
                        className='text-blue-600 hover:text-blue-800 p-1 rounded'
                        title='Cambiar rol'
                      >
                        <ArrowPathIcon className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.name)}
                        className='text-yellow-600 hover:text-yellow-800 p-1 rounded'
                        title='Resetear contraseña'
                      >
                        <KeyIcon className='h-4 w-4' />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className='text-red-600 hover:text-red-800 p-1 rounded'
                        title='Eliminar usuario'
                      >
                        <TrashIcon className='h-4 w-4' />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.last_page > 1 && (
          <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Página {pagination.current_page} de {pagination.last_page}
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    current_page: pagination.current_page - 1,
                  })
                }
                disabled={pagination.current_page <= 1}
                className='px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Anterior
              </button>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    current_page: pagination.current_page + 1,
                  })
                }
                disabled={pagination.current_page >= pagination.last_page}
                className='px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
