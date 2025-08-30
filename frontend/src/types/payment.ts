export type PaymentStatus = 'pending' | 'paid' | 'overdue' | 'cancelled';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'online';
export type PaymentType = 'lesson' | 'boarding' | 'event' | 'membership' | 'equipment' | 'other';
export type PaymentFormMode = 'create' | 'edit';
export interface Payment {
  _id: string
  user: {
    _id: string
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  amount: number
  payment_type: PaymentType
  payment_method: PaymentMethod
  status: PaymentStatus
  due_date: string
  paid_date?: string
  invoice_number?: string
  description?: string
  createdAt?: string
  updatedAt?: string
  is_active?: boolean
}
export interface PaymentDetailProps {
  isOpen: boolean
  onClose: () => void
  payment: Payment | null
}

export interface PaymentFormData {
  user_id: string
  amount: number
  payment_type: PaymentType
  payment_method: PaymentMethod
  status: PaymentStatus
  due_date: string
  paid_date?: string
  description?: string
}

export interface PaymentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  payment?: Payment | null
  mode?: PaymentFormMode
}