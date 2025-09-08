'use client';

import {
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

import { authAPI } from '@/lib/api';

import { handleApiError } from '@/utils/handleApiError';

function ResetPasswordContent() {
  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');

    if (!tokenParam || !emailParam) {
      toast.error('Enlace de restablecimiento inválido');
      router.push('/');
      return;
    }

    setToken(tokenParam);
    setEmail(emailParam);
  }, [searchParams, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.password) {
      toast.error('La contraseña es requerida');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!token || !email) {
      toast.error('Datos de restablecimiento inválidos');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authAPI.resetPassword(
        token,
        email,
        formData.password,
        formData.password_confirmation,
      );

      toast.success(response.message || 'Contraseña restablecida exitosamente');
      router.push('/');
    } catch (error: unknown) {
      handleApiError(error, { isEditing: false, entityName: 'contraseña' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className='min-h-screen bg-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-md w-full space-y-8'>
        <div>
          <div className='flex justify-center'>
            <div className='text-6xl'>🔒</div>
          </div>
          <h2 className='mt-6 text-center text-3xl font-extrabold text-gray-900'>
            Restablecer Contraseña
          </h2>
          <p className='mt-2 text-center text-sm text-gray-600'>
            Ingresa tu nueva contraseña para {email}
          </p>
        </div>

        <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            {/* New Password */}
            <div>
              <label
                htmlFor='password'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Nueva Contraseña
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  className='appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm'
                  placeholder='Ingresa tu nueva contraseña'
                  value={formData.password}
                  onChange={handleInputChange}
                  minLength={8}
                />
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <LockClosedIcon className='h-5 w-5 text-gray-400' />
                </div>
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeSlashIcon className='h-5 w-5 text-gray-400' />
                  ) : (
                    <EyeIcon className='h-5 w-5 text-gray-400' />
                  )}
                </button>
              </div>
              <p className='text-xs text-gray-500 mt-1'>Mínimo 8 caracteres</p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor='password_confirmation'
                className='block text-sm font-medium text-gray-700 mb-1'
              >
                Confirmar Contraseña
              </label>
              <div className='relative'>
                <input
                  id='password_confirmation'
                  name='password_confirmation'
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className='appearance-none relative block w-full px-3 py-2 pl-10 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-purple-500 focus:border-purple-500 focus:z-10 sm:text-sm'
                  placeholder='Confirma tu nueva contraseña'
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  minLength={8}
                />
                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                  <LockClosedIcon className='h-5 w-5 text-gray-400' />
                </div>
                <button
                  type='button'
                  className='absolute inset-y-0 right-0 pr-3 flex items-center'
                  onClick={toggleConfirmPasswordVisibility}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className='h-5 w-5 text-gray-400' />
                  ) : (
                    <EyeIcon className='h-5 w-5 text-gray-400' />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Password Requirements */}
          <div className='bg-blue-50 border border-blue-200 rounded-md p-3'>
            <h4 className='text-sm font-medium text-blue-800 mb-2'>
              Requisitos de la contraseña:
            </h4>
            <ul className='text-xs text-blue-700 space-y-1'>
              <li
                className={`flex items-center ${
                  formData.password.length >= 8 ? 'text-green-700' : ''
                }`}
              >
                <span className='mr-2'>
                  {formData.password.length >= 8 ? '✓' : '•'}
                </span>
                Al menos 8 caracteres
              </li>
              <li
                className={`flex items-center ${
                  formData.password === formData.password_confirmation &&
                  formData.password
                    ? 'text-green-700'
                    : ''
                }`}
              >
                <span className='mr-2'>
                  {formData.password === formData.password_confirmation &&
                  formData.password
                    ? '✓'
                    : '•'}
                </span>
                Las contraseñas deben coincidir
              </li>
            </ul>
          </div>

          <div>
            <button
              type='submit'
              disabled={
                isSubmitting ||
                !formData.password ||
                !formData.password_confirmation
              }
              className='group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {isSubmitting ? (
                <div className='flex items-center'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  Restableciendo...
                </div>
              ) : (
                'Restablecer Contraseña'
              )}
            </button>
          </div>

          <div className='text-center'>
            <button
              type='button'
              onClick={() => router.push('/')}
              className='text-sm text-purple-600 hover:text-purple-500'
            >
              Volver al inicio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-purple-50 flex items-center justify-center'>
          <div className='text-gray-600'>Cargando formulario…</div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
