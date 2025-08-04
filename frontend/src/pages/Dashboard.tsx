import React, { useState, useEffect } from 'react'
import { Users as Horse, Calendar, Trophy, CreditCard, Users, TrendingUp } from 'lucide-react'
import { apiClient } from '../lib/api'

interface Stats {
  totalHorses: number
  upcomingLessons: number
  activeEvents: number
  pendingPayments: number
  totalMembers: number
  monthlyRevenue: number
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalHorses: 0,
    upcomingLessons: 0,
    activeEvents: 0,
    pendingPayments: 0,
    totalMembers: 0,
    monthlyRevenue: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = () => {
      // В реальном приложении у вас был бы отдельный endpoint для статистики
      // Пока что мы симулируем данные
      Promise.resolve()
        .then(() => {
          setStats({
            totalHorses: 24,
            upcomingLessons: 18,
            activeEvents: 3,
            pendingPayments: 7,
            totalMembers: 156,
            monthlyRevenue: 12450
          })
        })
        .catch(error => {
          console.error('Failed to fetch stats:', error)
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      name: 'Всего лошадей',
      value: stats.totalHorses,
      icon: Horse,
      color: 'bg-blue-500',
      change: '+2 в этом месяце'
    },
    {
      name: 'Предстоящие занятия',
      value: stats.upcomingLessons,
      icon: Calendar,
      color: 'bg-green-500',
      change: '+5 на этой неделе'
    },
    {
      name: 'Активные мероприятия',
      value: stats.activeEvents,
      icon: Trophy,
      color: 'bg-purple-500',
      change: '2 предстоящих'
    },
    {
      name: 'Ожидающие платежи',
      value: stats.pendingPayments,
      icon: CreditCard,
      color: 'bg-yellow-500',
      change: '2 340₽ всего'
    },
    {
      name: 'Всего участников',
      value: stats.totalMembers,
      icon: Users,
      color: 'bg-indigo-500',
      change: '+12 в этом месяце'
    },
    {
      name: 'Месячная выручка',
      value: `${stats.monthlyRevenue.toLocaleString()}₽`,
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: '+8,2% с прошлого месяца'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
        <p className="text-gray-600">Добро пожаловать! Вот что происходит в вашем центре.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Последняя активность</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Новое занятие запланировано с Громом</p>
              <span className="text-xs text-gray-400">2 часа назад</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Получен платеж от Эммы Уильямс</p>
              <span className="text-xs text-gray-400">4 часа назад</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-purple-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Открыта регистрация на зимние соревнования</p>
              <span className="text-xs text-gray-400">1 день назад</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <p className="text-sm text-gray-600">Запланирован визит ветеринара для Лунного света</p>
              <span className="text-xs text-gray-400">2 дня назад</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Предстоящие мероприятия</h3>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-medium text-gray-900">Зимние соревнования по выездке</h4>
              <p className="text-sm text-gray-600">28 декабря 2024</p>
              <p className="text-xs text-gray-500">50 участников зарегистрировано</p>
            </div>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">Клиника по конкуру</h4>
              <p className="text-sm text-gray-600">15-16 января 2025</p>
              <p className="text-xs text-gray-500">15 участников зарегистрировано</p>
            </div>
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-medium text-gray-900">Новогодняя прогулка</h4>
              <p className="text-sm text-gray-600">1 января 2025</p>
              <p className="text-xs text-gray-500">22 участника зарегистрировано</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard