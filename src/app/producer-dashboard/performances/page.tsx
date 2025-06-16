'use client';

import {
  EyeIcon,
  PencilIcon,
  PlusIcon,
  QrCodeIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import {
  CreatePerformanceData,
  Performance,
  PerformancesResponse,
  UpdatePerformanceData,
} from '@/lib/types/performance';
import { Play, PlaysResponse } from '@/lib/types/play';

import ProtectedRoute from '@/components/ProtectedRoute';
import { Column, DataTable } from '@/components/ui/DataTable';
import { FormField, FormModal } from '@/components/ui/FormModal';
import { PageHeader } from '@/components/ui/PageHeader';

export default function PerformancesManagement() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [plays, setPlays] = useState<Play[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPerformance, setEditingPerformance] =
    useState<Performance | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState<CreatePerformanceData>({
    play_id: 0,
    date: '',
    time: '',
    location: '',
  });

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [performancesResponse, playsResponse] = await Promise.all([
        authAPI.getPerformances().catch(() => ({ data: [] })),
        authAPI.getPlays().catch(() => ({ plays: [] })),
      ]);

      // Handle different response formats
      const performancesData =
        (performancesResponse as PerformancesResponse).performances ||
        performancesResponse;
      const playsData = (playsResponse as PlaysResponse).plays || playsResponse;

      setPerformances(Array.isArray(performancesData) ? performancesData : []);
      setPlays(Array.isArray(playsData) ? playsData : []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
      setPerformances([]);
      setPlays([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.play_id) {
      toast.error('Debe seleccionar una obra');
      return;
    }

    if (!formData.date) {
      toast.error('La fecha es requerida');
      return;
    }

    if (!formData.time) {
      toast.error('La hora es requerida');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEditing && editingPerformance) {
        const updateData: UpdatePerformanceData = {
          play_id: formData.play_id,
          date: formData.date,
          time: formData.time,
        };

        const response = await authAPI.updatePerformance(
          editingPerformance.id,
          updateData
        );
        const updatedPerformance = response.performance || response;

        setPerformances(
          performances.map((performance) =>
            performance.id === editingPerformance.id
              ? updatedPerformance
              : performance
          )
        );
        toast.success('Función actualizada exitosamente');
      } else {
        const response = await authAPI.createPerformance(formData);
        const newPerformance = response.performance || response;

        setPerformances([...performances, newPerformance]);
        toast.success('Función creada exitosamente');
      }
      closeModal();
    } catch (error) {
      console.error('Error saving performance:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la función`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (performance: Performance) => {
    setIsEditing(true);
    setEditingPerformance(performance);
    setFormData({
      play_id: performance.play_id,
      date: performance.date,
      time: performance.time,
      location: performance.location || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (performanceId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta función?')) {
      return;
    }

    try {
      await authAPI.deletePerformance(performanceId);
      setPerformances(
        performances.filter((performance) => performance.id !== performanceId)
      );
      toast.success('Función eliminada exitosamente');
    } catch (error) {
      console.error('Error deleting performance:', error);
      toast.error('Error al eliminar la función');
    }
  };

  const handleViewResults = (performanceId: number) => {
    window.location.href = `/performance/${performanceId}/results`;
  };

  const handleViewQR = (qrCode: string) => {
    // Create a simple QR code display modal or redirect
    const qrUrl = `${window.location.origin}/qr/${qrCode}`;
    window.open(qrUrl, '_blank');
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingPerformance(null);
    setFormData({
      play_id: 0,
      date: '',
      time: '',
      location: '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditing(false);
    setEditingPerformance(null);
    setFormData({
      play_id: 0,
      date: '',
      time: '',
      location: '',
    });
  };

  const handleFormChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  // Filter performances based on search term
  const filteredPerformances = performances.filter((performance) => {
    const playTitle = performance.play?.titulo || '';
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
      render: (performance) => {
        console.log('performance', performance);
        return (
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
        );
      },
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
            onClick={() => handleViewQR(performance.qr_code)}
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
            onClick={() => handleViewResults(performance.id)}
            className='text-green-600 hover:text-green-800 p-1 rounded'
            title='Ver resultados'
          >
            <EyeIcon className='h-4 w-4' />
          </button>
          <button
            onClick={() => handleEdit(performance)}
            className='text-blue-600 hover:text-blue-800 p-1 rounded'
            title='Editar'
          >
            <PencilIcon className='h-4 w-4' />
          </button>
          <button
            onClick={() => handleDelete(performance.id)}
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
      name: 'play_id',
      label: 'Obra',
      type: 'select',
      required: true,
      options: plays.map((play) => ({
        value: play.id,
        label: play.title || `Obra ${play.id}`,
      })),
    },
    {
      name: 'date',
      label: 'Fecha',
      type: 'date',
      required: true,
    },
    {
      name: 'time',
      label: 'Hora',
      type: 'time',
      required: true,
    },
    {
      name: 'location',
      label: 'Ubicación',
      type: 'text',
      required: false,
    },
  ];

  return (
    <ProtectedRoute allowedRoles={['productor']}>
      <div className='min-h-screen bg-purple-50'>
        <PageHeader
          title='Gestión de Funciones'
          subtitle='Administra las funciones teatrales'
          icon='🎪'
          backTo='/producer-dashboard'
          actions={[
            {
              label: 'Nueva Función',
              icon: PlusIcon,
              onClick: openCreateModal,
            },
          ]}
        />

        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <DataTable
            data={filteredPerformances}
            columns={columns}
            loading={isLoading}
            title='Funciones'
            count={filteredPerformances.length}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            emptyState={{
              icon: '🎪',
              title: 'No hay funciones programadas',
              description:
                'Crea tu primera función usando el botón "Nueva Función"',
            }}
          />
        </div>

        <FormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={isEditing ? 'Editar Función' : 'Programar Nueva Función'}
          icon='🎪'
          fields={formFields}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          submitText={isEditing ? 'Actualizar Función' : 'Programar Función'}
          isSubmitting={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
