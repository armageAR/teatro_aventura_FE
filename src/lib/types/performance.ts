export interface Performance {
  id: number;
  play_id: number;
  date: string;
  time: string;
  qr_code_token: string;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  started_at?: string | null;
  ended_at?: string | null;
  deleted_at?: string | null;
  created_by?: number;
  play?: {
    id: number;
    title: string;
    description: string;
  };
  creator?: {
    id: number;
    name: string;
  };
}

export interface PerformancesResponse {
  performances: Performance[];
}

export interface PerformanceResponse {
  performance: Performance;
}

export interface FormPerformanceData {
  play_id?: number;
  date?: string;
  time?: string;
  location?: string;
  is_active?: boolean;
  [key: string]: string | number | boolean | undefined;
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
  spectator_session_uuid?: string;
}

export interface SpectatorAnswerResponse {
  message: string;
  success: boolean;
}

export interface JoinPerformanceResponse {
  message: string;
  performance: Performance;
  spectator_id?: number;
  spectator_session_uuid?: string;
  session_uuid?: string;
  questions?: Array<{
    id: number;
    question: string;
    answers: Array<{
      id: number;
      answer: string;
    }>;
  }>;
}
