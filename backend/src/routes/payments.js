const express = require('express');
const Payment = require('../models/Payment');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Получить все платежи
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, paymentType, member } = req.query;
    
    let query = {};
    
    if (status) query.status = status;
    if (paymentType) query.paymentType = paymentType;
    if (member) query.member = member;

    // Участники видят только свои платежи
    if (req.user.role === 'member') {
      query.member = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate('member', 'firstName lastName email')
      .populate('reference')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Payment.countDocuments(query);

    res.json({
      success: true,
      data: payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    logger.error('Ошибка получения платежей:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Получить платеж по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate('member', 'firstName lastName email phone')
      .populate('reference');
    
    if (!payment) {
      return res.status(404).json({ message: 'Платеж не найден' });
    }

    // Проверка прав доступа
    if (req.user.role === 'member' && payment.member._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Доступ запрещен' });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Ошибка получения платежа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Создать платеж
router.post('/', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const payment = new Payment(req.body);
    await payment.save();

    await payment.populate('member', 'firstName lastName email');

    logger.info(`Создан новый платеж: ${payment.invoiceNumber}`);

    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Ошибка создания платежа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновить статус платежа
router.patch('/:id/status', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const { status, paidDate } = req.body;
    
    const payment = await Payment.findById(req.params.id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Платеж не найден' });
    }

    payment.status = status;
    if (status === 'paid' && paidDate) {
      payment.paidDate = new Date(paidDate);
    }

    await payment.save();
    await payment.populate('member', 'firstName lastName email');

    logger.info(`Обновлен статус платежа ${payment.invoiceNumber}: ${status}`);

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Ошибка обновления статуса платежа:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;