import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '../lib/api'

// Интерфейсы для типов данных
interface ApiErrorResponse {
  message?: string;
  success?: boolean;
  errors?: string[];
}

interface ExtendedError extends Error {
  response?: Response & {
    data?: ApiErrorResponse;
  };
}
interface LessonFormData {
  title: string
  description?: string
  instructor_id: string
  horse_id?: string
  member_id: string
  scheduled_date: string
  duration_minutes: number
  lesson_type: 'private' | 'group' | 'training'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  cost: number
  payment_status: 'pending' | 'paid' | 'overdue'
  notes?: string
}

interface LessonFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lesson?: Lesson | null
  mode?: 'create' | 'edit'
}

interface Lesson {
  _id: string
  title: string
  description?: string
  instructor: {
    _id: string
    first_name: string
    last_name: string
  }
  horse?: {
    _id: string
    name: string
    breed: string
  }
  member: {
    _id: string
    first_name: string
    last_name: string
  }
  scheduled_date: string
  duration_minutes: number
  lesson_type: 'private' | 'group' | 'training'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  cost: number
  payment_status: 'pending' | 'paid' | 'overdue'
  notes?: string
}

interface User {
  _id: string
  first_name: string
  last_name: string
  role: string
}

interface Horse {
  _id: string
  name: string
  breed: string
}

const LessonForm: React.FC<LessonFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  lesson = null,
  mode = 'create'
}) => {
  // Состояние для данных формы
  const [formData, setFormData] = useState<LessonFormData>({
    title: '',
    description: '',
    instructor_id: '',
    horse_id: '',
    member_id: '',
    scheduled_date: '',
    duration_minutes: 60,
    lesson_type: 'private',
    status: 'scheduled',
    cost: 0,
    payment_status: 'pending',
    notes: ''
  })
  
  // Состояния для загрузки и ошибок
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  
  // Состояния для списков данных
  const [instructors, setInstructors] = useState<User[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [horses, setHorses] = useState<Horse[]>([])
  const [loadingData, setLoadingData] = useState<boolean>(true)

  // Эффект для загрузки данных инструкторов, участников и лошадей
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoadingData(true)

        // Загрузка инструкторов (тренеров)
        const instructorsResponse = await apiClient.getAll<User>('users', { role: 'trainer' })
        if (instructorsResponse.success && instructorsResponse.data) {
          setInstructors(instructorsResponse.data)
        }

        // Загрузка участников
        const membersResponse = await apiClient.getAll<User>('users', { role: 'member' })
        if (membersResponse.success && membersResponse.data) {
          setMembers(membersResponse.data)
        }

        // Загрузка лошадей
        const horsesResponse = await apiClient.getAll<Horse>('horses')
        if (horsesResponse.success && horsesResponse.data) {
          setHorses(horsesResponse.data)
        }
      } catch (error) {
        console.error('Не удалось загрузить данные:', error)
        // Установка демонстрационных данных для разработки
        setInstructors([
          { _id: '1', first_name: 'Сара', last_name: 'Джонсон', role: 'trainer' },
          { _id: '2', first_name: 'Майкл', last_name: 'Чен', role: 'trainer' }
        ])
        setMembers([
          { _id: '3', first_name: 'Эмма', last_name: 'Уильямс', role: 'member' },
          { _id: '4', first_name: 'Джеймс', last_name: 'Браун', role: 'member' },
          { _id: '5', first_name: 'Софи', last_name: 'Дэвис', role: 'member' }
        ])
        setHorses([
          { _id: '1', name: 'Гром', breed: 'Т thoroughbred' },
          { _id: '2', name: 'Лунный свет', breed: 'Арабская' },
          { _id: '3', name: 'Звезда', breed: 'Квотер хорс' }
        ])
      } finally {
        setLoadingData(false)
      }
    }

    // Загрузка данных только если форма открыта
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  // Эффект для обновления данных формы при изменении урока или режима
  useEffect(() => {
    if (lesson && mode === 'edit') {
      // Форматирование даты для поля ввода datetime-local
      const scheduled_date = new Date(lesson.scheduled_date)
      const formattedDate = scheduled_date.toISOString().slice(0, 16)

      // Заполнение формы данными редактируемого урока
      setFormData({
        title: lesson.title,
        description: lesson.description || '',
        instructor_id: lesson.instructor._id,
        horse_id: lesson.horse?._id || '',
        member_id: lesson.member._id,
        scheduled_date: formattedDate,
        duration_minutes: lesson.duration_minutes,
        lesson_type: lesson.lesson_type,
        status: lesson.status,
        cost: lesson.cost,
        payment_status: lesson.payment_status,
        notes: lesson.notes || ''
      })
    } else if (mode === 'create') {
      // Сброс формы для режима создания
      // Установка даты на 1 день вперед от текущего времени
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0); // Установка времени на 10:00
      const formattedDate = futureDate.toISOString().slice(0, 16);

      setFormData({
        title: '',
        description: '',
        instructor_id: '',
        horse_id: '',
        member_id: '',
        scheduled_date: formattedDate,
        duration_minutes: 60,
        lesson_type: 'private',
        status: 'scheduled',
        cost: 0,
        payment_status: 'pending',
        notes: ''
      })
    }
  }, [lesson, mode])

  // Обработчик отправки формы
const handleSubmit = async (e: React.FormEvent): Promise<void> => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    console.log('Отправка данных формы:', formData)

    // Проверка обязательных полей
    if (!formData.title.trim()) {
      throw new Error('Название урока обязательно')
    }
    if (!formData.instructor_id) {
      throw new Error('Инструктор обязателен')
    }
    if (!formData.member_id) {
      throw new Error('Участник обязателен')
    }
    if (!formData.scheduled_date) {
      throw new Error('Дата урока обязательна')
    }

    if (mode === 'edit' && lesson) {
      await apiClient.updateLesson(lesson._id, formData)
    } else {
      await apiClient.createLesson(formData)
    }

    // Вызов колбэков при успешной отправке
    onSuccess()
    onClose()
  } catch (err: unknown) {
    // Обработка ошибок
    console.error('Ошибка отправки формы:', err)
    
    let errorMessage = 'Произошла неизвестная ошибка';
    
    if (err instanceof Error) {
      const extendedError = err as ExtendedError;
      if (extendedError.response?.data?.message) {
        errorMessage = extendedError.response.data.message;
      } else {
        errorMessage = extendedError.message;
      }
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false)
  }
}
  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'cost'
        ? parseFloat(value) || 0  // Преобразование числовых значений
        : value
    }))
  }

  // Не отображать компонент, если форма закрыта
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Заголовок формы */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Редактировать занятие' : 'Создать занятие'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Закрыть"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Индикатор загрузки или форма */}
        {loadingData ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Загрузка данных...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Отображение ошибок */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Основная сетка формы */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Название урока */}
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Название занятия *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Например: Урок выездки для начинающих"
                />
              </div>

              {/* Выбор инструктора */}
              <div>
                <label htmlFor="instructor_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Инструктор *
                </label>
                <select
                  id="instructor_id"
                  name="instructor_id"
                  required
                  value={formData.instructor_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Выберите инструктора</option>
                  {instructors.map((instructor) => (
                    <option key={instructor._id} value={instructor._id}>
                      {instructor.first_name} {instructor.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Выбор участника */}
              <div>
                <label htmlFor="member_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Участник *
                </label>
                <select
                  id="member_id"
                  name="member_id"
                  required
                  value={formData.member_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Выберите участника</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Выбор лошади */}
              <div>
                <label htmlFor="horse_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Лошадь
                </label>
                <select
                  id="horse_id"
                  name="horse_id"
                  value={formData.horse_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Выберите лошадь (необязательно)</option>
                  {horses.map((horse) => (
                    <option key={horse._id} value={horse._id}>
                      {horse.name} ({horse.breed})
                    </option>
                  ))}
                </select>
              </div>

              {/* Тип урока */}
              <div>
                <label htmlFor="lesson_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Тип занятия *
                </label>
                <select
                  id="lesson_type"
                  name="lesson_type"
                  required
                  value={formData.lesson_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="private">Индивидуальное</option>
                  <option value="group">Групповое</option>
                  <option value="training">Тренировка</option>
                </select>
              </div>

              {/* Дата и время урока */}
              <div>
                <label htmlFor="scheduled_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Дата и время *
                </label>
                <input
                  type="datetime-local"
                  id="scheduled_date"
                  name="scheduled_date"
                  required
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Продолжительность урока */}
              <div>
                <label htmlFor="duration_minutes" className="block text-sm font-medium text-gray-700 mb-2">
                  Продолжительность (минуты) *
                </label>
                <input
                  type="number"
                  id="duration_minutes"
                  name="duration_minutes"
                  required
                  min="15"
                  max="240"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Стоимость урока */}
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                  Стоимость (₽) *
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  required
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Статус урока */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="scheduled">Запланировано</option>
                  <option value="completed">Завершено</option>
                  <option value="cancelled">Отменено</option>
                  <option value="no_show">Не явился</option>
                </select>
              </div>

              {/* Статус оплаты */}
              <div>
                <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700 mb-2">
                  Статус оплаты
                </label>
                <select
                  id="payment_status"
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending">Ожидает оплаты</option>
                  <option value="paid">Оплачено</option>
                  <option value="overdue">Просрочено</option>
                </select>
              </div>
            </div>

            {/* Описание урока */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Дополнительная информация о занятии..."
              />
            </div>

            {/* Заметки */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Заметки
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Заметки инструктора, особые требования..."
              />
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? (mode === 'edit' ? 'Сохранение...' : 'Создание...')
                  : (mode === 'edit' ? 'Сохранить изменения' : 'Создать занятие')
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default LessonForm