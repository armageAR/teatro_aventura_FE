import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

import { useAuth } from '@/contexts/AuthContext';
import { getRoleEmoji, getRoleName } from '@/utils/role';

const LimitationsByRole = ({ limitations }: { limitations: string[] }) => {
  const { roles } = useAuth();
  const roleName = getRoleName(roles);
  const roleEmoji = getRoleEmoji(roles);
  return (
    <div className='bg-yellow-50 rounded-lg border border-yellow-200 p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
        <ExclamationTriangleIcon className='h-5 w-5 text-yellow-600 mr-2' />
        Limitaciones del {roleName} {roleEmoji}
      </h3>
      <div className='space-y-3'>
        {limitations.map((limitation, index) => (
          <div key={index} className='flex items-start'>
            <div className='flex-shrink-0 mt-1'>
              <div className='w-2 h-2 bg-yellow-500 rounded-full'></div>
            </div>
            <p className='ml-3 text-yellow-800'>{limitation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LimitationsByRole;
