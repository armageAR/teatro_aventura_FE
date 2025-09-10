export const constants = {
  roles: {
    routes: {
      administrador: '/admin-dashboard',
      productor: '/producer-dashboard',
      director: '/director-dashboard',
      espectador: '/my-history',
    } as const,
    colors: {
      administrador: '#8B5CF6',
      productor: '#EF4444',
      director: '#3B82F6',
      espectador: '#10B981',
    } as const,
    // Tailwind-friendly role color keys and classes for UI reuse
    ui: {
      colorKeyByRole: {
        administrador: 'purple',
        productor: 'red',
        director: 'blue',
        espectador: 'green',
      } as const,
      border: {
        administrador: 'border-purple-500',
        productor: 'border-red-500',
        director: 'border-blue-500',
        espectador: 'border-green-500',
      } as const,
      titleText: {
        administrador: 'text-purple-800',
        productor: 'text-red-800',
        director: 'text-blue-800',
        espectador: 'text-green-800',
      } as const,
      subtitleText: {
        administrador: 'text-purple-600',
        productor: 'text-red-600',
        director: 'text-blue-600',
        espectador: 'text-green-600',
      } as const,
      badge: {
        administrador: 'bg-purple-100 text-purple-800',
        productor: 'bg-red-100 text-red-800',
        director: 'bg-blue-100 text-blue-800',
        espectador: 'bg-green-100 text-green-800',
      } as const,
      background: {
        administrador: 'bg-purple-50',
        productor: 'bg-red-50',
        director: 'bg-blue-50',
        espectador: 'bg-green-50',
      } as const,
    },
    emojis: {
      administrador: '👑',
      productor: '🎭',
      director: '🎬',
      espectador: '👤',
    } as const,
  },
  pagination: {
    defaultPerPage: 15,
  },
  messages: {
    errors: {
      loginFailed: 'Error al iniciar sesión',
      fetchFailed: 'Error al cargar los datos',
    },
    success: {
      userCreated: 'Usuario creado exitosamente',
    },
  },
};

export default constants;
