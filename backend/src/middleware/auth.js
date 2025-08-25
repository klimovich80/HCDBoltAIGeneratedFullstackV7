const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../config/logger');
const config = require('../../../shared/config');

// Middleware аутентификации
const auth = (req, res, next) => {
  console.log('\n auth middleware jwt from config:', config.backend.jwtSecret, '\n');
  const handleAuth = () => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ message: 'Нет токена, доступ запрещен' });
      return;
    }

    try {
      const decoded = jwt.verify(token, config.backend.jwtSecret);

      User.findById(decoded.userId).select('-password')
        .then(user => {
          if (!user) {
            res.status(401).json({ message: 'Токен недействителен' });
            return;
          }

          // Удаляем пароль из объекта пользователя
          if (user.password) {
            delete user.password;
          }

          req.user = { userId: user._id, role: user.role };
          next();
        })
        .catch(error => {
          logger.error('Ошибка аутентификации:', error);
          res.status(401).json({ message: 'Токен недействителен' });
        });
    } catch (error) {
      logger.error('Ошибка аутентификации:', error);
      res.status(401).json({ message: 'Токен недействителен' });
    }
  };

  handleAuth();
};

// Middleware авторизации
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Доступ запрещен' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Роль ${req.user.role} не имеет доступа к этому ресурсу`
      });
    }

    next();
  };
};

module.exports = { auth, authorize };