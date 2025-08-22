const express = require('express');
const Payment = require('../models/Payment');
const { auth, authorize } = require('../middleware/auth');
const logger = require('../config/logger');

const router = express.Router();

// Получить все платежи
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, payment_method, user } = req.query;

    let query = { isActive: true };

    if (status) query.status = status;
    if (payment_method) query.payment_method = payment_method;
    if (user) query.user = user;

    // Участники видят только свои платежи
    if (req.user.role === 'member') {
      query.user = req.user._id;
    }

    const payments = await Payment.find(query)
      .populate('user', 'first_name last_name email')
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
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении платежей'
    });
  }
});

// Получить платеж по ID
router.get('/:id', auth, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      isActive: true
    }).populate('user', 'first_name last_name email phone');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Платеж не найден'
      });
    }

    // Проверка прав доступа
    if (req.user.role === 'member' && payment.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Доступ запрещен'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Ошибка получения платежа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера'
    });
  }
});

// Создать платеж
router.post('/', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const { amount, description, due_date, payment_method, user_id, reference_number } = req.body;

    // Валидация обязательных полей
    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'ID пользователя обязательно для заполнения'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Сумма платежа должна быть положительной'
      });
    }

    if (!due_date) {
      return res.status(400).json({
        success: false,
        message: 'Дата оплаты обязательна для заполнения'
      });
    }

    const paymentData = {
      user: user_id, // Используем user_id из тела запроса
      amount,
      description,
      due_date: new Date(due_date),
      payment_method: payment_method || 'cash',
      reference_number,
      invoiceNumber: req.body.invoiceNumber || `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    };

    const payment = new Payment(paymentData);
    await payment.save();

    await payment.populate('user', 'first_name last_name email');

    logger.info(`Создан новый платеж: ${payment.invoiceNumber} для пользователя ${payment.user.first_name} ${payment.user.last_name}`);

    res.status(201).json({
      success: true,
      data: payment,
      message: 'Платеж успешно создан'
    });
  } catch (error) {
    logger.error('Ошибка создания платежа:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Ошибка валидации данных',
        errors
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Платеж с таким номером счета уже существует'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при создании платежа'
    });
  }
});

// Обновить статус платежа
router.patch('/:id/status', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const { status, payment_date } = req.body;

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Платеж не найден'
      });
    }

    payment.status = status;
    if (status === 'paid' && payment_date) {
      payment.payment_date = new Date(payment_date);
    } else if (status === 'paid') {
      payment.payment_date = new Date();
    }

    await payment.save();
    await payment.populate('user', 'first_name last_name email');

    logger.info(`Обновлен статус платежа ${payment.invoiceNumber}: ${status}`);

    res.json({
      success: true,
      data: payment,
      message: 'Статус платежа обновлен'
    });
  } catch (error) {
    logger.error('Ошибка обновления статуса платежа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении статуса'
    });
  }
});

// Обновить платеж
router.put('/:id', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('user', 'first_name last_name email');

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Платеж не найден'
      });
    }

    res.json({
      success: true,
      data: payment,
      message: 'Платеж успешно обновлен'
    });
  } catch (error) {
    logger.error('Ошибка обновления платежа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при обновлении платежа'
    });
  }
});

// Удалить платеж (мягкое удаление)
router.delete('/:id', auth, authorize('admin'), async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Платеж не найден'
      });
    }

    logger.info(`Платеж удален: ${payment.invoiceNumber}`);

    res.json({
      success: true,
      message: 'Платеж успешно удален'
    });
  } catch (error) {
    logger.error('Ошибка удаления платежа:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при удалении платежа'
    });
  }
});

// Получить статистику по платежам
router.get('/stats/summary', auth, authorize('admin', 'trainer'), async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [totalRevenue, monthlyRevenue, pendingPayments, paidPayments] = await Promise.all([
      // Общая выручка
      Payment.aggregate([
        { $match: { status: 'paid', isActive: true } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Выручка за текущий месяц
      Payment.aggregate([
        {
          $match: {
            status: 'paid',
            isActive: true,
            payment_date: { $gte: startOfMonth, $lte: endOfMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      // Ожидающие платежи
      Payment.countDocuments({ status: 'pending', isActive: true }),
      // Оплаченные платежи
      Payment.countDocuments({ status: 'paid', isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue[0]?.total || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        pendingPayments,
        paidPayments
      }
    });
  } catch (error) {
    logger.error('Ошибка получения статистики платежей:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка сервера при получении статистики'
    });
  }
});

module.exports = router;