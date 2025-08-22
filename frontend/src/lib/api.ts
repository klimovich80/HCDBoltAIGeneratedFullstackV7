// api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { Horse } from "../types/horse";

// Интерфейсы для типов данных
interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'trainer' | 'member' | 'guest';
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}
interface Lesson {
  _id: string;
  title: string;
  description?: string;
  instructor: User;
  horse?: Horse;
  member: User;
  scheduled_date: string;
  duration_minutes: number;
  lesson_type: 'private' | 'group' | 'training';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  cost: number;
  payment_status: 'pending' | 'paid' | 'overdue';
  notes?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Интерфейсы для ответов API
interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface ServerResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: Pagination;
  token?: string;
  user?: User;
}

interface LessonFormData {
  title: string;
  description?: string;
  instructor_id: string;
  horse_id?: string;
  member_id: string;
  scheduled_date: string;
  duration_minutes: number;
  lesson_type: 'private' | 'group' | 'training';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  cost: number;
  payment_status: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout = 8000
  ): Promise<ServerResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(id);
      
      if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
          errorData = await response.json();
        } catch (e) {
          console.warn('Ошибка парсинга JSON:', e);
          throw new Error(`HTTP ошибка! статус: ${response.status} - ${response.statusText}`);
        }
        throw new Error(errorData.message || `HTTP ошибка! статус: ${response.status}`);
      }
      
      const text = await response.text();
      const data = text ? JSON.parse(text) : {};
      
      return {
        success: data.success !== undefined ? data.success : true,
        data: data.data !== undefined ? data.data : data,
        message: data.message,
        pagination: data.pagination,
        token: data.token,
        user: data.user
      };
    } catch (error) {
      clearTimeout(id);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Превышено время ожидания запроса');
      }
      console.error('Ошибка API запроса:', error);
      throw error;
    }
  }

  // Методы аутентификации
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      // Создаем интерфейс для данных ответа
      interface LoginResponseData {
        token?: string;
        user?: User;
      }
      
      if (response.success) {
        const responseData = response.data as LoginResponseData;
        const token = response.token || responseData?.token;
        const user = response.user || responseData?.user;
        
        if (token) {
          this.setToken(token);
          return {
            success: true,
            token,
            user,
            message: response.message
          };
        }
      }
      
      return {
        success: false,
        message: response.message || 'Ошибка входа'
      };
    } catch (error) {
      console.error('Ошибка входа:', error);
      return {
        success: false,
        message: (error as Error).message || 'Ошибка входа'
      };
    }
  }
    
  async register(userData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      
      // Создаем интерфейс для данных ответа
      interface RegisterResponseData {
        token?: string;
        user?: User;
      }
      
      if (response.success) {
        const responseData = response.data as RegisterResponseData;
        const token = response.token || responseData?.token;
        const user = response.user || responseData?.user;
        
        if (token) {
          this.setToken(token);
          return {
            success: true,
            token,
            user,
            message: response.message
          };
        }
      }
      
      return {
        success: false,
        message: response.message || 'Ошибка регистрации'
      };
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      return {
        success: false,
        message: (error as Error).message || 'Ошибка регистрации'
      };
    }
  }
    
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.request<User>('/auth/me');
      
      if (response.success) {
        // Возвращаем непосредственно пользователя, а не весь response
        return response.data || response.user || null;
      }
      return null;
    } catch (error) {
      console.error('Ошибка получения текущего пользователя:', error);
      return null;
    }
  }

  logout(): void {
    this.setToken(null);
  }

  // Универсальные CRUD методы
  getAll<T>(resource: string, params?: Record<string, unknown>): Promise<ServerResponse<T[]>> {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<T[]>(`/${resource}${queryString}`);
  }

  async get<T>(endpoint: string): Promise<ServerResponse<T>> {
    try {
      const response = await this.request<T>(endpoint, {
        method: 'GET',
      });
      
      return response;
    } catch (error) {
      console.error('GET request failed:', error);
      return {
        success: false,
        message: (error as Error).message
      };
    }
  }

  getById<T>(resource: string, id: string): Promise<ServerResponse<T>> {
    return this.request<T>(`/${resource}/${id}`);
  }

  create<T>(resource: string, data: unknown): Promise<ServerResponse<T>> {
    return this.request<T>(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  update<T>(resource: string, id: string, data: unknown): Promise<ServerResponse<T>> {
    return this.request<T>(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(resource: string, id: string): Promise<ServerResponse<T>> {
    return this.request<T>(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }

  // Специализированный метод для создания уроков
  async createLesson(lessonData: LessonFormData): Promise<ServerResponse<Lesson>> {
    let scheduledDate = lessonData.scheduled_date;
    
    if (scheduledDate) {
      try {
        if (scheduledDate.length === 10) {
          scheduledDate += 'T00:00:00';
        }
        else if (scheduledDate.length === 16) {
          scheduledDate += ':00';
        }
        
        const dateObj = new Date(scheduledDate);
        if (!isNaN(dateObj.getTime())) {
          scheduledDate = dateObj.toISOString();
        }
      } catch (error) {
        console.warn('Ошибка преобразования даты:', error);
      }
    }

    const transformedData = {
      title: lessonData.title,
      description: lessonData.description,
      instructor: lessonData.instructor_id,
      member: lessonData.member_id,
      scheduled_date: scheduledDate,
      duration_minutes: lessonData.duration_minutes,
      lesson_type: lessonData.lesson_type,
      cost: lessonData.cost,
      status: lessonData.status,
      payment_status: lessonData.payment_status,
      notes: lessonData.notes,
      ...(lessonData.horse_id && { horse: lessonData.horse_id })
    };
    
    return this.request<Lesson>('/lessons', {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });
  }

  // Специализированный метод для обновления уроков
  async updateLesson(id: string, lessonData: Partial<LessonFormData>): Promise<ServerResponse<Lesson>> {
    let scheduledDate = lessonData.scheduled_date;
    
    if (scheduledDate) {
      try {
        if (scheduledDate.length === 10) {
          scheduledDate += 'T00:00:00';
        }
        else if (scheduledDate.length === 16) {
          scheduledDate += ':00';
        }
        
        const dateObj = new Date(scheduledDate);
        if (!isNaN(dateObj.getTime())) {
          scheduledDate = dateObj.toISOString();
        }
      } catch (error) {
        console.warn('Ошибка преобразования даты:', error);
      }
    }
    
    const transformedData: Record<string, unknown> = {};
    
    if (lessonData.title !== undefined) transformedData.title = lessonData.title;
    if (lessonData.description !== undefined) transformedData.description = lessonData.description;
    if (lessonData.instructor_id !== undefined) transformedData.instructor = lessonData.instructor_id;
    if (lessonData.member_id !== undefined) transformedData.member = lessonData.member_id;
    if (scheduledDate !== undefined) transformedData.scheduled_date = scheduledDate;
    if (lessonData.duration_minutes !== undefined) transformedData.duration_minutes = lessonData.duration_minutes;
    if (lessonData.lesson_type !== undefined) transformedData.lesson_type = lessonData.lesson_type;
    if (lessonData.cost !== undefined) transformedData.cost = lessonData.cost;
    if (lessonData.status !== undefined) transformedData.status = lessonData.status;
    if (lessonData.payment_status !== undefined) transformedData.payment_status = lessonData.payment_status;
    if (lessonData.notes !== undefined) transformedData.notes = lessonData.notes;
    if (lessonData.horse_id !== undefined) transformedData.horse = lessonData.horse_id;
    
    return this.request<Lesson>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transformedData),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Помощники аутентификации
export const signIn = (email: string, password: string): Promise<AuthResponse> => {
  return apiClient.login(email, password);
};

export const signUp = (userData: Partial<User>): Promise<AuthResponse> => {
  return apiClient.register(userData);
};

export const signOut = (): void => {
  apiClient.logout();
  window.location.reload();
};

export const getCurrentUser = (): Promise<User | null> => {
  return apiClient.getCurrentUser();
};