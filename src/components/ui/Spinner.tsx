export const Spinner = ({
  message = 'Cargando...',
  color = 'red',
}: {
  message?: string;
  color?: 'red' | 'blue' | 'purple';
}) => {
  const bgClasses: Record<'red' | 'blue' | 'purple', string> = {
    red: 'bg-red-50',
    blue: 'bg-blue-50',
    purple: 'bg-purple-50',
  };
  const borderClasses: Record<'red' | 'blue' | 'purple', string> = {
    red: 'border-red-600',
    blue: 'border-blue-600',
    purple: 'border-purple-600',
  };
  return (
    <div
      className={`flex justify-center items-center min-h-screen ${bgClasses[color]}`}
    >
      <div
        className={`animate-spin rounded-full h-12 w-12 border-b-2 ${borderClasses[color]}`}
      />
      <span className='ml-3 text-gray-600'>{message}</span>
    </div>
  );
};
