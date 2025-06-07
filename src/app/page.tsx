'use client';

import {
  CogIcon,
  EyeIcon,
  PlayIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import { LoginModal } from '@/components/LoginModal';

import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 to-blue-50'>
      {/* Header */}
      <header className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <div className='text-2xl'>🎭</div>
              <h1 className='ml-3 text-2xl font-bold text-gray-900'>
                Teatro de Aventura
              </h1>
            </div>

            <div className='flex items-center space-x-4'>
              {isAuthenticated ? (
                <div className='flex items-center space-x-4'>
                  <span className='text-sm text-gray-600'>
                    Hola, <span className='font-medium'>{user?.name}</span>
                  </span>
                  <button
                    onClick={logout}
                    className='bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500'
                  >
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className='bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                >
                  Iniciar Sesión
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className='py-20 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-5xl font-bold text-gray-900 mb-6'>
            Vive el Teatro de una Nueva Manera
          </h2>
          <p className='text-xl text-gray-600 mb-8 max-w-3xl mx-auto'>
            Una experiencia teatral interactiva donde cada decisión cuenta.
            Conectamos audiencias, directores, productores y administradores en
            una plataforma única de entretenimiento inmersivo.
          </p>

          <div className='flex justify-center mb-12'>
            <div className='relative'>
              <div className='w-64 h-64 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center shadow-2xl'>
                <PlayIcon className='h-20 w-20 text-white' />
              </div>
              <div className='absolute -top-4 -right-4 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center'>
                <span className='text-2xl'>🎬</span>
              </div>
              <div className='absolute -bottom-4 -left-4 w-12 h-12 bg-green-400 rounded-full flex items-center justify-center'>
                <span className='text-xl'>🎭</span>
              </div>
            </div>
          </div>

          {!isAuthenticated && (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className='bg-purple-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg transform hover:scale-105 transition-all duration-200'
            >
              ¡Únete Ahora!
            </button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className='py-16 bg-white'>
        <div className='max-w-6xl mx-auto px-4'>
          <h3 className='text-3xl font-bold text-center text-gray-900 mb-12'>
            Para Cada Tipo de Usuario
          </h3>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
            {/* Administrador */}
            <div className='text-center p-6 rounded-lg bg-purple-50 border border-purple-200'>
              <div className='text-4xl mb-4'>👑</div>
              <h4 className='text-xl font-semibold text-purple-800 mb-3'>
                Administradores
              </h4>
              <ul className='text-sm text-purple-600 space-y-2'>
                <li>• Control total del sistema</li>
                <li>• Gestión de usuarios</li>
                <li>• Estadísticas completas</li>
                <li>• Administración de obras</li>
              </ul>
            </div>

            {/* Productor */}
            <div className='text-center p-6 rounded-lg bg-red-50 border border-red-200'>
              <div className='text-4xl mb-4'>🎭</div>
              <h4 className='text-xl font-semibold text-red-800 mb-3'>
                Productores
              </h4>
              <ul className='text-sm text-red-600 space-y-2'>
                <li>• Crear obras teatrales</li>
                <li>• Gestionar funciones</li>
                <li>• Asignar directores</li>
                <li>• Ver estadísticas propias</li>
              </ul>
            </div>

            {/* Director */}
            <div className='text-center p-6 rounded-lg bg-blue-50 border border-blue-200'>
              <div className='text-4xl mb-4'>🎬</div>
              <h4 className='text-xl font-semibold text-blue-800 mb-3'>
                Directores
              </h4>
              <ul className='text-sm text-blue-600 space-y-2'>
                <li>• Crear preguntas interactivas</li>
                <li>• Dirigir funciones en vivo</li>
                <li>• Ver respuestas en tiempo real</li>
                <li>• Generar reportes PDF</li>
              </ul>
            </div>

            {/* Espectador */}
            <div className='text-center p-6 rounded-lg bg-green-50 border border-green-200'>
              <div className='text-4xl mb-4'>👤</div>
              <h4 className='text-xl font-semibold text-green-800 mb-3'>
                Espectadores
              </h4>
              <ul className='text-sm text-green-600 space-y-2'>
                <li>• Participar en funciones</li>
                <li>• Acceso por código QR</li>
                <li>• Historial personal</li>
                <li>• Informes finales</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-4xl mx-auto px-4 text-center'>
          <h3 className='text-3xl font-bold text-gray-900 mb-12'>
            ¿Cómo Funciona?
          </h3>

          <div className='grid md:grid-cols-3 gap-8'>
            <div className='flex flex-col items-center'>
              <div className='w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4'>
                <UserGroupIcon className='h-8 w-8 text-white' />
              </div>
              <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                1. Conecta
              </h4>
              <p className='text-gray-600'>
                Únete como administrador, productor, director o espectador según
                tu rol.
              </p>
            </div>

            <div className='flex flex-col items-center'>
              <div className='w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4'>
                <CogIcon className='h-8 w-8 text-white' />
              </div>
              <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                2. Gestiona
              </h4>
              <p className='text-gray-600'>
                Crea obras, programa funciones y prepara experiencias
                interactivas únicas.
              </p>
            </div>

            <div className='flex flex-col items-center'>
              <div className='w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4'>
                <EyeIcon className='h-8 w-8 text-white' />
              </div>
              <h4 className='text-lg font-semibold text-gray-900 mb-2'>
                3. Disfruta
              </h4>
              <p className='text-gray-600'>
                Vive la experiencia teatral interactiva donde tu participación
                importa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Access Section */}
      <section className='py-16 bg-gradient-to-r from-green-400 to-blue-500'>
        <div className='max-w-4xl mx-auto px-4 text-center text-white'>
          <h3 className='text-3xl font-bold mb-6'>
            Acceso Rápido para Espectadores
          </h3>
          <p className='text-xl mb-8'>
            Los espectadores pueden unirse instantáneamente escaneando el código
            QR en el teatro, sin necesidad de registro previo.
          </p>
          <div className='inline-block bg-white p-4 rounded-lg'>
            <div className='w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center'>
              <span className='text-4xl'>📱</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-800 text-white py-12'>
        <div className='max-w-6xl mx-auto px-4'>
          <div className='grid md:grid-cols-3 gap-8'>
            <div>
              <div className='flex items-center mb-4'>
                <span className='text-2xl mr-2'>🎭</span>
                <h4 className='text-xl font-bold'>Teatro de Aventura</h4>
              </div>
              <p className='text-gray-300'>
                Revolucionando la experiencia teatral a través de la tecnología
                y la participación interactiva.
              </p>
            </div>

            <div>
              <h4 className='text-lg font-semibold mb-4'>Contacto</h4>
              <div className='text-gray-300 space-y-2'>
                <p>📧 info@teatroaventura.com</p>
                <p>📞 +1 (555) 123-4567</p>
                <p>📍 Ciudad Teatral, 12345</p>
              </div>
            </div>

            <div>
              <h4 className='text-lg font-semibold mb-4'>Enlaces</h4>
              <div className='text-gray-300 space-y-2'>
                <p>
                  <a href='#' className='hover:text-white'>
                    Sobre Nosotros
                  </a>
                </p>
                <p>
                  <a href='#' className='hover:text-white'>
                    Términos de Servicio
                  </a>
                </p>
                <p>
                  <a href='#' className='hover:text-white'>
                    Política de Privacidad
                  </a>
                </p>
                <p>
                  <a href='#' className='hover:text-white'>
                    Soporte
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className='border-t border-gray-700 mt-8 pt-8 text-center text-gray-400'>
            <p>
              &copy; 2025 Teatro de Aventura. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
