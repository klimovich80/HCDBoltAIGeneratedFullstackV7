import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '../lib/api'

interface EquipmentFormData {
  name: string
  category: 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other'
  brand?: string
  model?: string
  size?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  purchaseDate?: string
  cost?: number
  currentValue?: number
  assignedHorse?: string
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNotes?: string
  location?: string
  notes?: string
}

interface EquipmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  equipment?: Equipment | null
  mode?: 'create' | 'edit'
}

interface Equipment {
  _id: string
  name: string
  category: 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other'
  brand?: string
  model?: string
  size?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  purchaseDate?: string
  cost?: number
  currentValue?: number
  assignedHorse?: {
    _id: string
    name: string
    breed: string
  }
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNotes?: string
  location?: string
  notes?: string
}

interface Horse {
  _id: string
  name: string
  breed: string
}

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

  // Load horses for assignment
  useEffect(() => {
    const loadHorses = async () => {
      try {
        setLoadingData(true)
        
        const horsesResponse = await apiClient.getAll<{ success: boolean; data: Horse[] }>('horses')
        if (horsesResponse.success) {
          setHorses(horsesResponse.data)
        }
      } catch (error) {
        console.error('Failed to load horses:', error)
        // Set demo data for development
        setHorses([
          { _id: '1', name: 'Thunder', breed: 'Thoroughbred' },
          { _id: '2', name: 'Moonlight', breed: 'Arabian' },
          { _id: '3', name: 'Star', breed: 'Quarter Horse' }
        ])
      } finally {
        setLoadingData(false)
      }
    }

    if (isOpen) {
      loadHorses()
    }
  }, [isOpen])

  // Update form data when equipment prop changes
  useEffect(() => {
    if (equipment && mode === 'edit') {
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
        assignedHorse: equipment.assignedHorse?._id || '',
        lastMaintenance,
        nextMaintenance,
        maintenanceNotes: equipment.maintenanceNotes || '',
        location: equipment.location || '',
        notes: equipment.notes || ''
      })
    } else if (mode === 'create') {
      // Reset form for create mode
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
      // Clean data for API
      const cleanedData = {
        ...formData,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        size: formData.size || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        cost: formData.cost || undefined,
        currentValue: formData.currentValue || undefined,
        assignedHorse: formData.assignedHorse || undefined,
        lastMaintenance: formData.lastMaintenance || undefined,
        nextMaintenance: formData.nextMaintenance || undefined,
        maintenanceNotes: formData.maintenanceNotes || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined
      }

      if (mode === 'edit' && equipment) {
        await apiClient.update('equipment', equipment._id, cleanedData)
      } else {
        await apiClient.create('equipment', cleanedData)
      }

      onSuccess()
      onClose()
      setError('')
    } catch (err: any) {
      setError(err.message || `Failed to ${mode} equipment`)
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Редактировать снаряжение' : 'Добавить снаряжение'}
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
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Название снаряжения *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Например: Седло для выездки"
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Категория *
                </label>
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Например: Wintec"
                />
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Например: Pro Dressage"
                />
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Например: 17.5 дюймов"
                />
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Например: Комната снаряжения A"
                />
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

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
                  : (mode === 'edit' ? 'Сохранить изменения' : 'Добавить снаряжение')
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