import { ArrowRightEndOnRectangleIcon } from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';

export const ButtonLogout = () => {
  const { logout } = useAuth();
  return (
    <button
      onClick={logout}
      className='bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center'
    >
      <ArrowRightEndOnRectangleIcon className='h-4 w-4 mr-2' />
      Cerrar Sesión
    </button>
  );
};

export const ButtonStart = () => {
  return (
    <button
      onClick={() => (window.location.href = '/')}
      className='text-gray-600 hover:text-gray-800 px-3 py-2 rounded-md text-sm'
    >
      Inicio
    </button>
  );
};
