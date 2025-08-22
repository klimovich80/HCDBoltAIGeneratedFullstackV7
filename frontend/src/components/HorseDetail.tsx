import React from 'react'
import { X, Calendar, Heart, FileText } from 'lucide-react'
import { HorseDetailProps } from '../types/horse'

const HorseDetail: React.FC<HorseDetailProps> = ({ isOpen, onClose, horse }) => {
  if (!isOpen || !horse) return null

  const getVaccinationStatusColor = (status: string) => {
    switch (status) {
      case 'current': return 'bg-green-100 text-green-800'
      case 'due': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getBoardingTypeLabel = (type: string) => {
    switch (type) {
      case 'full': return 'Полное содержание'
      case 'partial': return 'Частичное содержание'
      case 'pasture': return 'Пастбищное содержание'
      default: return type
    }
  }

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'mare': return 'Кобыла'
      case 'stallion': return 'Жеребец'
      case 'gelding': return 'Мерин'
      default: return gender
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано'
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {horse.profileImage ? (
              <img
                src={horse.profileImage}
                alt={horse.name}
                className="h-16 w-16 rounded-full object-cover border-2 border-indigo-200"
              />
            ) : (
              <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center">
                <Heart className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{horse.name}</h2>
              <p className="text-gray-600">{horse.breed} • {getGenderLabel(horse.gender)}</p>
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
            {/* Horse Image Section */}
            {horse.profileImage && (
              <div className="lg:col-span-2 mb-6">
                <div className="flex justify-center">
                  <img
                    src={horse.profileImage}
                    alt={horse.name}
                    className="max-w-md w-full h-64 object-cover rounded-lg shadow-md"
                  />
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Возраст:</span>
                    <span className="font-medium">{horse.age} лет</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Пол:</span>
                    <span className="font-medium">{getGenderLabel(horse.gender)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Масть:</span>
                    <span className="font-medium">{horse.color}</span>
                  </div>
                  {horse.markings && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Отметины:</span>
                      <span className="font-medium">{horse.markings}</span>
                    </div>
                  )}
                  {horse.registrationNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Рег. номер:</span>
                      <span className="font-medium">{horse.registrationNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Boarding Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Содержание</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Тип содержания:</span>
                    <span className="font-medium">{getBoardingTypeLabel(horse.boardingType)}</span>
                  </div>
                  {horse.stallNumber && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Номер денника:</span>
                      <span className="font-medium">{horse.stallNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Owner Information */}
              {horse.owner && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Владелец</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Имя:</span>
                      <span className="font-medium">{horse.owner.first_name} {horse.owner.last_name}</span>
                    </div>
                    {horse.owner.email && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{horse.owner.email}</span>
                      </div>
                    )}
                    {horse.owner.phone && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Телефон:</span>
                        <span className="font-medium">{horse.owner.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Medical Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Медицинская информация</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Статус вакцинации:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVaccinationStatusColor(horse.vaccinationStatus)}`}>
                      {horse.vaccinationStatus === 'current' ? 'Актуальна' :
                        horse.vaccinationStatus === 'due' ? 'Требуется' : 'Просрочена'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Последний визит ветеринара:</span>
                    <span className="font-medium">{formatDate(horse.lastVetVisit)}</span>
                  </div>
                  {horse.nextVetVisit && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Следующий визит:</span>
                      <span className="font-medium">{formatDate(horse.nextVetVisit)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Medical Notes */}
              {horse.medicalNotes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Медицинские заметки
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{horse.medicalNotes}</p>
                  </div>
                </div>
              )}

              {/* Dietary Restrictions */}
              {horse.dietaryRestrictions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Диетические ограничения
                  </h4>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{horse.dietaryRestrictions}</p>
                  </div>
                </div>
              )}

              {/* Insurance Information */}
              {horse.insuranceInfo && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Информация о страховке</h4>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{horse.insuranceInfo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer with timestamps */}
          {(horse.createdAt || horse.updatedAt) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-500">
                {horse.createdAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Добавлено: {formatDate(horse.createdAt)}
                  </div>
                )}
                {horse.updatedAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Обновлено: {formatDate(horse.updatedAt)}
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

export default HorseDetail