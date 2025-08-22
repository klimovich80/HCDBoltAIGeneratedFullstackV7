// hooks/useEquipmentForm.ts
import { useState, useEffect } from 'react';
import { EquipmentFormData, EquipmentFormProps, MaintenanceData} from '../types/equipment';
import { Horse } from '../types/horse';
import { apiClient } from '../lib/api';
import { getErrorMessage } from '../utils/errorUtils';

interface ApiEquipmentResponse {
  _id: string;
  // другие поля, которые могут быть в ответе
  [key: string]: unknown;
}

export const useEquipmentForm = ({ equipment, mode }: Pick<EquipmentFormProps, 'equipment' | 'mode'>) => {
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: '',
    category: 'saddle',
    brand: '',
    model: '',
    size: '',
    condition: 'good',
    purchaseDate: '',
    cost: undefined,
    currentValue: undefined,
    assignedHorse: '',
    lastMaintenance: '',
    nextMaintenance: '',
    maintenanceNotes: '',
    location: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [horses, setHorses] = useState<Horse[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  // Load horses for assignment
  useEffect(() => {
    const loadHorses = async () => {
      try {
        setLoadingData(true);
        const horsesResponse = await apiClient.getAll<Horse>('horses');
        if (horsesResponse.success) {
          setHorses(horsesResponse.data || []);
        }
      } catch (error) {
        console.error('Не удалось загрузить лошадей:', error);
      } finally {
        setLoadingData(false);
      }
    };

    if (mode !== 'maintenance') {
      loadHorses();
    } else {
      setLoadingData(false);
    }
  }, [mode]);

  // Update form data when equipment changes
  useEffect(() => {
    if (equipment && (mode === 'edit' || mode === 'maintenance')) {
      const purchaseDate = equipment.purchaseDate ? new Date(equipment.purchaseDate).toISOString().slice(0, 10) : '';
      const lastMaintenance = equipment.lastMaintenance ? new Date(equipment.lastMaintenance).toISOString().slice(0, 10) : '';
      const nextMaintenance = equipment.nextMaintenance ? new Date(equipment.nextMaintenance).toISOString().slice(0, 10) : '';
      
      setFormData({
        name: equipment.name,
        category: equipment.category,
        brand: equipment.brand || '',
        model: equipment.model || '',
        size: equipment.size || '',
        condition: equipment.condition,
        purchaseDate,
        cost: equipment.cost,
        currentValue: equipment.currentValue,
        assignedHorse: equipment.assignedHorse?._id || '',
        lastMaintenance,
        nextMaintenance,
        maintenanceNotes: equipment.maintenanceNotes || '',
        location: equipment.location || '',
        notes: equipment.notes || ''
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        name: '',
        category: 'saddle',
        brand: '',
        model: '',
        size: '',
        condition: 'good',
        purchaseDate: '',
        cost: undefined,
        currentValue: undefined,
        assignedHorse: '',
        lastMaintenance: '',
        nextMaintenance: '',
        maintenanceNotes: '',
        location: '',
        notes: ''
      });
      setSelectedFiles([]);
    }
  }, [equipment, mode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cost' || name === 'currentValue' 
        ? value === '' ? undefined : parseFloat(value) || 0 
        : value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent, onSuccess: () => void, onClose: () => void) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'maintenance' && equipment) {
        // For maintenance mode
        const maintenanceData: MaintenanceData = {
          lastMaintenance: formData.lastMaintenance || undefined,
          nextMaintenance: formData.nextMaintenance || undefined,
          maintenanceNotes: formData.maintenanceNotes || undefined,
          condition: formData.condition
        };
        
        // Используем новую сигнатуру метода update
        await apiClient.update(`equipment/${equipment._id}`, maintenanceData);
      } else {
        // For create and edit modes
        const requestData: EquipmentFormData = {
          name: formData.name,
          category: formData.category,
          brand: formData.brand || undefined,
          model: formData.model || undefined,
          size: formData.size || undefined,
          condition: formData.condition,
          purchaseDate: formData.purchaseDate || undefined,
          cost: formData.cost,
          currentValue: formData.currentValue,
          assignedHorse: formData.assignedHorse || undefined,
          lastMaintenance: formData.lastMaintenance || undefined,
          nextMaintenance: formData.nextMaintenance || undefined,
          maintenanceNotes: formData.maintenanceNotes || undefined,
          location: formData.location || undefined,
          notes: formData.notes || undefined
        };

        if (mode === 'edit' && equipment) {
          // Используем новую сигнатуру метода update
          await apiClient.update(`equipment/${equipment._id}`, requestData);
        } else {
          // For create mode, first create the equipment
          const createResponse = await apiClient.create<ApiEquipmentResponse>('equipment', requestData);
          
          // If there are selected files, upload them
          if (createResponse.success && selectedFiles.length > 0) {
            const equipmentId = createResponse.data?._id;
            
            if (equipmentId) {
              const uploadFormData = new FormData();
              selectedFiles.forEach(file => {
                uploadFormData.append('photos', file);
              });
              
              await apiClient.upload(`equipment/${equipmentId}/photos`, uploadFormData);
            }
          }
        }
      }

      onSuccess();
      onClose();
      setError('');
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(`Не удалось ${mode === 'edit' ? 'отредактировать' : mode === 'maintenance' ? 'обслужить' : 'создать'} снаряжение: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const isFieldDisabled = (fieldName: string): boolean => {
    if (mode !== 'maintenance') return false;
    
    // In maintenance mode, only these fields are editable
    const editableFields = ['condition', 'lastMaintenance', 'nextMaintenance', 'maintenanceNotes'];
    return !editableFields.includes(fieldName);
  };

  return {
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
  };
};