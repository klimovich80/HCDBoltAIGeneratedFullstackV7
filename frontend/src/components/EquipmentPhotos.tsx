// components/EquipmentPhotos.tsx
import React, { useRef } from 'react';
import { X, Upload, Trash2, Star, Image } from 'lucide-react';
import { EquipmentPhotosProps } from '../types/equipment';
import { useEquipmentPhotos } from '../hooks/useEquipmentPhotos';

const EquipmentPhotos: React.FC<EquipmentPhotosProps> = ({
  equipment,
  onUpdate,
  isOpen,
  onClose
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    uploading,
    error,
    handleFileSelect,
    handleSetPrimary,
    handleDeletePhoto,
    setError
  } = useEquipmentPhotos(equipment._id, onUpdate);

  if (!isOpen) return null;

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Фотографии снаряжения: {equipment.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
              <p className="text-red-600 text-sm">{error}</p>
              <button onClick={() => setError('')} className="text-red-600 hover:text-red-800 mt-2">
                Закрыть
              </button>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Добавить фотографии
            </label>
            <div className="flex items-center space-x-4">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
                id="photo-upload"
              />
              <label
                htmlFor="photo-upload"
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Выбрать файлы
              </label>
              {uploading && (
                <div className="text-gray-500">Загрузка...</div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Вы можете выбрать несколько фотографий
            </p>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Галерея фотографий
            </h3>
            
            {(!equipment.photos || equipment.photos.length === 0) ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Нет загруженных фотографий</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {equipment.photos.map((photo) => (
                  <div key={photo._id} className="relative group">
                    <img
                      src={photo.url}
                      alt={photo.caption || `Фото снаряжения ${equipment.name}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex space-x-2">
                        {!photo.isPrimary && (
                          <button
                            onClick={() => handleSetPrimary(photo._id)}
                            className="p-2 bg-white rounded-full hover:bg-gray-100"
                            title="Сделать основной"
                          >
                            <Star className="h-4 w-4 text-yellow-500" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeletePhoto(photo._id)}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="Удалить"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    {photo.isPrimary && (
                      <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs">
                        Основная
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default EquipmentPhotos;