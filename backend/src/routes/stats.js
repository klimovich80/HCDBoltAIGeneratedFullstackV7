const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Horse = require('../models/Horse');
const Lesson = require('../models/Lesson');
const Event = require('../models/Event');
const Payment = require('../models/Payment');

// Вспомогательная функция для безопасного преобразования дат
const safeDateToISO = (date) => {
  if (!date) return new Date().toISOString();
  try {
    const dateObj = new Date(date);
    return isNaN(dateObj.getTime()) ? new Date().toISOString() : dateObj.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

// GET /api/stats/dashboard - Получение статистики для дашборда
router.get('/dashboard', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(now);
    endOfWeek.setDate(now.getDate() + (6 - now.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);

    // Параллельное выполнение всех запросов
    const [
      totalHorses,
      totalMembers,
      upcomingLessons,
      activeEvents,
      pendingPayments,
      monthlyRevenueResult,
      newHorsesThisMonth,
      newLessonsThisWeek,
      newMembersThisMonth,
      pendingPaymentsAmountResult
    ] = await Promise.all([
      Horse.countDocuments({ isActive: true }),
      User.countDocuments({ role: 'member', isActive: true }),
      Lesson.countDocuments({
        scheduled_date: { $gte: now, $lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        status: 'scheduled',
        isActive: true
      }),
      Event.countDocuments({
        $or: [
          { start_date: { $lte: now }, end_date: { $gte: now } },
          { start_date: { $gte: now } }
        ],
        isActive: true,
        status: { $in: ['upcoming', 'ongoing'] }
      }),
      Payment.countDocuments({
        status: 'pending',
        isActive: true,
        due_date: { $gte: now }
      }),
      Payment.aggregate([
        {
          $match: {
            status: 'paid',
            payment_date: { $gte: startOfMonth, $lte: endOfMonth },
            isActive: true
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Horse.countDocuments({ createdAt: { $gte: startOfMonth }, isActive: true }),
      Lesson.countDocuments({ createdAt: { $gte: startOfWeek, $lte: endOfWeek }, isActive: true }),
      User.countDocuments({ role: 'member', createdAt: { $gte: startOfMonth }, isActive: true }),
      Payment.aggregate([
        {
          $match: {
            status: 'pending',
            isActive: true,
            due_date: { $gte: now }
          }
        },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const monthlyRevenue = monthlyRevenueResult[0]?.total || 0;
    const pendingPaymentsAmount = pendingPaymentsAmountResult[0]?.total || 0;

    // Расчет роста выручки
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const previousMonthRevenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          payment_date: { $gte: previousMonthStart, $lte: previousMonthEnd },
          isActive: true
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const previousMonthRevenue = previousMonthRevenueResult[0]?.total || 0;
    const revenueGrowthPercent = previousMonthRevenue > 0
      ? Number(((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(1))
      : monthlyRevenue > 0 ? 100 : 0;

    // Получение ближайших мероприятий
    const upcomingEventsData = await Event.find({
      start_date: { $gte: now },
      isActive: true,
      status: 'upcoming'
    })
      .sort({ start_date: 1 })
      .limit(3)
      .select('title start_date current_participants max_participants')
      .lean();

    const upcomingEvents = upcomingEventsData.map(event => ({
      title: event.title || 'Без названия',
      date: safeDateToISO(event.start_date),
      participants: `${event.current_participants || 0}/${event.max_participants || '∞'}`
    }));

    // Получение последней активности с безопасной обработкой
    const [recentLesson, recentPayment, recentEvent] = await Promise.all([
      Lesson.findOne({ isActive: true })
        .sort({ createdAt: -1 })
        .populate('member', 'first_name last_name')
        .populate('horse', 'name')
        .select('title member horse createdAt')
        .lean(),
      Payment.findOne({ status: 'paid', isActive: true })
        .sort({ payment_date: -1 })
        .populate('user', 'first_name last_name')
        .select('amount user payment_date description')
        .lean(),
      Event.findOne({ isActive: true })
        .sort({ createdAt: -1 })
        .select('title createdAt')
        .lean()
    ]);

    const recentActivity = [];

    // Безопасная обработка занятия
    if (recentLesson) {
      const horseName = recentLesson.horse?.name || 'неизвестная лошадь';
      const memberName = recentLesson.member ?
        `${recentLesson.member.first_name} ${recentLesson.member.last_name}` :
        'Неизвестный пользователь';

      recentActivity.push({
        type: 'lesson',
        message: `Новое занятие запланировано с ${horseName}`,
        user: memberName,
        timestamp: safeDateToISO(recentLesson.createdAt),
        color: 'green'
      });
    }

    // Безопасная обработка платежа
    if (recentPayment && recentPayment.user) {
      recentActivity.push({
        type: 'payment',
        message: `Получен платеж от ${recentPayment.user.first_name} ${recentPayment.user.last_name}`,
        amount: recentPayment.amount || 0,
        timestamp: safeDateToISO(recentPayment.payment_date),
        color: 'blue'
      });
    }

    // Безопасная обработка мероприятия
    if (recentEvent) {
      recentActivity.push({
        type: 'event',
        message: `Создано мероприятие: ${recentEvent.title || 'Без названия'}`,
        timestamp: safeDateToISO(recentEvent.createdAt),
        color: 'purple'
      });
    }

    // Сортировка по времени
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const statsData = {
      totalHorses: totalHorses || 0,
      upcomingLessons: upcomingLessons || 0,
      activeEvents: activeEvents || 0,
      pendingPayments: pendingPayments || 0,
      totalMembers: totalMembers || 0,
      monthlyRevenue: monthlyRevenue || 0,
      newHorsesThisMonth: newHorsesThisMonth || 0,
      newLessonsThisWeek: newLessonsThisWeek || 0,
      newMembersThisMonth: newMembersThisMonth || 0,
      pendingPaymentsAmount: pendingPaymentsAmount || 0,
      revenueGrowthPercent: revenueGrowthPercent || 0,
      upcomingEvents: upcomingEvents || [],
      recentActivity: recentActivity.slice(0, 4)
    };

    res.json({
      success: true,
      data: statsData
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении статистики дашборда'
    });
  }
});

// GET /api/stats/overview - Краткая сводка
router.get('/overview', async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [users, lessons, revenueResult] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo }, isActive: true }),
      Lesson.countDocuments({ scheduled_date: { $gte: now }, status: 'scheduled', isActive: true }),
      Payment.aggregate([
        { $match: { status: 'paid', isActive: true } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const overviewData = {
      newUsersLast30Days: users || 0,
      upcomingLessons: lessons || 0,
      totalRevenue: totalRevenue || 0
    };

    res.json({
      success: true,
      data: overviewData
    });

  } catch (error) {
    console.error('Error fetching overview stats:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении сводной статистики'
    });
  }
});

module.exports = router;