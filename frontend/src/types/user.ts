export type UserFormMode = 'create' | 'edit';
export type UserRole = 'admin' | 'trainer' | 'member' | 'guest';
export type UserMemmberShipTier = 'basic' | 'premium' | 'elite';
export interface User {
  _id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  role: UserRole
  membershipTier?: UserMemmberShipTier
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
  mode?: UserFormMode
}

export interface UserFormData {
  first_name: string
  last_name: string
  email: string
  password?: string
  phone?: string
  role: UserRole
  membershipTier?: UserMemmberShipTier
  emergencyContactName?: string
  emergencyContactPhone?: string
  emergencyContactRelationship?: string
  notes?: string
  profileImage?: string
}