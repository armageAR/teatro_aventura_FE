'use client';

import { ArrowLeftIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';

import { handleApiError } from '@/utils/handleApiError';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('El email es requerido');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Ingresa un email válido');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authAPI.forgotPassword(email);

      toast.success(response.message || 'Enlace de restablecimiento enviado');
      setIsEmailSent(true);
    } catch (error) {
      handleApiError(error, {
        isEditing: false,
        entityName: 'enlace de restablecimiento',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLogin = () => {
    router.push('/');
  };

  if (isEmailSent) {
    return (
      <div className='min-h-screen bg-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full space-y-8'>
          <div className='text-center'>
            <div className='text-6xl mb-6'>📧</div>
            <h2 className='text-3xl font-extrabold text-gray-900 mb-4'>
              Revisa tu email
            </h2>
            <p className='text-gray-600 mb-6'>
              Hemos enviado un enlace de restablecimiento de contraseña a:
            </p>
            <p className='text-purple-600 font-medium text-lg mb-8'>{email}</p>
            <div className='bg-blue-50 border border-blue-200 rounded-md p-4 mb-6'>
              <p className='text-sm text-blue-800'>
                <strong>Nota:</strong> Si no recibes el email en unos minutos,
                revisa tu carpeta de spam o correo no deseado.
              </p>
            </div>
            <div className='space-y-3'>
              <button
                onClick={() => setIsEmailSent(false)}
                className='w-full flex justify-center py-2 px-4 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-white hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              >
                Enviar otro enlace
              </button>
              <button
                onClick={handleBackToLogin}
                className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='flex justify-center'>
            <div className='text-6xl'>🔑</div>
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Recuperar Contraseña
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Ingresa tu email y te enviaremos un enlace para restablecer tu
            contraseña
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Dirección de Email
            </label>
            <div className='relative'>
              <input
                id='email'
                name='email'
                type='email'
                autoComplete='email'
                required
                className='appearance-none relative block w-full px-3 py-2 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm'
                placeholder='tu@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                <EnvelopeIcon className='h-5 w-5 text-gray-400' />
              </div>
            </div>
          </div>

          <div className='bg-yellow-50 border border-yellow-200 rounded-md p-3'>
            <p className='text-sm text-yellow-800'>
              <strong>¿Qué sucederá después?</strong>
              <br />
              Te enviaremos un email con un enlace seguro para restablecer tu
              contraseña. El enlace será válido por 60 minutos.
            </p>
          </div>

          <div>
            <button
              type='submit'
              disabled={isSubmitting}
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? (
                <div className='flex items-center'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Enviando enlace...
                </div>
              ) : (
                'Enviar enlace de restablecimiento'
              )}
            </button>
          </div>

          <div className='flex items-center justify-center'>
            <button
              type='button'
              onClick={handleBackToLogin}
              className='flex items-center text-sm text-purple-600 hover:text-purple-500'
            >
              <ArrowLeftIcon className='h-4 w-4 mr-1' />
              Volver al inicio de sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
