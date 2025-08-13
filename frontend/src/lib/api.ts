const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
  ): Promise<T> {
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
  login(email: string, password: string): Promise<any> {
    return this.request<any>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    .then(response => {
      if (response.success && response.token) {
        this.setToken(response.token);
      }
      return response;
    })
  }
    
  register(userData: any): Promise<any> {
    return this.request<any>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    .then(response => {
      if (response.success && response.token) {
        this.setToken(response.token);
      }
      return response;
    })
  }
    
  getCurrentUser(): Promise<any> {
    return this.request<any>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // Универсальные CRUD методы
  getAll<T>(resource: string, params?: Record<string, any>): Promise<T> {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`/${resource}${queryString}`);
  }

  getById<T>(resource: string, id: string): Promise<T> {
    return this.request<T>(`/${resource}/${id}`);
  }

  create<T>(resource: string, data: any): Promise<T> {
    console.log('api.ts posting created: ', data ," to ", resource);
    return this.request<T>(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  update<T>(resource: string, id: string,  any): Promise<T> {
    console.log('api.ts posting updated: ', data ," to ", resource);
    return this.request<T>(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  delete(resource: string, id: string): Promise<any> {
    return this.request(`/${resource}/${id}`, {
      method: 'DELETE',
    });
  }

  // Специализированный метод для создания уроков
  createLesson(lessonData: any): Promise<any> {
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
      notes: lessonData.notes
    };

    // Добавляем horse только если он указан
    if (lessonData.horse_id) {
      (transformedData as any).horse = lessonData.horse_id;
    }

    console.log('Transformed lesson data:', transformedData);
    
    return this.request<any>('/lessons', {
      method: 'POST',
      body: JSON.stringify(transformedData),
    });
  }

  // Специализированный метод для обновления уроков
  updateLesson(id: string, lessonData: any): Promise<any> {
    console.log('api.ts updating lesson with ', lessonData);
    
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
    const transformedData: any = {};
    
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
    
    return this.request<any>(`/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transformedData),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Помощники аутентификации
export const signIn = (email: string, password: string) => {
  return apiClient.login(email, password);
};

export const signUp = (userData: any) => {
  return apiClient.register(userData);
};

export const signOut = () => {
  apiClient.logout();
  window.location.reload();
};

export const getCurrentUser = () => {
  return apiClient.getCurrentUser()
    .then(response => response.user)
    .catch(error => {
      console.error('Failed to get current user:', error);
      return null;
    })
};