import React, { useState, useEffect } from 'react'
import { Search, Plus, Package, Wrench } from 'lucide-react'
import { apiClient } from '../lib/api'

interface Equipment {
  _id: string
  name: string
  category: 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other'
  brand?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  assignedHorse?: {
    name: string
    breed: string
  }
  cost?: number
  currentValue?: number
  location?: string
  lastMaintenance?: string
  nextMaintenance?: string
}

const Equipment: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchEquipment = () => {
      apiClient.getAll<{ success: boolean; data: Equipment[] }>('equipment')
        .then(response => {
          if (response.success) {
            setEquipment(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch equipment:', error)
          // Устанавливаем демо данные для разработки
          setEquipment([
            {
              _id: '1',
              name: 'English All-Purpose Saddle',
              category: 'saddle',
              brand: 'Wintec',
              condition: 'excellent',
              assignedHorse: { name: 'Thunder', breed: 'Thoroughbred' },
              cost: 850,
              currentValue: 600,
              location: 'Tack Room A'
            },
            {
              _id: '2',
              name: 'Dressage Bridle',
              category: 'bridle',
              brand: 'Stubben',
              condition: 'good',
              assignedHorse: { name: 'Thunder', breed: 'Thoroughbred' },
              cost: 320,
              currentValue: 250,
              location: 'Tack Room A'
            },
            {
              _id: '3',
              name: 'Western Saddle',
              category: 'saddle',
              brand: 'Circle Y',
              condition: 'good',
              assignedHorse: { name: 'Blaze', breed: 'Paint Horse' },
              cost: 1200,
              currentValue: 900,
              location: 'Tack Room B'
            },
            {
              _id: '4',
              name: 'Training Halter',
              category: 'halter',
              brand: 'Tough-1',
              condition: 'excellent',
              assignedHorse: { name: 'Spirit', breed: 'Mustang' },
              cost: 35,
              currentValue: 30,
              location: 'Barn Aisle'
            },
            {
              _id: '5',
              name: 'Winter Blanket',
              category: 'blanket',
              brand: 'Rambo',
              condition: 'fair',
              assignedHorse: { name: 'Moonlight', breed: 'Arabian' },
              cost: 180,
              currentValue: 100,
              location: 'Blanket Storage'
            }
          ])
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchEquipment()
  }, [])

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800'
      case 'good': return 'bg-blue-100 text-blue-800'
      case 'fair': return 'bg-yellow-100 text-yellow-800'
      case 'poor': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'saddle':
      case 'bridle':
      case 'halter':
        return Package
      default:
        return Package
    }
  }

  const formatCurrency = (amount?: number) => {
    return amount ? `${amount.toLocaleString()}₽` : 'Не указано'
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
          <h1 className="text-2xl font-bold text-gray-900">Снаряжение</h1>
          <p className="text-gray-600">Управляйте амуницией, снаряжением и инвентарем</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Добавить снаряжение</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск снаряжения..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Снаряжение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Категория
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Состояние
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Назначенная лошадь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Стоимость
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Местоположение
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.map((item) => {
                const CategoryIcon = getCategoryIcon(item.category)
                return (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CategoryIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.brand && (
                            <div className="text-sm text-gray-500">{item.brand}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">
                        {item.category === 'saddle' ? 'седло' : 
                         item.category === 'bridle' ? 'уздечка' : 
                         item.category === 'halter' ? 'недоуздок' : 
                         item.category === 'blanket' ? 'попона' : 
                         item.category === 'boot' ? 'ногавки' : 
                         item.category === 'grooming' ? 'груминг' : 'прочее'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getConditionColor(item.condition)}`}>
                        {item.condition === 'excellent' ? 'отличное' : 
                         item.condition === 'good' ? 'хорошее' : 
                         item.condition === 'fair' ? 'удовлетворительное' : 'плохое'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.assignedHorse ? (
                        <div>
                          <div className="text-sm text-gray-900">{item.assignedHorse.name}</div>
                          <div className="text-sm text-gray-500">{item.assignedHorse.breed}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Не назначено</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm text-gray-900">
                          Текущая: {formatCurrency(item.currentValue)}
                        </div>
                        <div className="text-sm text-gray-500">
                          Первоначальная: {formatCurrency(item.cost)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{item.location || 'Не указано'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-indigo-600 hover:text-indigo-900">
                          <Package className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Wrench className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Equipment