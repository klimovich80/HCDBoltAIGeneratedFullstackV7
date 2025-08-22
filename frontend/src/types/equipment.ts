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
  category: 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other';
  brand?: string;
  model?: string;
  size?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
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
  category: 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other';
  brand?: string;
  model?: string;
  size?: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
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
  mode?: 'create' | 'edit' | 'maintenance';
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