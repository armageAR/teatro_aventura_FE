import { CalendarIcon, PlayIcon, UsersIcon } from '@heroicons/react/24/outline';

export const RecentActivities = () => {
  return (
    <div className='mt-8 bg-white rounded-lg shadow-sm p-6 mb-8'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Actividad Reciente
      </h3>
      <div className='space-y-4'>
        <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 bg-red-100 rounded-full flex items-center justify-center'>
              <PlayIcon className='h-4 w-4 text-red-600' />
            </div>
          </div>
          <div className='ml-3 flex-1'>
            <p className='text-sm font-medium text-gray-900'>
              Obra "El Misterio del Teatro" creada
            </p>
            <p className='text-xs text-gray-500'>Hace 2 horas</p>
          </div>
        </div>

        <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center'>
              <CalendarIcon className='h-4 w-4 text-orange-600' />
            </div>
          </div>
          <div className='ml-3 flex-1'>
            <p className='text-sm font-medium text-gray-900'>
              Función programada para el 15 de Enero
            </p>
            <p className='text-xs text-gray-500'>Ayer</p>
          </div>
        </div>

        <div className='flex items-center p-3 bg-gray-50 rounded-lg'>
          <div className='flex-shrink-0'>
            <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
              <UsersIcon className='h-4 w-4 text-blue-600' />
            </div>
          </div>
          <div className='ml-3 flex-1'>
            <p className='text-sm font-medium text-gray-900'>
              Director María García asignada
            </p>
            <p className='text-xs text-gray-500'>Hace 3 días</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentActivities;
