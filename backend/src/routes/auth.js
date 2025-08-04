const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Регистрация нового пользователя
router.post('/register', (req, res) => {
  const handleRegister = () => {
    const { firstName, lastName, email, password, role = 'member' } = req.body;

    // Проверяем, существует ли пользователь
    User.findOne({ email })
      .then(existingUser => {
        if (existingUser) {
          res.status(400).json({ message: 'Пользователь с таким email уже существует' });
          return;
        }

        // Создаем пользователя
        const userData = {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          role
        };
        
        return User.create(userData);
      })
      .then(user => {
        if (!user) return;
        
        // Генерируем JWT токен
        const token = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        logger.info(`Новый пользователь зарегистрирован: ${email}`);

        res.status(201).json({
          success: true,
          token,
          user: {
            id: user._id,
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role
          }
        });
      })
      .catch(error => {
        logger.error('Ошибка регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleRegister();
});

// Вход пользователя
router.post('/login', (req, res) => {
  const handleLogin = () => {
    const { email, password } = req.body;

    // Находим пользователя
    User.findOne({ email })
      .then(user => {
        if (!user) {
          res.status(400).json({ message: 'Неверные учетные данные' });
          return;
        }

        // Проверяем пароль
        return user.comparePassword(password)
          .then(isMatch => {
            if (!isMatch) {
              res.status(400).json({ message: 'Неверные учетные данные' });
              return;
            }

            // Генерируем JWT токен
            const token = jwt.sign(
              { userId: user._id, role: user.role },
              process.env.JWT_SECRET || 'fallback_secret',
              { expiresIn: process.env.JWT_EXPIRE || '7d' }
            );

            logger.info(`Пользователь вошел в систему: ${email}`);

            res.json({
              success: true,
              token,
              user: {
                id: user._id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role
              }
            });
          });
      })
      .catch(error => {
        logger.error('Ошибка входа:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleLogin();
});

// Получить текущего пользователя
router.get('/me', auth, (req, res) => {
  const handleGetMe = () => {
    User.findById(req.user.userId)
      .then(user => {
        res.json({
          success: true,
          user
        });
      })
      .catch(error => {
        logger.error('Ошибка получения пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleGetMe();
});

module.exports = router;