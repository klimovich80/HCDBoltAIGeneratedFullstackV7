const express = require('express');
const Equipment = require('../models/Equipment');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Получить все снаряжение
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, condition, assignedHorse } = req.query;

    let query = { isActive: true };

    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (assignedHorse) query.assignedHorse = assignedHorse;

    const equipment = await Equipment.find(query)
      .populate('assignedHorse', 'name breed')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ name: 1 });

    const total = await Equipment.countDocuments(query);

    res.json({
      success: true,
      data: equipment,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Ошибка получения снаряжения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить снаряжение по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id)
      .populate('assignedHorse', 'name breed age');

    if (!equipment || !equipment.isActive) {
      return res.status(404).json({ message: 'Снаряжение не найдено' });
    }

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    logger.error('Ошибка получения снаряжения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать снаряжение
router.post('/', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const equipment = new Equipment(req.body);
    await equipment.save();

    await equipment.populate('assignedHorse', 'name breed');

    logger.info(`Создано новое снаряжение: ${equipment.name}`);

    res.status(201).json({
      success: true,
      data: equipment
    });
  } catch (error) {
    logger.error('Ошибка создания снаряжения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить снаряжение
router.put('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment || !equipment.isActive) {
      return res.status(404).json({ message: 'Снаряжение не найдено' });
    }

    Object.keys(req.body).forEach(key => {
      equipment[key] = req.body[key];
    });

    await equipment.save();
    await equipment.populate('assignedHorse', 'name breed');

    logger.info(`Обновлено снаряжение: ${equipment.name}`);

    res.json({
      success: true,
      data: equipment
    });
  } catch (error) {
    logger.error('Ошибка обновления снаряжения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить снаряжение
router.delete('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Снаряжение не найдено' });
    }

    await equipment.deleteOne();

    logger.info(`Удалено снаряжение: ${equipment.name}`);

    res.json({
      success: true,
      message: 'Снаряжение успешно удалено'
    });
  } catch (error) {
    logger.error('Ошибка удаления снаряжения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Архивировать/восстановить снаряжение
router.patch('/:id/archive', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const equipment = await Equipment.findById(req.params.id);

    if (!equipment) {
      return res.status(404).json({ message: 'Снаряжение не найдено' });
    }

    equipment.isActive = req.body.isActive !== undefined ? req.body.isActive : !equipment.isActive;
    await equipment.save();

    const action = equipment.isActive ? 'восстановлено' : 'архивировано';
    logger.info(`Снаряжение ${action}: ${equipment.name}`);

    res.json({
      success: true,
      data: equipment,
      message: `Снаряжение успешно ${action}`
    });
  } catch (error) {
    logger.error('Ошибка архивирования снаряжения:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;