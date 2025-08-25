// shared/config.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const config = {
  frontend: {
    baseUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
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

  backend: {
    port: process.env.PORT || 5000,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/equestrian_crm',
    jwtSecret: process.env.JWT_SECRET || 'surikat',
    jwtExpire: process.env.JWT_EXPIRE || '7d',
    logLevel: process.env.LOG_LEVEL || 'info'
  },

  api: {
    baseUrl: process.env.VITE_API_URL || 'http://localhost:5000/api',
    paths: {
      base: '/api',
      auth: '/auth',
      health: '/health',
      users: '/users',
      login: '/login',
      register: '/register',
      logout: '/logout',
      dashboard: '/stats',
      horses: '/horses',
      lessons: '/lessons',
      events: '/events',
      equipment: '/equipment',
      payments: '/payments',
      stats: '/stats'
    }
  }
};

// Генерация полных URL для API
config.api.fullUrls = {};
for (const [key, path] of Object.entries(config.api.paths)) {
  if (key !== 'base') {
    config.api.fullUrls[key] = `${config.api.baseUrl.replace('/api', '')}${config.api.paths.base}${path}`;
  }
}

module.exports = config;