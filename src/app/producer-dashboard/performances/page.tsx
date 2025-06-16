'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
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
import {
  PerformanceFormModal,
} from '@/components/Performances/PerformanceFormModal';
import {
  PerformancesTable,
} from '@/components/Performances/PerformancesTable';
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
          performances={performances}
          loading={isLoading}
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
          plays={plays}
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </ProtectedRoute>
  );
}
