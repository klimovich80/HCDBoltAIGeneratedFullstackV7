// hooks/useEquipmentPhotos.ts
import { useState } from 'react';
import { apiClient } from '../lib/api';

export const useEquipmentPhotos = (equipmentId: string, onUpdate: () => void) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    setUploading(true);
    setError('');
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('photos', file);
      });
      
      const response = await apiClient.upload(
        `equipment/${equipmentId}/photos`,
        formData
      );
      
      if (response.success) {
        onUpdate();
      } else {
        setError(response.message || 'Ошибка при загрузке фотографий');
      }
    } catch (err) {
      setError('Ошибка при загрузке фотографий');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (photoId: string) => {
    try {
      const response = await apiClient.update(
        `equipment/${equipmentId}/photos/${photoId}`,
        { isPrimary: true }
      );
      
      if (response.success) {
        onUpdate();
      } else {
        setError(response.message || 'Ошибка при установке основной фотографии');
      }
    } catch (err) {
      setError('Ошибка при установке основной фотографии');
      console.error('Set primary error:', err);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту фотографию?')) return;
    
    try {
      const response = await apiClient.delete(
        `equipment/${equipmentId}/photos/${photoId}`
      );
      
      if (response.success) {
        onUpdate();
      } else {
        setError(response.message || 'Ошибка при удалении фотографии');
      }
    } catch (err) {
      setError('Ошибка при удалении фотографии');
      console.error('Delete photo error:', err);
    }
  };

  return {
    uploading,
    error,
    handleFileSelect,
    handleSetPrimary,
    handleDeletePhoto,
    setError
  };
};