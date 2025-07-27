import React from 'react';

import type { FormPerformanceData } from '@/lib/types/performance';
import { usePlays } from '@/hooks/usePlays';

import { FormField, FormModal } from '@/components/ui/FormModal';

export interface PerformanceFormModalProps {
  isOpen: boolean;
  isEditing: boolean;
  formData: FormPerformanceData;
  onChange: (field: string, value: string | number | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isSubmitting: boolean;
}

export function PerformanceFormModal({
  isOpen,
  isEditing,
  formData,
  onChange,
  onSubmit,
  onClose,
  isSubmitting,
}: PerformanceFormModalProps) {
  const { data: playsData } = usePlays();
  const plays = playsData?.plays ?? [];

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
    { name: 'date', label: 'Fecha', type: 'date', required: true },
    { name: 'time', label: 'Hora', type: 'time', required: true },
    { name: 'location', label: 'Ubicación', type: 'text', required: false },
  ];

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Función' : 'Programar Nueva Función'}
      icon='🎪'
      fields={formFields}
      formData={formData}
      onChange={onChange}
      onSubmit={onSubmit}
      submitText={isEditing ? 'Actualizar Función' : 'Programar Función'}
      isSubmitting={isSubmitting}
    />
  );
}
