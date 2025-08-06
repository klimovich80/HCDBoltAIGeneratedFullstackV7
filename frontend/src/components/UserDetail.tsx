import React from 'react'
import { X, Calendar, Mail, Phone, Shield, User, AlertTriangle, FileText } from 'lucide-react'

interface User {
  _id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: 'admin' | 'trainer' | 'member' | 'guest'
  membershipTier?: 'basic' | 'premium' | 'elite'
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

interface UserDetailProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

const UserDetail: React.FC<UserDetailProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Администратор'
      case 'trainer': return 'Тренер'
      case 'member': return 'Участник'
      case 'guest': return 'Гость'
      default: return role
    }
  }

  const getMembershipTierLabel = (tier?: string) => {
    switch (tier) {
      case 'elite': return 'Элитное'
      case 'premium': return 'Премиум'
      case 'basic': return 'Базовое'
      default: return 'Не указано'
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-indigo-600 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.first_name} {user.last_name}
                {user.isActive === false && (
                  <span className="ml-3 inline-flex px-2 py-1 text-sm font-semibold rounded-full bg-gray-100 text-gray-800">
                    Архивирован
                  </span>
                )}
              </h2>
              <p className="text-gray-600 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                {getRoleLabel(user.role)}
              </p>
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
            {/* Basic Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Роль:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  {user.role === 'member' && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Уровень членства:</span>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMembershipTierColor(user.membershipTier)}`}>
                        {getMembershipTierLabel(user.membershipTier)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Контактная информация</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Email:</span>
                      <span className="ml-2 font-medium">{user.email}</span>
                    </div>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <div>
                        <span className="text-gray-600">Телефон:</span>
                        <span className="ml-2 font-medium">{user.phone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              {(user.emergencyContactName || user.emergencyContactPhone) && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                    Экстренный контакт
                  </h3>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {user.emergencyContactName && (
                        <div>
                          <span className="text-gray-600">Имя:</span>
                          <span className="ml-2 font-medium">{user.emergencyContactName}</span>
                        </div>
                      )}
                      {user.emergencyContactPhone && (
                        <div>
                          <span className="text-gray-600">Телефон:</span>
                          <span className="ml-2 font-medium">{user.emergencyContactPhone}</span>
                        </div>
                      )}
                      {user.emergencyContactRelationship && (
                        <div>
                          <span className="text-gray-600">Отношение:</span>
                          <span className="ml-2 font-medium">{user.emergencyContactRelationship}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              {/* Account Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Статус аккаунта</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Статус:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.isActive !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {user.isActive !== false ? 'Активен' : 'Архивирован'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Дата регистрации:</span>
                    <span className="font-medium">{formatDate(user.createdAt)}</span>
                  </div>
                  {user.updatedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Последнее обновление:</span>
                      <span className="font-medium">{formatDate(user.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes */}
              {user.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Заметки
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{user.notes}</p>
                  </div>
                </div>
              )}

              {/* Statistics placeholder */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">-</div>
                      <div className="text-sm text-gray-600">Занятий</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">-</div>
                      <div className="text-sm text-gray-600">Платежей</div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Статистика будет доступна после интеграции с другими модулями
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with timestamps */}
          {(user.createdAt || user.updatedAt) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-500">
                {user.createdAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Создан: {formatDate(user.createdAt)}
                  </div>
                )}
                {user.updatedAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Обновлен: {formatDate(user.updatedAt)}
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

export default UserDetail