const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const logger = require('../config/logger');
const config = require('../../../shared/config');

const router = express.Router();

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  const handleRegister = async () => {
    const {
      first_name,
      last_name,
      email,
      password,
      role = 'member',
      phone,
      membershipTier,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      notes
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      res.status(400).json({
        success: false,
        message: 'Имя, фамилия, email и пароль обязательны'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Неверный формат email'
      });
      return;
    }

    // Validate password length
    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Пароль должен содержать минимум 6 символов'
      });
      return;
    }

    // Validate role
    const allowedRoles = ['member', 'trainer', 'admin'];
    if (!allowedRoles.includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Недопустимая роль пользователя'
      });
      return;
    }

    // Validate membership tier for members
    if (role === 'member' && membershipTier) {
      const allowedTiers = ['basic', 'premium', 'elite'];
      if (!allowedTiers.includes(membershipTier)) {
        res.status(400).json({
          success: false,
          message: 'Недопустимый уровень членства'
        });
        return;
      }
    }

    try {
      // Проверяем, существует ли пользователь
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует'
        });
      }

      // Hash password with bcrypt
      logger.info(`Hashing password for new user registration: ${email}`);
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      logger.info(`Password hashed successfully for user registration: ${email}`);

      // Prepare user data
      const userData = {
        first_name: first_name,
        last_name: last_name,
        email,
        password: hashedPassword, // Use the hashed password
        role,
        phone: phone || undefined,
        membership_tier: role === 'member' ? membershipTier : undefined,
        emergency_contact: {
          name: emergencyContactName || undefined,
          phone: emergencyContactPhone || undefined,
          relationship: emergencyContactRelationship || undefined
        },
        notes: notes || undefined
      };

      // Remove undefined emergency contact if all fields are empty
      if (!emergencyContactName && !emergencyContactPhone && !emergencyContactRelationship) {
        delete userData.emergency_contact;
      }

      logger.info(`Registering new user: ${email}`);

      // Create user
      const user = await User.create(userData);
      console.log('\n auth route jwt from config:', config.backend.jwtSecret, '\n');
      // Генерируем JWT токен
      const token = jwt.sign(
        { userId: user._id, role: user.role },
        config.backend.jwtSecret,
        { expiresIn: config.backend.jwtExpire }
      );

      logger.info(`New user registered successfully: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно создан',
        token,
        user: {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          membershipTier: user.membership_tier,
          emergencyContactName: user.emergency_contact?.name,
          emergencyContactPhone: user.emergency_contact?.phone,
          emergencyContactRelationship: user.emergency_contact?.relationship,
          notes: user.notes
        }
      });
    } catch (error) {
      logger.error('Ошибка регистрации:', error);

      // Handle specific MongoDB errors
      if (error.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует'
        });
      } else if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => err.message);
        res.status(400).json({
          success: false,
          message: 'Ошибка валидации данных',
          errors: validationErrors
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Ошибка сервера при создании пользователя'
        });
      }
    }
  };

  await handleRegister();
});

// Вход пользователя
router.post('/login', (req, res) => {
  const handleLogin = () => {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email и пароль обязательны'
      });
      return;
    }

    logger.info(`Login attempt for user: ${email}`);

    // Находим пользователя
    User.findOne({ email })
      .then(user => {
        if (!user) {
          logger.warn(`Login failed - user not found ${email}`);
          res.status(400).json({ message: 'Неверные учетные данные, пользователь с :' + email + ' не найден' });
          return;
        }

        // Check if user is active
        if (user.isActive === false) {
          logger.warn(`Login failed - user is archived: ${email}`);
          res.status(400).json({ message: 'Аккаунт заблокирован' });
          return;
        }

        // Проверяем пароль
        return user.comparePassword(password);
      })
      .then(isMatch => {
        if (!isMatch) {
          logger.warn(`Login failed - invalid password for user: ${email}`);
          res.status(400).json({ message: 'Неверные учетные данные с паролем: ', password });
          return;
        }

        // Find user again to get complete user object
        return User.findOne({ email }).then(user => {
          console.log('\n auth route jwt from config:', config.backend.jwtSecret, '\n');
          // Генерируем JWT токен
          const token = jwt.sign(
            { userId: user._id, role: user.role },
            config.backend.jwtSecret,
            { expiresIn: config.backend.jwtExpire }
          );

          logger.info(`User logged in successfully: ${email}`);

          res.json({
            success: true,
            token,
            user: {
              id: user._id,
              first_name: user.first_name,
              last_name: user.last_name,
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
        if (!user) {
          res.status(404).json({ message: 'Пользователь не найден' });
          return;
        }

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