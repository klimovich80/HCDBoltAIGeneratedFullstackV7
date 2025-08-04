import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Eye, Archive, RotateCcw } from 'lucide-react'
import { apiClient } from '../lib/api'
import HorseForm from '../components/HorseForm'
import HorseDetail from '../components/HorseDetail'

interface Horse {
  _id: string
  name: string
  breed: string
  age: number
  gender: 'mare' | 'stallion' | 'gelding'
  color: string
  profileImage?: string
  boardingType: 'full' | 'partial' | 'pasture'
  stallNumber?: string
  vaccinationStatus: 'current' | 'due' | 'overdue'
  isActive?: boolean
  owner?: {
    firstName: string
    lastName: string
  }
}

const Horses: React.FC = () => {
  const [horses, setHorses] = useState<Horse[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHorse, setEditingHorse] = useState<Horse | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [viewingHorse, setViewingHorse] = useState<Horse | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    const fetchHorses = () => {
      apiClient.getAll<{ success: boolean; data: Horse[] }>('horses')
        .then(response => {
          if (response.success) {
            setHorses(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch horses:', error)
          // Устанавливаем демо данные для разработки
          setHorses([
            {
              _id: '1',
              name: 'Thunder',
              breed: 'Thoroughbred',
              age: 8,
              gender: 'gelding',
              color: 'Bay',
              profileImage: 'https://images.pexels.com/photos/1996333/pexels-photo-1996333.jpeg?auto=compress&cs=tinysrgb&w=400',
              boardingType: 'full',
              stallNumber: 'S01',
              vaccinationStatus: 'current',
              isActive: true,
              owner: { firstName: 'Emma', lastName: 'Williams' }
            },
            {
              _id: '2',
              name: 'Moonlight',
              breed: 'Arabian',
              age: 12,
              gender: 'mare',
              color: 'Gray',
              profileImage: 'https://images.pexels.com/photos/1996334/pexels-photo-1996334.jpeg?auto=compress&cs=tinysrgb&w=400',
              boardingType: 'full',
              stallNumber: 'S02',
              vaccinationStatus: 'current',
              isActive: true,
              owner: { firstName: 'James', lastName: 'Brown' }
            },
            {
              _id: '3',
              name: 'Star',
              breed: 'Quarter Horse',
              age: 6,
              gender: 'mare',
              color: 'Chestnut',
              boardingType: 'partial',
              stallNumber: 'S03',
              vaccinationStatus: 'due',
              isActive: true,
              owner: { firstName: 'Sophie', lastName: 'Davis' }
            },
            {
              _id: '4',
              name: 'Retired Champion',
              breed: 'Warmblood',
              age: 20,
              gender: 'gelding',
              color: 'Black',
              boardingType: 'pasture',
              stallNumber: '',
              vaccinationStatus: 'current',
              isActive: false,
              owner: { firstName: 'Former', lastName: 'Owner' }
            }
          ])
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchHorses()
  }, [])

  const handleAddSuccess = () => {
    // Refresh the horses list
    const fetchHorses = () => {
      apiClient.getAll<{ success: boolean; data: Horse[] }>('horses')
        .then(response => {
          if (response.success) {
            setHorses(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch horses:', error)
        })
    }
    fetchHorses()
  }

  const handleEditHorse = (horse: Horse) => {
    setEditingHorse(horse)
    setShowEditForm(true)
  }

  const handleEditSuccess = () => {
    // Refresh the horses list
    const fetchHorses = () => {
      apiClient.getAll<{ success: boolean; data: Horse[] }>('horses')
        .then(response => {
          if (response.success) {
            setHorses(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch horses:', error)
        })
    }
    fetchHorses()
    setEditingHorse(null)
  }

  const handleCloseEditForm = () => {
    setShowEditForm(false)
    setEditingHorse(null)
  }

  const handleViewHorse = (horse: Horse) => {
    setViewingHorse(horse)
    setShowDetailView(true)
  }

  const handleCloseDetailView = () => {
    setShowDetailView(false)
    setViewingHorse(null)
  }

  const handleArchiveHorse = async (horse: Horse) => {
    if (window.confirm(`Вы уверены, что хотите ${horse.isActive ? 'архивировать' : 'восстановить'} лошадь "${horse.name}"?`)) {
      try {
        await apiClient.update('horses', horse._id, { isActive: !horse.isActive })
        // Refresh the horses list
        const response = await apiClient.getAll<{ success: boolean; data: Horse[] }>('horses')
        if (response.success) {
          setHorses(response.data)
        }
      } catch (error) {
        console.error('Failed to archive/restore horse:', error)
        alert('Ошибка при архивировании/восстановлении лошади')
      }
    }
  }

  const filteredHorses = horses.filter(horse =>
    (horse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     horse.breed.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (showArchived ? !horse.isActive : horse.isActive !== false)
  )

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
          <h1 className="text-2xl font-bold text-gray-900">Лошади</h1>
          <p className="text-gray-600">Управляйте лошадьми и их информацией</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Добавить лошадь</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск лошадей..."
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
                  Лошадь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Детали
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Содержание
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Владелец
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Вакцинация
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHorses.map((horse) => (
                <tr key={horse._id} className={`hover:bg-gray-50 ${horse.isActive === false ? 'opacity-60 bg-gray-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {horse.profileImage ? (
                        <img
                          src={horse.profileImage}
                          alt={horse.name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      ) : (
                        <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center mr-3">
                          <span className="text-gray-600 text-xs font-medium">
                            {horse.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {horse.name}
                        {horse.isActive === false && (
                          <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            Архивировано
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">{horse.breed}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {horse.age} лет • {horse.gender === 'mare' ? 'кобыла' : horse.gender === 'stallion' ? 'жеребец' : 'мерин'} • {horse.color}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{getBoardingTypeLabel(horse.boardingType)}</div>
                      {horse.stallNumber && (
                        <div className="text-sm text-gray-500">Денник {horse.stallNumber}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {horse.owner ? `${horse.owner.firstName} ${horse.owner.lastName}` : 'Школьная лошадь'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getVaccinationStatusColor(horse.vaccinationStatus)}`}>
                      {horse.vaccinationStatus === 'current' ? 'актуальна' : horse.vaccinationStatus === 'due' ? 'требуется' : 'просрочена'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewHorse(horse)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Просмотр информации о лошади"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditHorse(horse)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Редактировать лошадь"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleArchiveHorse(horse)}
                        className={`${horse.isActive === false ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'}`}
                        title={horse.isActive === false ? 'Восстановить лошадь' : 'Архивировать лошадь'}
                      >
                        {horse.isActive === false ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <HorseForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
        mode="create"
      />

      <HorseForm
        isOpen={showEditForm}
        onClose={handleCloseEditForm}
        onSuccess={handleEditSuccess}
        horse={editingHorse}
        mode="edit"
      />

      <HorseDetail
        isOpen={showDetailView}
        onClose={handleCloseDetailView}
        horse={viewingHorse}
      />
    </div>
  )
}

export default Horses