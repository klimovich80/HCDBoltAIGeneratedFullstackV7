import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '../lib/api'
import { HorseFormData, HorseFormProps } from '../types/horse'

const HorseForm: React.FC<HorseFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  horse = null, 
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState<HorseFormData>({
    name: '',
    breed: '',
    age: 1,
    gender: 'gelding',
    color: '',
    markings: '',
    profileImage: '',
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
  const [imagePreview, setImagePreview] = useState<string>('')
  const [uploadingImage, setUploadingImage] = useState(false)

  // Update form data when horse prop changes
  useEffect(() => {
    if (horse && mode === 'edit') {
      setFormData({
        name: horse.name,
        breed: horse.breed,
        age: horse.age,
        gender: horse.gender,
        color: horse.color,
        markings: horse.markings || '',
        profileImage: horse.profileImage || '',
        boardingType: horse.boardingType,
        stallNumber: horse.stallNumber || '',
        medicalNotes: horse.medicalNotes || '',
        dietaryRestrictions: horse.dietaryRestrictions || '',
        vaccinationStatus: horse.vaccinationStatus,
        insuranceInfo: horse.insuranceInfo || '',
        registrationNumber: horse.registrationNumber || ''
      })
      setImagePreview(horse.profileImage || '')
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        breed: '',
        age: 1,
        gender: 'gelding',
        color: '',
        markings: '',
        profileImage: '',
        boardingType: 'full',
        stallNumber: '',
        medicalNotes: '',
        dietaryRestrictions: '',
        vaccinationStatus: 'current',
        insuranceInfo: '',
        registrationNumber: ''
      })
      setImagePreview('')
    }
  }, [horse, mode])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите файл изображения')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB')
      return
    }

    setUploadingImage(true)
    setError('')

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append('image', file)

      // Upload to a simple image hosting service or convert to base64
      // For demo purposes, we'll convert to base64
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target?.result as string
        setImagePreview(base64String)
        setFormData(prev => ({
          ...prev,
          profileImage: base64String
        }))
        setUploadingImage(false)
      }
      reader.onerror = () => {
        setError('Ошибка при загрузке изображения')
        setUploadingImage(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.log(error)
      setError('Ошибка при загрузке изображения')
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setImagePreview('')
    setFormData(prev => ({
      ...prev,
      profileImage: ''
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Convert empty strings to undefined for optional fields
    const cleanedData = {
      ...formData,
      markings: formData.markings || undefined,
      stallNumber: formData.stallNumber || undefined,
      profileImage: formData.profileImage || undefined,
      medicalNotes: formData.medicalNotes || undefined,
      dietaryRestrictions: formData.dietaryRestrictions || undefined,
      insuranceInfo: formData.insuranceInfo || undefined,
      registrationNumber: formData.registrationNumber || undefined
    }

    const apiCall = mode === 'edit' && horse
      ? apiClient.update('horses', horse._id, cleanedData)
      : apiClient.create('horses', cleanedData)

    apiCall
      .then(() => {
        onSuccess()
        onClose()
        setError('')
      })
      .catch(err => {
        setError(err.message || `Failed to ${mode} horse`)
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
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Редактировать лошадь' : 'Добавить лошадь'}
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

          {/* Profile Image Section */}
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Фотография лошади
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Horse preview"
                    className="h-24 w-24 rounded-lg object-cover border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Нет фото</span>
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="horse-image-upload"
                  disabled={uploadingImage}
                />
                <label
                  htmlFor="horse-image-upload"
                  className={`cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 ${
                    uploadingImage ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {uploadingImage ? 'Загрузка...' : 'Выбрать фото'}
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG до 5MB
                </p>
              </div>
            </div>
          </div>

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
              {loading 
                ? (mode === 'edit' ? 'Сохранение...' : 'Создание...') 
                : (mode === 'edit' ? 'Сохранить изменения' : 'Создать лошадь')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default HorseForm