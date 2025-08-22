import React from 'react'
import { X, Calendar, MapPin, Users, DollarSign, FileText, Trophy, Mail, Phone, User, Clock } from 'lucide-react'
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

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 24) {
      return `${diffInHours} часов назад`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} дней назад`
    }
  }

  const { date: startDate, time: startTime } = formatDateTime(event.startDate)
  const { date: endDate, time: endTime } = formatDateTime(event.endDate)

  const isSameDay = startDate === endDate
  const participantsCount = event.participants.length
  const waitlistCount = event.waitlist?.length || 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
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
                {event.isActive === false && (
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                    Архивировано
                  </span>
                )}
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
                      {participantsCount} участников
                      {event.maxParticipants && ` из ${event.maxParticipants}`}
                      {waitlistCount > 0 && `, ${waitlistCount} в листе ожидания`}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div className="text-sm text-gray-900">
                      Регистрационный взнос: {event.registrationFee.toLocaleString('ru-RU')}₽
                    </div>
                  </div>
                </div>
              </div>

              {/* Organizer */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Организатор</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-gray-700 font-medium">
                        {event.organizer.first_name} {event.organizer.last_name}
                      </p>
                      {event.organizer.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-1" />
                          {event.organizer.email}
                        </div>
                      )}
                      {event.organizer.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="h-4 w-4 mr-1" />
                          {event.organizer.phone}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 capitalize">
                        Роль: {event.organizer.role}
                      </div>
                    </div>
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
              {participantsCount > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Участники ({participantsCount})
                  </h4>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {event.participants.slice(0, 3).map((participant) => (
                        <div key={participant.user._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-green-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm text-gray-700 block">
                                {participant.user.first_name} {participant.user.last_name}
                              </span>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatRelativeTime(participant.registeredAt)}
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            participant.paymentStatus === 'paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {participant.paymentStatus === 'paid' ? 'Оплачено' : 'Ожидает оплаты'}
                          </span>
                        </div>
                      ))}
                      {participantsCount > 3 && (
                        <p className="text-xs text-gray-500 mt-2">
                          и еще {participantsCount - 3} участников...
                        </p>
                      )}
                    </div>
                    {event.maxParticipants && (
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ 
                              width: `${Math.min((participantsCount / event.maxParticipants) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {event.maxParticipants - participantsCount} мест осталось
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Waitlist Preview */}
              {waitlistCount > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Лист ожидания ({waitlistCount})
                  </h4>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {event.waitlist!.slice(0, 3).map((waitlistParticipant) => (
                        <div key={waitlistParticipant.user._id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 bg-orange-600 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <span className="text-sm text-gray-700 block">
                                {waitlistParticipant.user.first_name} {waitlistParticipant.user.last_name}
                              </span>
                              <div className="flex items-center text-xs text-gray-500">
                                <Clock className="h-3 w-3 mr-1" />
                                {formatRelativeTime(waitlistParticipant.addedAt)}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                            В ожидании
                          </span>
                        </div>
                      ))}
                      {waitlistCount > 3 && (
                        <p className="text-xs text-gray-500 mt-2">
                          и еще {waitlistCount - 3} в списке ожидания...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with timestamps */}
          {(event.createdAt || event.updatedAt) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row justify-between text-sm text-gray-500 gap-2">
                {event.createdAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Создано: {formatDate(event.createdAt)}
                  </div>
                )}
                {event.updatedAt && event.updatedAt !== event.createdAt && (
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