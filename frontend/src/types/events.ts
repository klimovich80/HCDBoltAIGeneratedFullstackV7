// types/events.ts
export interface Event {
  _id: string
  title: string
  description: string
  eventType: 'competition' | 'clinic' | 'social' | 'maintenance' | 'show'
  startDate: string
  endDate: string
  location?: string
  maxParticipants?: number
  registrationFee: number
  organizer: {
    first_name: string
    last_name: string
  }
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  participants: any[]
  isActive?: boolean
}

export interface EventFormData {
  title: string
  description: string
  eventType: Event['eventType']
  startDate: string
  endDate: string
  location?: string
  maxParticipants?: number
  registrationFee: number
  organizer: {
    first_name: string
    last_name: string
  }
  status: Event['status']
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}