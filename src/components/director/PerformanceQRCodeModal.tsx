'use client';

import Image from 'next/image';
import React, { useEffect, useMemo } from 'react';

import type { Performance } from '@/lib/types/performance';

interface PerformanceQRCodeModalProps {
  performance: Performance;
  isOpen: boolean;
  onClose: () => void;
}

const backdropCls =
  'fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4';
const modalCls =
  'bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative flex flex-col items-center gap-4';

const CloseIcon = () => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    fill='none'
    viewBox='0 0 24 24'
    strokeWidth={1.5}
    stroke='currentColor'
    className='w-5 h-5'
  >
    <path
      strokeLinecap='round'
      strokeLinejoin='round'
      d='M6 18 18 6M6 6l12 12'
    />
  </svg>
);

const PerformanceQRCodeModal: React.FC<PerformanceQRCodeModalProps> = ({
  performance,
  isOpen,
  onClose,
}) => {
  const joinUrl = useMemo(() => {
    const baseUrl =
      typeof window !== 'undefined'
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL || '';
    return `${baseUrl.replace(/\/$/, '')}/join/${performance.qr_code_token}`;
  }, [performance.qr_code_token]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={backdropCls} role='dialog' aria-modal='true'>
      <div className={modalCls}>
        <button
          type='button'
          onClick={onClose}
          className='absolute top-4 right-4 text-gray-400 hover:text-gray-600'
          aria-label='Cerrar'
        >
          <CloseIcon />
        </button>
        <h3 className='text-lg font-semibold text-gray-900 text-center'>
          QR para espectadores
        </h3>
        <p className='text-sm text-gray-600 text-center'>
          Comparte este código para que el público pueda unirse a la función.
        </p>
        <Image
          src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(joinUrl)}`}
          alt='QR de la función'
          width={220}
          height={220}
          className='rounded-lg border border-gray-200'
        />
        <p className='text-xs text-gray-500 break-all text-center'>{joinUrl}</p>
        <div className='flex gap-3'>
          <button
            onClick={() => navigator.clipboard.writeText(joinUrl)}
            className='px-4 py-2 rounded bg-blue-500 text-white text-sm font-medium hover:bg-blue-600'
          >
            Copiar enlace
          </button>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded bg-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-300'
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceQRCodeModal;
