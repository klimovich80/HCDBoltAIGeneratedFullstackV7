import React, { useState, useEffect } from 'react'
import { Search, Plus, Calendar, MapPin, Users } from 'lucide-react'
import { apiClient } from '../lib/api'

interface Event {
  _id: string
  title: string
  description: string
  eventType: 'competition' | 'clinic' | 'social' | 'maintenance' | 'show'
  startDate: string
  endDate: string
  location?: string
  maxParticipants?: number
  registrationFee: number
  organizer: {
    first_name: string
    last_name: string
  }
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  participants: any[]
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchEvents = () => {
      apiClient.getAll<{ success: boolean; data: Event[] }>('events')
        .then(response => {
          if (response.success) {
            setEvents(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch events:', error)
          // Устанавливаем демо данные для разработки
          setEvents([
            {
              _id: '1',
              title: 'Winter Dressage Competition',
              description: 'Annual winter dressage competition for all levels',
              eventType: 'competition',
              startDate: '2024-12-28T08:00:00Z',
              endDate: '2024-12-28T18:00:00Z',
              location: 'Main Arena',
              maxParticipants: 50,
              registrationFee: 45,
              organizer: { first_name: 'Sarah', last_name: 'Johnson' },
              status: 'upcoming',
              participants: new Array(32).fill(null)
            },
            {
              _id: '2',
              title: 'Jumping Clinic with Expert Trainer',
              description: 'Two-day intensive jumping clinic',
              eventType: 'clinic',
              startDate: '2025-01-15T09:00:00Z',
              endDate: '2025-01-16T17:00:00Z',
              location: 'Outdoor Arena',
              maxParticipants: 20,
              registrationFee: 180,
              organizer: { first_name: 'Michael', last_name: 'Chen' },
              status: 'upcoming',
              participants: new Array(15).fill(null)
            },
            {
              _id: '3',
              title: 'New Year Social Ride',
              description: 'Celebratory group ride and BBQ',
              eventType: 'social',
              startDate: '2025-01-01T11:00:00Z',
              endDate: '2025-01-01T16:00:00Z',
              location: 'Trail System',
              maxParticipants: 30,
              registrationFee: 25,
              organizer: { first_name: 'Sarah', last_name: 'Johnson' },
              status: 'upcoming',
              participants: new Array(22).fill(null)
            }
          ])
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchEvents()
  }, [])

  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.eventType.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
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
          <h1 className="text-2xl font-bold text-gray-900">Мероприятия</h1>
          <p className="text-gray-600">Управляйте соревнованиями, клиниками и социальными мероприятиями</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Создать мероприятие</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск мероприятий..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredEvents.map((event) => (
            <div key={event._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <div className="flex space-x-2 mb-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.eventType)}`}>
                      {event.eventType === 'competition' ? 'соревнование' :
                        event.eventType === 'clinic' ? 'клиника' :
                          event.eventType === 'social' ? 'социальное' :
                            event.eventType === 'maintenance' ? 'обслуживание' : 'шоу'}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                      {event.status === 'upcoming' ? 'предстоящее' :
                        event.status === 'ongoing' ? 'идет' :
                          event.status === 'completed' ? 'завершено' : 'отменено'}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDateRange(event.startDate, event.endDate)}
                </div>
                {event.location && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="h-4 w-4 mr-2" />
                  {event.participants.length}
                  {event.maxParticipants && ` / ${event.maxParticipants}`} участников
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div>
                  <span className="text-lg font-semibold text-gray-900">
                    {event.registrationFee}₽
                  </span>
                  <span className="text-sm text-gray-500 ml-1">регистрация</span>
                </div>
                <div className="text-sm text-gray-500">
                  от {event.organizer.first_name} {event.organizer.last_name}
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                <button className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-md text-sm hover:bg-indigo-700">
                  Подробнее
                </button>
                {event.status === 'upcoming' && (
                  <button className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                    Записаться
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Events