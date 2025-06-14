import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';
import React from 'react';

import { QuickActionButton } from '@/components/QuickActionButton';

export type QuickActionColor = 'red' | 'orange' | 'blue' | 'green' | 'purple';

export interface QuickAction {
  icon: React.ReactElement;
  title: string;
  description: string;
  color: QuickActionColor;
  onClick: () => void;
}

const colorStyles: Record<
  QuickActionColor,
  { border: string; hover: string; text: string; icon: string }
> = {
  red: {
    border: 'border-red-200',
    hover: 'hover:bg-red-50',
    text: 'text-red-800',
    icon: 'text-red-600',
  },
  orange: {
    border: 'border-orange-200',
    hover: 'hover:bg-orange-50',
    text: 'text-orange-800',
    icon: 'text-orange-600',
  },
  blue: {
    border: 'border-blue-200',
    hover: 'hover:bg-blue-50',
    text: 'text-blue-800',
    icon: 'text-blue-600',
  },
  green: {
    border: 'border-green-200',
    hover: 'hover:bg-green-50',
    text: 'text-green-800',
    icon: 'text-green-600',
  },
  purple: {
    border: 'border-purple-200',
    hover: 'hover:bg-purple-50',
    text: 'text-purple-800',
    icon: 'text-purple-600',
  },
};

export interface QuickActionsProps {
  actions?: QuickAction[];
}

const defaultActions: QuickAction[] = [
  {
    icon: <PlusIcon className='h-5 w-5' />,
    title: 'Gestion Obras',
    description: 'Crear una nueva obra teatral interactiva',
    color: 'red',
    onClick: () => {
      window.location.href = '/producer-dashboard/plays';
    },
  },
  {
    icon: <CalendarIcon className='h-5 w-5' />,
    title: 'Gestion Funciónes',
    description: 'Crear nuevas fechas y horarios',
    color: 'orange',
    onClick: () => {
      window.location.href = '/producer-dashboard/performances';
    },
  },
];

export const QuickActionsPanel: React.FC<QuickActionsProps> = ({
  actions = defaultActions,
}) => {
  return (
    <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Acciones Rápidas
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {actions.map((action, index) => {
          const styles = colorStyles[action.color];
          return (
            <QuickActionButton
              key={index}
              action={action}
              index={index}
              styles={styles}
            />
          );
        })}
      </div>
    </div>
  );
};

export default QuickActionsPanel;
