export const constants = {
  api: {
    base_url: 'https://teatroaventurabe.up.railway.app/api',
  },
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
