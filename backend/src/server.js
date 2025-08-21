const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { connectDB } = require('./config/database.js');
const logger = require('./config/logger');

// Подключение к базе данных
connectDB();

const app = express();

// Middleware безопасности
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Ограничение скорости запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Слишком много запросов с этого IP, попробуйте позже'
});
app.use('/api/', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Проверка состояния
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
  res.status(404).json({ message: 'server.js Маршрут не найден' });
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  logger.error('Необработанная ошибка:', err);

  res.status(err.status || 500).json({
    message: err.message || 'Внутренняя ошибка сервера',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Сервер запущен на порту ${PORT}`);
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