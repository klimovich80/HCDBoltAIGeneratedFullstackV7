const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Интерфейсы для типов данных
interface User {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
<<<<<<< HEAD
  role: 'admin' | 'trainer' | 'member' | 'guest';
=======
  role: string;
>>>>>>> fa859d18cc2c9a6f99585199b9833dd2dac442d4
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface Horse {
  _id: string;
  name: string;
  breed: string;
  age?: number;
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

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
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

  private request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    return fetch(url, config)
      .then(response => {
        if (!response.ok) {
          return response.json()
            .catch(() => ({}))
            .then(errorData => {
              throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
            })
        }
        return response.json()
      })
      .catch(error => {
        console.error('API request failed:', error)
        throw error
      })
  }

  // Методы аутентификации
  login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
<<<<<<< HEAD
      .then(response => {
      console.log('api.ts successfull login response: ', response);
=======
    .then(response => {
>>>>>>> fa859d18cc2c9a6f99585199b9833dd2dac442d4
      // Здесь response имеет тип ApiResponse<AuthResponse>
      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
      }
      // Возвращаем данные аутентификации, а не весь ApiResponse
      return {
        success: response.success,
<<<<<<< HEAD
        //TODO:нужно исправить ошибки типизации APIresponse (отсутсвуют поля токена и юзера)
        token: response.token,
        user: response.user,
        message: response.message,
        response: response
=======
        token: response.data?.token,
        user: response.data?.user,
        message: response.message
>>>>>>> fa859d18cc2c9a6f99585199b9833dd2dac442d4
      };
    });
  }
    
  register(userData: Partial<User>): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    .then(response => {
      // Здесь response имеет тип ApiResponse<AuthResponse>
      if (response.success && response.data?.token) {
        this.setToken(response.data.token);
      }
      // Возвращаем данные аутентификации, а не весь ApiResponse
      return {
        success: response.success,
        token: response.data?.token,
        user: response.data?.user,
        message: response.message
      };
    });
  }
    
  getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/me');
  }

  logout(): void {
    this.setToken(null);
  }

  // Универсальные CRUD методы
  getAll<T>(resource: string, params?: Record<string, unknown>): Promise<ApiResponse<T[]>> {
    const queryString = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : '';
    return this.request<T[]>(`/${resource}${queryString}`);
  }

  getById<T>(resource: string, id: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/${resource}/${id}`);
  }

  create<T>(resource: string, data: Partial<T>): Promise<ApiResponse<T>> {
    console.log('api.ts posting created: ', data ," to ", resource);
    return this.request<T>(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  update<T>(resource: string, id: string, data: Partial<T>): Promise<ApiResponse<T>> {
    console.log('api.ts posting updated: ', data ," to ", resource);
    return this.request<T>(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete<T>(resource: string, id: string): Promise<ApiResponse<T>> {
    return this.request<T>(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }

  // Специализированный метод для создания уроков
  createLesson(lessonData: LessonFormData): Promise<ApiResponse<Lesson>> {
    console.log('api.ts creating lesson with ', lessonData);
    
    // Преобразование и коррекция даты
    let scheduledDate = lessonData.scheduled_date;
    
    // Если дата в формате datetime-local (YYYY-MM-DDTHH:mm), конвертируем в правильный ISO
    if (scheduledDate && scheduledDate.length === 16) {
      // Добавляем секунды
      scheduledDate += ':00';
      // Конвертируем в объект Date и затем в ISO строку
      const dateObj = new Date(scheduledDate);
      scheduledDate = dateObj.toISOString();
    } else if (scheduledDate && !scheduledDate.includes('T')) {
      // Если дата в другом формате, пытаемся сконвертировать
      const dateObj = new Date(scheduledDate);
      if (!isNaN(dateObj.getTime())) {
        scheduledDate = dateObj.toISOString();
      }
    }

    // Преобразование данных для соответствия серверной схеме
    const transformedData: Record<string, unknown> = {
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
      notes: lessonData.notes
    };

    // Добавляем horse только если он указан
    if (lessonData.horse_id) {
      transformedData.horse = lessonData.horse_id;
    }

    console.log('Transformed lesson ', transformedData);
    
    return this.request<Lesson>('/lessons', {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });
  }

  // Специализированный метод для обновления уроков
  updateLesson(id: string, lessonData: Partial<LessonFormData>): Promise<ApiResponse<Lesson>> {
    console.log('api.ts updating lesson with ', lessonData);
    
    // Преобразование и коррекция даты
    let scheduledDate = lessonData.scheduled_date;
    
    // Если дата в формате datetime-local (YYYY-MM-DDTHH:mm), конвертируем в правильный ISO
    if (scheduledDate && scheduledDate && scheduledDate.length === 16) {
      // Добавляем секунды
      scheduledDate += ':00';
      // Конвертируем в объект Date и затем в ISO строку
      const dateObj = new Date(scheduledDate);
      scheduledDate = dateObj.toISOString();
    } else if (scheduledDate && !scheduledDate.includes('T')) {
      // Если дата в другом формате, пытаемся сконвертировать
      const dateObj = new Date(scheduledDate);
      if (!isNaN(dateObj.getTime())) {
        scheduledDate = dateObj.toISOString();
      }
    }
    
    // Преобразование данных для соответствия серверной схеме
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

    console.log('Transformed lesson update data:', transformedData);
    
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
  return apiClient.getCurrentUser()
    .then(response => response.data || null)
    .catch(error => {
      console.error('Failed to get current user:', error);
      return null;
    })
};