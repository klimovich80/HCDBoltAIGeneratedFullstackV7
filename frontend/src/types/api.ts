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

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}
export interface LoginResponseData {
        token?: string;
        user?: User;
}
      
export interface RegisterResponseData {
        token?: string;
        user?: User;
      }