export interface Play {
  id: number;
  title: string;
  description: string;
  release_date: string;
  company_id?: number;
  producer_id?: number;
  created_at: string;
  updated_at: string;
}

export interface PlaysResponse {
  plays: Play[];
}

export interface PlayResponse {
  data: Play;
  obra?: Play;
}

export interface CreatePlayData {
  title: string;
  description: string;
  release_date: string;
  [key: string]: string | number | boolean | undefined;
}

export interface UpdatePlayData {
  title?: string;
  description?: string;
  release_date?: string;
}

export interface CreatePlayResponse {
  message: string;
  play: Play;
}

export interface UpdatePlayResponse {
  message: string;
  play: Play;
}

export interface DeletePlayResponse {
  message: string;
}
