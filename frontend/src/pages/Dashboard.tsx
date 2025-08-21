import React, { useState, useEffect } from 'react'
import { Users as Horse, Calendar, Trophy, CreditCard, Users, TrendingUp, Clock, AlertCircle } from 'lucide-react'
import { apiClient } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { DashboardStats } from '../types/stats'

const Dashboard: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalHorses: 0,
    upcomingLessons: 0,
    activeEvents: 0,
    pendingPayments: 0,
    totalMembers: 0,
    monthlyRevenue: 0,
    newHorsesThisMonth: 0,
    newLessonsThisWeek: 0,
    newMembersThisMonth: 0,
    pendingPaymentsAmount: 0,
    revenueGrowthPercent: 0,
    upcomingEvents: [],
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

 useEffect(() => {
  const fetchStats = async () => {
    try {
      setError('')
      // Используем get вместо getAll, так как endpoint возвращает один объект
      const response = await apiClient.get<DashboardStats>('/stats/dashboard')
      
      if (response.success && response.data) {
        setStats(response.data)
      } else {
        setError(response.message || 'Не удалось загрузить статистику')
        setStats({
          totalHorses: 0,
          upcomingLessons: 0,
          activeEvents: 0,
          pendingPayments: 0,
          totalMembers: 0,
          monthlyRevenue: 0,
          newHorsesThisMonth: 0,
          newLessonsThisWeek: 0,
          newMembersThisMonth: 0,
          pendingPaymentsAmount: 0,
          revenueGrowthPercent: 0,
          upcomingEvents: [],
          recentActivity: []
        })
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      setError('Ошибка при загрузке данных')
      setStats({
        totalHorses: 0,
        upcomingLessons: 0,
        activeEvents: 0,
        pendingPayments: 0,
        totalMembers: 0,
        monthlyRevenue: 0,
        newHorsesThisMonth: 0,
        newLessonsThisWeek: 0,
        newMembersThisMonth: 0,
        pendingPaymentsAmount: 0,
        revenueGrowthPercent: 0,
        upcomingEvents: [],
        recentActivity: []
      })
    } finally {
      setLoading(false)
    }
  }

  fetchStats()
}, [])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('ru-RU').format(num)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'только что'
    } else if (diffInHours < 24) {
      return `${diffInHours} час${diffInHours === 1 ? '' : 'а'} назад`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} день${diffInDays === 1 ? '' : 'ей'} назад`
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'lesson': return <Clock className="h-4 w-4 text-green-500" />
      case 'payment': return <CreditCard className="h-4 w-4 text-blue-500" />
      case 'event': return <Calendar className="h-4 w-4 text-purple-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const statCards = [
    {
      name: 'Всего лошадей',
      value: formatNumber(stats.totalHorses),
      icon: Horse,
      color: 'bg-blue-500',
      change: `+${stats.newHorsesThisMonth} в этом месяце`
    },
    {
      name: 'Предстоящие занятия',
      value: formatNumber(stats.upcomingLessons),
      icon: Calendar,
      color: 'bg-green-500',
      change: `+${stats.newLessonsThisWeek} на этой неделе`
    },
    {
      name: 'Активные мероприятия',
      value: formatNumber(stats.activeEvents),
      icon: Trophy,
      color: 'bg-purple-500',
      change: `${stats.upcomingEvents.length} предстоящих`
    },
    {
      name: 'Ожидающие платежи',
      value: formatNumber(stats.pendingPayments),
      icon: CreditCard,
      color: 'bg-yellow-500',
      change: `${formatCurrency(stats.pendingPaymentsAmount)} всего`
    },
    {
      name: 'Всего участников',
      value: formatNumber(stats.totalMembers),
      icon: Users,
      color: 'bg-indigo-500',
      change: `+${stats.newMembersThisMonth} в этом месяце`
    },
    {
      name: 'Месячная выручка',
      value: formatCurrency(stats.monthlyRevenue),
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: `+${stats.revenueGrowthPercent}% с прошлого месяца`
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="bg-gray-200 p-3 rounded-lg animate-pulse">
                  <div className="h-6 w-6"></div>
                </div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-10 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Панель управления</h1>
        <p className="text-gray-600">
          Добро пожаловать{currentUser?.first_name ? `, ${currentUser.first_name}` : ''}! Вот что происходит в вашем центре.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.name} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{card.name}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500 mt-1">{card.change}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Последняя активность */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Последняя активность</h3>
          <div className="space-y-4">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600">{activity.message}</p>
                    {activity.amount && (
                      <p className="text-xs text-green-600 font-medium">
                        {formatCurrency(activity.amount)}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Активность не найдена</p>
              </div>
            )}
          </div>
        </div>

        {/* Предстоящие мероприятия */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Предстоящие мероприятия</h3>
          <div className="space-y-4">
            {stats.upcomingEvents.length > 0 ? (
              stats.upcomingEvents.map((event, index) => (
                <div key={index} className="border-l-4 border-purple-500 pl-4 py-2">
                  <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{formatDate(event.date)}</p>
                  <p className="text-xs text-gray-500 mt-1">Участники: {event.participants}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Предстоящих мероприятий нет</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      {currentUser?.role === 'admin' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Быстрые действия</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-900 mb-2">Новое занятие</h4>
              <p className="text-sm text-blue-700">Запланируйте занятие с клиентом</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h4 className="font-medium text-green-900 mb-2">Добавить лошадь</h4>
              <p className="text-sm text-green-700">Внесите новую лошадь в систему</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h4 className="font-medium text-purple-900 mb-2">Создать мероприятие</h4>
              <p className="text-sm text-purple-700">Организуйте новое мероприятие</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard