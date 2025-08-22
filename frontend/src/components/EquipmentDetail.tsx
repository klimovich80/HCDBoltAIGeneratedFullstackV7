import React, { useState } from 'react'
import { X, Calendar, Package, MapPin, DollarSign, FileText, Wrench, Image, Plus } from 'lucide-react'
import { EquipmentDetailProps } from '../types/equipment'
import EquipmentPhotos from './EquipmentPhotos'

const EquipmentDetail: React.FC<EquipmentDetailProps> = ({ 
  isOpen, 
  onClose, 
  equipment,
  onUpdate 
}) => {
  const [showPhotosModal, setShowPhotosModal] = useState(false)

  if (!isOpen || !equipment) return null

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'saddle': return 'bg-purple-100 text-purple-800'
      case 'bridle': return 'bg-indigo-100 text-indigo-800'
      case 'halter': return 'bg-blue-100 text-blue-800'
      case 'blanket': return 'bg-green-100 text-green-800'
      case 'boot': return 'bg-orange-100 text-orange-800'
      case 'grooming': return 'bg-pink-100 text-pink-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'saddle': return 'Седло'
      case 'bridle': return 'Уздечка'
      case 'halter': return 'Недоуздок'
      case 'blanket': return 'Попона'
      case 'boot': return 'Ногавки'
      case 'grooming': return 'Груминг'
      case 'other': return 'Прочее'
      default: return category
    }
  }

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'Отличное'
      case 'good': return 'Хорошее'
      case 'fair': return 'Удовлетворительное'
      case 'poor': return 'Плохое'
      default: return condition
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

  const formatCurrency = (amount?: number) => {
    return amount ? `${amount.toLocaleString()}₽` : 'Не указано'
  }

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              {equipment.photos && equipment.photos.length > 0 ? (
                <img
                  src={equipment.photos.find(p => p.isPrimary)?.url || equipment.photos[0].url}
                  alt={equipment.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{equipment.name}</h2>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(equipment.category)}`}>
                    {getCategoryLabel(equipment.category)}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(equipment.condition)}`}>
                    {getConditionLabel(equipment.condition)}
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
            {/* Блок с фотографиями */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Фотографии</h3>
                <button
                  onClick={() => setShowPhotosModal(true)}
                  className="flex items-center px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Управление фото
                </button>
              </div>
              
              {equipment.photos && equipment.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {equipment.photos
                    .filter(p => p.isPrimary)
                    .concat(equipment.photos.filter(p => !p.isPrimary))
                    .slice(0, 6)
                    .map((photo) => (
                      <div key={photo._id} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.caption || `Фото снаряжения ${equipment.name}`}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        {photo.isPrimary && (
                          <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                            Основная
                          </div>
                        )}
                      </div>
                    ))
                  }
                  {equipment.photos.length > 6 && (
                    <div className="flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-gray-500">+{equipment.photos.length - 6} ещё</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Нет загруженных фотографий</p>
                  <button
                    onClick={() => setShowPhotosModal(true)}
                    className="mt-2 text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    Добавить фотографии
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Информация о снаряжении */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о снаряжении</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Категория:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(equipment.category)}`}>
                        {getCategoryLabel(equipment.category)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Состояние:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(equipment.condition)}`}>
                        {getConditionLabel(equipment.condition)}
                      </span>
                    </div>
                    {equipment.brand && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Бренд:</span>
                        <span className="font-medium">{equipment.brand}</span>
                      </div>
                    )}
                    {equipment.model && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Модель:</span>
                        <span className="font-medium">{equipment.model}</span>
                      </div>
                    )}
                    {equipment.size && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Размер:</span>
                        <span className="font-medium">{equipment.size}</span>
                      </div>
                    )}
                    {equipment.location && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-600">Местоположение:</span>
                          <span className="ml-2 font-medium">{equipment.location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Финансовая информация */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Финансовая информация</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-gray-600">Первоначальная стоимость:</span>
                        <span className="ml-2 font-medium">{formatCurrency(equipment.cost)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-gray-600">Текущая стоимость:</span>
                        <span className="ml-2 font-medium">{formatCurrency(equipment.currentValue)}</span>
                      </div>
                    </div>
                    {equipment.purchaseDate && (
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <span className="text-gray-600">Дата покупки:</span>
                          <span className="ml-2 font-medium">{formatDate(equipment.purchaseDate)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Назначенная лошадь */}
                {equipment.assignedHorse && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Назначенная лошадь</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="space-y-1">
                        <p className="text-gray-700 font-medium">{equipment.assignedHorse.name}</p>
                        <p className="text-sm text-gray-600">{equipment.assignedHorse.breed}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Обслуживание и заметки */}
              <div className="space-y-6">
                {/* Информация об обслуживании */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Wrench className="h-5 w-5 mr-2" />
                    Обслуживание
                  </h3>
                  <div className="space-y-3">
                    {equipment.lastMaintenance && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Последнее обслуживание:</span>
                        <span className="font-medium">{formatDate(equipment.lastMaintenance)}</span>
                      </div>
                    )}
                    {equipment.nextMaintenance && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Следующее обслуживание:</span>
                        <span className="font-medium">{formatDate(equipment.nextMaintenance)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Заметки по обслуживанию */}
                {equipment.maintenanceNotes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Заметки по обслуживанию
                    </h4>
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm leading-relaxed">{equipment.maintenanceNotes}</p>
                    </div>
                  </div>
                )}

                {/* Общие заметки */}
                {equipment.notes && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      Общие заметки
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 text-sm leading-relaxed">{equipment.notes}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Подвал с временными метками */}
            {(equipment.createdAt || equipment.updatedAt) && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-sm text-gray-500">
                  {equipment.createdAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Добавлено: {formatDate(equipment.createdAt)}
                    </div>
                  )}
                  {equipment.updatedAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      Обновлено: {formatDate(equipment.updatedAt)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно управления фотографиями */}
      {showPhotosModal && (
        <EquipmentPhotos
          equipment={equipment}
          onUpdate={onUpdate}
          isOpen={showPhotosModal}
          onClose={() => setShowPhotosModal(false)}
        />
      )}
    </>
  )
}

export default EquipmentDetail