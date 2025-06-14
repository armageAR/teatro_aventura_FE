export interface Performance {
  id: number;
  play_id: number;
  date: string;
  time: string;
  qr_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  play?: {
    id: number;
    titulo: string;
    descripcion: string;
  };
}

export interface PerformancesResponse {
  data: Performance[];
  performances?: Performance[];
}

export interface PerformanceResponse {
  data: Performance;
  performance?: Performance;
}

export interface CreatePerformanceData {
  play_id: number;
  date: string;
  time: string;
  [key: string]: string | number | boolean | undefined;
}

export interface UpdatePerformanceData {
  play_id?: number;
  date?: string;
  time?: string;
  is_active?: boolean;
}

export interface CreatePerformanceResponse {
  message: string;
  performance: Performance;
}

export interface UpdatePerformanceResponse {
  message: string;
  performance: Performance;
}

export interface DeletePerformanceResponse {
  message: string;
}

export interface PerformanceResults {
  performance: Performance;
  total_participants: number;
  questions: Array<{
    id: number;
    question: string;
    answers: Array<{
      id: number;
      answer: string;
      count: number;
      percentage: number;
    }>;
  }>;
}

export interface PerformanceResultsResponse {
  data: PerformanceResults;
}

export interface SpectatorAnswer {
  question_id: number;
  answer_id: number;
  performance_id: number;
}

export interface SpectatorAnswerResponse {
  message: string;
  success: boolean;
}

export interface JoinPerformanceResponse {
  message: string;
  performance: Performance;
  spectator_id?: number;
  questions?: Array<{
    id: number;
    question: string;
    answers: Array<{
      id: number;
      answer: string;
    }>;
  }>;
}
