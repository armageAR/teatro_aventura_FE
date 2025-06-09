'use client';

import { ArrowLeftIcon, PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import { CompaniesResponse, Company } from '@/lib/types/company';
import { Pagination } from '@/lib/types/pagination';
import { Role } from '@/lib/types/role';
import { CreateUserData, UserWithRoles } from '@/lib/types/user';
import { UpdateUserData } from '@/lib/types/user';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { UserFormDialog } from '@/components/Users/UserFormDialog';
import { UsersTable } from '@/components/Users/UsersTable';

import { handleApiError } from '@/utils/handleApiError';

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
  const [pagination, setPagination] = useState<Pagination>({
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
        const updateData: UpdateUserData = {
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

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className='max-w-md'>
            <UserFormDialog
              isOpen={isModalOpen}
              isEditing={isEditing}
              isCreating={isCreating}
              roles={roles}
              companies={companies}
              formData={formData}
              onChange={(data) => setFormData({ ...formData, ...data })}
              onSubmit={handleSubmitUser}
              onClose={closeModal}
            />
          </DialogContent>
        </Dialog>

        <UsersTable
          users={users}
          roles={roles}
          companies={companies}
          pagination={pagination}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          selectedCompany={selectedCompany}
          setSelectedCompany={setSelectedCompany}
          openEditModal={openEditModal}
          handleChangeUserRole={handleChangeUserRole}
          handleResetPassword={handleResetPassword}
          handleDeleteUser={handleDeleteUser}
          setPagination={setPagination}
        />
      </div>
    </ProtectedRoute>
  );
}
