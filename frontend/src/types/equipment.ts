export type EquipmentCategory = 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other';
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'poor';
export type EquipmentFormMode = 'create' | 'edit' | 'maintenance';
export interface EquipmentPhoto {
  _id: string;
  url: string;
  caption?: string;
  isPrimary: boolean;
  uploadedAt: string;
}

export interface Equipment {
  _id: string;
  name: string;
  category: EquipmentCategory
  brand?: string;
  model?: string;
  size?: string;
  condition: EquipmentCondition
  purchaseDate?: string;
  cost?: number;
  currentValue?: number;
  assignedHorse?: {
    _id: string;
    name: string;
    breed: string;
  };
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceNotes?: string;
  location?: string;
  notes?: string;
  isActive?: boolean;
  photos?: EquipmentPhoto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface EquipmentFormData {
  name: string;
  category: EquipmentCategory
  brand?: string;
  model?: string;
  size?: string;
  condition: EquipmentCondition
  purchaseDate?: string;
  cost?: number;
  currentValue?: number;
  assignedHorse?: string;
  lastMaintenance?: string;
  nextMaintenance?: string;
  maintenanceNotes?: string;
  location?: string;
  notes?: string;
}

export interface EquipmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  equipment?: Equipment | null;
  mode?: EquipmentFormMode
}
export interface EquipmentDetailProps {
  isOpen: boolean
  onClose: () => void
  equipment: Equipment | null
  onUpdate: () => void
}

export interface EquipmentPhotosProps {
  equipment: Equipment;
  onUpdate: () => void;
  isOpen: boolean;
  onClose: () => void;
}