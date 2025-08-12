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
      .populate('instructor', 'first_name last_name email')
      .populate('horse', 'name breed')
      .populate('member', 'first_name last_name email')
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
      .populate('instructor', 'first_name last_name email phone')
      .populate('horse', 'name breed age')
      .populate('member', 'first_name last_name email phone');

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
  console.log('req.body creating lesson @routes/lessons.js', req.body);
  try {
    const lesson = new Lesson(req.body);
    await lesson.save();

    await lesson.populate([
      { path: 'instructor', select: 'first_name last_name email' },
      { path: 'horse', select: 'name breed' },
      { path: 'member', select: 'first_name last_name email' }
    ]);

    logger.info(`Создано новое занятие: ${lesson.title}`);

    res.status(201).json({
      success: true,
      data: lesson
    });
  } catch (error) {
    logger.error('Ошибка создания занятия @routes/lessons.js: \n', error);
    res.status(500).json({ message: 'Ошибка сервера\n' });
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
      { path: 'instructor', select: 'first_name last_name email' },
      { path: 'horse', select: 'name breed' },
      { path: 'member', select: 'first_name last_name email' }
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
router.delete('/:id', auth, authorize('admin', 'trainer'), (req, res) => {
  const handleDeleteLesson = () => {
    Lesson.findById(req.params.id)
      .then(lesson => {
        if (!lesson) {
          res.status(404).json({ message: 'Занятие не найдено' });
          return;
        }

        return lesson.deleteOne();
      })
      .then(result => {
        if (!result) return;

        logger.info(`Удалено занятие с ID: ${req.params.id}`);

        res.json({
          success: true,
          message: 'Занятие успешно удалено'
        });
      })
      .catch(error => {
        logger.error('Ошибка удаления занятия:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleDeleteLesson();
});

// Архивировать/восстановить занятие
router.patch('/:id/archive', auth, authorize('admin', 'trainer'), (req, res) => {
  const handleArchiveLesson = () => {
    Lesson.findById(req.params.id)
      .then(lesson => {
        if (!lesson) {
          res.status(404).json({ message: 'Занятие не найдено' });
          return;
        }

        lesson.isActive = req.body.isActive !== undefined ? req.body.isActive : !lesson.isActive;
        return lesson.save();
      })
      .then(updatedLesson => {
        if (!updatedLesson) return;

        const action = updatedLesson.isActive ? 'восстановлено' : 'архивировано';
        logger.info(`Занятие ${action}: ${updatedLesson.title}`);

        res.json({
          success: true,
          data: updatedLesson,
          message: `Занятие успешно ${action}`
        });
      })
      .catch(error => {
        logger.error('Ошибка архивирования занятия:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleArchiveLesson();
});

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