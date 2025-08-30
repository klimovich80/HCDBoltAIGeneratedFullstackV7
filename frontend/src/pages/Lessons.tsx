import React, { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Calendar, Clock, User, Edit, Eye, Trash2, Archive, RotateCcw, Filter, Download } from 'lucide-react'
import { apiClient } from '../lib/api'
import LessonForm from '../components/LessonForm'
import LessonDetail from '../components/LessonDetail'
import {
  Lesson,
  LessonStatus,
  PaymentStatus
} from '../types/index'
import {
  exportToCSV,
  prepareLessonsForExport
} from '../utils/exportUtils'
import {
  Button,
  Input,
  Select,
  Card
} from '../components/ui/index'
import{cn} from '../styles/constants'
import { useStyles } from '../hooks/useStyles'

/**
 * Компонент для управления занятиями
 * Отображает список занятий с возможностью фильтрации, поиска и действий
 */
const Lessons: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<LessonStatus | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'all'>('all')
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
  const [showEditForm, setShowEditForm] = useState<boolean>(false)
  const [viewingLesson, setViewingLesson] = useState<Lesson | null>(null)
  const [showDetailView, setShowDetailView] = useState<boolean>(false)
  const [showArchived, setShowArchived] = useState<boolean>(false)
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())
  const styles = useStyles()

  /**
   * Преобразует данные из API в правильный формат
   * @param data Данные из API
   * @returns Массив уроков
   */
  const transformLessonsData = useCallback((data: unknown): Lesson[] => {
    if (!data) return []
    
    if (typeof data === 'object' && 'data' in (data as any)) {
      const apiData = (data as any).data
      return Array.isArray(apiData) ? apiData as Lesson[] : [apiData as Lesson]
    }
    
    if (Array.isArray(data)) {
      if (data.length > 0 && Array.isArray(data[0])) {
        return ([] as Lesson[]).concat(...data)
      }
      return data as Lesson[]
    }
    
    return [data as Lesson]
  }, [])

  /**
   * Загружает уроки с сервера
   */
  const fetchLessons = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const response = await apiClient.getAll<Lesson[]>('lessons')
      
      if (response.success && response.data) {
        const lessonsData = transformLessonsData(response.data)
        setLessons(lessonsData)
      } else {
        setError('Не удалось загрузить занятия')
        setLessons([])
      }
    } catch (error: unknown) {
      console.error('Ошибка загрузки занятий:', error)
      setError('Произошла ошибка при загрузке занятий')
      setLessons([])
    } finally {
      setLoading(false)
    }
  }, [transformLessonsData])

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchLessons()
  }, [fetchLessons])

  // Фильтрация уроков при изменении параметров
  useEffect(() => {
    const filtered = lessons.filter(lesson => {
      const matchesSearch = 
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (lesson.horse && lesson.horse.name.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || lesson.status === statusFilter
      const matchesPayment = paymentFilter === 'all' || lesson.payment_status === paymentFilter
      const matchesArchive = showArchived ? true : lesson.isActive !== false
      
      return matchesSearch && matchesStatus && matchesPayment && matchesArchive
    })
    
    setFilteredLessons(filtered)
  }, [lessons, searchTerm, statusFilter, paymentFilter, showArchived])

  /**
   * Обработчик успешного добавления урока
   */
  const handleAddSuccess = useCallback((): void => {
    setShowAddForm(false)
    fetchLessons()
  }, [fetchLessons])

  /**
   * Обработчик выбора урока для редактирования
   * @param lesson Урок для редактирования
   */
  const handleEditLesson = useCallback((lesson: Lesson): void => {
    setEditingLesson(lesson)
    setShowEditForm(true)
  }, [])

  /**
   * Обработчик успешного редактирования урока
   */
  const handleEditSuccess = useCallback((): void => {
    setShowEditForm(false)
    setEditingLesson(null)
    fetchLessons()
  }, [fetchLessons])

  /**
   * Обработчик закрытия формы редактирования
   */
  const handleCloseEditForm = useCallback((): void => {
    setShowEditForm(false)
    setEditingLesson(null)
  }, [])

  /**
   * Обработчик просмотра деталей урока
   * @param lesson Урок для просмотра
   */
  const handleViewLesson = useCallback((lesson: Lesson): void => {
    setViewingLesson(lesson)
    setShowDetailView(true)
  }, [])

  /**
   * Обработчик закрытия просмотра деталей урока
   */
  const handleCloseDetailView = useCallback((): void => {
    setShowDetailView(false)
    setViewingLesson(null)
  }, [])

  /**
   * Обработчик удаления урока
   * @param lesson Урок для удаления
   */
  const handleDeleteLesson = useCallback(async (lesson: Lesson): Promise<void> => {
    if (window.confirm(`Вы уверены, что хотите удалить занятие "${lesson.title}"? Это действие нельзя отменить.`)) {
      try {
        await apiClient.delete<Lesson>('lessons', lesson._id)
        // Оптимистическое обновление
        setLessons(prev => prev.filter(l => l._id !== lesson._id))
      } catch (error: unknown) {
        console.error('Ошибка удаления занятия:', error)
        alert('Ошибка при удалении занятия')
        fetchLessons()
      }
    }
  }, [fetchLessons])

  /**
   * Обработчик архивирования/восстановления урока
   * @param lesson Урок для архивирования/восстановления
   */
  const handleArchiveLesson = useCallback(async (lesson: Lesson): Promise<void> => {
    if (window.confirm(`Вы уверены, что хотите ${lesson.isActive ? 'архивировать' : 'восстановить'} занятие "${lesson.title}"?`)) {
      try {
        await apiClient.update<Lesson>('lessons', lesson._id, { isActive: !lesson.isActive })
        // Оптимистическое обновление
        setLessons(prev => prev.map(l => 
          l._id === lesson._id ? { ...l, isActive: !l.isActive } : l
        ))
      } catch (error: unknown) {
        console.error('Ошибка архивирования/восстановления занятия:', error)
        alert('Ошибка при архивировании/восстановлении занятия')
        fetchLessons()
      }
    }
  }, [])

  /**
   * Обработчик выбора строки таблицы
   * @param id ID урока
   */
  const handleSelectRow = useCallback((id: string): void => {
    setSelectedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }, [])

  /**
   * Обработчик выбора всех строк таблицы
   */
  const handleSelectAll = useCallback((): void => {
    if (selectedRows.size === filteredLessons.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(filteredLessons.map(l => l._id)))
    }
  }, [filteredLessons, selectedRows.size])

  /**
   * Обработчик массового архивирования/восстановления
   */
  const handleBulkArchive = useCallback(async (): Promise<void> => {
    if (selectedRows.size === 0) return
    
    const action = showArchived ? 'восстановить' : 'архивировать'
    if (window.confirm(`Вы уверены, что хотите ${action} ${selectedRows.size} занятий?`)) {
      try {
        const promises = Array.from(selectedRows).map(id => 
          apiClient.update<Lesson>('lessons', id, { isActive: showArchived })
        )
        
        await Promise.all(promises)
        
        // Оптимистическое обновление
        setLessons(prev => prev.map(l => 
          selectedRows.has(l._id) ? { ...l, isActive: showArchived } : l
        ))
        
        setSelectedRows(new Set())
      } catch (error: unknown) {
        console.error('Ошибка массового архивирования:', error)
        alert(`Ошибка при ${action}ии занятий`)
        fetchLessons()
      }
    }
  }, [selectedRows, showArchived, fetchLessons])

  /**
   * Обработчик экспорта данных
   */
  const handleExport = useCallback((): void => {
    const dataToExport = prepareLessonsForExport(filteredLessons)
    exportToCSV(dataToExport, 'занятия')
  }, [filteredLessons])

  /**
   * Возвращает цвет статуса урока
   * @param status Статус урока
   * @returns CSS классы для цвета статуса
   */
  const getStatusColor = useCallback((status: LessonStatus): string => {
    switch (status) {
      case 'scheduled': return styles.badge('info')
      case 'completed': return styles.badge('success')
      case 'cancelled': return styles.badge('error')
      case 'no_show': return styles.badge('warning')
      default: return styles.badge('neutral')
    }
  }, [styles])

  /**
   * Возвращает цвет статуса оплаты
   * @param status Статус оплаты
   * @returns CSS классы для цвета статуса оплаты
   */
  const getPaymentStatusColor = useCallback((status: PaymentStatus): string => {
    switch (status) {
      case 'paid': return styles.badge('success')
      case 'pending': return styles.badge('warning')
      case 'overdue': return styles.badge('error')
      default: return styles.badge('neutral')
    }
  }, [styles])

  /**
   * Форматирует дату для отображения
   * @param dateString Строка с датой
   * @returns Отформатированная дата
   */
  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }, [])

  /**
   * Форматирует время для отображения
   * @param dateString Строка с датой
   * @returns Отформатированное время
   */
  const formatTime = useCallback((dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }, [])

  // Отображение загрузки
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
        <Button
          onClick={() => setShowAddForm(true)}
          variant="primary"
          icon={Plus}
        >
          Запланировать занятие
        </Button>
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <div className={styles.alert('error')}>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card>
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Поиск занятий..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as LessonStatus | 'all')}
                  options={[
                    { value: 'all', label: 'Все статусы' },
                    { value: 'scheduled', label: 'Запланировано' },
                    { value: 'completed', label: 'Завершено' },
                    { value: 'cancelled', label: 'Отменено' },
                    { value: 'no_show', label: 'Не явился' }
                  ]}
                />
                
                <Select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as PaymentStatus | 'all')}
                  options={[
                    { value: 'all', label: 'Все оплаты' },
                    { value: 'paid', label: 'Оплачено' },
                    { value: 'pending', label: 'Ожидает оплаты' },
                    { value: 'overdue', label: 'Просрочено' }
                  ]}
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
                
                <Button
                  onClick={handleExport}
                  variant="ghost"
                  icon={Download}
                  size="sm"
                >
                  Экспорт
                </Button>
              </div>
            </div>
          </div>
          
          {/* Массовые операции */}
          {selectedRows.size > 0 && (
            <div className="mt-4 flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Выбрано: {selectedRows.size}
              </span>
              <Button
                onClick={handleBulkArchive}
                variant="outline"
                size="sm"
              >
                {showArchived ? 'Восстановить выбранное' : 'Архивировать выбранное'}
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className={styles.table()}>
            <thead className={styles.tableHead()}>
              <tr>
                <th className={cn(styles.tableHeader(), 'w-8')}>
                  <input
                    type="checkbox"
                    checked={selectedRows.size === filteredLessons.length && filteredLessons.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </th>
                <th className={styles.tableHeader()}>Занятие</th>
                <th className={styles.tableHeader()}>Расписание</th>
                <th className={styles.tableHeader()}>Участники</th>
                <th className={styles.tableHeader()}>Лошадь</th>
                <th className={styles.tableHeader()}>Статус</th>
                <th className={styles.tableHeader()}>Оплата</th>
                <th className={styles.tableHeader()}>Действия</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLessons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    {lessons.length === 0 ? 'Нет занятий' : 'Ничего не найдено'}
                  </td>
                </tr>
              ) : (
                filteredLessons.map((lesson) => (
                  <tr key={lesson._id} className={cn(styles.tableRow(), lesson.isActive === false ? 'opacity-60 bg-gray-50' : '')}>
                    <td className={cn(styles.tableCell(), 'whitespace-nowrap')}>
                      <input
                        type="checkbox"
                        checked={selectedRows.has(lesson._id)}
                        onChange={() => handleSelectRow(lesson._id)}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className={cn(styles.tableCell(), 'whitespace-nowrap')}>
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
                    <td className={cn(styles.tableCell(), 'whitespace-nowrap')}>
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
                    <td className={cn(styles.tableCell(), 'whitespace-nowrap')}>
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
                    <td className={cn(styles.tableCell(), 'whitespace-nowrap')}>
                      {lesson.horse ? (
                        <div>
                          <div className="text-sm text-gray-900">{lesson.horse.name}</div>
                          <div className="text-sm text-gray-500">{lesson.horse.breed}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Не назначена</span>
                      )}
                    </td>
                    <td className={cn(styles.tableCell(), 'whitespace-nowrap')}>
                      <span className={getStatusColor(lesson.status as LessonStatus)}>
                        {lesson.status === 'scheduled' ? 'запланировано' :
                          lesson.status === 'completed' ? 'завершено' :
                            lesson.status === 'cancelled' ? 'отменено' : 'не явился'}
                      </span>
                    </td>
                    <td className={cn(styles.tableCell(), 'whitespace-nowrap')}>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lesson.cost}₽</div>
                        <span className={getPaymentStatusColor(lesson.payment_status as PaymentStatus)}>
                          {lesson.payment_status === 'paid' ? 'оплачено' :
                            lesson.payment_status === 'pending' ? 'ожидает' : 'просрочено'}
                        </span>
                      </div>
                    </td>
                    <td className={cn(styles.tableCell(), 'whitespace-nowrap text-sm font-medium')}>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => handleViewLesson(lesson)}
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                          title="Просмотр информации о занятии"
                        />
                        <Button
                          onClick={() => handleEditLesson(lesson)}
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          title="Редактировать занятие"
                        />
                        <Button
                          onClick={() => handleArchiveLesson(lesson)}
                          variant="ghost"
                          size="sm"
                          icon={lesson.isActive === false ? RotateCcw : Archive}
                          title={lesson.isActive === false ? 'Восстановить занятие' : 'Архивировать занятие'}
                        />
                        <Button
                          onClick={() => handleDeleteLesson(lesson)}
                          variant="ghost"
                          size="sm"
                          icon={Trash2}
                          title="Удалить занятие"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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

export default React.memo(Lessons)