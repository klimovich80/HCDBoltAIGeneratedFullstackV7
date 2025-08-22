// api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
import { Lesson, LessonFormData } from "../types/lesson";
import { User } from "../types/user";
import { AuthResponse, ServerResponse} from "../types/api";

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
    
    // Prepare headers
    const headers: Record<string, string> = {};
    
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      headers: {
        ...headers,
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    try {
      const response = await fetch(url, config);
      clearTimeout(id);
      
      // Handle empty responses (like 204 No Content)
      if (response.status === 204) {
        return {
          success: true,
          data: undefined as unknown as T,
        };
      }
      
      if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
          const errorText = await response.text();
          errorData = errorText ? JSON.parse(errorText) : {};
        } catch (e) {
          console.warn('Ошибка парсинга JSON ошибки:', e);
        }
        throw new Error(
          errorData.message || 
          `HTTP ошибка! статус: ${response.status} - ${response.statusText}`
        );
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

  async upload<T>(endpoint: string, formData: FormData): Promise<ServerResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    }, 30000); // 30 секунд для загрузки файлов
  }

  // Методы аутентификации
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      if (response.success && response.token) {
        this.setToken(response.token);
        return {
          success: true,
          token: response.token,
          user: response.user,
          message: response.message
        };
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
      
      if (response.success && response.token) {
        this.setToken(response.token);
        return {
          success: true,
          token: response.token,
          user: response.user,
          message: response.message
        };
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
      return response.success ? response.data || response.user || null : null;
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

  get<T>(endpoint: string): Promise<ServerResponse<T>> {
    return this.request<T>(endpoint);
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

  update<T>(endpoint: string, data: unknown): Promise<ServerResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<ServerResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Специализированный метод для создания уроков
  async createLesson(lessonData: LessonFormData): Promise<ServerResponse<Lesson>> {
    const transformedData = this.transformLessonData(lessonData);
    return this.request<Lesson>('/lessons', {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });
  }

  // Специализированный метод для обновления уроков
  async updateLesson(id: string, lessonData: Partial<LessonFormData>): Promise<ServerResponse<Lesson>> {
    const transformedData = this.transformLessonData(lessonData);
    return this.request<Lesson>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transformedData),
    });
  }

  private transformLessonData(lessonData: Partial<LessonFormData>): Record<string, unknown> {
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
    
    return transformedData;
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