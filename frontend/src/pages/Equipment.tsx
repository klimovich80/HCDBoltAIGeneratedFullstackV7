import React, { useState, useEffect } from 'react'
import { Search, Plus, Package, Wrench, Edit, Eye, Trash2, Archive, RotateCcw } from 'lucide-react'
import { apiClient } from '../lib/api'
import EquipmentForm from '../components/EquipmentForm'
import EquipmentDetail from '../components/EquipmentDetail'

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
  isActive?: boolean
}

const Equipment: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [viewingEquipment, setViewingEquipment] = useState<Equipment | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

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
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchEquipment()
  }, [])

  const handleAddSuccess = () => {
    // Refresh the equipment list
    const fetchEquipment = () => {
      apiClient.getAll<{ success: boolean; data: Equipment[] }>('equipment')
        .then(response => {
          if (response.success) {
            setEquipment(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch equipment:', error)
        })
    }
    fetchEquipment()
  }

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment)
    setShowEditForm(true)
  }

  const handleEditSuccess = () => {
    // Refresh the equipment list
    const fetchEquipment = () => {
      apiClient.getAll<{ success: boolean; data: Equipment[] }>('equipment')
        .then(response => {
          if (response.success) {
            setEquipment(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch equipment:', error)
        })
    }
    fetchEquipment()
    setEditingEquipment(null)
  }

  const handleCloseEditForm = () => {
    setShowEditForm(false)
    setEditingEquipment(null)
  }

  const handleViewEquipment = (equipment: Equipment) => {
    setViewingEquipment(equipment)
    setShowDetailView(true)
  }

  const handleCloseDetailView = () => {
    setShowDetailView(false)
    setViewingEquipment(null)
  }

  const handleDeleteEquipment = async (equipment: Equipment) => {
    if (window.confirm(`Вы уверены, что хотите удалить снаряжение "${equipment.name}"? Это действие нельзя отменить.`)) {
      try {
        await apiClient.delete('equipment', equipment._id)
        handleAddSuccess() // Refresh the list
      } catch (error) {
        console.error('Failed to delete equipment:', error)
        alert('Ошибка при удалении снаряжения')
      }
    }
  }

  const handleArchiveEquipment = async (equipment: Equipment) => {
    if (window.confirm(`Вы уверены, что хотите ${equipment.isActive ? 'архивировать' : 'восстановить'} снаряжение "${equipment.name}"?`)) {
      try {
        await apiClient.update('equipment', equipment._id, { isActive: !equipment.isActive })
        handleAddSuccess() // Refresh the list
      } catch (error) {
        console.error('Failed to archive/restore equipment:', error)
        alert('Ошибка при архивировании/восстановлении снаряжения')
      }
    }
  }

  const filteredEquipment = equipment.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(item => showArchived ? true : item.isActive !== false)

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
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить снаряжение</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
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
            <div className="flex items-center space-x-4">
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
                  <tr key={item._id} className={`hover:bg-gray-50 ${item.isActive === false ? 'opacity-60 bg-gray-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CategoryIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.name}
                            {item.isActive === false && (
                              <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                                Архивировано
                              </span>
                            )}
                          </div>
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
                        <button 
                          onClick={() => handleViewEquipment(item)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Просмотр информации о снаряжении"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditEquipment(item)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Редактировать снаряжение"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleArchiveEquipment(item)}
                          className={`${item.isActive === false ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'}`}
                          title={item.isActive === false ? 'Восстановить снаряжение' : 'Архивировать снаряжение'}
                        >
                          {item.isActive === false ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                        </button>
                        <button 
                          onClick={() => handleDeleteEquipment(item)}
                          className="text-red-600 hover:text-red-900"
                          title="Удалить снаряжение"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <EquipmentForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
        mode="create"
      />

      <EquipmentForm
        isOpen={showEditForm}
        onClose={handleCloseEditForm}
        onSuccess={handleEditSuccess}
        equipment={editingEquipment}
        mode="edit"
      />

      <EquipmentDetail
        isOpen={showDetailView}
        onClose={handleCloseDetailView}
        equipment={viewingEquipment}
      />
    </div>
  )
}

export default Equipment