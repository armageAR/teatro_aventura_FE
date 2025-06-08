'use client';

import {
  ArrowLeftIcon,
  ArrowPathIcon,
  KeyIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import {
  CompaniesResponse,
  Company,
  CreateUserData,
  Role,
  UserWithRoles,
} from '@/lib/auth';

import ProtectedRoute from '@/components/ProtectedRoute';

import { handleApiError } from '@/utils/handleApiError';

export interface UserUpdateData {
  name: string;
  email: string;
  company_id: number | undefined;
  password?: string;
  password_confirmation?: string;
}

export default function UsersAdministration() {
  const [users, setUsers] = useState<UserWithRoles[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithRoles | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0,
    from: 0,
    to: 0,
  });

  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: '',
    company_id: undefined,
  });

  const loadData = useCallback(async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        role: selectedRole || undefined,
        company_id: selectedCompany ? parseInt(selectedCompany) : undefined,
        per_page: pagination.per_page,
        page: pagination.current_page,
      };

      const [usersResponse, rolesData, companiesResponse] = await Promise.all([
        authAPI.getUsers(filters),
        authAPI.getRoles(),
        authAPI.getCompanies(),
      ]);

      console.log('🔍 Users response:', usersResponse);
      console.log('🔍 Roles response:', rolesData);
      console.log('🔍 Companies response:', companiesResponse);

      setUsers(usersResponse.users);
      setPagination(usersResponse.pagination);

      // Manejar diferentes formatos de respuesta para roles
      const rolesResponse = rolesData as Role[];
      if (Array.isArray(rolesResponse)) {
        setRoles(rolesResponse);
      } else {
        console.warn('❌ Formato de roles inesperado:', rolesResponse);
        setRoles([]);
      }

      // Manejar diferentes formatos de respuesta para compañías
      const companiesData = companiesResponse as CompaniesResponse;
      if (Array.isArray(companiesData.companies)) {
        setCompanies(companiesData.companies);
      } else {
        console.warn('❌ Formato de compañías inesperado:', companiesData);
        setCompanies([]);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  }, [
    searchTerm,
    selectedRole,
    selectedCompany,
    pagination.current_page,
    pagination.per_page,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadData();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [
    searchTerm,
    selectedRole,
    selectedCompany,
    pagination.current_page,
    loadData,
  ]);

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones frontend
    if (formData.name.length < 2 || formData.name.length > 255) {
      toast.error('El nombre debe tener entre 2 y 255 caracteres');
      return;
    }

    if (!formData.email.includes('@')) {
      toast.error('Ingresa un email válido');
      return;
    }

    // Para edición, las contraseñas son opcionales
    if (
      (!isEditing && formData.password !== formData.password_confirmation) ||
      (isEditing &&
        formData.password &&
        formData.password !== formData.password_confirmation)
    ) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    // Validar contraseña solo si es requerida
    if (
      (!isEditing && formData.password.length < 8) ||
      (isEditing && formData.password && formData.password.length < 8)
    ) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (!formData.role) {
      toast.error('Debe seleccionar un rol');
      return;
    }

    setIsCreating(true);
    try {
      if (isEditing && editingUser) {
        // Preparar datos para edición (sin contraseña si está vacía)
        const updateData: UserUpdateData = {
          name: formData.name,
          email: formData.email,
          company_id: formData.company_id,
        };

        // Solo incluir contraseña si se proporciona
        if (formData.password) {
          updateData.password = formData.password;
          updateData.password_confirmation = formData.password_confirmation;
        }

        const response = await authAPI.updateUser(editingUser.id, updateData);

        // Actualizar el usuario en la lista
        setUsers(
          users.map((user) =>
            user.id === editingUser.id ? response.user : user
          )
        );

        // Si el rol cambió, actualizarlo también
        if (formData.role !== editingUser.roles[0]?.name) {
          await authAPI.changeUserRole(editingUser.id, { role: formData.role });
          // Recargar la lista para obtener los datos actualizados
          loadData();
        }

        toast.success(response.message || 'Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        const response = await authAPI.createUser(formData);
        setUsers([...users, response.user]);
        toast.success(response.message || 'Usuario creado exitosamente');
      }

      closeModal();
    } catch (error) {
      handleApiError(error, { isEditing, entityName: 'usuario' });
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

  const handleRoleChange = (roleId: string) => {
    setFormData({
      ...formData,
      role: roleId,
    });
  };

  const handleCompanyChange = (companyId: string) => {
    setFormData({
      ...formData,
      company_id: companyId ? parseInt(companyId) : undefined,
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: '',
      company_id: undefined,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserWithRoles) => {
    setIsEditing(true);
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      password_confirmation: '',
      role: user.roles[0]?.name || '',
      company_id: user.company_id || undefined,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: '',
      company_id: undefined,
    });
  };

  const handleChangeUserRole = async (userId: number, currentRole: string) => {
    const newRole = prompt(
      `Cambiar rol del usuario (actual: ${currentRole}):`,
      currentRole
    );
    if (!newRole || newRole === currentRole) return;

    try {
      const response = await authAPI.changeUserRole(userId, { role: newRole });
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, roles: [{ name: newRole }] } : user
        )
      );
      toast.success(response.message || 'Rol actualizado exitosamente');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error changing user role:', error);
      toast.error('Error al cambiar el rol del usuario');
    }
  };

  const handleResetPassword = async (userId: number, userName: string) => {
    const newPassword = prompt(`Nueva contraseña para ${userName}:`);
    if (!newPassword) return;

    const confirmPassword = prompt('Confirmar nueva contraseña:');
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await authAPI.resetUserPassword(userId, {
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      toast.success(response.message || 'Contraseña reseteada exitosamente');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error resetting password:', error);
      toast.error('Error al resetear la contraseña');
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
                  onClick={openCreateModal}
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
                        <div className='text-sm text-gray-900'>
                          {user.email}
                        </div>
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
                            onClick={() =>
                              handleResetPassword(user.id, user.name)
                            }
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

        {/* Create User Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold text-gray-900'>
                  {isEditing ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                </h2>
                <button
                  onClick={closeModal}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handleSubmitUser}>
                <div className='space-y-4'>
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
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Entre 2 y 255 caracteres
                    </p>
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
                      Contraseña{' '}
                      {isEditing && (
                        <span className='text-xs text-gray-500'>
                          (opcional)
                        </span>
                      )}
                    </label>
                    <input
                      type='password'
                      required={!isEditing}
                      minLength={8}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      {isEditing
                        ? 'Dejar vacío para mantener la contraseña actual. Mínimo 8 caracteres si se cambia.'
                        : 'Mínimo 8 caracteres'}
                    </p>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Confirmar Contraseña{' '}
                      {isEditing && (
                        <span className='text-xs text-gray-500'>
                          (opcional)
                        </span>
                      )}
                    </label>
                    <input
                      type='password'
                      required={!isEditing}
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
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Rol
                    </label>
                    <select
                      required
                      value={formData.role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    >
                      <option value=''>Seleccionar rol...</option>
                      {Array.isArray(roles) &&
                        roles.map((role) => (
                          <option
                            key={`${role.id}-${role.name}`}
                            value={role.name}
                          >
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
                      onChange={(e) => handleCompanyChange(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    >
                      <option value=''>Sin compañía asignada</option>
                      {Array.isArray(companies) &&
                        companies.map((company) => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                    </select>
                    <p className='text-xs text-gray-500 mt-1'>
                      Opcional. Solo super administradores pueden asignar
                      compañías.
                    </p>
                  </div>
                </div>

                <div className='flex justify-end space-x-3 mt-6'>
                  <button
                    type='button'
                    onClick={closeModal}
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
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
