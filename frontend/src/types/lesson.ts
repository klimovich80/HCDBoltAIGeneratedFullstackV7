export interface Lesson {
  _id: string
  title: string
  description?: string
  instructor: {
    _id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  horse?: {
    _id: string
    name: string
    breed: string
    age?: number
  }
  member: {
    _id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  scheduled_date: string
  duration_minutes: number
  lesson_type: 'private' | 'group' | 'training'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  cost: number
  payment_status: 'pending' | 'paid' | 'overdue'
  notes?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

// Интерфейс для пропсов компонента
export interface LessonDetailProps {
  isOpen: boolean
  onClose: () => void
  lesson: Lesson | null
}

export interface LessonFormData {
  title: string
  description?: string
  instructor_id: string
  horse_id?: string
  member_id: string
  scheduled_date: string
  duration_minutes: number
  lesson_type: 'private' | 'group' | 'training'
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  cost: number
  payment_status: 'pending' | 'paid' | 'overdue'
  notes?: string
}

export interface LessonFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  lesson?: Lesson | null
  mode?: 'create' | 'edit'
}