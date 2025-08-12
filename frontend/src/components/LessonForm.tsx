import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '../lib/api'

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
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [instructors, setInstructors] = useState<User[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [horses, setHorses] = useState<Horse[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Load instructors, members, and horses
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingData(true)

        // Load instructors (trainers and admins)
        const instructorsResponse = await apiClient.getAll<{ success: boolean; data: User[] }>('users', { role: 'trainer' })
        if (instructorsResponse.success) {
          setInstructors(instructorsResponse.data)
        }

        // Load members
        const membersResponse = await apiClient.getAll<{ success: boolean; data: User[] }>('users', { role: 'member' })
        if (membersResponse.success) {
          setMembers(membersResponse.data)
        }

        // Load horses
        const horsesResponse = await apiClient.getAll<{ success: boolean; data: Horse[] }>('horses')
        if (horsesResponse.success) {
          setHorses(horsesResponse.data)
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        // Set demo data for development
        setInstructors([
          { _id: '1', first_name: 'Sarah', last_name: 'Johnson', role: 'trainer' },
          { _id: '2', first_name: 'Michael', last_name: 'Chen', role: 'trainer' }
        ])
        setMembers([
          { _id: '3', first_name: 'Emma', last_name: 'Williams', role: 'member' },
          { _id: '4', first_name: 'James', last_name: 'Brown', role: 'member' },
          { _id: '5', first_name: 'Sophie', last_name: 'Davis', role: 'member' }
        ])
        setHorses([
          { _id: '1', name: 'Thunder', breed: 'Thoroughbred' },
          { _id: '2', name: 'Moonlight', breed: 'Arabian' },
          { _id: '3', name: 'Star', breed: 'Quarter Horse' }
        ])
      } finally {
        setLoadingData(false)
      }
    }

    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  // Update form data when lesson prop changes
  useEffect(() => {
    if (lesson && mode === 'edit') {
      const scheduled_date = new Date(lesson.scheduled_date)
      const formattedDate = scheduled_date.toISOString().slice(0, 16) // Format for datetime-local input

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
      // Reset form for create mode
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset()) // Adjust for timezone

      setFormData({
        title: '',
        description: '',
        instructor_id: '',
        horse_id: '',
        member_id: '',
        scheduled_date: now.toISOString().slice(0, 16),
        duration_minutes: 60,
        lesson_type: 'private',
        status: 'scheduled',
        cost: 0,
        payment_status: 'pending',
        notes: ''
      })
    }
  }, [lesson, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    console.log('handling lesson form submit')

    try {
      // Convert datetime-local to ISO string
      const scheduled_date = new Date(formData.scheduled_date).toISOString()

      // Clean data for API
      const cleanedData = {
        ...formData,
        scheduled_date: scheduled_date,
        horse_id: formData.horse_id || undefined,
        description: formData.description || undefined,
        notes: formData.notes || undefined
      }

      if (mode === 'edit' && lesson) {
        await apiClient.update('lessons', lesson._id, cleanedData)
      } else {
        await apiClient.create('lessons', cleanedData)
      }

      onSuccess()
      onClose()
      setError('unable to send data from form')
    } catch (err: any) {
      setError(err.message || `Failed to ${mode} lesson`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'cost'
        ? parseFloat(value) || 0
        : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Редактировать занятие' : 'Создать занятие'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loadingData ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Загрузка данных...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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