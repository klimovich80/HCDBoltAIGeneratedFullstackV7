import React from 'react'
import { X, Calendar, Clock, User, Users as Horse, DollarSign, FileText } from 'lucide-react'

interface Lesson {
  _id: string
  title: string
  description?: string
  instructor: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
  }
  horse?: {
    name: string
    breed: string
    age?: number
  }
  member: {
    firstName: string
    lastName: string
    email?: string
    phone?: string
  }
  scheduled_date: string
  duration_minutes: number
  lesson_type: 'private' | 'group' | 'training'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  cost: number
  payment_status: 'pending' | 'paid' | 'overdue'
  notes?: string
  createdAt?: string
  updatedAt?: string
}

interface LessonDetailProps {
  isOpen: boolean
  onClose: () => void
  lesson: Lesson | null
}

const LessonDetail: React.FC<LessonDetailProps> = ({ isOpen, onClose, lesson }) => {
  if (!isOpen || !lesson) return null

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

  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'private': return 'Индивидуальное'
      case 'group': return 'Групповое'
      case 'training': return 'Тренировка'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Запланировано'
      case 'completed': return 'Завершено'
      case 'cancelled': return 'Отменено'
      case 'no_show': return 'Не явился'
      default: return status
    }
  }

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачено'
      case 'pending': return 'Ожидает оплаты'
      case 'overdue': return 'Просрочено'
      default: return status
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано'
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const { date, time } = formatDateTime(lesson.scheduled_date)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
              <p className="text-gray-600">{getLessonTypeLabel(lesson.lesson_type)} • {date}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Lesson Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о занятии</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Тип занятия:</span>
                    <span className="font-medium">{getLessonTypeLabel(lesson.lesson_type)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Дата:</span>
                    <span className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {date}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Время:</span>
                    <span className="font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {time}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Продолжительность:</span>
                    <span className="font-medium">{lesson.duration_minutes} минут</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Статус:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lesson.status)}`}>
                      {getStatusLabel(lesson.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Participants */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Участники</h3>
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Инструктор
                    </h4>
                    <div className="space-y-1">
                      <p className="text-gray-700">{lesson.instructor.firstName} {lesson.instructor.lastName}</p>
                      {lesson.instructor.email && (
                        <p className="text-sm text-gray-600">{lesson.instructor.email}</p>
                      )}
                      {lesson.instructor.phone && (
                        <p className="text-sm text-gray-600">{lesson.instructor.phone}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Участник
                    </h4>
                    <div className="space-y-1">
                      <p className="text-gray-700">{lesson.member.firstName} {lesson.member.lastName}</p>
                      {lesson.member.email && (
                        <p className="text-sm text-gray-600">{lesson.member.email}</p>
                      )}
                      {lesson.member.phone && (
                        <p className="text-sm text-gray-600">{lesson.member.phone}</p>
                      )}
                    </div>
                  </div>

                  {lesson.horse && (
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Horse className="h-4 w-4 mr-2" />
                        Лошадь
                      </h4>
                      <div className="space-y-1">
                        <p className="text-gray-700">{lesson.horse.name}</p>
                        <p className="text-sm text-gray-600">{lesson.horse.breed}</p>
                        {lesson.horse.age && (
                          <p className="text-sm text-gray-600">{lesson.horse.age} лет</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment and Notes */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Оплата</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Стоимость:</span>
                    <span className="text-2xl font-bold text-gray-900 flex items-center">
                      <DollarSign className="h-5 w-5 mr-1" />
                      {lesson.cost.toLocaleString()}₽
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Статус оплаты:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(lesson.payment_status)}`}>
                      {getPaymentStatusLabel(lesson.payment_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {lesson.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Описание
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{lesson.description}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {lesson.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Заметки
                  </h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{lesson.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with timestamps */}
          {(lesson.createdAt || lesson.updatedAt) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-500">
                {lesson.createdAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Создано: {formatDate(lesson.createdAt)}
                  </div>
                )}
                {lesson.updatedAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Обновлено: {formatDate(lesson.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LessonDetail