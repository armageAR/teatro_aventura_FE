export const Spinner = ({ message = 'Cargando...' }: { message?: string }) => {
  return (
    <div className='flex justify-center items-center min-h-screen bg-red-50'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-600' />
      <span className='ml-3 text-gray-600'>{message}</span>
    </div>
  );
};
