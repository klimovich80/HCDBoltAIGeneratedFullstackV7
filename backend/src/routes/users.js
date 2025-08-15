const express = require('express');
const User = require('../models/User');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

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

// Обновить пользователя
router.put('/:id', auth, (req, res) => {
  const handleUpdateUser = () => {
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
        if (req.body.role && req.user.role !== 'admin') {
          delete req.body.role;
        }

        Object.keys(req.body).forEach(key => {
          if (key !== 'password') { // Не разрешаем обновление пароля через этот маршрут
            user[key] = req.body[key];
          }
        });

        return user.save();
      })
      .then(updatedUser => {
        if (!updatedUser) return;

        logger.info(`Обновлен пользователь: ${updatedUser.email}`);

        res.json({
          success: true,
          data: updatedUser
        });
      })
      .catch(error => {
        logger.error('Ошибка обновления пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
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

module.exports = router;