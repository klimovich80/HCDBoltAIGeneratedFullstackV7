export interface User {
  _id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: 'admin' | 'trainer' | 'member' | 'guest'
  membershipTier?: 'basic' | 'premium' | 'elite'
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
  profileImage?: string
}

export interface UserDetailProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export interface UserFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  user?: User | null
  mode?: 'create' | 'edit'
}

export interface UserFormData {
  first_name: string
  last_name: string
  email: string
  password?: string
  phone?: string
  role: 'admin' | 'trainer' | 'member' | 'guest'
  membershipTier?: 'basic' | 'premium' | 'elite'
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  notes?: string
  profileImage?: string
}