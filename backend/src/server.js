const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = require('./config/database.js');
const logger = require('./config/logger');
const config = require('../../shared/config');

// Подключение к базе данных
connectDB();

const app = express();

// Middleware безопасности
app.use(helmet());
app.use(cors({
  origin: config.frontend.baseUrl,
  credentials: true
}));

// Ограничение скорости запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP
  message: 'Слишком много запросов с этого IP, попробуйте позже'
});
app.use(config.api.paths.base + '/', limiter);

// Middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Проверка состояния
app.get(config.api.paths.health, (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API маршруты
app.use(config.api.paths.base + '/auth', require('./routes/auth'));
app.use(config.api.paths.base + '/users', require('./routes/users'));
app.use(config.api.paths.base + '/horses', require('./routes/horses'));
app.use(config.api.paths.base + '/lessons', require('./routes/lessons'));
app.use(config.api.paths.base + '/events', require('./routes/events'));
app.use(config.api.paths.base + '/equipment', require('./routes/equipment'));
app.use(config.api.paths.base + '/payments', require('./routes/payments'));
app.use(config.api.paths.base + '/stats', require('./routes/stats'));

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

const PORT = config.backend.port;

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