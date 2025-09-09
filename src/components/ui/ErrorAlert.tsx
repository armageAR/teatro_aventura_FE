import React from 'react';

import { cn } from '@/lib/utils';

export type ErrorAlertProps = {
  message: string;
  className?: string;
};

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className }) => {
  return (
    <div
      className={cn(
        'bg-red-50 border border-red-200 rounded-md p-4 mb-6',
        className,
      )}
    >
      <p className='text-red-800'>{message}</p>
    </div>
  );
};

export default ErrorAlert;
