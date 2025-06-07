'use client';

import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import { CreateUserData, Role, UserWithRoles } from '@/lib/auth';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function UsersAdministration() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role_ids: [],
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, rolesData] = await Promise.all([
        authAPI.getUsers(),
        authAPI.getRoles(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (formData.role_ids.length === 0) {
      toast.error('Debe seleccionar al menos un role');
      return;
    }

    setIsCreating(true);
    try {
      const newUser = await authAPI.createUser(formData);
      setUsers([...users, newUser]);
      setIsModalOpen(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role_ids: [],
      });
      toast.success('Usuario creado exitosamente');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating user:', error);
      toast.error('Error al crear el usuario');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      return;
    }

    try {
      await authAPI.deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
      toast.success('Usuario eliminado exitosamente');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error deleting user:', error);
      toast.error('Error al eliminar el usuario');
    }
  };

  const handleRoleChange = (roleId: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        role_ids: [...formData.role_ids, roleId],
      });
    } else {
      setFormData({
        ...formData,
        role_ids: formData.role_ids.filter((id) => id !== roleId),
      });
    }
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-purple-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
        <span className='ml-3 text-gray-600'>Cargando usuarios...</span>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['administrador']}>
      <div className='min-h-screen bg-purple-50'>
        {/* Header */}
        <header className='bg-white shadow-sm border-b-4 border-purple-500'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-center py-4'>
              <div className='flex items-center'>
                <button
                  onClick={() => (window.location.href = '/admin-dashboard')}
                  className='mr-4 p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800'
                >
                  <ArrowLeftIcon className='h-5 w-5' />
                </button>
                <div className='text-3xl mr-3'>👥</div>
                <div>
                  <h1 className='text-2xl font-bold text-purple-800'>
                    Administración de Usuarios
                  </h1>
                  <p className='text-purple-600'>
                    Gestionar usuarios del sistema
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className='bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center'
                >
                  <PlusIcon className='h-4 w-4 mr-2' />
                  Agregar Usuario
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Users Table */}
          <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Usuarios ({users.length})
              </h2>
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
                        <div className='text-sm text-gray-900'>
                          {user.email}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='flex flex-wrap gap-1'>
                          {user.roles.map((role) => (
                            <span
                              key={role.id}
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
                            onClick={() => handleDeleteUser(user.id)}
                            className='text-red-600 hover:text-red-800 p-1 rounded'
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
          </div>
        </div>

        {/* Create User Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold text-gray-900'>
                  Crear Nuevo Usuario
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nombre
                    </label>
                    <input
                      type='text'
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
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
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Contraseña
                    </label>
                    <input
                      type='password'
                      required
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Confirmar Contraseña
                    </label>
                    <input
                      type='password'
                      required
                      value={formData.password_confirmation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password_confirmation: e.target.value,
                        })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Roles
                    </label>
                    <div className='space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-3'>
                      {roles.map((role) => (
                        <label key={role.id} className='flex items-center'>
                          <input
                            type='checkbox'
                            checked={formData.role_ids.includes(role.id)}
                            onChange={(e) =>
                              handleRoleChange(role.id, e.target.checked)
                            }
                            className='mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
                          />
                          <span className='text-sm text-gray-700'>
                            {role.display_name || role.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className='flex justify-end space-x-3 mt-6'>
                  <button
                    type='button'
                    onClick={() => setIsModalOpen(false)}
                    className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500'
                  >
                    Cancelar
                  </button>
                  <button
                    type='submit'
                    disabled={isCreating}
                    className='px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
                  >
                    {isCreating ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
