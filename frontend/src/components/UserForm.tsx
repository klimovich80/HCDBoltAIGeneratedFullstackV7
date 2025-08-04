import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '../lib/api'

interface UserFormData {
  firstName: string
  lastName: string
  email: string
  password?: string
  phone?: string
  role: 'admin' | 'trainer' | 'member' | 'guest'
  membershipTier?: 'basic' | 'premium' | 'elite'
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  notes?: string
}

interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: User | null
  mode?: 'create' | 'edit'
}

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
  emergencyContactRelationship?: string
  notes?: string
}

const UserForm: React.FC<UserFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  user = null, 
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    role: 'member',
    membershipTier: 'basic',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Update form data when user prop changes
  useEffect(() => {
    if (user && mode === 'edit') {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '', // Don't pre-fill password for security
        phone: user.phone || '',
        role: user.role,
        membershipTier: user.membershipTier || 'basic',
        emergencyContactName: user.emergencyContactName || '',
        emergencyContactPhone: user.emergencyContactPhone || '',
        emergencyContactRelationship: user.emergencyContactRelationship || '',
        notes: user.notes || ''
      })
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        role: 'member',
        membershipTier: 'basic',
        emergencyContactName: '',
        emergencyContactPhone: '',
        emergencyContactRelationship: '',
        notes: ''
      })
    }
  }, [user, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Clean data for API
      const cleanedData = {
        ...formData,
        phone: formData.phone || undefined,
        membershipTier: formData.role === 'member' ? formData.membershipTier : undefined,
        emergencyContactName: formData.emergencyContactName || undefined,
        emergencyContactPhone: formData.emergencyContactPhone || undefined,
        emergencyContactRelationship: formData.emergencyContactRelationship || undefined,
        notes: formData.notes || undefined
      }

      // Remove password if empty for edit mode
      if (mode === 'edit' && !formData.password) {
        delete cleanedData.password
      }

      if (mode === 'edit' && user) {
        await apiClient.update('users', user._id, cleanedData)
      } else {
        await apiClient.create('users', cleanedData)
      }

      onSuccess()
      onClose()
      setError('')
    } catch (err: any) {
      setError(err.message || `Failed to ${mode} user`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Редактировать пользователя' : 'Добавить пользователя'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                Имя *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Фамилия *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Телефон
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                Роль *
              </label>
              <select
                id="role"
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="member">Участник</option>
                <option value="trainer">Тренер</option>
                <option value="admin">Администратор</option>
                <option value="guest">Гость</option>
              </select>
            </div>

            {formData.role === 'member' && (
              <div>
                <label htmlFor="membershipTier" className="block text-sm font-medium text-gray-700 mb-2">
                  Уровень членства
                </label>
                <select
                  id="membershipTier"
                  name="membershipTier"
                  value={formData.membershipTier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="basic">Базовый</option>
                  <option value="premium">Премиум</option>
                  <option value="elite">Элитный</option>
                </select>
              </div>
            )}

            {mode === 'create' && (
              <div className={formData.role === 'member' ? '' : 'md:col-span-2'}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Пароль *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required={mode === 'create'}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  minLength={6}
                />
              </div>
            )}

            {mode === 'edit' && (
              <div className={formData.role === 'member' ? '' : 'md:col-span-2'}>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Новый пароль (оставьте пустым, чтобы не менять)
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  minLength={6}
                />
              </div>
            )}
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Экстренный контакт</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="emergencyContactName" className="block text-sm font-medium text-gray-700 mb-2">
                  Имя контакта
                </label>
                <input
                  type="text"
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="emergencyContactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон контакта
                </label>
                <input
                  type="tel"
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="emergencyContactRelationship" className="block text-sm font-medium text-gray-700 mb-2">
                  Отношение
                </label>
                <input
                  type="text"
                  id="emergencyContactRelationship"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Родитель, супруг, друг..."
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Заметки
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Дополнительная информация о пользователе..."
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
                : (mode === 'edit' ? 'Сохранить изменения' : 'Создать пользователя')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm