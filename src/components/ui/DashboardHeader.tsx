import { ButtonLogout, ButtonStart } from './buttons';
import { useAuth } from '@/contexts/AuthContext';

export type DashboardHeaderProps = {
  icon: string | React.ReactNode;
  title: string;
  color?: 'blue' | 'red' | 'purple';
};

const colorClasses = {
  blue: {
    border: 'border-blue-500',
    title: 'text-blue-800',
    subtitle: 'text-blue-600',
  },
  red: {
    border: 'border-red-500',
    title: 'text-red-800',
    subtitle: 'text-red-600',
  },
  purple: {
    border: 'border-purple-500',
    title: 'text-purple-800',
    subtitle: 'text-purple-600',
  },
} as const;

export const DashboardHeader = ({ icon, title, color = 'blue' }: DashboardHeaderProps) => {
  const { user } = useAuth();
  const styles = colorClasses[color];
  return (
    <header className={`bg-white shadow-sm border-b-4 ${styles.border}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center py-4'>
          <div className='flex items-center'>
            <div className='text-3xl mr-3'>{icon}</div>
            <div>
              <h1 className={`text-2xl font-bold ${styles.title}`}>{title}</h1>
              <p className={styles.subtitle}>Bienvenido, {user?.name}</p>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <ButtonStart />
            <ButtonLogout />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
