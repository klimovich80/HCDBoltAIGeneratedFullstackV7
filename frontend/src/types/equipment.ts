// src/types/equipment.ts

export interface Horse {
  _id: string
  name: string
  breed: string
}

export interface Equipment {
  _id: string
  name: string
  category: 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other'
  brand?: string
  model?: string
  size?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  purchaseDate?: string
  cost?: number
  currentValue?: number
  assignedHorse?: {
    _id: string
    name: string
    breed: string
  }
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNotes?: string
  location?: string
  notes?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface EquipmentFormData {
  name: string
  category: 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other'
  brand?: string
  model?: string
  size?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  purchaseDate?: string
  cost?: number
  currentValue?: number
  assignedHorse?: string
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNotes?: string
  location?: string
  notes?: string
}

// Добавляем интерфейс для данных обслуживания
export interface MaintenanceData {
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNotes?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
}

export interface EquipmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  equipment?: Equipment | null
  mode?: 'create' | 'edit' | 'maintenance'
}

// Интерфейс для создания/обновления оборудования
export interface EquipmentRequest {
  name: string
  category: 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other'
  brand?: string
  model?: string
  size?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  purchaseDate?: string
  cost?: number
  currentValue?: number
  assignedHorse?: string  // Теперь это строка (ID)
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNotes?: string
  location?: string
  notes?: string
}

// Интерфейс для ответа API (получение оборудования)
export interface EquipmentResponse {
  _id: string
  name: string
  category: 'saddle' | 'bridle' | 'halter' | 'blanket' | 'boot' | 'grooming' | 'other'
  brand?: string
  model?: string
  size?: string
  condition: 'excellent' | 'good' | 'fair' | 'poor'
  purchaseDate?: string
  cost?: number
  currentValue?: number
  assignedHorse?: {
    _id: string
    name: string
    breed: string
  }
  lastMaintenance?: string
  nextMaintenance?: string
  maintenanceNotes?: string
  location?: string
  notes?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}