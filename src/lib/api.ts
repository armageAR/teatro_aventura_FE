import axios from 'axios';

import {
  API_BASE_URL,
  AuthResponse,
  LoginCredentials,
  UserRoles,
} from './auth';

// Configuración de API según especificaciones del backend
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Interceptor para añadir el token a peticiones autenticadas
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  // Función de prueba para verificar conectividad
  testConnection: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/`);
      return { status: 'success', data: response.data };
    } catch (error) {
      return { status: 'error', error };
    }
  },

  // Función de prueba para la API base
  testAPI: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return { status: 'success', data: response.data };
    } catch (error) {
      return { status: 'error', error };
    }
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post('/login', credentials);
    return response.data;
  },

  getUser: async () => {
    const response = await api.get('/user');
    return response.data;
  },

  getUserRoles: async (userId: number): Promise<UserRoles> => {
    const response = await api.get(`/user/${userId}/roles`);
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/admin-dashboard');
    return response.data;
  },

  getProducerDashboard: async () => {
    const response = await api.get('/producer-dashboard');
    return response.data;
  },

  getDirectorDashboard: async () => {
    const response = await api.get('/director-dashboard');
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get('/my-history');
    return response.data;
  },
};

export default api;
