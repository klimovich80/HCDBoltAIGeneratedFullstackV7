import React from 'react'
import { X, Calendar, Clock, User, Users as Horse, DollarSign, FileText } from 'lucide-react'

// Интерфейс для урока
interface Lesson {
  _id: string
  title: string
  description?: string
  instructor: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  horse?: {
    name: string
    breed: string
    age?: number
  }
  member: {
    first_name: string
    last_name: string
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

// Интерфейс для пропсов компонента
interface LessonDetailProps {
  isOpen: boolean
  onClose: () => void
  lesson: Lesson | null
}

const LessonDetail: React.FC<LessonDetailProps> = ({ isOpen, onClose, lesson }) => {
  // Не отображать компонент, если он закрыт или урок не передан
  if (!isOpen || !lesson) return null

  // Функция для получения цвета статуса урока
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Функция для получения цвета статуса оплаты
  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Функция для получения текстового представления типа урока
  const getLessonTypeLabel = (type: string) => {
    switch (type) {
      case 'private': return 'Индивидуальное'
      case 'group': return 'Групповое'
      case 'training': return 'Тренировка'
      default: return type
    }
  }

  // Функция для получения текстового представления статуса урока
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Запланировано'
      case 'completed': return 'Завершено'
      case 'cancelled': return 'Отменено'
      case 'no_show': return 'Не явился'
      default: return status
    }
  }

  // Функция для получения текстового представления статуса оплаты
  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачено'
      case 'pending': return 'Ожидает оплаты'
      case 'overdue': return 'Просрочено'
      default: return status
    }
  }

  // Функция для форматирования даты и времени урока
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

  // Функция для форматирования даты создания/обновления
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

  // Форматирование даты и времени урока для отображения
  const { date, time } = formatDateTime(lesson.scheduled_date)

  return (
    // Модальное окно с затемненным фоном
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Основной контейнер модального окна */}
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Шапка модального окна с заголовком и кнопкой закрытия */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {/* Иконка календаря */}
            <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            {/* Заголовок и тип урока с датой */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{lesson.title}</h2>
              <p className="text-gray-600">{getLessonTypeLabel(lesson.lesson_type)} • {date}</p>
            </div>
          </div>
          {/* Кнопка закрытия модального окна */}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Основное содержимое модального окна */}
        <div className="p-6">
          {/* Сетка с двумя колонками для информации */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Левая колонка - информация о занятии и участниках */}
            <div className="space-y-6">
              {/* Блок информации о занятии */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о занятии</h3>
                <div className="space-y-3">
                  {/* Тип занятия */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Тип занятия:</span>
                    <span className="font-medium">{getLessonTypeLabel(lesson.lesson_type)}</span>
                  </div>
                  {/* Дата занятия */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Дата:</span>
                    <span className="font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {date}
                    </span>
                  </div>
                  {/* Время занятия */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Время:</span>
                    <span className="font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {time}
                    </span>
                  </div>
                  {/* Продолжительность занятия */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Продолжительность:</span>
                    <span className="font-medium">{lesson.duration_minutes} минут</span>
                  </div>
                  {/* Статус занятия */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Статус:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lesson.status)}`}>
                      {getStatusLabel(lesson.status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Блок участников */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Участники</h3>
                <div className="space-y-4">
                  {/* Карточка инструктора */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Инструктор
                    </h4>
                    <div className="space-y-1">
                      <p className="text-gray-700">{lesson.instructor.first_name} {lesson.instructor.last_name}</p>
                      {lesson.instructor.email && (
                        <p className="text-sm text-gray-600">{lesson.instructor.email}</p>
                      )}
                      {lesson.instructor.phone && (
                        <p className="text-sm text-gray-600">{lesson.instructor.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Карточка участника */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Участник
                    </h4>
                    <div className="space-y-1">
                      <p className="text-gray-700">{lesson.member.first_name} {lesson.member.last_name}</p>
                      {lesson.member.email && (
                        <p className="text-sm text-gray-600">{lesson.member.email}</p>
                      )}
                      {lesson.member.phone && (
                        <p className="text-sm text-gray-600">{lesson.member.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Карточка лошади (если назначена) */}
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

            {/* Правая колонка - оплата и заметки */}
            <div className="space-y-6">
              {/* Блок оплаты */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Оплата</h3>
                <div className="space-y-3">
                  {/* Стоимость занятия */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Стоимость:</span>
                    <span className="text-2xl font-bold text-gray-900 flex items-center">
                      <DollarSign className="h-5 w-5 mr-1" />
                      {lesson.cost.toLocaleString()}₽
                    </span>
                  </div>
                  {/* Статус оплаты */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Статус оплаты:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(lesson.payment_status)}`}>
                      {getPaymentStatusLabel(lesson.payment_status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Описание занятия (если есть) */}
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

              {/* Заметки (если есть) */}
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

          {/* Футер с датами создания и обновления (если есть) */}
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