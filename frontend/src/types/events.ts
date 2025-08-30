export type EventType = 'competition' | 'clinic' | 'social' | 'maintenance' | 'show';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type EventFormMode = 'create' | 'edit';

export interface Event {
  _id: string
  title: string
  description?: string
  eventType: EventType
  startDate: string
  endDate: string
  location?: string
  maxParticipants?: number
  registrationFee: number
  organizer: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  status: EventStatus
  requirements?: string
  participants: unknown[]
  createdAt?: string
  updatedAt?: string
  isActive?: boolean
}

export interface EventDetailProps {
  isOpen: boolean
  onClose: () => void
  event: Event | null
}

export interface EventFormData {
  title: string
  description?: string
  eventType: EventType
  startDate: string
  endDate: string
  location?: string
  maxParticipants?: number
  registrationFee: number
  requirements?: string
}
export interface EventFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  event?: Event | null
  mode?: EventFormMode
}