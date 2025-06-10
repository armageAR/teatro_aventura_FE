export const TopBanner = ({
  icon,
  title,
  message,
  borderColor,
}: {
  icon: string;
  title: string;
  message: string;
  borderColor: string;
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm p-6 mb-8 border-l-4 ${borderColor}`}
    >
      <h2 className='text-xl font-semibold text-gray-900 mb-2'>
        {icon} {title}
      </h2>
      <p className='text-gray-600'>{message}</p>
    </div>
  );
};

export default TopBanner;
