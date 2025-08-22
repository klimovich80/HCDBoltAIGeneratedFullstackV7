import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
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

  // Update form data when event prop changes
  useEffect(() => {
    if (event && mode === 'edit') {
      const startDate = new Date(event.startDate)
      const endDate = new Date(event.endDate)
      const formattedStartDate = startDate.toISOString().slice(0, 16)
      const formattedEndDate = endDate.toISOString().slice(0, 16)
      
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
      // Reset form for create mode
      const now = new Date()
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      
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
  }, [event, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate dates
    const startDate = new Date(formData.startDate)
    const endDate = new Date(formData.endDate)
    
    if (endDate <= startDate) {
      setError('Дата окончания должна быть позже даты начала')
      setLoading(false)
      return
    }

    try {
      // Convert datetime-local to ISO string
      const startDateISO = startDate.toISOString()
      const endDateISO = endDate.toISOString()
      
      // Clean data for API
      const cleanedData = {
        ...formData,
        startDate: startDateISO,
        endDate: endDateISO,
        location: formData.location || undefined,
        maxParticipants: formData.maxParticipants || undefined,
        description: formData.description || undefined,
        requirements: formData.requirements || undefined
      }

      if (mode === 'edit' && event) {
        await apiClient.update('events', event._id, cleanedData)
      } else {
        await apiClient.create('events', cleanedData)
      }

      onSuccess()
      onClose()
      setError('')
    } catch (err: any) {
      setError(err.message || `Failed to ${mode} event`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'maxParticipants' || name === 'registrationFee' 
        ? value === '' ? undefined : parseFloat(value) || 0 
        : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Редактировать мероприятие' : 'Создать мероприятие'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
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
              />
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                Тип мероприятия *
              </label>
              <select
                id="eventType"
                name="eventType"
                required
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="competition">Соревнование</option>
                <option value="clinic">Клиника</option>
                <option value="social">Социальное мероприятие</option>
                <option value="maintenance">Обслуживание</option>
                <option value="show">Шоу</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
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
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Дата и время начала *
              </label>
              <input
                type="datetime-local"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
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
              />
            </div>

            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
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
              />
            </div>

            <div>
              <label htmlFor="registrationFee" className="block text-sm font-medium text-gray-700 mb-2">
                Регистрационный взнос (₽) *
              </label>
              <input
                type="number"
                id="registrationFee"
                name="registrationFee"
                required
                min="0"
                step="0.01"
                value={formData.registrationFee}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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