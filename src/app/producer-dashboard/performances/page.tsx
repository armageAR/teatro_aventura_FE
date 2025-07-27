'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';
import {
  CreatePerformanceData,
  Performance,
  UpdatePerformanceData,
} from '@/lib/types/performance';

import { PerformanceFormModal } from '@/components/Performances/PerformanceFormModal';
import { PerformancesTable } from '@/components/Performances/PerformancesTable';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PageHeader } from '@/components/ui/PageHeader';

export default function PerformancesManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

    const combinedDateTime = `${formData.date}T${formData.time}`;

    setIsSubmitting(true);
    try {
      if (isEditing && editingPerformance) {
        const updateData: UpdatePerformanceData = {
          play_id: formData.play_id,
          date: combinedDateTime,
          time: formData.time,
          is_active: editingPerformance.is_active,
        };

        await authAPI.updatePerformance(editingPerformance.id, updateData);
        toast.success('Función actualizada exitosamente');
      } else {
        const createData: CreatePerformanceData = {
          play_id: formData.play_id,
          date: combinedDateTime,
          time: formData.time,
          location: formData.location,
        };

        await authAPI.createPerformance(createData);
        toast.success('Función creada exitosamente');
      }

      queryClient.invalidateQueries({ queryKey: ['performances'] });
      closeModal();
    } catch (error) {
      console.error('Error saving performance:', error);
      toast.error(`Error al ${isEditing ? 'actualizar' : 'crear'} la función`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (performance: Performance) => {
    const [datePart, timePart] = performance.date.split('T');
    setIsEditing(true);
    setEditingPerformance(performance);
    setFormData({
      play_id: performance.play_id,
      date: datePart,
      time: timePart?.slice(0, 5) || '',
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
      toast.success('Función eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['performances'] });
    } catch (error) {
      console.error('Error deleting performance:', error);
      toast.error('Error al eliminar la función');
    }
  };

  const handleViewResults = (performanceId: number) => {
    router.push(`/performance/${performanceId}/results`);
  };

  const handleViewQR = (qrCode: string) => {
    const qrUrl = `${window.location.origin}/qr/${qrCode}`;
    window.open(qrUrl, '_blank');
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingPerformance(null);
    setFormData({
      play_id: 0,
      date: '',
      time: '',
      location: '',
    });
  };

  const openCreateModal = () => {
    setIsModalOpen(true);
    resetForm();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleFormChange = (
    field: string,
    value: string | number | boolean,
  ) => {
    setFormData({ ...formData, [field]: value });
  };

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

        <PerformancesTable
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewResults={handleViewResults}
          onViewQR={handleViewQR}
        />

        <PerformanceFormModal
          isOpen={isModalOpen}
          onClose={closeModal}
          isEditing={isEditing}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
