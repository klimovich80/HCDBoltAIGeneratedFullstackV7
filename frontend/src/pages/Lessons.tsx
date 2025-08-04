import React, { useState, useEffect } from 'react'
import { Search, Plus, Calendar, Clock, User } from 'lucide-react'
import { apiClient } from '../lib/api'

interface Lesson {
  _id: string
  title: string
  instructor: {
    firstName: string
    lastName: string
  }
  horse?: {
    name: string
    breed: string
  }
  member: {
    firstName: string
    lastName: string
  }
  scheduledDate: string
  durationMinutes: number
  lessonType: 'private' | 'group' | 'training'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  cost: number
  paymentStatus: 'pending' | 'paid' | 'overdue'
}

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchLessons = () => {
      apiClient.getAll<{ success: boolean; data: Lesson[] }>('lessons')
        .then(response => {
          if (response.success) {
            setLessons(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch lessons:', error)
          // Устанавливаем демо данные для разработки
          setLessons([
            {
              _id: '1',
              title: 'Beginner Riding Lesson',
              instructor: { firstName: 'Sarah', lastName: 'Johnson' },
              horse: { name: 'Spirit', breed: 'Mustang' },
              member: { firstName: 'Emma', lastName: 'Williams' },
              scheduledDate: '2024-12-20T10:00:00Z',
              durationMinutes: 60,
              lessonType: 'private',
              status: 'scheduled',
              cost: 85,
              paymentStatus: 'pending'
            },
            {
              _id: '2',
              title: 'Advanced Dressage',
              instructor: { firstName: 'Michael', lastName: 'Chen' },
              horse: { name: 'Thunder', breed: 'Thoroughbred' },
              member: { firstName: 'Sophie', lastName: 'Davis' },
              scheduledDate: '2024-12-20T14:00:00Z',
              durationMinutes: 90,
              lessonType: 'private',
              status: 'scheduled',
              cost: 120,
              paymentStatus: 'paid'
            },
            {
              _id: '3',
              title: 'Group Trail Ride',
              instructor: { firstName: 'Sarah', lastName: 'Johnson' },
              horse: { name: 'Star', breed: 'Quarter Horse' },
              member: { firstName: 'James', lastName: 'Brown' },
              scheduledDate: '2024-12-21T09:00:00Z',
              durationMinutes: 120,
              lessonType: 'group',
              status: 'scheduled',
              cost: 65,
              paymentStatus: 'pending'
            }
          ])
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchLessons()
  }, [])

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.member.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Занятия</h1>
          <p className="text-gray-600">Управляйте расписанием занятий и бронированием</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Запланировать занятие</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск занятий..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Занятие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Расписание
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Участники
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Лошадь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Оплата
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLessons.map((lesson) => (
                <tr key={lesson._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lesson.title}</div>
                      <div className="text-sm text-gray-500 capitalize">
                        {lesson.lessonType === 'private' ? 'индивидуальное' : lesson.lessonType === 'group' ? 'групповое' : 'тренировка'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{formatDate(lesson.scheduledDate)}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(lesson.scheduledDate)} ({lesson.durationMinutes} мин)
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {lesson.member.firstName} {lesson.member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        Инструктор: {lesson.instructor.firstName} {lesson.instructor.lastName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {lesson.horse ? (
                      <div>
                        <div className="text-sm text-gray-900">{lesson.horse.name}</div>
                        <div className="text-sm text-gray-500">{lesson.horse.breed}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Не назначена</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lesson.status)}`}>
                      {lesson.status === 'scheduled' ? 'запланировано' : lesson.status === 'completed' ? 'завершено' : lesson.status === 'cancelled' ? 'отменено' : 'не явился'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lesson.cost}₽</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(lesson.paymentStatus)}`}>
                        {lesson.paymentStatus === 'paid' ? 'оплачено' : lesson.paymentStatus === 'pending' ? 'ожидает' : 'просрочено'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Lessons