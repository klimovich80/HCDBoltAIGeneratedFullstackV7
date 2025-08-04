const express = require('express');
const Event = require('../models/Event');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Получить все мероприятия
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, eventType, status } = req.query;
    
    let query = {};
    
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName email')
      .populate('participants.user', 'firstName lastName email')
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
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить мероприятие по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email phone')
      .populate('participants.user', 'firstName lastName email phone')
      .populate('waitlist.user', 'firstName lastName email phone');
    
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }

    res.json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error('Ошибка получения мероприятия:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать мероприятие
router.post('/', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const event = new Event({
      ...req.body,
      organizer: req.user._id
    });
    
    await event.save();
    await event.populate('organizer', 'firstName lastName email');

    logger.info(`Создано новое мероприятие: ${event.title}`);

    res.status(201).json({
      success: true,
      data: event
    });
  } catch (error) {
    logger.error('Ошибка создания мероприятия:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Регистрация на мероприятие
router.post('/:id/register', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Мероприятие не найдено' });
    }

    // Проверка, не зарегистрирован ли уже пользователь
    const alreadyRegistered = event.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Вы уже зарегистрированы на это мероприятие' });
    }

    // Проверка лимита участников
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      // Добавить в лист ожидания
      event.waitlist.push({ user: req.user._id });
      await event.save();
      
      return res.json({
        success: true,
        message: 'Добавлен в лист ожидания',
        waitlisted: true
      });
    }

    // Регистрация участника
    event.participants.push({ user: req.user._id });
    await event.save();

    logger.info(`Пользователь ${req.user.email} зарегистрирован на мероприятие: ${event.title}`);

    res.json({
      success: true,
      message: 'Успешно зарегистрированы на мероприятие'
    });
  } catch (error) {
    logger.error('Ошибка регистрации на мероприятие:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;