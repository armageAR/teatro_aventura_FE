'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface Action {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  backTo?: string;
  onBack?: () => void;
  actions?: Action[];
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    onClick?: () => void;
  }>;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  backTo,
  onBack,
  actions = [],
  breadcrumbs,
}: PageHeaderProps) {
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      window.location.href = backTo;
    }
  };

  const getActionClasses = (variant = 'primary') => {
    const baseClasses =
      'px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 flex items-center disabled:opacity-50 disabled:cursor-not-allowed';

    switch (variant) {
      case 'secondary':
        return `${baseClasses} text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-gray-500`;
      case 'danger':
        return `${baseClasses} text-white bg-red-600 border border-transparent hover:bg-red-700 focus:ring-red-500`;
      default:
        return `${baseClasses} text-white bg-purple-600 border border-transparent hover:bg-purple-700 focus:ring-purple-500`;
    }
  };

  return (
    <header className='bg-white shadow-sm border-b-4 border-purple-500'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <div className='py-2'>
            <nav className='flex text-sm text-gray-500'>
              {breadcrumbs.map((crumb, index) => (
                <span key={index} className='flex items-center'>
                  {index > 0 && <span className='mx-2'>/</span>}
                  {crumb.href || crumb.onClick ? (
                    <button
                      onClick={
                        crumb.onClick ||
                        (() => (window.location.href = crumb.href || '/'))
                      }
                      className='hover:text-purple-600'
                    >
                      {crumb.label}
                    </button>
                  ) : (
                    <span className='text-gray-900'>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        )}

        <div className='flex justify-between items-center py-4'>
          <div className='flex items-center'>
            {(backTo || onBack) && (
              <button
                onClick={handleBack}
                className='mr-4 p-2 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800'
              >
                <ArrowLeftIcon className='h-5 w-5' />
              </button>
            )}

            {icon && <div className='text-3xl mr-3'>{icon}</div>}

            <div>
              <h1 className='text-2xl font-bold text-purple-800'>{title}</h1>
              {subtitle && <p className='text-purple-600'>{subtitle}</p>}
            </div>
          </div>

          {actions.length > 0 && (
            <div className='flex items-center space-x-4'>
              {actions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={index}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={getActionClasses(action.variant)}
                  >
                    {IconComponent && (
                      <IconComponent className='h-4 w-4 mr-2' />
                    )}
                    {action.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
