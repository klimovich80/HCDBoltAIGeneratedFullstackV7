import React from 'react'
import { X, Calendar, DollarSign, User, FileText, CreditCard } from 'lucide-react'

interface Payment {
  _id: string
  member: {
    first_name: string
    last_name: string
    email?: string
    phone?: string
  }
  amount: number
  payment_type: 'lesson' | 'boarding' | 'event' | 'membership' | 'equipment' | 'other'
  payment_method: 'cash' | 'card' | 'transfer' | 'check'
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  due_date: string
  paid_date?: string
  invoice_number?: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

interface PaymentDetailProps {
  isOpen: boolean
  onClose: () => void
  payment: Payment | null
}

const PaymentDetail: React.FC<PaymentDetailProps> = ({ isOpen, onClose, payment }) => {
  if (!isOpen || !payment) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentTypeColor = (type: string) => {
    switch (type) {
      case 'lesson': return 'bg-blue-100 text-blue-800'
      case 'boarding': return 'bg-purple-100 text-purple-800'
      case 'event': return 'bg-indigo-100 text-indigo-800'
      case 'membership': return 'bg-green-100 text-green-800'
      case 'equipment': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'lesson': return 'Занятие'
      case 'boarding': return 'Содержание'
      case 'event': return 'Мероприятие'
      case 'membership': return 'Членство'
      case 'equipment': return 'Снаряжение'
      case 'other': return 'Прочее'
      default: return type
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid': return 'Оплачено'
      case 'pending': return 'Ожидает оплаты'
      case 'overdue': return 'Просрочено'
      case 'cancelled': return 'Отменено'
      default: return status
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash': return 'Наличные'
      case 'card': return 'Карта'
      case 'transfer': return 'Перевод'
      case 'check': return 'Чек'
      default: return method
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Не указано'
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return 'Не указано'
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 bg-green-600 rounded-full flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {payment.invoice_number || 'Платеж'}
              </h2>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeColor(payment.payment_type)}`}>
                  {getPaymentTypeLabel(payment.payment_type)}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                  {getStatusLabel(payment.status)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Payment Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о платеже</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Сумма:</span>
                    <span className="text-2xl font-bold text-gray-900 flex items-center">
                      <DollarSign className="h-5 w-5 mr-1" />
                      {payment.amount.toLocaleString()}₽
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Тип платежа:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeColor(payment.payment_type)}`}>
                      {getPaymentTypeLabel(payment.payment_type)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Способ оплаты:</span>
                    <span className="font-medium flex items-center">
                      <CreditCard className="h-4 w-4 mr-1" />
                      {getPaymentMethodLabel(payment.payment_method)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Статус:</span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                  {payment.invoice_number && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Номер счета:</span>
                      <span className="font-medium">{payment.invoice_number}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Member Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Участник</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="space-y-1">
                    <p className="text-gray-700 font-medium flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {payment.member.first_name} {payment.member.last_name}
                    </p>
                    {payment.member.email && (
                      <p className="text-sm text-gray-600">{payment.member.email}</p>
                    )}
                    {payment.member.phone && (
                      <p className="text-sm text-gray-600">{payment.member.phone}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dates and Description */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Даты</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <span className="text-gray-600">Срок оплаты:</span>
                      <span className="ml-2 font-medium">{formatDate(payment.due_date)}</span>
                    </div>
                  </div>
                  {payment.paid_date && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-green-400" />
                      <div>
                        <span className="text-gray-600">Дата оплаты:</span>
                        <span className="ml-2 font-medium text-green-600">{formatDate(payment.paid_date)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {payment.description && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <FileText className="h-4 w-4 mr-2" />
                    Описание
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{payment.description}</p>
                  </div>
                </div>
              )}

              {/* Payment Status Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Статус платежа</h4>
                <div className={`rounded-lg p-4 ${
                  payment.status === 'paid' ? 'bg-green-50' :
                  payment.status === 'overdue' ? 'bg-red-50' :
                  payment.status === 'cancelled' ? 'bg-gray-50' : 'bg-yellow-50'
                }`}>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                    {payment.status === 'paid' && payment.paid_date && (
                      <span className="text-sm text-green-600">
                        Оплачено {formatDate(payment.paid_date)}
                      </span>
                    )}
                    {payment.status === 'overdue' && (
                      <span className="text-sm text-red-600">
                        Просрочен с {formatDate(payment.due_date)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer with timestamps */}
          {(payment.createdAt || payment.updatedAt) && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-sm text-gray-500">
                {payment.createdAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Создан: {formatDateTime(payment.createdAt)}
                  </div>
                )}
                {payment.updatedAt && (
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Обновлен: {formatDateTime(payment.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PaymentDetail