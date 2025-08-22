import React from 'react'
import { X, Calendar, MapPin, Users, DollarSign, FileText, Trophy } from 'lucide-react'
import { EventDetailProps } from '../types/events'

const EventDetail: React.FC<EventDetailProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null

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
      case 'social': return 'Социальное мероприятие'
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

  const { date: startDate, time: startTime } = formatDateTime(event.startDate)
  const { date: endDate, time: endTime } = formatDateTime(event.endDate)

  const isSameDay = startDate === endDate

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-purple-600 rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{event.title}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEventTypeColor(event.eventType)}`}>
                  {getEventTypeLabel(event.eventType)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(event.status)}`}>
                  {getStatusLabel(event.status)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Event Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о мероприятии</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {isSameDay ? (
                          <>
                            {startDate}
                            <div className="text-sm text-gray-500">
                              {startTime} - {endTime}
                            </div>
                          </>
                        ) : (
                          <>
                            {startDate} {startTime} - {endDate} {endTime}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400" />
                      <span className="text-sm text-gray-900">{event.location}</span>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-400" />
                    <div className="text-sm text-gray-900">
                      {event.participants.length} участников
                      {event.maxParticipants && ` из ${event.maxParticipants}`}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div className="text-sm text-gray-900">
                      Регистрационный взнос: {event.registrationFee.toLocaleString()}₽
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Организатор</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="space-y-1">
                    <p className="text-gray-700 font-medium">
                      {event.organizer.first_name} {event.organizer.last_name}
                    </p>
                    {event.organizer.email && (
                      <p className="text-sm text-gray-600">{event.organizer.email}</p>
                    )}
                    {event.organizer.phone && (
                      <p className="text-sm text-gray-600">{event.organizer.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Description and Requirements */}
            <div className="space-y-6">
              {/* Description */}
              {event.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Описание
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{event.description}</p>
                  </div>
                </div>
              )}

              {/* Requirements */}
              {event.requirements && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Требования
                  </h4>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{event.requirements}</p>
                  </div>
                </div>
              )}

              {/* Participants Preview */}
              {event.participants.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Участники ({event.participants.length})
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      {event.participants.length} человек зарегистрировано на мероприятие
                    </p>
                    {event.maxParticipants && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((event.participants.length / event.maxParticipants) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.maxParticipants - event.participants.length} мест осталось
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with timestamps */}
          {(event.createdAt || event.updatedAt) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-500">
                {event.createdAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Создано: {formatDate(event.createdAt)}
                  </div>
                )}
                {event.updatedAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Обновлено: {formatDate(event.updatedAt)}
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

export default EventDetail