import React, { useState, useEffect } from 'react'
import { X, Calendar, Clock, MapPin, Users, DollarSign } from 'lucide-react'
import { apiClient } from '../lib/api'
import { EventFormData, EventFormProps } from '../types/events'

const EventForm: React.FC<EventFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  event = null, 
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    eventType: 'competition',
    startDate: '',
    endDate: '',
    location: '',
    maxParticipants: undefined,
    registrationFee: 0,
    requirements: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Обновление данных формы при изменении свойства event
  useEffect(() => {
    if (event && mode === 'edit') {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      
      // Корректировка смещения часового пояса
      const timezoneOffset = startDate.getTimezoneOffset() * 60000
      const localStartDate = new Date(startDate.getTime() - timezoneOffset)
      const localEndDate = new Date(endDate.getTime() - timezoneOffset)
      
      const formattedStartDate = localStartDate.toISOString().slice(0, 16)
      const formattedEndDate = localEndDate.toISOString().slice(0, 16)
      
      setFormData({
        title: event.title,
        description: event.description || '',
        eventType: event.eventType,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        location: event.location || '',
        maxParticipants: event.maxParticipants,
        registrationFee: event.registrationFee,
        requirements: event.requirements || ''
      })
    } else if (mode === 'create') {
      // Сброс формы для режима создания
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(now.getHours() + 1)
      
      setFormData({
        title: '',
        description: '',
        eventType: 'competition',
        startDate: now.toISOString().slice(0, 16),
        endDate: tomorrow.toISOString().slice(0, 16),
        location: '',
        maxParticipants: undefined,
        registrationFee: 0,
        requirements: ''
      })
    }
  }, [event, mode, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Проверка обязательных полей
    if (!formData.title.trim()) {
      setError('Название мероприятия обязательно для заполнения')
      setLoading(false)
      return
    }

    // Проверка дат
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    
    if (endDate <= startDate) {
      setError('Дата окончания должна быть позже даты начала')
      setLoading(false)
      return
    }

    try {
      // Преобразование datetime-local в ISO строку
      const startDateISO = startDate.toISOString()
      const endDateISO = endDate.toISOString()
      
      // Очистка данных для API
      const cleanedData = {
        ...formData,
        startDate: startDateISO,
        endDate: endDateISO,
        location: formData.location || undefined,
        maxParticipants: formData.maxParticipants || undefined,
        description: formData.description || undefined,
        requirements: formData.requirements || undefined,
        // Убедимся, что registrationFee является числом
        registrationFee: Number(formData.registrationFee)
      }

      if (mode === 'edit' && event) {
        await apiClient.update(`events/${event._id}`, cleanedData)
      } else {
        await apiClient.create('events', cleanedData)
      }

      onSuccess()
      onClose()
      setError('')
    } catch (err: unknown) {
      setError(
        err instanceof Error 
          ? err.message 
          : `Не удалось ${mode === 'edit' ? 'сохранить' : 'создать'} мероприятие`
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    setFormData(prev => {
      // Обработка числовых полей
      if (name === 'maxParticipants' || name === 'registrationFee') {
        // Для пустого значения устанавливаем undefined или 0
        if (value === '') {
          return {
            ...prev,
            [name]: name === 'registrationFee' ? 0 : undefined
          }
        }
        
        // Преобразуем в число
        const numericValue = Number(value)
        
        // Проверяем, является ли значение корректным числом
        if (!isNaN(numericValue)) {
          return {
            ...prev,
            [name]: numericValue
          }
        }
        
        // Если значение не число, оставляем предыдущее значение
        return prev
      }
      
      // Для нечисловых полей
      return {
        ...prev,
        [name]: value
      }
    })
  }

  const handleClose = () => {
    // Проверка на наличие изменений перед закрытием
    const hasChanges = Object.values(formData).some(value => 
      value !== '' && value !== 0 && value !== undefined
    )
    
    if (!hasChanges || window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите закрыть?')) {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Редактировать мероприятие' : 'Создать мероприятие'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Название мероприятия *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Например: Зимние соревнования по выездке"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                Тип мероприятия *
              </label>
              <div className="relative">
                <select
                  id="eventType"
                  name="eventType"
                  required
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none"
                  disabled={loading}
                >
                  <option value="competition">Соревнование</option>
                  <option value="clinic">Клиника</option>
                  <option value="social">Социальное мероприятие</option>
                  <option value="maintenance">Обслуживание</option>
                  <option value="show">Шоу</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Место проведения
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Например: Главная арена"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Дата и время начала *
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Дата и время окончания *
              </label>
              <input
                type="datetime-local"
                id="endDate"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Users className="h-4 w-4 mr-1" />
                Максимум участников
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                min="1"
                value={formData.maxParticipants || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Без ограничений"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="registrationFee" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Регистрационный взнос (₽) *
              </label>
              <input
                type="number"
                id="registrationFee"
                name="registrationFee"
                required
                min="0"
                step="1" // Изменили step на 1 для целых чисел
                value={formData.registrationFee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={loading}
              />
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
              placeholder="Подробное описание мероприятия..."
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
              Требования
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={3}
              value={formData.requirements}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Требования к участникам, необходимое снаряжение..."
              disabled={loading}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading 
                ? (mode === 'edit' ? 'Сохранение...' : 'Создание...') 
                : (mode === 'edit' ? 'Сохранить изменения' : 'Создать мероприятие')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EventForm