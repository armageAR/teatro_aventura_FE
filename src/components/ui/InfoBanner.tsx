import React from 'react';

import { cn } from '@/lib/utils';

export type InfoBannerProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  color?: 'blue' | 'red' | 'green' | 'purple' | 'orange';
  className?: string;
};

const colorClasses = {
  blue: 'border-blue-500',
  red: 'border-red-500',
  green: 'border-green-500',
  purple: 'border-purple-500',
  orange: 'border-orange-500',
} as const;

const InfoBanner: React.FC<InfoBannerProps> = ({
  title,
  description,
  color = 'blue',
  className,
}) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4',
        colorClasses[color],
        className,
      )}
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-2'>{title}</h2>
      {description && <p className='text-gray-600'>{description}</p>}
    </div>
  );
};

export default InfoBanner;
