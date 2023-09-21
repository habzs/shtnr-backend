export interface FullLinkResponse {
  url: string;
}

export interface ShtndLinkResponse {
  shtnd_url?: string;
  error?: string;
  err_code?: string;
}

export interface CustomLinkResponse {
  url: string;
  shtnd_url: string;
  times_visited: number;
  created_at: Date;
  user_id: string;
}
