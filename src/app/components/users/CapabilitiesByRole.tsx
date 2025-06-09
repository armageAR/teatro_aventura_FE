import { useAuth } from '@/contexts/AuthContext';
import { getRoleEmoji, getRoleName } from '@/utils/role';

const CapabilitiesByRole = ({ capabilities }: { capabilities: string[] }) => {
  const { roles } = useAuth();
  const roleName = getRoleName(roles);
  const roleEmoji = getRoleEmoji(roles);
  return (
    <div className='bg-white rounded-lg shadow-sm p-6'>
      <h3 className='text-lg font-semibold text-gray-900 mb-4'>
        Capacidades del {roleName} {roleEmoji}
      </h3>
      <div className='space-y-3'>
        {capabilities.map((capability, index) => (
          <div key={index} className='flex items-start'>
            <div className='flex-shrink-0 mt-1'>
              <div className='w-2 h-2 bg-purple-500 rounded-full'></div>
            </div>
            <p className='ml-3 text-gray-700'>{capability}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CapabilitiesByRole;
