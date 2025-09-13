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

// Tipos locales para endpoints extendidos (directorías y preguntas)
export type DirectorsIndexResponse = {
  play_id: number;
  directors: Array<{ id: number; name: string; email: string }>;
};
export type AssignDirectorResponse = {
  message: string;
  play_id: number;
  directors: Array<{ id: number; name: string; email: string }>;
};

export type QuestionOption = {
  id: number;
  question_id: number;
  text: string;
  is_correct: boolean;
};
export type QuestionDTO = {
  id: number;
  play_id: number;
  title: string;
  body: string | null;
  options?: QuestionOption[];
};
export type QuestionsIndexResponse = {
  play_id: number;
  questions: QuestionDTO[];
};
export type CreateQuestionPayload = {
  title: string;
  body?: string | null;
  answer_options?: Array<{ text: string; is_correct?: boolean }>;
};
export type CreateQuestionResponse = {
  message: string;
  play_id: number;
  question: QuestionDTO;
};
export type ShowQuestionResponse = {
  question: QuestionDTO;
};
export type UpdateQuestionPayload = {
  title?: string;
  body?: string | null;
  answer_options?: Array<{ text: string; is_correct?: boolean }>;
};
export type UpdateQuestionResponse = {
  message: string;
  question: QuestionDTO;
};
export type DeleteQuestionResponse = {
  message: string;
};

export type LiveSendCloseResponse = {
  message: string;
  question_id: number;
  performance_id: number;
  status: 'sent' | 'closed';
  sent_at?: string;
  closed_at?: string;
};
export type LiveResultsResponse = {
  question_id: number;
  performance_id: number;
  results: Array<{ option_id: number; text: string; votes: number }>;
  total: number;
};

export type CurrentPerformanceResponse = {
  performance: unknown;
  status: 'pendiente' | 'activa' | 'finalizada';
  active: boolean;
  started_at: string | null;
  ended_at: string | null;
};
export type QRInfoResponse = {
  performance_id: number;
  token: string;
  join_endpoint: string;
  status: 'pendiente' | 'activa' | 'finalizada';
};

// Configuración de API
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Interceptor para añadir token (SSR-safe)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('token');
    if (token) {
      config.headers = {
        ...(config.headers || {}),
        Authorization: `Bearer ${token}`,
      } as typeof config.headers;
    }
  }
  return config;
});

// Interceptor para manejar 401 (SSR-safe)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  },
);

export const authAPI = {
  // Tests/diagnóstico
  testConnection: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL.replace('/api', '')}/`);
      return { status: 'success', data: response.data };
    } catch (error) {
      return { status: 'error', error };
    }
  },
  testAPI: async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      return { status: 'success', data: response.data };
    } catch (error) {
      return { status: 'error', error };
    }
  },

  // Auth
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

  // Dashboards
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

  // Espectador (autenticado)
  getMyHistory: async () => {
    const response = await api.get('/spectator/my-history');
    return response.data;
  },

  // Usuarios
  getUsers: async (filters?: UserFilters): Promise<UsersListResponse> => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.company_id)
      params.append('company_id', String(filters.company_id));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.per_page) params.append('per_page', String(filters.per_page));
    if (filters?.page) params.append('page', String(filters.page));

    const query = params.toString();
    const response = await api.get(`/users${query ? `?${query}` : ''}`);
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

  // Roles (listado y asignaciones)
  getRoles: async (): Promise<Role[]> => {
    const response = await api.get('/roles');
    if (Array.isArray(response.data)) return response.data;
    if (response.data && Array.isArray(response.data.roles))
      return response.data.roles;
    if (response.data && Array.isArray(response.data.data))
      return response.data.data;
    // eslint-disable-next-line no-console
    console.warn('Formato de roles inesperado:', response.data);
    return [];
  },
  assignRole: async (userId: number, role: string) => {
    const response = await api.post('/roles/assign', { user_id: userId, role });
    return response.data;
  },
  removeRole: async (userId: number, role: string) => {
    const response = await api.post('/roles/remove', { user_id: userId, role });
    return response.data;
  },

  // Compañías
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

  // Obras (plays)
  getPlays: async (): Promise<PlaysResponse> => {
    const response = await api.get('/plays');
    return response.data;
  },
  getPlay: async (playId: number): Promise<PlayResponse> => {
    const response = await api.get(`/plays/${playId}`);
    return response.data;
  },
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

  // Directores por obra (asignación)
  getPlayDirectors: async (playId: number): Promise<DirectorsIndexResponse> => {
    const response = await api.get(`/plays/${playId}/directors`);
    return response.data;
  },
  assignDirectorToPlay: async (
    playId: number,
    userId: number,
  ): Promise<AssignDirectorResponse> => {
    const response = await api.post(`/plays/${playId}/directors`, {
      user_id: userId,
    });
    return response.data;
  },

  // Funciones (performances)
  getPerformances: async (filters?: {
    play_id?: number;
    is_active?: boolean;
    page?: number;
    per_page?: number;
  }): Promise<PerformancesResponse> => {
    const params = new URLSearchParams();
    if (filters?.play_id) params.append('play_id', String(filters.play_id));
    if (typeof filters?.is_active === 'boolean')
      params.append('is_active', String(filters.is_active ? 1 : 0));
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.per_page) params.append('per_page', String(filters.per_page));

    const query = params.toString();
    const response = await api.get(`/performances${query ? `?${query}` : ''}`);
    return response.data;
  },
  // Conveniencia: obtener solo las performances de una obra
  getPlayPerformances: async (
    playId: number,
    options?: { is_active?: boolean; page?: number; per_page?: number },
  ): Promise<PerformancesResponse> => {
    return authAPI.getPerformances({ play_id: playId, ...options });
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

  // Operativa de performance (opcional)
  startPerformance: async (performanceId: number) => {
    const response = await api.post(`/performances/${performanceId}/start`);
    return response.data;
  },
  closePerformance: async (performanceId: number) => {
    const response = await api.post(`/performances/${performanceId}/close`);
    return response.data;
  },
  getCurrentPerformance: async (
    performanceId: number,
  ): Promise<CurrentPerformanceResponse> => {
    const response = await api.get(`/performances/${performanceId}/current`);
    return response.data;
  },
  getPerformanceQR: async (performanceId: number): Promise<QRInfoResponse> => {
    const response = await api.get(`/performances/${performanceId}/qr`);
    return response.data;
  },

  // Espectadores (público)
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
    const response = await api.get(`/performances/${performanceId}/results`);
    return response.data;
  },

  // Preguntas (questions)
  getQuestions: async (playId: number): Promise<QuestionsIndexResponse> => {
    const response = await api.get(`/plays/${playId}/questions`);
    return response.data;
  },
  createQuestion: async (
    playId: number,
    payload: CreateQuestionPayload,
  ): Promise<CreateQuestionResponse> => {
    const response = await api.post(`/plays/${playId}/questions`, payload);
    return response.data;
  },
  getQuestion: async (questionId: number): Promise<ShowQuestionResponse> => {
    const response = await api.get(`/questions/${questionId}`);
    return response.data;
  },
  updateQuestion: async (
    questionId: number,
    payload: UpdateQuestionPayload,
  ): Promise<UpdateQuestionResponse> => {
    const response = await api.put(`/questions/${questionId}`, payload);
    return response.data;
  },
  deleteQuestion: async (
    questionId: number,
  ): Promise<DeleteQuestionResponse> => {
    const response = await api.delete(`/questions/${questionId}`);
    return response.data;
  },

  // Live Questions
  sendLiveQuestion: async (
    questionId: number,
    performanceId: number,
  ): Promise<LiveSendCloseResponse> => {
    const response = await api.post(`/questions/${questionId}/send`, {
      performance_id: performanceId,
    });
    return response.data;
  },
  closeLiveQuestion: async (
    questionId: number,
    performanceId: number,
  ): Promise<LiveSendCloseResponse> => {
    const response = await api.post(`/questions/${questionId}/close`, {
      performance_id: performanceId,
    });
    return response.data;
  },
  getLiveQuestionResults: async (
    questionId: number,
    performanceId: number,
  ): Promise<LiveResultsResponse> => {
    const response = await api.get(
      `/questions/${questionId}/results?performance_id=${performanceId}`,
    );
    return response.data;
  },

  // Password reset
  forgotPassword: async (email: string) => {
    const response = await api.post('/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (
    token: string,
    email: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<ResetPasswordResponse> => {
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
