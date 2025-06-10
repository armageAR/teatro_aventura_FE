import { ClockIcon } from '@heroicons/react/24/outline';

export interface LiveSessionStatusProps {
  play: string;
  showTime: string;
  expectedViewers: number;
  questionCount: number;
}

export const LiveSessionStatus = ({
  play,
  showTime,
  expectedViewers,
  questionCount,
}: LiveSessionStatusProps) => {
  return (
    <div className='mt-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white'>
      <h3 className='text-lg font-semibold mb-4 flex items-center'>
        <ClockIcon className='h-5 w-5 mr-2' /> Estado de Sesión en Vivo
      </h3>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white bg-opacity-20 rounded-lg p-4'>
          <p className='text-sm opacity-90'>Próxima Función</p>
          <p className='font-semibold text-lg'>{play}</p>
          <p className='text-sm opacity-75'>{showTime}</p>
        </div>
        <div className='bg-white bg-opacity-20 rounded-lg p-4'>
          <p className='text-sm opacity-90'>Espectadores Esperados</p>
          <p className='font-semibold text-2xl'>{expectedViewers}</p>
        </div>
        <div className='bg-white bg-opacity-20 rounded-lg p-4'>
          <p className='text-sm opacity-90'>Preguntas Preparadas</p>
          <p className='font-semibold text-2xl'>{questionCount}</p>
        </div>
      </div>
    </div>
  );
};

export default LiveSessionStatus;
