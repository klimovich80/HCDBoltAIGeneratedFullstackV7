// api.ts
import { config } from "../config";
import {
  Lesson,
  LessonFormData,
  User,
  AuthResponse,
  ServerResponse,
  LoginResponseData,
  DashboardStats
} from "../types/index";

// Деструктуризация конфигурации API для удобства использования
const {
  api: {
    baseUrl: apiBaseUrl,
    paths: {
      login: loginUrl,
      register: registerUrl,
      me: meUrl,
      lessons: lessonsUrl
    }
  }
} = config;

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // При инициализации проверяем наличие токена в localStorage
    this.token = localStorage.getItem('token');
  }

  // Установка/удаление токена аутентификации
  setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  // Базовый метод для выполнения HTTP-запросов
private async request<T>(
  endpoint: string,
  options: RequestInit = {},
  timeout = 8000
): Promise<ServerResponse<T>> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const url = `${this.baseURL}${endpoint}`;

  // Создаем объект заголовков
  const headers: HeadersInit = {
    // Добавляем Authorization заголовок если есть токен
    ...(this.token && { Authorization: `Bearer ${this.token}` }),
    // Добавляем Content-Type только если тело не FormData
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    // Добавляем пользовательские заголовки
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers, // Используем созданные заголовки
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: data.success ?? true,
      data: data.data ?? data,
      message: data.message,
      pagination: data.pagination,
      token: data.token,
      user: data.user
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

  // Обработка ответов аутентификации (логин/регистрация)
  private handleAuthResponse(response: ServerResponse<AuthResponse>): AuthResponse {
    if (response.success) {
      const responseData = response.data as LoginResponseData;
      const token = response.token || responseData?.token;
      const user = response.user || responseData?.user;

      if (token) {
        this.setToken(token);
        return { success: true, token, user, message: response.message };
      }
    }

    return {
      success: false,
      message: response.message || 'Ошибка аутентификации'
    };
  }

 async getDashboardStats(): Promise<ServerResponse<DashboardStats>> {
  return this.request<DashboardStats>('/stats/dashboard');
}

  // Методы аутентификации
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>(loginUrl, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return this.handleAuthResponse(response);
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Ошибка входа'
      };
    }
  }

  async register(userData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>(registerUrl, {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return this.handleAuthResponse(response);
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Ошибка регистрации'
      };
    }
  }

  // Получение информации о текущем пользователе
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.request<User>(meUrl);
      return response.data || response.user || null;
    } catch (error) {
      console.error('Ошибка получения текущего пользователя:', error);
      return null;
    }
  }

  // Выход из системы
  logout(): void {
    this.setToken(null);
  }

  // Универсальные CRUD-методы
  getAll<T>(resource: string, params?: Record<string, unknown>): Promise<ServerResponse<T[]>> {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return this.request<T[]>(`/${resource}${queryString}`);
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

  // Специализированные методы для работы с уроками
  
  // Форматирование даты для API
  private formatDateForAPI(dateString: string): string {
    if (dateString.length === 10) dateString += 'T00:00:00';
    else if (dateString.length === 16) dateString += ':00';
    
    const dateObj = new Date(dateString);
    return isNaN(dateObj.getTime()) ? dateString : dateObj.toISOString();
  }

  // Создание урока
  async createLesson(lessonData: LessonFormData): Promise<ServerResponse<Lesson>> {
    const transformedData = {
      title: lessonData.title,
      description: lessonData.description,
      instructor: lessonData.instructor_id,
      member: lessonData.member_id,
      scheduled_date: lessonData.scheduled_date ? this.formatDateForAPI(lessonData.scheduled_date) : undefined,
      duration_minutes: lessonData.duration_minutes,
      lesson_type: lessonData.lesson_type,
      cost: lessonData.cost,
      status: lessonData.status,
      payment_status: lessonData.payment_status,
      notes: lessonData.notes,
      ...(lessonData.horse_id && { horse: lessonData.horse_id })
    };

    return this.request<Lesson>(lessonsUrl, {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });
  }

  // Обновление урока
  async updateLesson(id: string, lessonData: Partial<LessonFormData>): Promise<ServerResponse<Lesson>> {
    const transformedData: Record<string, unknown> = {};

    Object.entries(lessonData).forEach(([key, value]) => {
      if (value !== undefined) {
        transformedData[key] = key === 'scheduled_date' && value 
          ? this.formatDateForAPI(value) 
          : value;
      }
    });

    return this.request<Lesson>(`${lessonsUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transformedData),
    });
  }
}

// Экспорт экземпляра API-клиента
export const apiClient = new ApiClient(apiBaseUrl);