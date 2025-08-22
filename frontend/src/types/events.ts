export interface Event {
  _id: string
  title: string
  description?: string
  eventType: 'competition' | 'clinic' | 'social' | 'maintenance' | 'show'
  startDate: string
  endDate: string
  location?: string
  maxParticipants?: number
  registrationFee: number
  organizer: {
    _id: string
    first_name: string
    last_name: string
  }
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  requirements?: string
  participants: any[]
  isActive?: boolean
}

export interface EventFormData {
  title: string
  description?: string
  eventType: 'competition' | 'clinic' | 'social' | 'maintenance' | 'show'
  startDate: string
  endDate: string
  location?: string
  maxParticipants?: number
  registrationFee: number
  requirements?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface EventFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  event?: Event | null
  mode?: 'create' | 'edit'
}