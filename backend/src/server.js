const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/database.js');
const logger = require('./config/logger');
const { errorHandler } = require('./middleware/errorHandler');

// Подключение к базе данных
connectDB();

const app = express();

// Trust proxy для правильной работы за reverse proxy (nginx, etc)
app.set('trust proxy', 1);

// Middleware безопасности
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Ограничение скорости запросов - разные лимиты для разных endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: {
    error: 'Слишком много запросов с этого IP, попробуйте позже'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 5, // максимум 5 попыток входа
  message: {
    error: 'Слишком много попыток входа, попробуйте позже'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting
app.use('/api/', generalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Middleware
app.use(compression());
app.use(morgan('combined', {
  stream: { write: message => logger.info(message.trim()) },
  skip: (req, res) => process.env.NODE_ENV === 'test' // Пропускаем логирование при тестировании
}));
app.use(express.json({
  limit: '10mb'
}));
app.use(express.urlencoded({
  extended: true,
  limit: '10mb'
}));

// Basic NoSQL injection protection
app.use((req, res, next) => {
  // Простая защита от NoSQL-инъекций
  const keys = ['$where', 'mapReduce', '$accumulator', '$function'];
  const hasMaliciousKeys = (obj) => {
    for (let key in obj) {
      if (keys.includes(key)) return true;
      if (typeof obj[key] === 'object' && hasMaliciousKeys(obj[key])) return true;
    }
    return false;
  };

  if (hasMaliciousKeys(req.body) || hasMaliciousKeys(req.query)) {
    return res.status(400).json({ error: 'Недопустимый запрос' });
  }

  next();
});

// Serve static files
app.use('/uploads', express.static('uploads'));

// Проверка состояния
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API маршруты
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/horses', require('./routes/horses'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/events', require('./routes/events'));
app.use('/api/equipment', require('./routes/equipment'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/stats', require('./routes/stats'));

// Обработка ошибок 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не найден'
  });
});

// Глобальный обработчик ошибок
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Сервер запущен на порту ${PORT} в режиме ${process.env.NODE_ENV || 'development'}`);
});

// Обработка непредвиденных ошибок
process.on('unhandledRejection', (err) => {
  logger.error('Непредвиденная ошибка:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error('Непойманное исключение:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Корректное завершение работы
process.on('SIGTERM', () => {
  logger.info('SIGTERM получен, закрытие HTTP сервера');
  server.close(() => {
    logger.info('HTTP сервер закрыт');
    process.exit(0);
  });
});

module.exports = app;