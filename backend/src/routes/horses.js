const express = require('express');
const Horse = require('../models/Horse');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Получить всех лошадей
router.get('/', auth, (req, res) => {
  const handleGetHorses = () => {
    const { page = 1, limit = 10, breed, boardingType, owner } = req.query;

    let query = {};

    if (breed) query.breed = new RegExp(breed, 'i');
    if (boardingType) query.boardingType = boardingType;
    if (owner) query.owner = owner;

    Promise.all([
      Horse.find(query)
        .populate('owner', 'first_name last_name email')
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ name: 1 }),
      Horse.countDocuments(query)
    ])
      .then(([horses, total]) => {
        res.json({
          success: true,
          data: horses,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        });
      })
      .catch(error => {
        logger.error('Ошибка получения лошадей:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
      });
  };

  handleGetHorses();
});

// Получить лошадь по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id)
      .populate('owner', 'first_name last_name email phone');

    if (!horse) {
      return res.status(404).json({ message: 'Лошадь не найдена' });
    }

    res.json({
      success: true,
      data: horse
    });
  } catch (error) {
    logger.error('Ошибка получения лошади:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать лошадь
router.post('/', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const horse = new Horse(req.body);
    await horse.save();

    await horse.populate('owner', 'first_name last_name email');

    logger.info(`Создана новая лошадь: ${horse.name}`);

    res.status(201).json({
      success: true,
      data: horse
    });
  } catch (error) {
    logger.error('Ошибка создания лошади:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить лошадь
router.put('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);

    if (!horse) {
      return res.status(404).json({ message: 'Лошадь не найдена' });
    }

    Object.keys(req.body).forEach(key => {
      horse[key] = req.body[key];
    });

    await horse.save();
    await horse.populate('owner', 'first_name last_name email');

    const action = req.body.isActive === false ? 'архивирована' : req.body.isActive === true ? 'восстановлена' : 'обновлена';
    logger.info(`Лошадь ${action}: ${horse.name}`);

    res.json({
      success: true,
      data: horse
    });
  } catch (error) {
    logger.error('Ошибка обновления лошади:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Удалить лошадь
router.delete('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const horse = await Horse.findById(req.params.id);

    if (!horse) {
      return res.status(404).json({ message: 'Лошадь не найдена' });
    }

    await horse.deleteOne();

    logger.info(`Удалена лошадь: ${horse.name}`);

    res.json({
      success: true,
      message: 'Лошадь успешно удалена'
    });
  } catch (error) {
    logger.error('Ошибка удаления лошади:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;