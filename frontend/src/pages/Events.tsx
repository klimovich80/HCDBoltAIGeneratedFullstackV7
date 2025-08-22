import React, { useState, useEffect, useCallback } from 'react'
import { Search, Plus, Calendar, MapPin, Users, Edit, Eye, Trash2, Archive, RotateCcw, Filter } from 'lucide-react'
import { apiClient } from '../lib/api'
import EventForm from '../components/EventForm'
import EventDetail from '../components/EventDetail'
import { Event } from '../types/events'

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [viewingEvent, setViewingEvent] = useState<Event | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  // Мемоизированная функция для загрузки мероприятий
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true)
      // Исправлено: правильное использование дженерика
      const response = await apiClient.getAll<Event>('events')
      if (response.success && response.data) {
        // Исправлено: response.data уже является массивом Event[]
        setEvents(response.data)
      } else {
        setError('Не удалось загрузить мероприятия')
      }
    } catch (err) {
      console.error('Ошибка при загрузке мероприятий:', err)
      setError('Ошибка при загрузке мероприятий')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const handleAddSuccess = () => {
    fetchEvents()
    setShowAddForm(false)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowEditForm(true)
  }

  const handleEditSuccess = () => {
    fetchEvents()
    setShowEditForm(false)
    setEditingEvent(null)
  }

  const handleCloseEditForm = () => {
    setShowEditForm(false)
    setEditingEvent(null)
  }

  const handleViewEvent = (event: Event) => {
    setViewingEvent(event)
    setShowDetailView(true)
  }

  const handleCloseDetailView = () => {
    setShowDetailView(false)
    setViewingEvent(null)
  }

  const handleDeleteEvent = async (event: Event) => {
    if (window.confirm(`Вы уверены, что хотите удалить мероприятие "${event.title}"? Это действие нельзя отменить.`)) {
      try {
        await apiClient.delete(`events/${event._id}`)
        fetchEvents()
      } catch (error) {
        console.error('Ошибка при удалении мероприятия:', error)
        alert('Ошибка при удалении мероприятия')
      }
    }
  }

  const handleArchiveEvent = async (event: Event) => {
    if (window.confirm(`Вы уверены, что хотите ${event.isActive ? 'архивировать' : 'восстановить'} мероприятие "${event.title}"?`)) {
      try {
        await apiClient.update(`events/${event._id}`, { isActive: !event.isActive })
        fetchEvents()
      } catch (error) {
        console.error('Ошибка при архивировании/восстановлении мероприятия:', error)
        alert('Ошибка при архивировании/восстановлении мероприятия')
      }
    }
  }

  // Фильтрация мероприятий по поисковому запросу и фильтрам
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesType = eventTypeFilter === 'all' || event.eventType === eventTypeFilter
    const matchesStatus = statusFilter === 'all' || event.status === statusFilter
    const matchesArchive = showArchived ? true : event.isActive !== false
    
    return matchesSearch && matchesType && matchesStatus && matchesArchive
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-100 text-blue-800'
      case 'ongoing': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'competition': return 'bg-purple-100 text-purple-800'
      case 'clinic': return 'bg-indigo-100 text-indigo-800'
      case 'social': return 'bg-green-100 text-green-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'show': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEventTypeLabel = (type: string) => {
    switch (type) {
      case 'competition': return 'Соревнование'
      case 'clinic': return 'Клиника'
      case 'social': return 'Социальное'
      case 'maintenance': return 'Обслуживание'
      case 'show': return 'Шоу'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'upcoming': return 'Предстоящее'
      case 'ongoing': return 'Идет'
      case 'completed': return 'Завершено'
      case 'cancelled': return 'Отменено'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start.toDateString() === end.toDateString()) {
      return formatDate(startDate)
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`
  }

  // Функция для корректного отображения суммы регистрационного взноса
  const formatRegistrationFee = (fee: number) => {
    // Если сумма целая, отображаем без десятичных знаков
    return fee % 1 === 0 ? fee.toString() : fee.toFixed(2)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Мероприятия</h1>
          <p className="text-gray-600">Управляйте соревнованиями, клиниками и социальными мероприятиями</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Создать мероприятие</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchEvents}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Попробовать снова
          </button>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="relative w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск мероприятий..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Все типы</option>
                  <option value="competition">Соревнования</option>
                  <option value="clinic">Клиники</option>
                  <option value="social">Социальные</option>
                  <option value="maintenance">Обслуживание</option>
                  <option value="show">Шоу</option>
                </select>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">Все статусы</option>
                  <option value="upcoming">Предстоящие</option>
                  <option value="ongoing">Текущие</option>
                  <option value="completed">Завершенные</option>
                  <option value="cancelled">Отмененные</option>
                </select>
              </div>
              
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

        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Calendar className="h-12 w-12" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Мероприятия не найдены</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || eventTypeFilter !== 'all' || statusFilter !== 'all' || showArchived
                ? 'Попробуйте изменить параметры поиска или фильтры.'
                : 'Начните создание нового мероприятия.'}
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Создать мероприятие
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredEvents.map((event) => (
              <div key={event._id} className={`border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${event.isActive === false ? 'opacity-60 bg-gray-50' : ''}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                      {event.isActive === false && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Архивировано
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.eventType)}`}>
                        {getEventTypeLabel(event.eventType)}
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                        {getStatusLabel(event.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {event.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{formatDateRange(event.startDate, event.endDate)}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>
                      {event.participants.length} участников
                      {event.maxParticipants && ` / ${event.maxParticipants}`}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatRegistrationFee(event.registrationFee)}₽
                    </span>
                    <span className="text-sm text-gray-500 ml-1">регистрация</span>
                  </div>
                  <div className="text-sm text-gray-500 truncate max-w-[120px]">
                    от {event.organizer?.first_name} {event.organizer?.last_name}
                  </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2">
                  <button 
                    onClick={() => handleViewEvent(event)}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700 flex items-center justify-center"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Подробнее
                  </button>
                  <div className="flex justify-center sm:justify-end gap-1">
                    <button 
                      onClick={() => handleEditEvent(event)}
                      className="p-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
                      title="Редактировать мероприятие"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleArchiveEvent(event)}
                      className={`p-2 border border-gray-300 rounded-md hover:bg-gray-50 ${event.isActive === false ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'}`}
                      title={event.isActive === false ? 'Восстановить мероприятие' : 'Архивировать мероприятие'}
                    >
                      {event.isActive === false ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </button>
                    <button 
                      onClick={() => handleDeleteEvent(event)}
                      className="p-2 text-red-600 hover:text-red-900 border border-gray-300 rounded-md hover:bg-gray-50"
                      title="Удалить мероприятие"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <EventForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
        mode="create"
      />

      <EventForm
        isOpen={showEditForm}
        onClose={handleCloseEditForm}
        onSuccess={handleEditSuccess}
        event={editingEvent}
        mode="edit"
      />

      <EventDetail
        isOpen={showDetailView}
        onClose={handleCloseDetailView}
        event={viewingEvent}
      />
    </div>
  )
}

export default Events