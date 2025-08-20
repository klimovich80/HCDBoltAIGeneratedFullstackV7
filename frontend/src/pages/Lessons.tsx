import React, { useState, useEffect } from 'react'
import { Search, Plus, Calendar, Clock, User, Edit, Eye, Trash2, Archive, RotateCcw } from 'lucide-react'
import { apiClient } from '../lib/api'
import LessonForm from '../components/LessonForm'
import LessonDetail from '../components/LessonDetail'

// Унифицированный интерфейс Lesson (совместимый с LessonForm и LessonDetail)
interface Lesson {
  _id: string
  title: string
  description?: string
  instructor: {
    _id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  horse?: {
    _id: string
    name: string
    breed: string
    age?: number
  }
  member: {
    _id: string
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
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

// Типы для статусов
type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'
type PaymentStatus = 'pending' | 'paid' | 'overdue'

const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [showEditForm, setShowEditForm] = useState<boolean>(false)
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null)
  const [showDetailView, setShowDetailView] = useState<boolean>(false)
  const [showArchived, setShowArchived] = useState<boolean>(false)

  // Функция для преобразования данных из API в правильный формат
  const transformLessonsData = (data: unknown): Lesson[] => {
    if (!data) return [];
    
    // Если это двумерный массив, объединяем его в одномерный
    if (Array.isArray(data) && data.length > 0 && Array.isArray(data[0])) {
      return ([] as Lesson[]).concat(...data);
    }
    
    // Если это уже одномерный массив
    if (Array.isArray(data)) {
      return data;
    }
    
    // Если это одиночный объект
    return [data] as Lesson[];
  };

  useEffect(() => {
    const fetchLessons = async (): Promise<void> => {
      try {
        const response = await apiClient.getAll<Lesson[]>('lessons')
        if (response.success && response.data) {
          const lessonsData = transformLessonsData(response.data);
          setLessons(lessonsData);
        } else {
          setLessons([])
        }
      } catch (error: unknown) {
        console.error('Failed to fetch lessons:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  const handleAddSuccess = async (): Promise<void> => {
    try {
      const response = await apiClient.getAll<Lesson[]>('lessons')
      if (response.success && response.data) {
        const lessonsData = transformLessonsData(response.data);
        setLessons(lessonsData);
      }
    } catch (error: unknown) {
      console.error('Failed to fetch lessons:', error)
    }
  }

  const handleEditLesson = (lesson: Lesson): void => {
    setEditingLesson(lesson)
    setShowEditForm(true)
  }

  const handleEditSuccess = async (): Promise<void> => {
    try {
      const response = await apiClient.getAll<Lesson[]>('lessons')
      if (response.success && response.data) {
        const lessonsData = transformLessonsData(response.data);
        setLessons(lessonsData);
      }
      setEditingLesson(null)
    } catch (error: unknown) {
      console.error('Failed to fetch lessons:', error)
    }
  }

  const handleCloseEditForm = (): void => {
    setShowEditForm(false)
    setEditingLesson(null)
  }

  const handleViewLesson = (lesson: Lesson): void => {
    setViewingLesson(lesson)
    setShowDetailView(true)
  }

  const handleCloseDetailView = (): void => {
    setShowDetailView(false)
    setViewingLesson(null)
  }

  const handleDeleteLesson = async (lesson: Lesson): Promise<void> => {
    if (window.confirm(`Вы уверены, что хотите удалить занятие "${lesson.title}"? Это действие нельзя отменить.`)) {
      try {
        await apiClient.delete<Lesson>('lessons', lesson._id)
        const response = await apiClient.getAll<Lesson[]>('lessons')
        if (response.success && response.data) {
          const lessonsData = transformLessonsData(response.data);
          setLessons(lessonsData);
        }
      } catch (error: unknown) {
        console.error('Failed to delete lesson:', error)
        alert('Ошибка при удалении занятия')
      }
    }
  }

  const handleArchiveLesson = async (lesson: Lesson): Promise<void> => {
    if (window.confirm(`Вы уверены, что хотите ${lesson.isActive ? 'архивировать' : 'восстановить'} занятие "${lesson.title}"?`)) {
      try {
        await apiClient.update<Lesson>('lessons', lesson._id, { isActive: !lesson.isActive })
        const response = await apiClient.getAll<Lesson[]>('lessons')
        if (response.success && response.data) {
          const lessonsData = transformLessonsData(response.data);
          setLessons(lessonsData);
        }
      } catch (error: unknown) {
        console.error('Failed to archive/restore lesson:', error)
        alert('Ошибка при архивировании/восстановлении занятия')
      }
    }
  }

  const filteredLessons = lessons.filter(lesson =>
    lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lesson.member.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )
    .filter(lesson => showArchived ? true : lesson.isActive !== false)

  const getStatusColor = (status: LessonStatus): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'no_show': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus): string => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
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
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Запланировать занятие</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
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
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Показать архивированные</span>
              </label>
            </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLessons.map((lesson) => (
                <tr key={lesson._id} className={`hover:bg-gray-50 ${lesson.isActive === false ? 'opacity-60 bg-gray-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {lesson.title}
                        {lesson.isActive === false && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Архивировано
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {lesson.lesson_type === 'private' ? 'индивидуальное' : lesson.lesson_type === 'group' ? 'групповое' : 'тренировка'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-900">{formatDate(lesson.scheduled_date)}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(lesson.scheduled_date)} ({lesson.duration_minutes} мин)
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900 flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {lesson.member.first_name} {lesson.member.last_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Инструктор: {lesson.instructor.first_name} {lesson.instructor.last_name}
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
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lesson.status as LessonStatus)}`}>
                      {lesson.status === 'scheduled' ? 'запланировано' : lesson.status === 'completed' ? 'завершено' : lesson.status === 'cancelled' ? 'отменено' : 'не явился'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{lesson.cost}₽</div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(lesson.payment_status as PaymentStatus)}`}>
                        {lesson.payment_status === 'paid' ? 'оплачено' : lesson.payment_status === 'pending' ? 'ожидает' : 'просрочено'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewLesson(lesson)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Просмотр информации о занятии"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEditLesson(lesson)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Редактировать занятие"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleArchiveLesson(lesson)}
                        className={`${lesson.isActive === false ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'}`}
                        title={lesson.isActive === false ? 'Восстановить занятие' : 'Архивировать занятие'}
                      >
                        {lesson.isActive === false ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson)}
                        className="text-red-600 hover:text-red-900"
                        title="Удалить занятие"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <LessonForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
        mode="create"
      />

      <LessonForm
        isOpen={showEditForm}
        onClose={handleCloseEditForm}
        onSuccess={handleEditSuccess}
        lesson={editingLesson}
        mode="edit"
      />

      <LessonDetail
        isOpen={showDetailView}
        onClose={handleCloseDetailView}
        lesson={viewingLesson}
      />
    </div>
  )
}

export default Lessons