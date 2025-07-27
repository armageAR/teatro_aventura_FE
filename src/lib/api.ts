import axios from 'axios';

import {
  CreatePerformanceResponse,
  DeletePerformanceResponse,
  FormPerformanceData,
  JoinPerformanceResponse,
  PerformanceResponse,
  PerformanceResultsResponse,
  PerformancesResponse,
  SpectatorAnswer,
  SpectatorAnswerResponse,
  UpdatePerformanceResponse,
} from '@/lib/types/performance';
import {
  CreatePlayData,
  CreatePlayResponse,
  DeletePlayResponse,
  PlayResponse,
  PlaysResponse,
  UpdatePlayData,
  UpdatePlayResponse,
} from '@/lib/types/play';
import { ChangeRoleData, ChangeRoleResponse, Role } from '@/lib/types/role';

import {
  API_BASE_URL,
  AuthResponse,
  LoginCredentials,
  ResetPasswordData,
  ResetPasswordResponse,
} from './types/auth';
import {
  CompaniesResponse,
  CompanyResponse,
  CreateCompanyData,
  UpdateCompanyData,
} from './types/company';
import {
  CreateUserData,
  CreateUserResponse,
  DeleteUserResponse,
  SearchUsersResponse,
  UpdateUserData,
  UpdateUserResponse,
  User,
  UserFilters,
  UserResponse,
  UserRoles,
  UsersListResponse,
  UserStatistics,
} from './types/user';

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
  },
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

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/user');
    return response.data;
  },

  getUserRoles: async (userId: number): Promise<UserRoles> => {
    const response = await api.get(`/roles/user/${userId}`);
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getProducerDashboard: async () => {
    const response = await api.get('/producer/dashboard');
    return response.data;
  },

  getDirectorDashboard: async () => {
    const response = await api.get('/director/dashboard');
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get('/spectator/my-history');
    return response.data;
  },

  // Endpoints para gestión de usuarios
  getUsers: async (filters?: UserFilters): Promise<UsersListResponse> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.company_id)
      params.append('company_id', filters.company_id.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.per_page)
      params.append('per_page', filters.per_page.toString());
    if (filters?.page) params.append('page', filters.page.toString());

    const queryString = params.toString();
    const response = await api.get(
      `/users${queryString ? `?${queryString}` : ''}`,
    );
    return response.data;
  },

  getUser: async (userId: number): Promise<UserResponse> => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  createUser: async (userData: CreateUserData): Promise<CreateUserResponse> => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (
    userId: number,
    userData: UpdateUserData,
  ): Promise<UpdateUserResponse> => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<DeleteUserResponse> => {
    const response = await api.delete(`/users/${userId}`);
    return response.data;
  },

  // Nuevos endpoints específicos
  changeUserRole: async (
    userId: number,
    roleData: ChangeRoleData,
  ): Promise<ChangeRoleResponse> => {
    const response = await api.post(`/users/${userId}/change-role`, roleData);
    return response.data;
  },

  resetUserPassword: async (
    userId: number,
    passwordData: ResetPasswordData,
  ): Promise<ResetPasswordResponse> => {
    const response = await api.post(
      `/users/${userId}/reset-password`,
      passwordData,
    );
    return response.data;
  },

  getUserStatistics: async (): Promise<UserStatistics> => {
    const response = await api.get('/users/statistics');
    return response.data;
  },

  searchUsers: async (
    query: string,
    limit = 10,
  ): Promise<SearchUsersResponse> => {
    const response = await api.get(
      `/users/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    return response.data;
  },

  // Endpoints para roles
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles');

    // Manejar diferentes formatos de respuesta
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && Array.isArray(response.data.roles)) {
      return response.data.roles;
    } else if (response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else {
      console.warn('❌ Formato de roles inesperado en API:', response.data);
      return [];
    }
  },

  // Endpoints para gestión de compañías
  getCompanies: async (): Promise<CompaniesResponse> => {
    const response = await api.get('/companies');
    return response.data;
  },

  createCompany: async (
    companyData: CreateCompanyData,
  ): Promise<CompanyResponse> => {
    const response = await api.post('/companies', companyData);
    return response.data;
  },

  updateCompany: async (
    companyId: number,
    companyData: UpdateCompanyData,
  ): Promise<CompanyResponse> => {
    const response = await api.put(`/companies/${companyId}`, companyData);
    return response.data;
  },

  deleteCompany: async (companyId: number): Promise<void> => {
    await api.delete(`/companies/${companyId}`);
  },

  // Endpoints para gestión de obras
  getPlays: async (): Promise<PlaysResponse> => {
    // Si hay token, usar el endpoint protegido que filtra por compañía
    const token = localStorage.getItem('token');
    const endpoint = token ? '/plays' : '/plays';
    const response = await api.get(endpoint);
    return response.data;
  },

  getPlay: async (playId: number): Promise<PlayResponse> => {
    const response = await api.get(`/plays/${playId}`);
    return response.data;
  },

  // Endpoints para gestión de obras (Productor)
  createPlay: async (playData: CreatePlayData): Promise<CreatePlayResponse> => {
    const response = await api.post('/plays', playData);
    return response.data;
  },

  updatePlay: async (
    playId: number,
    playData: UpdatePlayData,
  ): Promise<UpdatePlayResponse> => {
    const response = await api.put(`/plays/${playId}`, playData);
    return response.data;
  },

  deletePlay: async (playId: number): Promise<DeletePlayResponse> => {
    const response = await api.delete(`/plays/${playId}`);
    return response.data;
  },

  // Endpoints para gestión de funciones
  getPerformances: async (): Promise<PerformancesResponse> => {
    const response = await api.get('/performances');
    return response.data;
  },

  getPerformance: async (
    performanceId: number,
  ): Promise<PerformanceResponse> => {
    const response = await api.get(`/performances/${performanceId}`);
    return response.data;
  },

  createPerformance: async (
    performanceData: FormPerformanceData,
  ): Promise<CreatePerformanceResponse> => {
    const response = await api.post('/performances', performanceData);
    return response.data;
  },

  updatePerformance: async (
    performanceId: number,
    performanceData: FormPerformanceData,
  ): Promise<UpdatePerformanceResponse> => {
    const response = await api.put(
      `/performances/${performanceId}`,
      performanceData,
    );
    return response.data;
  },

  deletePerformance: async (
    performanceId: number,
  ): Promise<DeletePerformanceResponse> => {
    const response = await api.delete(`/performances/${performanceId}`);
    return response.data;
  },

  // Endpoints públicos para espectadores
  joinPerformanceByQR: async (
    qrCode: string,
  ): Promise<JoinPerformanceResponse> => {
    const response = await api.post(`/join-performance/${qrCode}`);
    return response.data;
  },

  submitAnswer: async (
    answerData: SpectatorAnswer,
  ): Promise<SpectatorAnswerResponse> => {
    const response = await api.post('/submit-answer', answerData);
    return response.data;
  },

  getPerformanceResults: async (
    performanceId: number,
  ): Promise<PerformanceResultsResponse> => {
    const response = await api.get(`/performance/${performanceId}/results`);
    return response.data;
  },

  // Endpoints para permisos
  getPermissions: async () => {
    const response = await api.get('/roles/permissions');
    return response.data;
  },

  checkPermission: async (permission: string) => {
    const response = await api.post('/roles/check-permission', { permission });
    return response.data;
  },

  // Endpoints para gestión de roles
  assignRole: async (userId: number, role: string) => {
    const response = await api.post('/roles/assign', { user_id: userId, role });
    return response.data;
  },

  removeRole: async (userId: number, role: string) => {
    const response = await api.post('/roles/remove', { user_id: userId, role });
    return response.data;
  },

  // Endpoints de autenticación adicionales
  forgotPassword: async (email: string) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (
    token: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ) => {
    const response = await api.post('/reset-password', {
      token,
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
    return response.data;
  },
};

export default api;
