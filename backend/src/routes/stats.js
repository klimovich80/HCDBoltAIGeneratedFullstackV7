const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Horse = require('../models/Horse');
const Lesson = require('../models/Lesson');
const Event = require('../models/Event');
const Payment = require('../models/Payment');

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
      title: event.title,
      date: event.start_date.toISOString(),
      participants: `${event.current_participants}/${event.max_participants || '∞'}`
    }));

    // Получение последней активности
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

    if (recentLesson && recentLesson.horse) {
      recentActivity.push({
        type: 'lesson',
        message: `Новое занятие запланировано с ${recentLesson.horse.name}`,
        user: recentLesson.member ? `${recentLesson.member.first_name} ${recentLesson.member.last_name}` : 'Неизвестный пользователь',
        timestamp: recentLesson.createdAt.toISOString(),
        color: 'green'
      });
    }

    if (recentPayment && recentPayment.user) {
      recentActivity.push({
        type: 'payment',
        message: `Получен платеж от ${recentPayment.user.first_name} ${recentPayment.user.last_name}`,
        amount: recentPayment.amount,
        timestamp: recentPayment.payment_date.toISOString(),
        color: 'blue'
      });
    }

    if (recentEvent) {
      recentActivity.push({
        type: 'event',
        message: `Создано мероприятие: ${recentEvent.title}`,
        timestamp: recentEvent.createdAt.toISOString(),
        color: 'purple'
      });
    }

    // Сортировка по времени
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    const statsData = {
      totalHorses,
      upcomingLessons,
      activeEvents,
      pendingPayments,
      totalMembers,
      monthlyRevenue,
      newHorsesThisMonth,
      newLessonsThisWeek,
      newMembersThisMonth,
      pendingPaymentsAmount,
      revenueGrowthPercent,
      upcomingEvents,
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
      newUsersLast30Days: users,
      upcomingLessons: lessons,
      totalRevenue
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