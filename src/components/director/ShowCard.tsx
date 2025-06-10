import { FilmIcon } from '@heroicons/react/24/outline';
import React from 'react';

export type ShowStatus = 'active' | 'preparation' | 'finished';

interface ShowCardProps {
  title: string;
  subtitle: string;
  status: ShowStatus;
  actionLabel: string;
}

const statusStyles: Record<ShowStatus, string> = {
  active: 'bg-green-100 text-green-800',
  preparation: 'bg-yellow-100 text-yellow-800',
  finished: 'bg-gray-100 text-gray-800',
};

export const ShowCard: React.FC<ShowCardProps> = ({
  title,
  subtitle,
  status,
  actionLabel,
}) => (
  <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200'>
    <div className='flex items-center'>
      <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4'>
        <FilmIcon className='h-6 w-6 text-gray-600' />
      </div>
      <div>
        <h4 className='font-medium text-gray-900'>{title}</h4>
        <p className='text-sm text-gray-600'>{subtitle}</p>
      </div>
    </div>
    <div className='flex items-center space-x-2'>
      <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[status]}`}>{
        status === 'active'
          ? 'Activa'
          : status === 'preparation'
          ? 'En preparación'
          : 'Finalizada'
      }</span>
      <button className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
        {actionLabel}
      </button>
    </div>
  </div>
);

export default ShowCard;
