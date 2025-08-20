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

interface StatCard {
  name: string
  value: string | number
  icon: React.ComponentType<any>
  color: string
  change: string
}

const defaultStats: Stats = {
  totalHorses: 24,
  upcomingLessons: 18,
  activeEvents: 3,
  pendingPayments: 7,
  totalMembers: 156,
  monthlyRevenue: 12450
}

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

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setError('')
        const response = await apiClient.get<Stats>('/stats/dashboard')
        if (response.success && response.data) {
          setStats(response.data)
        } else {
          setStats(defaultStats)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        setError('Ошибка при загрузке данных')
        setStats(defaultStats)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards: StatCard[] = [
    {
      name: 'Всего лошадей',
      value: formatNumber(stats.totalHorses),
      icon: Horse,
      color: 'bg-blue-500',
      change: '+2 в этом месяце'
    },
    {
      name: 'Предстоящие занятия',
      value: formatNumber(stats.upcomingLessons),
      icon: Calendar,
      color: 'bg-green-500',
      change: '+5 на этой неделе'
    },
    {
      name: 'Активные мероприятия',
      value: formatNumber(stats.activeEvents),
      icon: Trophy,
      color: 'bg-purple-500',
      change: '2 предстоящих'
    },
    {
      name: 'Ожидающие платежи',
      value: formatNumber(stats.pendingPayments),
      icon: CreditCard,
      color: 'bg-yellow-500',
      change: '2 340₽ всего'
    },
    {
      name: 'Всего участников',
      value: formatNumber(stats.totalMembers),
      icon: Users,
      color: 'bg-indigo-500',
      change: '+12 в этом месяце'
    },
    {
      name: 'Месячная выручка',
      value: formatCurrency(stats.monthlyRevenue),
      icon: TrendingUp,
      color: 'bg-emerald-500',
      change: '+8,2% с прошлого месяца'
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
        <p className="text-gray-600">Добро пожаловать! Вот что происходит в вашем центре.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

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

      {/* Остальной код без изменений */}
    </div>
  )
}

export default Dashboard