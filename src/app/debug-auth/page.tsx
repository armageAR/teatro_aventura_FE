'use client';

import React from 'react';

import { useAuth } from '@/contexts/AuthContext';

export default function DebugAuth() {
  const auth = useAuth();

  return (
    <div className='min-h-screen bg-gray-50 p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8'>Debug de Autenticación</h1>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>
            Estado de Autenticación
          </h2>
          <div className='space-y-2'>
            <p>
              <strong>isAuthenticated:</strong>{' '}
              {auth.isAuthenticated ? 'true' : 'false'}
            </p>
            <p>
              <strong>isLoading:</strong> {auth.isLoading ? 'true' : 'false'}
            </p>
            <p>
              <strong>Token:</strong> {auth.token ? 'Presente' : 'No presente'}
            </p>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Usuario</h2>
          <pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>
            {JSON.stringify(auth.user, null, 2)}
          </pre>
        </div>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Roles</h2>
          <div className='space-y-2'>
            <p>
              <strong>Roles array:</strong> {JSON.stringify(auth.roles)}
            </p>
            <p>
              <strong>Cantidad de roles:</strong> {auth.roles.length}
            </p>
            <p>
              <strong>Tipo de roles[0]:</strong> {typeof auth.roles[0]}
            </p>
            {auth.roles.map((role, index) => (
              <p key={index}>
                <strong>Rol {index}:</strong> "{role}"
              </p>
            ))}
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>Permisos</h2>
          <pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>
            {JSON.stringify(auth.permissions, null, 2)}
          </pre>
        </div>

        <div className='bg-white rounded-lg shadow p-6 mb-6'>
          <h2 className='text-xl font-semibold mb-4'>
            Prueba de Verificación de Roles
          </h2>
          <div className='space-y-2'>
            <p>
              <strong>¿Incluye 'administrador'?:</strong>{' '}
              {auth.roles.includes('administrador') ? 'Sí' : 'No'}
            </p>
            <p>
              <strong>¿Incluye 'admin'?:</strong>{' '}
              {auth.roles.includes('admin') ? 'Sí' : 'No'}
            </p>
            <p>
              <strong>Roles disponibles:</strong> ['administrador', 'productor',
              'director', 'espectador']
            </p>
          </div>
        </div>

        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-4'>Storage</h2>
          <div className='space-y-2'>
            <p>
              <strong>Token en localStorage:</strong>{' '}
              {localStorage.getItem('token') ? 'Presente' : 'No presente'}
            </p>
          </div>
        </div>

        <div className='mt-6 space-x-4'>
          <button
            onClick={() => (window.location.href = '/admin-dashboard')}
            className='bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700'
          >
            Ir a Admin Dashboard
          </button>
          <button
            onClick={() => auth.checkAuth()}
            className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
          >
            Recargar Auth
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className='bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700'
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
