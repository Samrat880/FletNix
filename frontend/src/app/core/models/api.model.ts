export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  age: number;
  role: string;
  isVerified: boolean;
  favoriteGenres?: string[];
  preferencesCompleted?: boolean;
}

export interface LoginData {
  user: User;
  accessToken: string;
}

export interface Show {
  _id: string;
  show_id: string;
  type: string;
  title: string;
  director: string | null;
  cast: string | null;
  country: string | null;
  date_added: string | null;
  release_year: number | null;
  rating: string | null;
  duration: string | null;
  listed_in: string | null;
  description: string | null;
}

export interface ShowsPage {
  shows: Show[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ShowFilterMeta {
  countries: string[];
  years: number[];
  ratings: string[];
  languages: string[];
  genres: string[];
}
