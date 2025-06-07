'use client';

import React, { useState } from 'react';

import { authAPI } from '@/lib/api';
import { API_BASE_URL } from '@/lib/auth';

interface TestResult {
  test: string;
  status: 'success' | 'error';
  message: string;
  details?: unknown;
  timestamp: string;
}

export default function TestConnection() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (
    test: string,
    status: 'success' | 'error',
    message: string,
    details?: unknown
  ) => {
    setResults((prev) => [
      ...prev,
      {
        test,
        status,
        message,
        details,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResults([]);

    // Test 1: Conectividad básica al servidor
    const connectionTest = await authAPI.testConnection();
    if (connectionTest.status === 'success') {
      addResult(
        'Conectividad básica',
        'success',
        'Servidor respondió correctamente'
      );
    } else {
      addResult(
        'Conectividad básica',
        'error',
        'No se puede conectar al servidor',
        connectionTest.error
      );
    }

    // Test 2: API base
    const apiTest = await authAPI.testAPI();
    if (apiTest.status === 'success') {
      addResult(
        'API Base',
        'success',
        'API respondió correctamente',
        apiTest.data
      );
    } else {
      addResult('API Base', 'error', 'Error en API base', apiTest.error);
    }

    // Test 3: Login con credenciales de prueba
    try {
      const loginResponse = await authAPI.login({
        email: 'admin@teatro.local',
        password: 'password123',
      });
      addResult('Login', 'success', 'Login exitoso', loginResponse);

      // Test 4: Si el login fue exitoso, probar obtener usuario
      try {
        const userResponse = await authAPI.getUser();
        addResult(
          'Get User',
          'success',
          'Usuario obtenido correctamente',
          userResponse
        );

        // Test 5: Obtener roles
        try {
          const rolesResponse = await authAPI.getUserRoles(userResponse.id);
          addResult(
            'Get Roles',
            'success',
            'Roles obtenidos correctamente',
            rolesResponse
          );
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Error desconocido';
          const errorData =
            error && typeof error === 'object' && 'response' in error
              ? (error as { response?: { data?: unknown } }).response?.data
              : undefined;
          addResult(
            'Get Roles',
            'error',
            `Error obteniendo roles: ${errorMessage}`,
            errorData
          );
        }
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'Error desconocido';
        const errorData =
          error && typeof error === 'object' && 'response' in error
            ? (error as { response?: { data?: unknown } }).response?.data
            : undefined;
        addResult(
          'Get User',
          'error',
          `Error obteniendo usuario: ${errorMessage}`,
          errorData
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';
      const errorData =
        error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: unknown } }).response?.data
          : undefined;
      addResult('Login', 'error', `Error en login: ${errorMessage}`, errorData);
    }

    setIsLoading(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>
            🔧 Diagnóstico de Conectividad
          </h1>
          <p className='text-gray-600 mb-4'>
            Esta página verifica la conectividad con el backend de Teatro de
            Aventura.
          </p>
          <div className='bg-blue-50 rounded-lg p-4 mb-6'>
            <h3 className='font-medium text-blue-900 mb-2'>
              Configuración actual:
            </h3>
            <p className='text-sm text-blue-800'>
              <strong>API Base URL:</strong> {API_BASE_URL}
            </p>
            <p className='text-sm text-blue-800'>
              <strong>Frontend:</strong> http://localhost:3000
            </p>
          </div>

          <div className='flex space-x-4'>
            <button
              onClick={testConnection}
              disabled={isLoading}
              className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed'
            >
              {isLoading ? 'Ejecutando pruebas...' : 'Ejecutar Pruebas'}
            </button>

            {results.length > 0 && (
              <button
                onClick={clearResults}
                disabled={isLoading}
                className='bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed'
              >
                Limpiar Resultados
              </button>
            )}
          </div>
        </div>

        {results.length > 0 && (
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              📊 Resultados de Pruebas
            </h2>

            <div className='space-y-4'>
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className='flex items-center justify-between mb-2'>
                    <h3
                      className={`font-medium ${
                        result.status === 'success'
                          ? 'text-green-800'
                          : 'text-red-800'
                      }`}
                    >
                      {result.status === 'success' ? '✅' : '❌'} {result.test}
                    </h3>
                    <span className='text-xs text-gray-500'>
                      {result.timestamp}
                    </span>
                  </div>

                  <p
                    className={`text-sm mb-2 ${
                      result.status === 'success'
                        ? 'text-green-700'
                        : 'text-red-700'
                    }`}
                  >
                    {result.message}
                  </p>

                  {result.details != null && (
                    <details className='mt-2'>
                      <summary className='text-xs text-gray-600 cursor-pointer hover:text-gray-800'>
                        Ver detalles
                      </summary>
                      <pre className='mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto max-h-40'>
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>

            {/* Resumen */}
            <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
              <h3 className='font-medium text-gray-900 mb-2'>📈 Resumen</h3>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-green-600 font-medium'>
                    ✅ Exitosas:{' '}
                    {results.filter((r) => r.status === 'success').length}
                  </span>
                </div>
                <div>
                  <span className='text-red-600 font-medium'>
                    ❌ Fallidas:{' '}
                    {results.filter((r) => r.status === 'error').length}
                  </span>
                </div>
              </div>

              {results.filter((r) => r.status === 'error').length > 0 && (
                <div className='mt-4 p-3 bg-yellow-50 rounded-lg'>
                  <h4 className='font-medium text-yellow-900 mb-2'>
                    🔧 Posibles Soluciones:
                  </h4>
                  <ul className='text-sm text-yellow-800 space-y-1'>
                    <li>
                      • Verifica que el backend esté ejecutándose en puerto 8008
                    </li>
                    <li>
                      • Configura CORS en Laravel para permitir origen
                      localhost:3000
                    </li>
                    <li>
                      • Asegúrate de que las rutas de API estén correctamente
                      definidas
                    </li>
                    <li>
                      • Verifica las credenciales de login (admin@teatro.local /
                      password123)
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className='mt-6 text-center'>
          <button
            onClick={() => (window.location.href = '/')}
            className='text-blue-600 hover:text-blue-800 text-sm'
          >
            ← Volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
