export interface Horse {
  _id: string
  name: string
  breed: string
  age: number
  gender: 'mare' | 'stallion' | 'gelding'
  color: string
  markings?: string
  profileImage?: string
  boardingType: 'full' | 'partial' | 'pasture'
  stallNumber?: string
  medicalNotes?: string
  dietaryRestrictions?: string
  vaccinationStatus: 'current' | 'due' | 'overdue'
  insuranceInfo?: string
  registrationNumber?: string
  lastVetVisit?: string
  nextVetVisit?: string
  owner?: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface HorseDetailProps {
  isOpen: boolean
  onClose: () => void
  horse: Horse | null
}

export interface HorseFormData {
  name: string
  breed: string
  age: number
  gender: 'mare' | 'stallion' | 'gelding'
  color: string
  markings?: string
  profileImage?: string
  boardingType: 'full' | 'partial' | 'pasture'
  stallNumber?: string
  medicalNotes?: string
  dietaryRestrictions?: string
  vaccinationStatus: 'current' | 'due' | 'overdue'
  insuranceInfo?: string
  registrationNumber?: string
}

export interface HorseFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  horse?: Horse | null
  mode?: 'create' | 'edit'
}