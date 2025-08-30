import React, { useState, useEffect, useCallback } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '../lib/api'
import {
  Horse,
  LessonFormData,
  LessonFormProps,
  User,
  ExtendedError
} from '../types/index'
import {
  sanitizeInput,
  validateFutureDate
} from '../utils/security'
import Button from './ui/Button'
import Input from './ui/Input'
import Select from './ui/Select'
import Textarea from './ui/Textarea'
import { useStyles } from '../hooks/useStyles'

/**
 * Форма для создания и редактирования уроков
 * @param isOpen - Открыта ли форма
 * @param onClose - Функция закрытия формы
 * @param onSuccess - Функция при успешном сохранении
 * @param lesson - Урок для редактирования (если режим редактирования)
 * @param mode - Режим формы (create или edit)
 */
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
  const [successMessage, setSuccessMessage] = useState<string>('')
  
  // Состояния для списков данных
  const [instructors, setInstructors] = useState<User[]>([])
  const [members, setMembers] = useState<User[]>([])
  const [horses, setHorses] = useState<Horse[]>([])
  const [loadingData, setLoadingData] = useState<boolean>(true)
  const styles = useStyles()

  /**
   * Загружает данные инструкторов, участников и лошадей
   */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      try {
        setLoadingData(true)

        // Параллельная загрузка данных
        const [instructorsResponse, membersResponse, horsesResponse] = await Promise.all([
          apiClient.getAll<User>('users', { role: 'trainer' }),
          apiClient.getAll<User>('users', { role: 'member' }),
          apiClient.getAll<Horse>('horses')
        ])

        if (instructorsResponse.success && instructorsResponse.data) {
          setInstructors(instructorsResponse.data)
        }

        if (membersResponse.success && membersResponse.data) {
          setMembers(membersResponse.data)
        }

        if (horsesResponse.success && horsesResponse.data) {
          setHorses(horsesResponse.data)
        }
      } catch (error) {
        console.error('Не удалось загрузить данные:', error)
        setError('Не удалось загрузить необходимые данные')
      } finally {
        setLoadingData(false)
      }
    }

    // Загрузка данных только если форма открыта
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  /**
   * Обновляет данные формы при изменении урока или режима
   */
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
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      futureDate.setHours(10, 0, 0, 0);
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

  /**
   * Валидирует данные формы
   * @returns Массив ошибок валидации
   */
  const validateForm = useCallback((): string[] => {
    const errors: string[] = []
    
    if (!formData.title.trim()) {
      errors.push('Название урока обязательно')
    }
    
    if (!formData.instructor_id) {
      errors.push('Инструктор обязателен')
    }
    
    if (!formData.member_id) {
      errors.push('Участник обязателен')
    }
    
    if (!formData.scheduled_date) {
      errors.push('Дата урока обязательна')
    } else if (!validateFutureDate(formData.scheduled_date)) {
      errors.push('Дата урока не может быть в прошлом')
    }
    
    if (formData.duration_minutes < 15) {
      errors.push('Продолжительность урока должна быть не менее 15 минут')
    }
    
    if (formData.cost < 0) {
      errors.push('Стоимость не может быть отрицательной')
    }
    
    return errors
  }, [formData])

  /**
   * Обработчик отправки формы
   * @param e Событие формы
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccessMessage('')

    // Валидация формы
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '))
      setLoading(false)
      return
    }

    try {
      // Санитизация вводимых данных
      const sanitizedData = {
        ...formData,
        title: sanitizeInput(formData.title),
        description: sanitizeInput(formData.description),
        notes: sanitizeInput(formData.notes)
      }

      // Преобразование числовых полей
      const submitData = {
        ...sanitizedData,
        cost: Number(formData.cost),
        duration_minutes: Number(formData.duration_minutes)
      }

      if (mode === 'edit' && lesson) {
        await apiClient.updateLesson(lesson._id, submitData)
        setSuccessMessage('Занятие успешно обновлено!')
      } else {
        await apiClient.createLesson(submitData)
        setSuccessMessage('Занятие успешно создано!')
      }

      // Вызов колбэков при успешной отправке
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)
    } catch (err: unknown) {
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

  /**
   * Обработчик изменения полей формы
   * @param e Событие изменения элемента формы
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration_minutes' || name === 'cost'
        ? parseFloat(value) || 0
        : value
    }))
  }

  /**
   * Обработчик закрытия формы
   */
  const handleClose = useCallback(() => {
    setError('')
    setSuccessMessage('')
    onClose()
  }, [onClose])

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
          <Button
            onClick={handleClose}
            variant="ghost"
            icon={X}
            disabled={loading}
            aria-label="Закрыть"
          />
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
              <div className={styles.alert('error')}>
                <p className="text-sm">{error}</p>
              </div>
            )}

            {/* Отображение успешных сообщений */}
            {successMessage && (
              <div className={styles.alert('success')}>
                <p className="text-sm">{successMessage}</p>
              </div>
            )}

            {/* Основная сетка формы */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Название урока */}
              <div className="md:col-span-2">
                <Input
                  label="Название занятия *"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Например: Урок выездки для начинающих"
                  maxLength={100}
                />
              </div>

              {/* Выбор инструктора */}
              <div>
                <Select
                  label="Инструктор *"
                  id="instructor_id"
                  name="instructor_id"
                  required
                  value={formData.instructor_id}
                  onChange={handleChange}
                  disabled={instructors.length === 0}
                  options={[
                    { value: '', label: 'Выберите инструктора' },
                    ...instructors.map(instructor => ({
                      value: instructor._id,
                      label: `${instructor.first_name} ${instructor.last_name}`
                    }))
                  ]}
                />
                {instructors.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">Нет доступных инструкторов</p>
                )}
              </div>

              {/* Выбор участника */}
              <div>
                <Select
                  label="Участник *"
                  id="member_id"
                  name="member_id"
                  required
                  value={formData.member_id}
                  onChange={handleChange}
                  disabled={members.length === 0}
                  options={[
                    { value: '', label: 'Выберите участника' },
                    ...members.map(member => ({
                      value: member._id,
                      label: `${member.first_name} ${member.last_name}`
                    }))
                  ]}
                />
                {members.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">Нет доступных участников</p>
                )}
              </div>

              {/* Выбор лошади */}
              <div>
                <Select
                  label="Лошадь"
                  id="horse_id"
                  name="horse_id"
                  value={formData.horse_id}
                  onChange={handleChange}
                  disabled={horses.length === 0}
                  options={[
                    { value: '', label: 'Выберите лошадь (необязательно)' },
                    ...horses.map(horse => ({
                      value: horse._id,
                      label: `${horse.name} (${horse.breed})`
                    }))
                  ]}
                />
                {horses.length === 0 && (
                  <p className="mt-1 text-sm text-yellow-600">Нет доступных лошадей</p>
                )}
              </div>

              {/* Тип урока */}
              <div>
                <Select
                  label="Тип занятия *"
                  id="lesson_type"
                  name="lesson_type"
                  required
                  value={formData.lesson_type}
                  onChange={handleChange}
                  options={[
                    { value: 'private', label: 'Индивидуальное' },
                    { value: 'group', label: 'Групповое' },
                    { value: 'training', label: 'Тренировка' }
                  ]}
                />
              </div>

              {/* Дата и время урока */}
              <div>
                <Input
                  label="Дата и время *"
                  id="scheduled_date"
                  name="scheduled_date"
                  type="datetime-local"
                  required
                  value={formData.scheduled_date}
                  onChange={handleChange}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Продолжительность урока */}
              <div>
                <Input
                  label="Продолжительность (минуты) *"
                  id="duration_minutes"
                  name="duration_minutes"
                  type="number"
                  required
                  min="15"
                  max="240"
                  step="15"
                  value={formData.duration_minutes}
                  onChange={handleChange}
                />
              </div>

              {/* Стоимость урока */}
              <div>
                <Input
                  label="Стоимость (₽) *"
                  id="cost"
                  name="cost"
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={formData.cost}
                  onChange={handleChange}
                />
              </div>

              {/* Статус урока */}
              <div>
                <Select
                  label="Статус"
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  options={[
                    { value: 'scheduled', label: 'Запланировано' },
                    { value: 'completed', label: 'Завершено' },
                    { value: 'cancelled', label: 'Отменено' },
                    { value: 'no_show', label: 'Не явился' }
                  ]}
                />
              </div>

              {/* Статус оплаты */}
              <div>
                <Select
                  label="Статус оплаты"
                  id="payment_status"
                  name="payment_status"
                  value={formData.payment_status}
                  onChange={handleChange}
                  options={[
                    { value: 'pending', label: 'Ожидает оплаты' },
                    { value: 'paid', label: 'Оплачено' },
                    { value: 'overdue', label: 'Просрочено' }
                  ]}
                />
              </div>
            </div>

            {/* Описание урока */}
            <div>
              <Textarea
                label="Описание"
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Дополнительная информация о занятии..."
                maxLength={500}
              />
            </div>

            {/* Заметки */}
            <div>
              <Textarea
                label="Заметки"
                id="notes"
                name="notes"
                rows={3}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Заметки инструктора, особые требования..."
                maxLength={500}
              />
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading
                  ? (mode === 'edit' ? 'Сохранение...' : 'Создание...')
                  : (mode === 'edit' ? 'Сохранить изменения' : 'Создать занятие')
                }
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default React.memo(LessonForm)