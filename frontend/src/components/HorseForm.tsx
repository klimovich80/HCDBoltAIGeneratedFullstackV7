import React, { useState } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '../lib/api'

interface HorseFormData {
  name: string
  breed: string
  age: number
  gender: 'mare' | 'stallion' | 'gelding'
  color: string
  markings?: string
  boardingType: 'full' | 'partial' | 'pasture'
  stallNumber?: string
  medicalNotes?: string
  dietaryRestrictions?: string
  vaccinationStatus: 'current' | 'due' | 'overdue'
  insuranceInfo?: string
  registrationNumber?: string
}

interface HorseFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

const HorseForm: React.FC<HorseFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<HorseFormData>({
    name: '',
    breed: '',
    age: 1,
    gender: 'gelding',
    color: '',
    markings: '',
    boardingType: 'full',
    stallNumber: '',
    medicalNotes: '',
    dietaryRestrictions: '',
    vaccinationStatus: 'current',
    insuranceInfo: '',
    registrationNumber: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Convert empty strings to undefined for optional fields
    const cleanedData = {
      ...formData,
      markings: formData.markings || undefined,
      stallNumber: formData.stallNumber || undefined,
      medicalNotes: formData.medicalNotes || undefined,
      dietaryRestrictions: formData.dietaryRestrictions || undefined,
      insuranceInfo: formData.insuranceInfo || undefined,
      registrationNumber: formData.registrationNumber || undefined
    }

    apiClient.create('horses', cleanedData)
      .then(() => {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          name: '',
          breed: '',
          age: 1,
          gender: 'gelding',
          color: '',
          markings: '',
          boardingType: 'full',
          stallNumber: '',
          medicalNotes: '',
          dietaryRestrictions: '',
          vaccinationStatus: 'current',
          insuranceInfo: '',
          registrationNumber: ''
        })
      })
      .catch(err => {
        setError(err.message || 'Failed to create horse')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' ? parseInt(value) || 1 : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Добавить лошадь</h2>
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
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Кличка *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="breed" className="block text-sm font-medium text-gray-700 mb-2">
                Порода *
              </label>
              <input
                type="text"
                id="breed"
                name="breed"
                required
                value={formData.breed}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Возраст *
              </label>
              <input
                type="number"
                id="age"
                name="age"
                required
                min="1"
                max="50"
                value={formData.age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Пол *
              </label>
              <select
                id="gender"
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="mare">Кобыла</option>
                <option value="stallion">Жеребец</option>
                <option value="gelding">Мерин</option>
              </select>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                Масть *
              </label>
              <input
                type="text"
                id="color"
                name="color"
                required
                value={formData.color}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="markings" className="block text-sm font-medium text-gray-700 mb-2">
                Отметины
              </label>
              <input
                type="text"
                id="markings"
                name="markings"
                value={formData.markings}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="boardingType" className="block text-sm font-medium text-gray-700 mb-2">
                Тип содержания *
              </label>
              <select
                id="boardingType"
                name="boardingType"
                required
                value={formData.boardingType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="full">Полное содержание</option>
                <option value="partial">Частичное содержание</option>
                <option value="pasture">Пастбищное содержание</option>
              </select>
            </div>

            <div>
              <label htmlFor="stallNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Номер денника
              </label>
              <input
                type="text"
                id="stallNumber"
                name="stallNumber"
                value={formData.stallNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="vaccinationStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Статус вакцинации *
              </label>
              <select
                id="vaccinationStatus"
                name="vaccinationStatus"
                required
                value={formData.vaccinationStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="current">Актуальна</option>
                <option value="due">Требуется</option>
                <option value="overdue">Просрочена</option>
              </select>
            </div>

            <div>
              <label htmlFor="registrationNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Регистрационный номер
              </label>
              <input
                type="text"
                id="registrationNumber"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700 mb-2">
              Медицинские заметки
            </label>
            <textarea
              id="medicalNotes"
              name="medicalNotes"
              rows={3}
              value={formData.medicalNotes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="dietaryRestrictions" className="block text-sm font-medium text-gray-700 mb-2">
              Диетические ограничения
            </label>
            <textarea
              id="dietaryRestrictions"
              name="dietaryRestrictions"
              rows={3}
              value={formData.dietaryRestrictions}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="insuranceInfo" className="block text-sm font-medium text-gray-700 mb-2">
              Информация о страховке
            </label>
            <textarea
              id="insuranceInfo"
              name="insuranceInfo"
              rows={2}
              value={formData.insuranceInfo}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
              {loading ? 'Создание...' : 'Создать лошадь'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HorseForm