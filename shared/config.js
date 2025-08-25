// shared/config.js

// Базовые настройки
const config = {
  // Frontend
  frontend: {
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
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

  // Backend
  backend: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/equestrian_crm',
    jwtSecret: process.env.JWT_SECRET || 'surikat',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  // API
  api: {
    baseUrl: process.env.VITE_API_URL || 'http://localhost:5000/api',
    paths: {
      base: '/api',
      health: '/health',
      users: '/users',
      login: '/login',
      register: '/register',
      logout: '/logout',
      dashboard: '/stats'
    }
  }
};

// Генерация полных URL
// фронтенд
config.frontend.fullUrls = Object.fromEntries(
  Object.entries(config.frontend.paths).map(([key, path]) =>
    [key, `${config.frontend.baseUrl}${path}`]
  )
);

// бэкенд
config.api.fullUrls = Object.fromEntries(
  Object.entries(config.api.paths).map(([key, path]) =>
    [key, `${config.api.baseUrl.replace('/api', '')}${config.api.paths.base}${path}`]
  )
);

module.exports = config;