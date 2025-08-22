const express = require('express');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Получить все мероприятия
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, eventType, status, isActive } = req.query;

    let query = {};

    if (eventType) query.eventType = eventType;
    if (status) query.status = status;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const events = await Event.find(query)
      .populate('organizer', 'first_name last_name email phone role')
      .populate('participants.user', 'first_name last_name email phone role')
      .populate('waitlist.user', 'first_name last_name email phone role')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Ошибка получения мероприятий:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Получить мероприятие по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'first_name last_name email phone role')
      .populate('participants.user', 'first_name last_name email phone role')
      .populate('waitlist.user', 'first_name last_name email phone role');

    if (!event) {
      return res.status(404).json({ success: false, message: 'Мероприятие не найдено' });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error('Ошибка получения мероприятия:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Создать мероприятие
router.post('/', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user.userId
    });

    await event.save();
    await event.populate('organizer', 'first_name last_name email phone role');

    logger.info(`Создано новое мероприятие: ${event.title} пользователем ${req.user.userId}`);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error('Ошибка создания мероприятия:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors
      });
    }

    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Обновить мероприятие
router.put('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Мероприятие не найдено' });
    }

    // Проверяем, является ли пользователь организатором или администратором
    if (event.organizer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для редактирования этого мероприятия'
      });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== 'organizer') { // Запрещаем изменение организатора
        event[key] = req.body[key];
      }
    });

    await event.save();
    await event.populate('organizer', 'first_name last_name email phone role');
    await event.populate('participants.user', 'first_name last_name email phone role');
    await event.populate('waitlist.user', 'first_name last_name email phone role');

    const action = req.body.isActive === false ? 'архивировано' :
      req.body.isActive === true ? 'восстановлено' : 'обновлено';
    logger.info(`Мероприятие ${action}: ${event.title} пользователем ${req.user.userId}`);

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error('Ошибка обновления мероприятия:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации',
        errors
      });
    }

    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Удалить мероприятие
router.delete('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Мероприятие не найдено' });
    }

    // Проверяем, является ли пользователь организатором или администратором
    if (event.organizer.toString() !== req.user.userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав для удаления этого мероприятия'
      });
    }

    await event.deleteOne();

    logger.info(`Удалено мероприятие: ${event.title} пользователем ${req.user.userId}`);

    res.json({
      success: true,
      message: 'Мероприятие успешно удалено'
    });
  } catch (error) {
    logger.error('Ошибка удаления мероприятия:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Регистрация на мероприятие
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Мероприятие не найдено' });
    }

    // Проверка, не зарегистрирован ли уже пользователь
    const alreadyRegistered = event.participants.some(
      p => p.user.toString() === req.user.userId.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'Вы уже зарегистрированы на это мероприятие'
      });
    }

    // Проверка, не находится ли пользователь в листе ожидания
    const alreadyInWaitlist = event.waitlist.some(
      w => w.user.toString() === req.user.userId.toString()
    );

    if (alreadyInWaitlist) {
      return res.status(400).json({
        success: false,
        message: 'Вы уже находитесь в листе ожидания этого мероприятия'
      });
    }

    // Проверка лимита участников
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      // Добавить в лист ожидания
      event.waitlist.push({ user: req.user.userId });
      await event.save();

      await event.populate('waitlist.user', 'first_name last_name email phone role');

      logger.info(`Пользователь ${req.user.userId} добавлен в лист ожидания мероприятия: ${event.title}`);

      return res.json({
        success: true,
        message: 'Добавлен в лист ожидания',
        waitlisted: true,
        data: event
      });
    }

    // Регистрация участника
    event.participants.push({
      user: req.user.userId,
      paymentStatus: event.registrationFee > 0 ? 'pending' : 'paid'
    });

    await event.save();
    await event.populate('participants.user', 'first_name last_name email phone role');

    logger.info(`Пользователь ${req.user.userId} зарегистрирован на мероприятие: ${event.title}`);

    res.json({
      success: true,
      message: 'Успешно зарегистрированы на мероприятие',
      waitlisted: false,
      data: event
    });
  } catch (error) {
    logger.error('Ошибка регистрации на мероприятие:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Отмена регистрации на мероприятие
router.post('/:id/unregister', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Мероприятие не найдено' });
    }

    // Проверка, зарегистрирован ли пользователь
    const participantIndex = event.participants.findIndex(
      p => p.user.toString() === req.user.userId.toString()
    );

    if (participantIndex === -1) {
      // Проверка, находится ли пользователь в листе ожидания
      const waitlistIndex = event.waitlist.findIndex(
        w => w.user.toString() === req.user.userId.toString()
      );

      if (waitlistIndex === -1) {
        return res.status(400).json({
          success: false,
          message: 'Вы не зарегистрированы на это мероприятие'
        });
      }

      // Удаление из листа ожидания
      event.waitlist.splice(waitlistIndex, 1);
      await event.save();

      logger.info(`Пользователь ${req.user.userId} удален из листа ожидания мероприятия: ${event.title}`);

      return res.json({
        success: true,
        message: 'Удален из листа ожидания',
        data: event
      });
    }

    // Удаление из участников
    event.participants.splice(participantIndex, 1);

    // Если есть лист ожидания, перемещаем первого из листа ожидания в участники
    if (event.waitlist.length > 0) {
      const nextParticipant = event.waitlist.shift();
      event.participants.push({
        user: nextParticipant.user,
        paymentStatus: event.registrationFee > 0 ? 'pending' : 'paid'
      });
    }

    await event.save();
    await event.populate('participants.user', 'first_name last_name email phone role');
    await event.populate('waitlist.user', 'first_name last_name email phone role');

    logger.info(`Пользователь ${req.user.userId} отменил регистрацию на мероприятие: ${event.title}`);

    res.json({
      success: true,
      message: 'Регистрация на мероприятие отменена',
      data: event
    });
  } catch (error) {
    logger.error('Ошибка отмены регистрации на мероприятие:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

// Обновление статуса оплаты
router.patch('/:id/payment/:userId', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Мероприятие не найдено' });
    }

    const participant = event.participants.find(
      p => p.user.toString() === req.params.userId
    );

    if (!participant) {
      return res.status(404).json({ success: false, message: 'Участник не найден' });
    }

    participant.paymentStatus = paymentStatus;
    await event.save();

    await event.populate('participants.user', 'first_name last_name email phone role');

    logger.info(`Статус оплаты обновлен для пользователя ${req.params.userId} на мероприятии: ${event.title}`);

    res.json({
      success: true,
      message: 'Статус оплаты обновлен',
      data: event
    });
  } catch (error) {
    logger.error('Ошибка обновления статуса оплаты:', error);
    res.status(500).json({ success: false, message: 'Ошибка сервера' });
  }
});

module.exports = router;