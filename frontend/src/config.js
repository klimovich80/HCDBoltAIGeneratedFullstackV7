// // frontend/src/config.js
// import sharedConfig from '../../../shared/config.js';

// // Для Vite используем импорт мета переменных
// const frontendConfig = {
//   ...sharedConfig,
//   api: {
//     ...sharedConfig.api,
//     baseUrl: import.meta.env.VITE_API_URL || sharedConfig.api.baseUrl
//   }
// };

// // Экспортируем константы для удобства использования
// export const {
//   frontend,
//   api
// } = frontendConfig;

// // Примеры использования в компонентах React:
// export const useApi = () => {
//   const login = async (credentials) => {
//     const response = await fetch(`${api.fullUrls.login}`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(credentials)
//     });
//     return response.json();
//   };

//   return { login };
// };

// // Пример использования в роутинге
// export const getFrontendPath = (pathName) => {
//   return frontend.paths[pathName] || '/';
// };

//-------------

// frontend/src/config.js
export const config = {
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
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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

// Генерация полных URL для API
config.api.fullUrls = {};
for (const [key, path] of Object.entries(config.api.paths)) {
  if (key !== 'base') {
    config.api.fullUrls[key] = `${config.api.baseUrl}${path}`;
  }
}

// Экспорт отдельных констант для удобства
export const API_BASE_URL = config.api.baseUrl;
export const FRONTEND_BASE_URL = config.frontend.baseUrl;
export const FRONTEND_DASHBOARD_URL = config.frontend.paths.dashboard;
export const FRONTEND_LOGIN_URL = config.frontend.paths.login;
export const FRONTEND_REGISTER_URL = config.frontend.paths.register;
export const FRONTEND_LOGOUT_URL = config.frontend.paths.logout;
export const FRONTEND_HOME_URL = config.frontend.paths.home;
export const FRONTEND_USER_URL = config.frontend.paths.user;
export const FRONTEND_USERS_URL = config.frontend.paths.users;
export const FRONTEND_HORSES_URL = config.frontend.paths.horses;
export const FRONTEND_LESSONS_URL = config.frontend.paths.lessons;
export const FRONTEND_EVENTS_URL = config.frontend.paths.events;
export const FRONTEND_EQUIPMENT_URL = config.frontend.paths.equipment;
export const FRONTEND_PAYMENTS_URL = config.frontend.paths.payments;

export const API_URL = config.api.fullUrls.base;
export const API_SERVER_HEALTH_CHECK_URL = config.api.fullUrls.health;
export const API_SERVER_USERS_URL = config.api.fullUrls.users;
export const API_SERVER_LOGIN_URL = config.api.fullUrls.login;
export const API_SERVER_REGISTER_URL = config.api.fullUrls.register;
export const API_SERVER_LOGOUT_URL = config.api.fullUrls.logout;
export const API_SERVER_DASHBOARD_URL = config.api.fullUrls.dashboard;

export default config;