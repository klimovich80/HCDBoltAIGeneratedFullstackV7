import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { apiClient } from '../lib/api'

interface PaymentFormData {
  member_id: string
  amount: number
  payment_type: 'lesson' | 'boarding' | 'event' | 'membership' | 'equipment' | 'other'
  payment_method: 'cash' | 'card' | 'transfer' | 'check'
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_date?: string
  invoice_number?: string
  description?: string
}

interface PaymentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  payment?: Payment | null
  mode?: 'create' | 'edit'
}

interface Payment {
  _id: string
  member: {
    _id: string
    first_name: string
    last_name: string
  }
  amount: number
  payment_type: 'lesson' | 'boarding' | 'event' | 'membership' | 'equipment' | 'other'
  payment_method: 'cash' | 'card' | 'transfer' | 'check'
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_date?: string
  invoice_number?: string
  description?: string
}

interface User {
  _id: string
  first_name: string
  last_name: string
  role: string
}

const PaymentForm: React.FC<PaymentFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  payment = null, 
  mode = 'create' 
}) => {
  const [formData, setFormData] = useState<PaymentFormData>({
    member_id: '',
    amount: 0,
    payment_type: 'lesson',
    payment_method: 'cash',
    status: 'pending',
    due_date: '',
    paid_date: '',
    invoice_number: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [members, setMembers] = useState<User[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Load members for payment assignment
  useEffect(() => {
    const loadMembers = async () => {
      try {
        setLoadingData(true)
        
        const membersResponse = await apiClient.getAll<{ success: boolean; data: User[] }>('users', { role: 'member' })
        if (membersResponse.success) {
          setMembers(membersResponse.data)
        }
      } catch (error) {
        console.error('Failed to load members:', error)
        // Set demo data for development
        setMembers([
          { _id: '1', first_name: 'Emma', last_name: 'Williams', role: 'member' },
          { _id: '2', first_name: 'James', last_name: 'Brown', role: 'member' },
          { _id: '3', first_name: 'Sophie', last_name: 'Davis', role: 'member' }
        ])
      } finally {
        setLoadingData(false)
      }
    }

    if (isOpen) {
      loadMembers()
    }
  }, [isOpen])

  // Update form data when payment prop changes
  useEffect(() => {
    if (payment && mode === 'edit') {
      const dueDate = new Date(payment.due_date).toISOString().slice(0, 10)
      const paidDate = payment.paid_date ? new Date(payment.paid_date).toISOString().slice(0, 10) : ''
      
      setFormData({
        member_id: payment.member._id,
        amount: payment.amount,
        payment_type: payment.payment_type,
        payment_method: payment.payment_method,
        status: payment.status,
        due_date: dueDate,
        paid_date: paidDate,
        invoice_number: payment.invoice_number || '',
        description: payment.description || ''
      })
    } else if (mode === 'create') {
      // Reset form for create mode
      const today = new Date().toISOString().slice(0, 10)
      
      setFormData({
        member_id: '',
        amount: 0,
        payment_type: 'lesson',
        payment_method: 'cash',
        status: 'pending',
        due_date: today,
        paid_date: '',
        invoice_number: '',
        description: ''
      })
    }
  }, [payment, mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Clean data for API
      const cleanedData = {
        ...formData,
        paid_date: formData.paid_date || undefined,
        invoice_number: formData.invoice_number || undefined,
        description: formData.description || undefined
      }

      if (mode === 'edit' && payment) {
        await apiClient.update('payments', payment._id, cleanedData)
      } else {
        await apiClient.create('payments', cleanedData)
      }

      onSuccess()
      onClose()
      setError('')
    } catch (err: any) {
      setError(err.message || `Failed to ${mode} payment`)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'edit' ? 'Редактировать платеж' : 'Создать платеж'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {loadingData ? (
          <div className="p-6 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2 text-gray-600">Загрузка данных...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="member_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Участник *
                </label>
                <select
                  id="member_id"
                  name="member_id"
                  required
                  value={formData.member_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Выберите участника</option>
                  {members.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.first_name} {member.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                  Сумма (₽) *
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="payment_type" className="block text-sm font-medium text-gray-700 mb-2">
                  Тип платежа *
                </label>
                <select
                  id="payment_type"
                  name="payment_type"
                  required
                  value={formData.payment_type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="lesson">Занятие</option>
                  <option value="boarding">Содержание</option>
                  <option value="event">Мероприятие</option>
                  <option value="membership">Членство</option>
                  <option value="equipment">Снаряжение</option>
                  <option value="other">Прочее</option>
                </select>
              </div>

              <div>
                <label htmlFor="payment_method" className="block text-sm font-medium text-gray-700 mb-2">
                  Способ оплаты *
                </label>
                <select
                  id="payment_method"
                  name="payment_method"
                  required
                  value={formData.payment_method}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="cash">Наличные</option>
                  <option value="card">Карта</option>
                  <option value="transfer">Перевод</option>
                  <option value="check">Чек</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Статус *
                </label>
                <select
                  id="status"
                  name="status"
                  required
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="pending">Ожидает</option>
                  <option value="paid">Оплачено</option>
                  <option value="overdue">Просрочено</option>
                  <option value="cancelled">Отменено</option>
                </select>
              </div>

              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
                  Срок оплаты *
                </label>
                <input
                  type="date"
                  id="due_date"
                  name="due_date"
                  required
                  value={formData.due_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {formData.status === 'paid' && (
                <div>
                  <label htmlFor="paid_date" className="block text-sm font-medium text-gray-700 mb-2">
                    Дата оплаты
                  </label>
                  <input
                    type="date"
                    id="paid_date"
                    name="paid_date"
                    value={formData.paid_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}

              <div>
                <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Номер счета
                </label>
                <input
                  type="text"
                  id="invoice_number"
                  name="invoice_number"
                  value={formData.invoice_number}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Например: INV-2024-001"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Описание
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Дополнительная информация о платеже..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? (mode === 'edit' ? 'Сохранение...' : 'Создание...') 
                  : (mode === 'edit' ? 'Сохранить изменения' : 'Создать платеж')
                }
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default PaymentForm