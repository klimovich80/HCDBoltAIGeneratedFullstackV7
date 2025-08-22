// components/EquipmentForm.tsx
import React from 'react';
import { X } from 'lucide-react';
import { EquipmentFormProps } from '../types/equipment';
import { useEquipmentForm } from '../hooks/useEquipmentForm';

const EquipmentForm: React.FC<EquipmentFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  equipment = null, 
  mode = 'create' 
}) => {
  const {
    formData,
    loading,
    error,
    horses,
    loadingData,
    selectedFiles,
    handleChange,
    handleFileChange,
    removeFile,
    handleSubmit,
    isFieldDisabled
  } = useEquipmentForm({ equipment, mode });

  if (!isOpen) return null;

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
          <form onSubmit={(e) => handleSubmit(e, onSuccess, onClose)} className="p-6 space-y-6">
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

              {/* Поле для загрузки фотографий (только в режиме создания) */}
              {mode === 'create' && (
                <div className="md:col-span-2">
                  <label htmlFor="photos" className="block text-sm font-medium text-gray-700 mb-2">
                    Фотографии снаряжения
                  </label>
                  <input
                    type="file"
                    id="photos"
                    name="photos"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Вы можете выбрать несколько фотографий
                  </p>

                  {/* Превью выбранных файлов */}
                  {selectedFiles.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Выбранные файлы:</h4>
                      <div className="space-y-2">
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                            <span className="text-sm text-gray-600 truncate">{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
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
  );
};

export default EquipmentForm;