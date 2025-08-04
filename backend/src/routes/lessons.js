const express = require('express');
const Lesson = require('../models/Lesson');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Получить все занятия
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, lessonType, instructor, member } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (lessonType) query.lessonType = lessonType;
    if (instructor) query.instructor = instructor;
    if (member) query.member = member;

    // Фильтрация по ролям
    if (req.user.role === 'member') {
      query.member = req.user._id;
    } else if (req.user.role === 'trainer') {
      query.instructor = req.user._id;
    }

    const lessons = await Lesson.find(query)
      .populate('instructor', 'firstName lastName email')
      .populate('horse', 'name breed')
      .populate('member', 'firstName lastName email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledDate: -1 });

    const total = await Lesson.countDocuments(query);

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
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить занятие по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id)
      .populate('instructor', 'firstName lastName email phone')
      .populate('horse', 'name breed age')
      .populate('member', 'firstName lastName email phone');
    
    if (!lesson) {
      return res.status(404).json({ message: 'Занятие не найдено' });
    }

    // Проверка прав доступа
    if (req.user.role === 'member' && lesson.member._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    logger.error('Ошибка получения занятия:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать занятие
router.post('/', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();

    await lesson.populate([
      { path: 'instructor', select: 'firstName lastName email' },
      { path: 'horse', select: 'name breed' },
      { path: 'member', select: 'firstName lastName email' }
    ]);

    logger.info(`Создано новое занятие: ${lesson.title}`);

    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    logger.error('Ошибка создания занятия:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить занятие
router.put('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Занятие не найдено' });
    }

    Object.keys(req.body).forEach(key => {
      lesson[key] = req.body[key];
    });

    await lesson.save();
    await lesson.populate([
      { path: 'instructor', select: 'firstName lastName email' },
      { path: 'horse', select: 'name breed' },
      { path: 'member', select: 'firstName lastName email' }
    ]);

    logger.info(`Обновлено занятие: ${lesson.title}`);

    res.json({
      success: true,
      data: lesson
    });
  } catch (error) {
    logger.error('Ошибка обновления занятия:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить занятие
router.delete('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Занятие не найдено' });
    }

    await lesson.deleteOne();

    logger.info(`Удалено занятие: ${lesson.title}`);

    res.json({
      success: true,
      message: 'Занятие успешно удалено'
    });
  } catch (error) {
    logger.error('Ошибка удаления занятия:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;