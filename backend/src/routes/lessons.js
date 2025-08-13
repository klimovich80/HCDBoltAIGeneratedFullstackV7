const express = require('express');
const Lesson = require('../models/Lesson');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Получить все занятия
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, lesson_type, instructor, member, dateFrom, dateTo } = req.query;

    // Формирование запроса
    let query = { isActive: true };

    // Фильтрация по параметрам
    if (status) query.status = status;
    if (lesson_type) query.lesson_type = lesson_type;
    if (instructor) query.instructor = instructor;
    if (member) query.member = member;

    // Фильтрация по диапазону дат
    if (dateFrom || dateTo) {
      query.scheduled_date = {};
      if (dateFrom) query.scheduled_date.$gte = new Date(dateFrom);
      if (dateTo) query.scheduled_date.$lte = new Date(dateTo);
    }

    // Фильтрация по ролям пользователя
    if (req.user.role === 'member') {
      query.member = req.user._id;
    } else if (req.user.role === 'trainer') {
      query.instructor = req.user._id;
    }

    // Выполнение запроса с пагинацией
    const lessons = await Lesson.find(query)
      .populate('instructor', 'first_name last_name email')
      .populate('horse', 'name breed')
      .populate('member', 'first_name last_name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduled_date: -1 });

    const total = await Lesson.countDocuments(query);

    logger.info(`Получен список занятий для пользователя ${req.user._id}`);

    res.json({
      success: true,
      data: lessons,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Ошибка получения занятий:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении занятий'
    });
  }
});

// Получить занятие по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('instructor', 'first_name last_name email phone')
      .populate('horse', 'name breed age')
      .populate('member', 'first_name last_name email phone');

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Занятие не найдено'
      });
    }

    // Проверка прав доступа
    if (req.user.role === 'member' && lesson.member._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    if ((req.user.role === 'trainer' || req.user.role === 'instructor') &&
      lesson.instructor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    logger.info(`Получено занятие ${lesson._id} для пользователя ${req.user._id}`);

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    logger.error('Ошибка получения занятия:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении занятия'
    });
  }
});

// Создать занятие
router.post('/', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    // Логирование входящих данных для отладки
    logger.info('Попытка создания занятия с данными:', {
      body: req.body,
      userId: req.user._id,
      userRole: req.user.role
    });

    // Валидация обязательных полей
    const { title, scheduled_date, duration_minutes, lesson_type, cost, member, instructor } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Название занятия обязательно'
      });
    }

    if (!scheduled_date) {
      return res.status(400).json({
        success: false,
        message: 'Дата занятия обязательна'
      });
    }

    if (!duration_minutes) {
      return res.status(400).json({
        success: false,
        message: 'Продолжительность занятия обязательна'
      });
    }

    if (!lesson_type) {
      return res.status(400).json({
        success: false,
        message: 'Тип занятия обязателен'
      });
    }

    if (cost === undefined || cost === null) {
      return res.status(400).json({
        success: false,
        message: 'Стоимость занятия обязательна'
      });
    }

    // Для тренеров автоматически устанавливаем себя как инструктора
    let lessonData = { ...req.body };

    if (req.user.role === 'trainer' && !lessonData.instructor) {
      lessonData.instructor = req.user._id;
      logger.info('Автоматически установлен инструктор:', req.user._id);
    }

    // Проверка наличия обязательных полей
    if (!lessonData.instructor) {
      return res.status(400).json({
        success: false,
        message: 'Инструктор обязателен'
      });
    }

    if (!lessonData.member) {
      return res.status(400).json({
        success: false,
        message: 'Участник обязателен'
      });
    }

    // Проверка конфликтов расписания перед созданием
    const newLesson = new Lesson(lessonData);

    // Проверка наличия конфликтов
    const hasConflict = await newLesson.hasScheduleConflict();
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'Конфликт расписания: на это время уже запланировано занятие'
      });
    }

    await newLesson.save();

    // Загрузка связанных данных
    await newLesson.populate([
      { path: 'instructor', select: 'first_name last_name email' },
      { path: 'horse', select: 'name breed' },
      { path: 'member', select: 'first_name last_name email' }
    ]);

    logger.info(`Создано новое занятие: ${newLesson.title}`, {
      lessonId: newLesson._id,
      userId: req.user._id
    });

    res.status(201).json({
      success: true,
      data: newLesson,
      message: 'Занятие успешно создано'
    });
  } catch (error) {
    logger.error('Ошибка создания занятия:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user._id
    });

    // Обработка ошибок валидации Mongoose
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors
      });
    }

    // Обработка ошибок дубликатов
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Занятие с такими данными уже существует'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании занятия'
    });
  }
});

// Обновить занятие
router.put('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Занятие не найдено'
      });
    }

    // Проверка прав доступа (только админ может редактировать чужие занятия)
    if (req.user.role === 'trainer' && lesson.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы можете редактировать только свои занятия'
      });
    }

    // Обновление полей
    Object.keys(req.body).forEach(key => {
      // Защита от изменения системных полей
      if (key !== '_id' && key !== '__v') {
        lesson[key] = req.body[key];
      }
    });

    // Проверка конфликтов при изменении даты или инструктора
    if (req.body.scheduled_date || req.body.instructor) {
      const hasConflict = await lesson.hasScheduleConflict();
      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Конфликт расписания: на это время уже запланировано занятие'
        });
      }
    }

    await lesson.save();

    // Загрузка обновленных связанных данных
    await lesson.populate([
      { path: 'instructor', select: 'first_name last_name email' },
      { path: 'horse', select: 'name breed' },
      { path: 'member', select: 'first_name last_name email' }
    ]);

    logger.info(`Обновлено занятие: ${lesson.title}`, {
      lessonId: lesson._id,
      userId: req.user._id
    });

    res.json({
      success: true,
      data: lesson,
      message: 'Занятие успешно обновлено'
    });
  } catch (error) {
    logger.error('Ошибка обновления занятия:', error);
    // Обработка ошибок валидации
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении занятия'
    });
  }
});

// Удалить занятие (жесткое удаление)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Занятие не найдено'
      });
    }

    await lesson.deleteOne();

    logger.info(`Удалено занятие: ${lesson.title}`, {
      lessonId: lesson._id,
      userId: req.user._id
    });

    res.json({
      success: true,
      message: 'Занятие успешно удалено'
    });
  } catch (error) {
    logger.error('Ошибка удаления занятия:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении занятия'
    });
  }
});

// Архивировать/восстановить занятие (мягкое удаление)
router.patch('/:id/archive', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Занятие не найдено'
      });
    }

    // Проверка прав доступа
    if (req.user.role === 'trainer' && lesson.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы можете архивировать только свои занятия'
      });
    }

    // Переключение статуса активности
    lesson.isActive = req.body.isActive !== undefined ? req.body.isActive : !lesson.isActive;
    await lesson.save();

    const action = lesson.isActive ? 'восстановлено' : 'архивировано';
    logger.info(`Занятие ${action}: ${lesson.title}`, {
      lessonId: lesson._id,
      userId: req.user._id
    });

    res.json({
      success: true,
      data: lesson,
      message: `Занятие успешно ${action}`
    });
  } catch (error) {
    logger.error('Ошибка архивирования занятия:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при архивировании занятия'
    });
  }
});

// Отменить занятие
router.patch('/:id/cancel', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Занятие не найдено'
      });
    }

    // Проверка прав доступа
    if (req.user.role === 'trainer' && lesson.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы можете отменять только свои занятия'
      });
    }

    // Проверка, что занятие еще не прошло
    if (lesson.scheduled_date < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя отменить прошедшее занятие'
      });
    }

    lesson.status = 'cancelled';
    await lesson.save();

    await lesson.populate([
      { path: 'instructor', select: 'first_name last_name' },
      { path: 'member', select: 'first_name last_name email' }
    ]);

    logger.info(`Отменено занятие: ${lesson.title}`, {
      lessonId: lesson._id,
      userId: req.user._id
    });

    res.json({
      success: true,
      data: lesson,
      message: 'Занятие успешно отменено'
    });
  } catch (error) {
    logger.error('Ошибка отмены занятия:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при отмене занятия'
    });
  }
});

// Завершить занятие
router.patch('/:id/complete', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({
        success: false,
        message: 'Занятие не найдено'
      });
    }

    // Проверка прав доступа
    if (req.user.role === 'trainer' && lesson.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Вы можете завершать только свои занятия'
      });
    }

    // Проверка, что занятие уже прошло
    if (lesson.scheduled_date > new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Нельзя завершить будущее занятие'
      });
    }

    lesson.status = 'completed';
    lesson.payment_status = req.body.payment_status || lesson.payment_status;
    await lesson.save();

    await lesson.populate([
      { path: 'instructor', select: 'first_name last_name' },
      { path: 'member', select: 'first_name last_name' }
    ]);

    logger.info(`Завершено занятие: ${lesson.title}`, {
      lessonId: lesson._id,
      userId: req.user._id
    });

    res.json({
      success: true,
      data: lesson,
      message: 'Занятие успешно завершено'
    });
  } catch (error) {
    logger.error('Ошибка завершения занятия:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при завершении занятия'
    });
  }
});

module.exports = router;