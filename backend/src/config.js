// backend/src/config.js
const sharedConfig = require('../../../shared/config.js');

// Дополнительные бэкенд-специфичные настройки
const backendConfig = {
  ...sharedConfig,
  // Можно добавить бэкенд-специфичные настройки
};

// Пример использования в Express.js
const express = require('express');
const cors = require('cors');

const app = express();

// CORS настройки
app.use(cors({
  origin: backendConfig.frontend.baseUrl,
  credentials: true
}));

// Пример роута
app.get(backendConfig.api.paths.health, (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Пример middleware для проверки JWT
const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, backendConfig.backend.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = {
  config: backendConfig,
  authMiddleware
};