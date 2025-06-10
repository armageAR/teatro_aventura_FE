import React from 'react';

import { cn } from '@/lib/utils';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number | string;
  color?: 'red' | 'orange' | 'blue' | 'green';
}

const colorClasses: Record<Required<StatCardProps>['color'], string> = {
  red: 'border-t-red-500 text-red-600',
  orange: 'border-t-orange-500 text-orange-600',
  blue: 'border-t-blue-500 text-blue-600',
  green: 'border-t-green-500 text-green-600',
};

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  color = 'blue',
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-md shadow-sm p-5 border-t-4 flex items-center space-x-4',
        colorClasses[color]
      )}
    >
      <div className={cn('text-2xl', colorClasses[color])}>{icon}</div>
      <div>
        <div className='text-sm font-medium text-gray-500'>{title}</div>
        <div className='text-2xl font-bold text-gray-900'>{value}</div>
      </div>
    </div>
  );
};

export default StatCard;
