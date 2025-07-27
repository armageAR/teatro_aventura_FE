'use client';

import {
  CalendarIcon,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import { CreatePlayData, Play, UpdatePlayData } from '@/lib/types/play';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Column, DataTable } from '@/components/ui/DataTable';
import { FormField, FormModal } from '@/components/ui/FormModal';
import { PageHeader } from '@/components/ui/PageHeader';

export default function PlaysManagement() {
  const [plays, setPlays] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPlay, setEditingPlay] = useState<Play | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreatePlayData>({
    title: '',
    description: '',
    release_date: '',
  });

  const loadPlays = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authAPI.getPlays();

      const playsData = response.plays;
      setPlays(Array.isArray(playsData) ? playsData : []);
    } catch (error) {
      console.error('❌ Error loading plays:', error);
      toast.error('Error al cargar las obras de tu compañía');
      setPlays([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlays();
  }, [loadPlays]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    if (!formData.release_date) {
      toast.error('La fecha de estreno es requerida');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingPlay) {
        const updateData: UpdatePlayData = {
          title: formData.title,
          description: formData.description,
          release_date: formData.release_date,
        };

        const response = await authAPI.updatePlay(editingPlay.id, updateData);
        const updatedPlay = response.play || response;

        setPlays(
          plays.map((play) =>
            play.id === editingPlay.id ? updatedPlay : play,
          ),
        );
        toast.success('Obra actualizada exitosamente');
      } else {
        const response = await authAPI.createPlay(formData);
        const newPlay = response.play || response;

        setPlays([...plays, newPlay]);
        toast.success('Obra creada exitosamente');
      }
      closeModal();
    } catch (error) {
      console.error('Error saving play:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la obra`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (play: Play) => {
    setIsEditing(true);
    setEditingPlay(play);
    setFormData({
      title: play.title || '',
      description: play.description || '',
      release_date: play.release_date || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (playId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta obra?')) {
      return;
    }

    try {
      await authAPI.deletePlay(playId);
      setPlays(plays.filter((play) => play.id !== playId));
      toast.success('Obra eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting play:', error);
      toast.error('Error al eliminar la obra');
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingPlay(null);
    setFormData({
      title: '',
      description: '',
      release_date: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingPlay(null);
    setFormData({
      title: '',
      description: '',
      release_date: '',
    });
    loadPlays();
  };

  const handleFormChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  // Filter plays based on search term
  const filteredPlays = plays.filter((play) => {
    const title = play.title || '';
    const description = play.description || '';
    return (
      title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const columns: Column<Play>[] = [
    {
      key: 'title',
      header: 'Obra',
      render: (play) => (
        <div className='flex items-center'>
          <div className='text-2xl mr-3'>🎭</div>
          <div>
            <div className='text-sm font-medium text-gray-900'>
              {play.title}
            </div>
            {play.description && (
              <div className='text-xs text-gray-500 max-w-xs truncate'>
                {play.description}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'release_date',
      header: 'Fecha de Estreno',
      render: (play) => (
        <div className='flex items-center'>
          <CalendarIcon className='h-4 w-4 mr-2 text-gray-400' />
          <span className='text-sm text-gray-900'>
            {play.release_date
              ? new Date(play.release_date).toLocaleDateString('es-ES')
              : 'No definida'}
          </span>
        </div>
      ),
    },
    {
      key: 'created_at',
      header: 'Fecha de Creación',
      render: (play) => (
        <span className='text-sm text-gray-500'>
          {new Date(play.created_at).toLocaleDateString('es-ES')}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      render: (play) => (
        <div className='flex space-x-2'>
          <button
            onClick={() => handleEdit(play)}
            className='text-blue-600 hover:text-blue-800 p-1 rounded'
            title='Editar'
          >
            <PencilIcon className='h-4 w-4' />
          </button>
          <button
            onClick={() => handleDelete(play.id)}
            className='text-red-600 hover:text-red-800 p-1 rounded'
            title='Eliminar'
          >
            <TrashIcon className='h-4 w-4' />
          </button>
        </div>
      ),
    },
  ];

  const formFields: FormField[] = [
    {
      name: 'title',
      label: 'Título',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el título de la obra',
    },
    {
      name: 'release_date',
      label: 'Fecha de Estreno',
      type: 'date',
      required: true,
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      placeholder: 'Descripción opcional de la obra',
      rows: 4,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['productor']}>
      <div className='min-h-screen bg-purple-50'>
        <PageHeader
          title='Gestión de Obras'
          subtitle='Administra las obras teatrales'
          icon='🎭'
          backTo='/producer-dashboard'
          actions={[
            {
              label: 'Nueva Obra',
              icon: PlusIcon,
              onClick: openCreateModal,
            },
          ]}
        />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <DataTable
            data={filteredPlays}
            columns={columns}
            loading={isLoading}
            title='Obras'
            count={filteredPlays.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            emptyState={{
              icon: '🎭',
              title: 'No hay obras registradas',
              description: 'Crea tu primera obra usando el botón "Nueva Obra"',
            }}
          />
        </div>

        <FormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={isEditing ? 'Editar Obra' : 'Crear Nueva Obra'}
          icon='🎭'
          fields={formFields}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          submitText={isEditing ? 'Actualizar Obra' : 'Crear Obra'}
          isSubmitting={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
