'use client';

import {
  ArrowLeftIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import { Company, CreateCompanyData } from '@/lib/auth';

import ProtectedRoute from '@/components/ProtectedRoute';

export default function CompaniesAdministration() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyData>({
    name: '',
    slug: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    logo_url: '',
    is_active: true,
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const response = await authAPI.getCompanies();
      console.log('Datos de compañías recibidos:', response);

      // El backend devuelve { companies: [...] }, extraer el array
      const companiesArray = response.companies || response;

      // Validar que companiesArray sea un array
      if (Array.isArray(companiesArray)) {
        setCompanies(companiesArray);
      } else {
        console.error('Los datos recibidos no son un array:', companiesArray);
        setCompanies([]);
        toast.error('Formato de datos incorrecto del servidor');
      }
    } catch (error) {
      console.error('Error loading companies:', error);
      setCompanies([]); // Asegurar que siempre sea un array
      toast.error(
        'Error al cargar las compañías. Puede que el endpoint no exista en el backend.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: generateSlug(name),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    if (!formData.slug.trim()) {
      toast.error('El slug es requerido');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingCompany) {
        const response = await authAPI.updateCompany(
          editingCompany.id,
          formData
        );
        console.log('Respuesta de actualización:', response);

        // Extraer la compañía de la respuesta (puede venir en { company: {...} } o directamente)
        const updatedCompany = response.company || response;

        setCompanies(
          companies.map((c) =>
            c.id === editingCompany.id ? updatedCompany : c
          )
        );
        toast.success('Compañía actualizada exitosamente');
      } else {
        const response = await authAPI.createCompany(formData);
        console.log('Respuesta de creación:', response);

        // Extraer la compañía de la respuesta (puede venir en { company: {...} } o directamente)
        const newCompany = response.company || response;

        setCompanies([...companies, newCompany]);
        toast.success('Compañía creada exitosamente');
      }
      closeModal();
    } catch (error) {
      console.error('Error saving company:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la compañía`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (company: Company) => {
    setIsEditing(true);
    setEditingCompany(company);
    setFormData({
      name: company.name,
      slug: company.slug,
      description: company.description || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      website: company.website || '',
      logo_url: company.logo_url || '',
      is_active: company.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (companyId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta compañía?')) {
      return;
    }

    try {
      await authAPI.deleteCompany(companyId);
      setCompanies(companies.filter((c) => c.id !== companyId));
      toast.success('Compañía eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Error al eliminar la compañía');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      logo_url: '',
      is_active: true,
    });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingCompany(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      email: '',
      phone: '',
      address: '',
      website: '',
      logo_url: '',
      is_active: true,
    });
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className='flex justify-center items-center min-h-screen bg-purple-50'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600'></div>
        <span className='ml-3 text-gray-600'>Cargando compañías...</span>
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
                <div className='text-3xl mr-3'>🏢</div>
                <div>
                  <h1 className='text-2xl font-bold text-purple-800'>
                    Administración de Compañías
                  </h1>
                  <p className='text-purple-600'>
                    Gestionar compañías de teatro
                  </p>
                </div>
              </div>

              <div className='flex items-center space-x-4'>
                <button
                  onClick={openCreateModal}
                  className='bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center'
                >
                  <PlusIcon className='h-4 w-4 mr-2' />
                  Agregar Compañía
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Companies Table */}
          <div className='bg-white rounded-lg shadow-sm overflow-hidden'>
            <div className='px-6 py-4 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>
                Compañías ({companies.length})
              </h2>
            </div>

            <div className='overflow-x-auto'>
              <table className='min-w-full divide-y divide-gray-200'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Compañía
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Contacto
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Estado
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
                  {Array.isArray(companies) && companies.length > 0 ? (
                    companies.map((company) => (
                      <tr key={company.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='flex items-center'>
                            <div className='text-2xl mr-3'>🏢</div>
                            <div>
                              <div className='text-sm font-medium text-gray-900'>
                                {company.name}
                              </div>
                              <div className='text-sm text-gray-500'>
                                Slug: {company.slug}
                              </div>
                              {company.description && (
                                <div className='text-xs text-gray-400 max-w-xs truncate'>
                                  {company.description}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm text-gray-900'>
                            {company.email && <div>{company.email}</div>}
                            {company.phone && (
                              <div className='text-gray-500'>
                                {company.phone}
                              </div>
                            )}
                            {company.website && (
                              <div className='text-xs text-blue-600 truncate max-w-xs'>
                                {company.website}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full ${
                              company.is_active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {company.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {new Date(company.created_at).toLocaleDateString(
                            'es-ES'
                          )}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => handleEdit(company)}
                              className='text-blue-600 hover:text-blue-800 p-1 rounded'
                            >
                              <PencilIcon className='h-4 w-4' />
                            </button>
                            <button
                              onClick={() => handleDelete(company.id)}
                              className='text-red-600 hover:text-red-800 p-1 rounded'
                            >
                              <TrashIcon className='h-4 w-4' />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr key='no-companies'>
                      <td
                        colSpan={5}
                        className='px-6 py-12 text-center text-gray-500'
                      >
                        <div className='flex flex-col items-center'>
                          <div className='text-4xl mb-2'>🏢</div>
                          <p className='text-lg font-medium mb-1'>
                            No hay compañías registradas
                          </p>
                          <p className='text-sm'>
                            {Array.isArray(companies)
                              ? 'Crea tu primera compañía usando el botón "Agregar Compañía"'
                              : 'Error cargando datos del servidor'}
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create/Edit Company Modal */}
        {isModalOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
            <div className='bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold text-gray-900'>
                  {isEditing ? 'Editar Compañía' : 'Crear Nueva Compañía'}
                </h2>
                <button
                  onClick={closeModal}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <XMarkIcon className='h-6 w-6' />
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Nombre *
                    </label>
                    <input
                      type='text'
                      required
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Slug *
                    </label>
                    <input
                      type='text'
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                      placeholder='nombre-compania'
                    />
                    <p className='text-xs text-gray-500 mt-1'>
                      Se genera automáticamente pero puede editarlo
                    </p>
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Descripción
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Email
                    </label>
                    <input
                      type='email'
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Teléfono
                    </label>
                    <input
                      type='text'
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Dirección
                    </label>
                    <input
                      type='text'
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      Sitio Web
                    </label>
                    <input
                      type='url'
                      value={formData.website}
                      onChange={(e) =>
                        setFormData({ ...formData, website: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                      placeholder='https://...'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>
                      URL del Logo
                    </label>
                    <input
                      type='url'
                      value={formData.logo_url}
                      onChange={(e) =>
                        setFormData({ ...formData, logo_url: e.target.value })
                      }
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500'
                      placeholder='https://...'
                    />
                  </div>

                  <div className='md:col-span-2'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            is_active: e.target.checked,
                          })
                        }
                        className='mr-2 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded'
                      />
                      <span className='text-sm text-gray-700'>
                        Compañía activa
                      </span>
                    </label>
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
                    disabled={isSubmitting}
                    className='px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50'
                  >
                    {isSubmitting
                      ? isEditing
                        ? 'Actualizando...'
                        : 'Creando...'
                      : isEditing
                      ? 'Actualizar'
                      : 'Crear Compañía'}
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
