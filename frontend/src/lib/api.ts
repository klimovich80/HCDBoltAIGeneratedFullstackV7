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
import { sanitizeEmail, sanitizePhone } from "../utils/security";

// Деструктуризация конфигурации API
const {
  api: {
    baseUrl: apiBaseUrl,
    paths: {
      login: loginUrl,
      register: registerUrl,
      me: meUrl,
      lessons: lessonsUrl,
      refresh: refreshUrl
    }
  }
} = config;

// Интерфейс для кэшированных данных
interface CachedData<T> {
  data: T;
  timestamp: number;
  expiresIn: number;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private pendingRequests: Map<string, Promise<any>> = new Map();
  private cache: Map<string, CachedData<any>> = new Map();
  private requestQueue: (() => Promise<any>)[] = [];
  private processingQueue = false;
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 100; // Минимальный интервал между запросами

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Загрузка токенов из localStorage при инициализации
    this.token = localStorage.getItem('authToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  /**
   * Устанавливает или удаляет токены аутентификации
   * @param token Токен доступа
   * @param refreshToken Токен обновления
   */
  public setTokens(token: string | null, refreshToken?: string | null): void {
  this.token = token;
  
  if (refreshToken !== undefined) {
    this.refreshToken = refreshToken;
  }
  
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
  
  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  } else if (refreshToken === null) {
    localStorage.removeItem('refreshToken');
  }
}

  /**
   * Декодирует JWT токен для извлечения информации
   * @param token JWT токен
   * @returns Декодированные данные токена или null
   */
  private decodeJWT(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      console.error('Ошибка декодирования JWT:', error);
      return null;
    }
  }

  /**
   * Проверяет, истек ли срок действия токена
   * @param token JWT токен
   * @returns true если токен истек
   */
  private isTokenExpired(token: string): boolean {
    const decoded = this.decodeJWT(token);
    if (!decoded || !decoded.exp) return true;
    return Date.now() >= decoded.exp * 1000;
  }

  /**
   * Обновляет токен доступа с помощью токена обновления
   * @returns true если токен успешно обновлен
   */
  private async refreshAuthToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
    
    try {
      const response = await fetch(`${this.baseURL}${refreshUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });
      
      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.token, data.refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
    }
    
    // Если обновление не удалось, выполняем выход
    this.logout();
    return false;
  }

  /**
   * Обрабатывает очередь запросов для соблюдения лимитов
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.requestQueue.length === 0) return;
    
    this.processingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      
      // Соблюдаем минимальный интервал между запросами
      if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
        await new Promise(resolve => 
          setTimeout(resolve, this.MIN_REQUEST_INTERVAL - timeSinceLastRequest)
        );
      }
      
      const request = this.requestQueue.shift();
      if (request) {
        this.lastRequestTime = Date.now();
        try {
          await request();
        } catch (error) {
          console.error('Ошибка выполнения запроса из очереди:', error);
        }
      }
    }
    
    this.processingQueue = false;
  }

  /**
   * Добавляет запрос в очередь на выполнение
   * @param request Функция запроса
   * @returns Промис с результатом запроса
   */
  private enqueueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  /**
   * Базовый метод для выполнения HTTP-запросов
   * @param endpoint Конечная точка API
   * @param options Опции запроса
   * @param retries Количество повторных попыток
   * @param timeout Таймаут запроса
   * @returns Ответ сервера
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retries = 2,
    timeout = 10000
  ): Promise<ServerResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const url = `${this.baseURL}${endpoint}`;
    const requestKey = `${options.method || 'GET'}:${url}`;

    // Проверяем, есть ли уже выполняющийся аналогичный запрос
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    // Проверяем кэш для GET запросов
    if (options.method === 'GET' || !options.method) {
      const cached = this.cache.get(requestKey);
      if (cached && cached.timestamp + cached.expiresIn > Date.now()) {
        return {
          success: true,
          data: cached.data
        };
      }
    }

    // Проверяем срок действия токена и обновляем при необходимости
    if (this.token && this.isTokenExpired(this.token)) {
      const refreshed = await this.refreshAuthToken();
      if (!refreshed) {
        throw new Error('Токен доступа истек и не может быть обновлен');
      }
    }

    // Создаем объект заголовков
    const headers: HeadersInit = {
      // Добавляем Authorization заголовок если есть токен
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      // Добавляем Content-Type только если тело не FormData
      ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
      // Добавляем защиту от CSRF
      ...{ 'X-Requested-With': 'XMLHttpRequest' },
      // Добавляем пользовательские заголовки
      ...options.headers,
    };

    const requestPromise = this.enqueueRequest(async () => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const response = await fetch(url, {
            ...options,
            headers,
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // Обработка ошибки аутентификации
          if (response.status === 401 && attempt < retries) {
            const refreshed = await this.refreshAuthToken();
            if (refreshed) continue;
          }

          // Обработка ограничения запросов
          if (response.status === 429 && attempt < retries) {
            const delay = Math.pow(2, attempt) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }

          if (!response.ok) {
            let errorMessage = `HTTP ошибка! статус: ${response.status}`;
            try {
              const errorData = await response.json();
              errorMessage = errorData.message || errorData.error || errorMessage;
            } catch (e) {
              // Если ответ не JSON, используем текст ошибки
              const errorText = await response.text();
              if (errorText) errorMessage = errorText;
            }
            throw new Error(errorMessage);
          }

          const data = await response.json();
          const result = {
            success: data.success ?? true,
            data: data.data ?? data,
            message: data.message,
            pagination: data.pagination,
            token: data.token,
            user: data.user
          };

          // Кэшируем GET запросы
          if (options.method === 'GET' || !options.method) {
            this.cache.set(requestKey, {
              data: result.data,
              timestamp: Date.now(),
              expiresIn: 5 * 60 * 1000 // 5 минут
            });
          }

          return result;
        } catch (error) {
          clearTimeout(timeoutId);
          
          if (attempt === retries) {
            if (error instanceof Error) {
              if (error.name === 'AbortError') {
                throw new Error('Таймаут запроса');
              }
              throw error;
            }
            throw new Error('Произошла неизвестная ошибка');
          }
          
          // Задержка перед повторной попыткой
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      
      throw new Error('Превышено максимальное количество попыток');
    });

    this.pendingRequests.set(requestKey, requestPromise);
    
    try {
      return await requestPromise;
    } finally {
      this.pendingRequests.delete(requestKey);
    }
  }

  /**
   * Очищает весь кэш
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Очищает кэш для определенного endpoint
   * @param endpoint Конечная точка API
   * @param method HTTP метод
   */
  clearCacheForEndpoint(endpoint: string, method: string = 'GET'): void {
    const requestKey = `${method}:${this.baseURL}${endpoint}`;
    this.cache.delete(requestKey);
  }

  /**
   * Обрабатывает ответы аутентификации (логин/регистрация)
   * @param response Ответ сервера
   * @returns Результат аутентификации
   */
  private handleAuthResponse(response: ServerResponse<AuthResponse>): AuthResponse {
    if (response.success) {
      const responseData = response.data as LoginResponseData;
      const token = response.token || responseData?.token;
      const user = response.user || responseData?.user;
      const refreshToken = (responseData as any)?.refreshToken;

      if (token) {
        this.setTokens(token, refreshToken || this.refreshToken);
        return { 
          success: true, 
          token, 
          user, 
          refreshToken,
          message: response.message 
        };
      }
    }

    return {
      success: false,
      message: response.message || 'Ошибка аутентификации'
    };
  }

  /**
   * Получает статистику для dashboard
   * @returns Статистика dashboard
   */
  async getDashboardStats(): Promise<ServerResponse<DashboardStats>> {
    return this.request<DashboardStats>('/stats/dashboard');
  }

  /**
   * Выполняет вход пользователя
   * @param email Email пользователя
   * @param password Пароль пользователя
   * @returns Результат аутентификации
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Санитизация ввода
      const sanitizedEmail = sanitizeEmail(email);
      const sanitizedPassword = password.trim();
      
      const response = await this.request<AuthResponse>(loginUrl, {
        method: 'POST',
        body: JSON.stringify({ email: sanitizedEmail, password: sanitizedPassword }),
      });
      return this.handleAuthResponse(response);
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Ошибка входа'
      };
    }
  }

  /**
   * Регистрирует нового пользователя
   * @param userData Данные пользователя
   * @returns Результат регистрации
   */
  async register(userData: Partial<User>): Promise<AuthResponse> {
    try {
      // Санитизация данных пользователя
      const sanitizedData: Partial<User> = {
        ...userData,
        email: userData.email ? sanitizeEmail(userData.email) : undefined,
        first_name: userData.first_name?.trim(),
        last_name: userData.last_name?.trim(),
        phone: userData.phone ? sanitizePhone(userData.phone) : undefined
      };
      
      const response = await this.request<AuthResponse>(registerUrl, {
        method: 'POST',
        body: JSON.stringify(sanitizedData),
      });
      return this.handleAuthResponse(response);
    } catch (error) {
      return {
        success: false,
        message: (error as Error).message || 'Ошибка регистрации'
      };
    }
  }

  /**
   * Получает информацию о текущем пользователе
   * @returns Данные пользователя или null
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await this.request<User>(meUrl);
      return response.data || response.user || null;
    } catch (error) {
      console.error('Ошибка получения текущего пользователя:', error);
      return null;
    }
  }

  /**
   * Выполняет выход пользователя
   */
  logout(): void {
    this.setTokens(null, null);
    this.clearCache();
  }

  /**
   * Получает все записи ресурса
   * @param resource Название ресурса
   * @param params Параметры запроса
   * @returns Список записей
   */
  getAll<T>(resource: string, params?: Record<string, unknown>): Promise<ServerResponse<T[]>> {
    const queryString = params ? `?${new URLSearchParams(params as Record<string, string>)}` : '';
    return this.request<T[]>(`/${resource}${queryString}`);
  }

  /**
   * Получает запись по ID
   * @param resource Название ресурса
   * @param id ID записи
   * @returns Запись
   */
  getById<T>(resource: string, id: string): Promise<ServerResponse<T>> {
    return this.request<T>(`/${resource}/${id}`);
  }

  /**
   * Создает новую запись
   * @param resource Название ресурса
   * @param data Данные для создания
   * @returns Созданная запись
   */
  create<T>(resource: string, data: unknown): Promise<ServerResponse<T>> {
    return this.request<T>(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Обновляет запись
   * @param resource Название ресурса
   * @param id ID записи
   * @param data Данные для обновления
   * @returns Обновленная запись
   */
  update<T>(resource: string, id: string, data: unknown): Promise<ServerResponse<T>> {
    return this.request<T>(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Удаляет запись
   * @param resource Название ресурса
   * @param id ID записи
   * @returns Результат удаления
   */
  delete<T>(resource: string, id: string): Promise<ServerResponse<T>> {
    return this.request<T>(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Форматирует дату для API
   * @param dateString Строка с датой
   * @returns Дата в формате ISO
   */
  private formatDateForAPI(dateString: string): string {
    if (!dateString) return '';
    
    try {
      let dateObj: Date;
      
      if (dateString.includes('T')) {
        dateObj = new Date(dateString);
      } else {
        // Если время не указано, добавляем время по умолчанию (12:00:00)
        dateObj = new Date(`${dateString}T12:00:00`);
      }
      
      if (isNaN(dateObj.getTime())) {
        throw new Error('Неверный формат даты');
      }
      
      return dateObj.toISOString();
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return dateString;
    }
  }

  /**
   * Создает новый урок
   * @param lessonData Данные урока
   * @returns Созданный урок
   */
  async createLesson(lessonData: LessonFormData): Promise<ServerResponse<Lesson>> {
    const transformedData = {
      title: lessonData.title,
      description: lessonData.description,
      instructor: lessonData.instructor_id,
      member: lessonData.member_id,
      scheduled_date: this.formatDateForAPI(lessonData.scheduled_date),
      duration_minutes: lessonData.duration_minutes,
      lesson_type: lessonData.lesson_type,
      cost: lessonData.cost,
      status: lessonData.status,
      payment_status: lessonData.payment_status,
      notes: lessonData.notes,
      ...(lessonData.horse_id && { horse: lessonData.horse_id })
    };

    const response = await this.request<Lesson>(lessonsUrl, {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });
    
    // Очищаем кэш для уроков после создания нового
    this.clearCacheForEndpoint(lessonsUrl, 'GET');
    
    return response;
  }

  /**
   * Обновляет урок
   * @param id ID урока
   * @param lessonData Данные урока
   * @returns Обновленный урок
   */
  async updateLesson(id: string, lessonData: Partial<LessonFormData>): Promise<ServerResponse<Lesson>> {
    const transformedData: Record<string, unknown> = {};

    Object.entries(lessonData).forEach(([key, value]) => {
      if (value !== undefined) {
        transformedData[key] = key === 'scheduled_date' && value 
          ? this.formatDateForAPI(value) 
          : value;
      }
    });

    const response = await this.request<Lesson>(`${lessonsUrl}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transformedData),
    });
    
    // Очищаем кэш для этого урока и списка уроков
    this.clearCacheForEndpoint(lessonsUrl, 'GET');
    this.clearCacheForEndpoint(`${lessonsUrl}/${id}`, 'GET');
    
    return response;
  }
}

// Экспорт экземпляра API-клиента
export const apiClient = new ApiClient(apiBaseUrl);