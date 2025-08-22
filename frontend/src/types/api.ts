import { User } from "./user";

export interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: string[];
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface ExtendedError extends Error {
  response?: Response & {
    data?: ApiErrorResponse;
  };
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ServerResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: Pagination;
  token?: string;
  user?: User;
}

export interface LoginResponseData {
        token?: string;
        user?: User;
}
      
export interface RegisterResponseData {
        token?: string;
        user?: User;
      }