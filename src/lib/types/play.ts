export interface Play {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface PlaysResponse {
  data: Play[];
}

export interface PlayResponse {
  data: Play;
}
