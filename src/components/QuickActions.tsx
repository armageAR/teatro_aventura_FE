import { CalendarIcon, PlusIcon, UsersIcon } from '@heroicons/react/24/outline';

export const QuickActions = () => {
  return (
    <div className='mt-8 bg-white rounded-lg shadow-sm p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Acciones Rápidas
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <button className='p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left group'>
          <div className='flex items-center mb-2'>
            <PlusIcon className='h-5 w-5 text-red-600 mr-2 group-hover:scale-110 transition-transform' />
            <span className='font-medium text-red-800'>Nueva Obra</span>
          </div>
          <p className='text-sm text-gray-600'>
            Crear una nueva obra teatral interactiva
          </p>
        </button>

        <button className='p-4 border-2 border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-left group'>
          <div className='flex items-center mb-2'>
            <CalendarIcon className='h-5 w-5 text-orange-600 mr-2 group-hover:scale-110 transition-transform' />
            <span className='font-medium text-orange-800'>
              Programar Función
            </span>
          </div>
          <p className='text-sm text-gray-600'>
            Crear nuevas fechas y horarios
          </p>
        </button>

        <button className='p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left group'>
          <div className='flex items-center mb-2'>
            <UsersIcon className='h-5 w-5 text-blue-600 mr-2 group-hover:scale-110 transition-transform' />
            <span className='font-medium text-blue-800'>Asignar Director</span>
          </div>
          <p className='text-sm text-gray-600'>
            Gestionar equipo de directores
          </p>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;
