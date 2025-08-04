import React, { useState, useEffect } from 'react'
import { Search, Plus, Mail, Phone, Shield } from 'lucide-react'
import { apiClient } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'

interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'admin' | 'trainer' | 'member' | 'guest'
  membershipTier?: 'basic' | 'premium' | 'elite'
  emergencyContactName?: string
  emergencyContactPhone?: string
  createdAt: string
}

const Users: React.FC = () => {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  // Разрешить доступ только администраторам и тренерам
  if (!currentUser || !['admin', 'trainer'].includes(currentUser.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Доступ запрещен</h3>
          <p className="text-gray-600">У вас нет разрешения на просмотр этой страницы.</p>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const fetchUsers = () => {
      apiClient.getAll<{ success: boolean; data: User[] }>('users')
        .then(response => {
          if (response.success) {
            setUsers(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch users:', error)
          // Устанавливаем демо данные для разработки
          setUsers([
            {
              _id: '1',
              firstName: 'Admin',
              lastName: 'User',
              email: 'admin@equestrian.com',
              phone: '+1-555-0001',
              role: 'admin',
              emergencyContactName: 'Emergency Contact',
              emergencyContactPhone: '+1-555-9999',
              createdAt: '2024-01-01T00:00:00Z'
            },
            {
              _id: '2',
              firstName: 'Sarah',
              lastName: 'Johnson',
              email: 'sarah.trainer@equestrian.com',
              phone: '+1-555-0002',
              role: 'trainer',
              emergencyContactName: 'Mike Johnson',
              emergencyContactPhone: '+1-555-9998',
              createdAt: '2024-01-15T00:00:00Z'
            },
            {
              _id: '3',
              firstName: 'Michael',
              lastName: 'Chen',
              email: 'michael.trainer@equestrian.com',
              phone: '+1-555-0003',
              role: 'trainer',
              emergencyContactName: 'Lisa Chen',
              emergencyContactPhone: '+1-555-9997',
              createdAt: '2024-02-01T00:00:00Z'
            },
            {
              _id: '4',
              firstName: 'Emma',
              lastName: 'Williams',
              email: 'emma@email.com',
              phone: '+1-555-0004',
              role: 'member',
              membershipTier: 'premium',
              emergencyContactName: 'David Williams',
              emergencyContactPhone: '+1-555-9996',
              createdAt: '2024-03-01T00:00:00Z'
            },
            {
              _id: '5',
              firstName: 'James',
              lastName: 'Brown',
              email: 'james@email.com',
              phone: '+1-555-0005',
              role: 'member',
              membershipTier: 'basic',
              emergencyContactName: 'Mary Brown',
              emergencyContactPhone: '+1-555-9995',
              createdAt: '2024-03-15T00:00:00Z'
            }
          ])
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchUsers()
  }, [])

  const filteredUsers = users.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'trainer': return 'bg-blue-100 text-blue-800'
      case 'member': return 'bg-green-100 text-green-800'
      case 'guest': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMembershipTierColor = (tier?: string) => {
    switch (tier) {
      case 'elite': return 'bg-purple-100 text-purple-800'
      case 'premium': return 'bg-indigo-100 text-indigo-800'
      case 'basic': return 'bg-gray-100 text-gray-800'
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
          <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600">Управляйте учетными записями пользователей и разрешениями</p>
        </div>
        {currentUser.role === 'admin' && (
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Добавить пользователя</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск пользователей..."
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
                  Пользователь
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Контакты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Членство
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Экстренный контакт
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Присоединился
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone className="h-4 w-4 mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.membershipTier ? (
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMembershipTierColor(user.membershipTier)}`}>
                        {user.membershipTier === 'elite' ? 'элитное' : 
                         user.membershipTier === 'premium' ? 'премиум' : 'базовое'}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-500">Не указано</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.emergencyContactName ? (
                      <div>
                        <div className="text-sm text-gray-900">{user.emergencyContactName}</div>
                        <div className="text-sm text-gray-500">{user.emergencyContactPhone}</div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Не указан</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        Просмотр
                      </button>
                      {currentUser.role === 'admin' && (
                        <button className="text-gray-600 hover:text-gray-900">
                          Редактировать
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Users