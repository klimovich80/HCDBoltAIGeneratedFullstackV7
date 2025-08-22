import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '../lib/api'
import { Equipment, Horse, EquipmentFormData, EquipmentFormProps, MaintenanceData } from '../types/equipment'

const EquipmentForm: React.FC<EquipmentFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  equipment = null, 
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    category: 'saddle',
    brand: '',
    model: '',
    size: '',
    condition: 'good',
    purchaseDate: '',
    cost: undefined,
    currentValue: undefined,
    assignedHorse: '',
    lastMaintenance: '',
    nextMaintenance: '',
    maintenanceNotes: '',
    location: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [horses, setHorses] = useState<Horse[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Загрузка лошадей для назначения
  useEffect(() => {
    const loadHorses = async () => {
      try {
        setLoadingData(true)
        
        const horsesResponse = await apiClient.getAll<{ success: boolean; data: Horse[] }>('horses')
        if (horsesResponse.success) {
          setHorses(horsesResponse.data)
        }
      } catch (error) {
        console.error('Не удалось загрузить лошадей:', error)
        // Установка демо-данных для разработки
        setHorses([
          { _id: '1', name: 'Thunder', breed: 'Чистокровная' },
          { _id: '2', name: 'Moonlight', breed: 'Арабская' },
          { _id: '3', name: 'Star', breed: 'Квартерхорс' }
        ])
      } finally {
        setLoadingData(false)
      }
    }

    if (isOpen && mode !== 'maintenance') {
      loadHorses()
    } else if (isOpen) {
      setLoadingData(false)
    }
  }, [isOpen, mode])

  // Обновление данных формы при изменении свойства equipment
  useEffect(() => {
    if (equipment && (mode === 'edit' || mode === 'maintenance')) {
      const purchaseDate = equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().slice(0, 10) : ''
      const lastMaintenance = equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toISOString().slice(0, 10) : ''
      const nextMaintenance = equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toISOString().slice(0, 10) : ''
      
      setFormData({
        name: equipment.name,
        category: equipment.category,
        brand: equipment.brand || '',
        model: equipment.model || '',
        size: equipment.size || '',
        condition: equipment.condition,
        purchaseDate,
        cost: equipment.cost,
        currentValue: equipment.currentValue,
        assignedHorse: equipment.assignedHorse?._id || '', // Используем _id вместо объекта
        lastMaintenance,
        nextMaintenance,
        maintenanceNotes: equipment.maintenanceNotes || '',
        location: equipment.location || '',
        notes: equipment.notes || ''
      })
    } else if (mode === 'create') {
      // Сброс формы для режима создания
      setFormData({
        name: '',
        category: 'saddle',
        brand: '',
        model: '',
        size: '',
        condition: 'good',
        purchaseDate: '',
        cost: undefined,
        currentValue: undefined,
        assignedHorse: '',
        lastMaintenance: '',
        nextMaintenance: '',
        maintenanceNotes: '',
        location: '',
        notes: ''
      })
    }
  }, [equipment, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (mode === 'maintenance' && equipment) {
        // Для режима обслуживания используем специальный интерфейс
        const maintenanceData: MaintenanceData = {
          lastMaintenance: formData.lastMaintenance || undefined,
          nextMaintenance: formData.nextMaintenance || undefined,
          maintenanceNotes: formData.maintenanceNotes || undefined,
          condition: formData.condition
        }
        await apiClient.update('equipment', equipment._id, maintenanceData)
      } else {
        // Для режимов создания и редактирования используем все поля
        const cleanedData: any = {
          name: formData.name,
          category: formData.category,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          size: formData.size || undefined,
          condition: formData.condition,
          purchaseDate: formData.purchaseDate || undefined,
          cost: formData.cost,
          currentValue: formData.currentValue,
          lastMaintenance: formData.lastMaintenance || undefined,
          nextMaintenance: formData.nextMaintenance || undefined,
          maintenanceNotes: formData.maintenanceNotes || undefined,
          location: formData.location || undefined,
          notes: formData.notes || undefined
        }

        // Добавляем assignedHorse только если он есть
        if (formData.assignedHorse) {
          cleanedData.assignedHorse = formData.assignedHorse
        }

        if (mode === 'edit' && equipment) {
          await apiClient.update('equipment', equipment._id, cleanedData)
        } else {
          await apiClient.create('equipment', cleanedData)
        }
      }

      onSuccess()
      onClose()
      setError('')
    } catch (err: any) {
      setError(err.message || `Не удалось ${mode === 'edit' ? 'отредактировать' : mode === 'maintenance' ? 'обслужить' : 'создать'} снаряжение`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' || name === 'currentValue' 
        ? value === '' ? undefined : parseFloat(value) || 0 
        : value
    }))
  }

  // Функция для проверки, должно ли поле быть отключено в режиме обслуживания
  const isFieldDisabled = (fieldName: string): boolean => {
    if (mode !== 'maintenance') return false
    
    // В режиме обслуживания редактируем только эти поля
    const editableFields = ['condition', 'lastMaintenance', 'nextMaintenance', 'maintenanceNotes']
    return !editableFields.includes(fieldName)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' 
              ? 'Редактировать снаряжение' 
              : mode === 'maintenance'
                ? 'Обслуживание снаряжения'
                : 'Добавить снаряжение'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loadingData ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Загрузка данных...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Поле названия */}
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Название снаряжения {mode !== 'maintenance' && '*'}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required={mode !== 'maintenance'}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isFieldDisabled('name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Например: Седло для выездки"
                />
              </div>

              {/* Поле категории */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Категория {mode !== 'maintenance' && '*'}
                </label>
                <select
                  id="category"
                  name="category"
                  required={mode !== 'maintenance'}
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isFieldDisabled('category')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="saddle">Седло</option>
                  <option value="bridle">Уздечка</option>
                  <option value="halter">Недоуздок</option>
                  <option value="blanket">Попона</option>
                  <option value="boot">Ногавки</option>
                  <option value="grooming">Груминг</option>
                  <option value="other">Прочее</option>
                </select>
              </div>

              {/* Поле состояния - Всегда активно в режиме обслуживания */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
                  Состояние *
                </label>
                <select
                  id="condition"
                  name="condition"
                  required
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="excellent">Отличное</option>
                  <option value="good">Хорошее</option>
                  <option value="fair">Удовлетворительное</option>
                  <option value="poor">Плохое</option>
                </select>
              </div>

              {/* Поле бренда */}
              <div>
                <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
                  Бренд
                </label>
                <input
                  type="text"
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  disabled={isFieldDisabled('brand')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Например: Wintec"
                />
              </div>

              {/* Поле модели */}
              <div>
                <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
                  Модель
                </label>
                <input
                  type="text"
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  disabled={isFieldDisabled('model')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Например: Pro Dressage"
                />
              </div>

              {/* Поле размера */}
              <div>
                <label htmlFor="size" className="block text-sm font-medium text-gray-700 mb-2">
                  Размер
                </label>
                <input
                  type="text"
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  disabled={isFieldDisabled('size')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Например: 17.5 дюймов"
                />
              </div>

              {/* Поле назначенной лошади - Показывать только в режимах создания/редактирования */}
              {mode !== 'maintenance' && (
                <div>
                  <label htmlFor="assignedHorse" className="block text-sm font-medium text-gray-700 mb-2">
                    Назначенная лошадь
                  </label>
                  <select
                    id="assignedHorse"
                    name="assignedHorse"
                    value={formData.assignedHorse}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Не назначено</option>
                    {horses.map((horse) => (
                      <option key={horse._id} value={horse._id}>
                        {horse.name} ({horse.breed})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Поле местоположения */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Местоположение
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={isFieldDisabled('location')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Например: Комната снаряжения A"
                />
              </div>

              {/* Поле даты покупки */}
              <div>
                <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Дата покупки
                </label>
                <input
                  type="date"
                  id="purchaseDate"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  disabled={isFieldDisabled('purchaseDate')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Поле первоначальной стоимости */}
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                  Первоначальная стоимость (₽)
                </label>
                <input
                  type="number"
                  id="cost"
                  name="cost"
                  min="0"
                  step="0.01"
                  value={formData.cost || ''}
                  onChange={handleChange}
                  disabled={isFieldDisabled('cost')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Поле текущей стоимости */}
              <div>
                <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700 mb-2">
                  Текущая стоимость (₽)
                </label>
                <input
                  type="number"
                  id="currentValue"
                  name="currentValue"
                  min="0"
                  step="0.01"
                  value={formData.currentValue || ''}
                  onChange={handleChange}
                  disabled={isFieldDisabled('currentValue')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>

              {/* Поле последнего обслуживания - Всегда активно */}
              <div>
                <label htmlFor="lastMaintenance" className="block text-sm font-medium text-gray-700 mb-2">
                  Последнее обслуживание
                </label>
                <input
                  type="date"
                  id="lastMaintenance"
                  name="lastMaintenance"
                  value={formData.lastMaintenance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Поле следующего обслуживания - Всегда активно */}
              <div>
                <label htmlFor="nextMaintenance" className="block text-sm font-medium text-gray-700 mb-2">
                  Следующее обслуживание
                </label>
                <input
                  type="date"
                  id="nextMaintenance"
                  name="nextMaintenance"
                  value={formData.nextMaintenance}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Поле заметок по обслуживанию - Всегда активно */}
            <div>
              <label htmlFor="maintenanceNotes" className="block text-sm font-medium text-gray-700 mb-2">
                Заметки по обслуживанию
              </label>
              <textarea
                id="maintenanceNotes"
                name="maintenanceNotes"
                rows={3}
                value={formData.maintenanceNotes}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Заметки о техническом обслуживании..."
              />
            </div>

            {/* Поле общих заметок - Показывать только в режимах создания/редактирования */}
            {mode !== 'maintenance' && (
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                  Общие заметки
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Дополнительная информация о снаряжении..."
                />
              </div>
            )}

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
                  ? (mode === 'edit' 
                      ? 'Сохранение...' 
                      : mode === 'maintenance'
                        ? 'Сохранение обслуживания...'
                        : 'Создание...') 
                  : (mode === 'edit' 
                      ? 'Сохранить изменения' 
                      : mode === 'maintenance'
                        ? 'Сохранить обслуживание'
                        : 'Добавить снаряжение')
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default EquipmentForm