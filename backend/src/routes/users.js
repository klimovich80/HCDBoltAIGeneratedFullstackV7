const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Create new user (admin only)
router.post('/', auth, authorize('admin'), (req, res) => {
  const handleCreateUser = async () => {
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
    const allowedRoles = ['member', 'trainer', 'admin', 'guest'];
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
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Пользователь с таким email уже существует'
        });
      }

      // Hash password with bcrypt
      logger.info(`Hashing password for new user: ${email}`);
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      logger.info(`Password hashed successfully for user: ${email}`);
      // Prepare user data with hashed password
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

      logger.info(`Creating new user: ${email} (created by admin: ${req.user.userId})`);

      // Create user
      const user = await User.create(userData);

      logger.info(`New user created successfully: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Пользователь успешно создан',
        data: {
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
          notes: user.notes,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      logger.error('Ошибка создания пользователя:', error);

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

  handleCreateUser();
});

// Получить всех пользователей (только администратор)
router.get('/', auth, authorize('admin'), (req, res) => {
  const handleGetUsers = () => {
    const { page = 1, limit = 10, role } = req.query;

    let query = {};
    if (role) query.role = role;

    Promise.all([
      User.find(query)
        .select('-password')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query)
    ])
      .then(([users, total]) => {
        res.json({
          success: true,
          data: users,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      })
      .catch(error => {
        logger.error('Ошибка получения пользователей:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleGetUsers();
});

// Получить пользователя по ID
router.get('/:id', auth, (req, res) => {
  const handleGetUser = () => {
    User.findById(req.params.id).select('-password')
      .then(user => {
        if (!user) {
          res.status(404).json({ message: 'Пользователь не найден' });
          return;
        }

        // Пользователи могут видеть только свой профиль, если они не администратор/тренер
        if (req.user.userId.toString() !== req.params.id &&
          !['admin', 'trainer'].includes(req.user.role)) {
          res.status(403).json({ message: 'Доступ запрещен' });
          return;
        }

        res.json({
          success: true,
          data: user
        });
      })
      .catch(error => {
        logger.error('Ошибка получения пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleGetUser();
});

// Update user (with password hashing support)
router.put('/:id', auth, (req, res) => {
  const handleUpdateUser = () => {
    const { password, ...otherFields } = req.body;

    User.findById(req.params.id)
      .then(user => {
        if (!user) {
          res.status(404).json({ message: 'Пользователь не найден' });
          return;
        }

        // Пользователи могут обновлять только свой профиль, если они не администратор
        if (req.user.userId.toString() !== req.params.id && req.user.role !== 'admin') {
          res.status(403).json({ message: 'Доступ запрещен' });
          return;
        }

        // Только администратор может изменять роли
        if (otherFields.role && req.user.role !== 'admin') {
          delete otherFields.role;
        }

        // Update other fields
        Object.keys(otherFields).forEach(key => {
          user[key] = otherFields[key];
        });

        // Handle password update if provided
        if (password) {
          // Validate password length
          if (password.length < 6) {
            res.status(400).json({
              success: false,
              message: 'Пароль должен содержать минимум 6 символов'
            });
            return;
          }

          // Set new password - it will be automatically hashed by pre-save hook
          user.password = password;
          logger.info(`Password updated for user: ${user.email}`);
        }

        return user.save();
      })
      .then(updatedUser => {
        if (!updatedUser) return;

        logger.info(`User updated: ${updatedUser.email}`);

        res.json({
          success: true,
          data: updatedUser
        });
      })
      .catch(error => {
        logger.error('Ошибка обновления пользователя:', error);

        if (error.name === 'ValidationError') {
          const validationErrors = Object.values(error.errors).map(err => err.message);
          res.status(400).json({
            success: false,
            message: 'Ошибка валидации данных',
            errors: validationErrors
          });
        } else {
          res.status(500).json({
            success: false,
            message: 'Ошибка сервера при обновлении пользователя'
          });
        }
      });
  };

  handleUpdateUser();
});

// Удалить пользователя (только администратор)
router.delete('/:id', auth, authorize('admin'), (req, res) => {
  const handleDeleteUser = () => {
    User.findById(req.params.id)
      .then(user => {
        if (!user) {
          res.status(404).json({ message: 'Пользователь не найден' });
          return;
        }

        // Prevent deleting the last admin
        if (user.role === 'admin') {
          return User.countDocuments({ role: 'admin', _id: { $ne: req.params.id } })
            .then(adminCount => {
              if (adminCount === 0) {
                res.status(400).json({ message: 'Нельзя удалить последнего администратора' });
                return;
              }
              return user.deleteOne();
            });
        }

        return user.deleteOne();
      })
      .then(result => {
        if (!result) return;

        logger.info(`Удален пользователь с ID: ${req.params.id}`);

        res.json({
          success: true,
          message: 'Пользователь успешно удален'
        });
      })
      .catch(error => {
        logger.error('Ошибка удаления пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleDeleteUser();
});

// Архивировать/восстановить пользователя (только администратор)
router.patch('/:id/archive', auth, authorize('admin'), (req, res) => {
  const handleArchiveUser = () => {
    User.findById(req.params.id)
      .then(user => {
        if (!user) {
          res.status(404).json({ message: 'Пользователь не найден' });
          return;
        }

        // Prevent archiving the last admin
        if (user.role === 'admin' && user.isActive !== false) {
          return User.countDocuments({ role: 'admin', isActive: { $ne: false }, _id: { $ne: req.params.id } })
            .then(activeAdminCount => {
              if (activeAdminCount === 0) {
                res.status(400).json({ message: 'Нельзя архивировать последнего активного администратора' });
                return;
              }
              user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
              return user.save();
            });
        }

        user.isActive = req.body.isActive !== undefined ? req.body.isActive : !user.isActive;
        return user.save();
      })
      .then(updatedUser => {
        if (!updatedUser) return;

        const action = updatedUser.isActive !== false ? 'восстановлен' : 'архивирован';
        logger.info(`Пользователь ${action}: ${updatedUser.email}`);

        res.json({
          success: true,
          data: updatedUser,
          message: `Пользователь успешно ${action}`
        });
      })
      .catch(error => {
        logger.error('Ошибка архивирования пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleArchiveUser();
});

module.exports = router;