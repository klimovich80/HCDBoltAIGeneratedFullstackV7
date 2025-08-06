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
    console.log('geting   All', resource);
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<T>(`/${resource}${queryString}`);
  }

  getById<T>(resource: string, id: string): Promise<T> {
    return this.request<T>(`/${resource}/${id}`);
  }

  create<T>(resource: string, data: any): Promise<T> {
    return this.request<T>(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  update<T>(resource: string, id: string, data: any): Promise<T> {
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