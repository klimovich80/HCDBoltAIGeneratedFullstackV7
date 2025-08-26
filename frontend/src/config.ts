
// frontend/src/config.js
export const config= {
  frontend: {
    baseUrl: window.location.origin,
    paths: {
      dashboard: '/dashboard',
      login: '/login',
      register: '/register',
      logout: '/logout',
      home: '/',
      user: '/user',
      users: '/users',
      horses: '/horses',
      lessons: '/lessons',
      events: '/events',
      equipment: '/equipment',
      payments: '/payments'
    }
  },

  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    paths: {
      base: '/api',
      health: '/health',
      users: '/users',
      login: '/auth/login',
      register: '/auth/register',
      me: '/auth/me',
      logout: '/logout',
      dashboard: '/stats',
      horses: '/horses',
      lessons: '/lessons',
      events: '/events',
      equipment: '/equipment',
      payments: '/payments'
    }
  }
};

export default config;