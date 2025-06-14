import React from 'react';

import { QuickAction } from '@/components/producer/QuickActionsPanel';

type ColorStyle = { border: string; hover: string; text: string; icon: string };

export const QuickActionButton = ({
  action,
  index,
  styles,
}: {
  action: QuickAction;
  index: number;
  styles: ColorStyle;
}) => {
  return (
    <button
      key={index}
      className={`p-4 border-2 ${styles.border} rounded-lg ${styles.hover} transition-colors text-left group`}
      onClick={action.onClick}
    >
      <div className='flex items-center mb-2'>
        {React.cloneElement(action.icon, {
          className: `h-5 w-5 ${styles.icon} mr-2 group-hover:scale-110 transition-transform`,
        })}
        <span className={`font-medium ${styles.text}`}>{action.title}</span>
      </div>
      <p className='text-sm text-gray-600'>{action.description}</p>
    </button>
  );
};
