import React, { useState, useEffect } from 'react'
import { Search, Plus, DollarSign, Calendar, User, Edit, Eye, Trash2, Archive, RotateCcw } from 'lucide-react'
import { apiClient } from '../lib/api'
import PaymentForm from '../components/PaymentForm'
import PaymentDetail from '../components/PaymentDetail'

interface Payment {
  _id: string
  member: {
    _id: string
    first_name: string
    last_name: string
    email?: string
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
  isActive?: boolean
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [showEditForm, setShowEditForm] = useState(false)
  const [viewingPayment, setViewingPayment] = useState<Payment | null>(null)
  const [showDetailView, setShowDetailView] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  useEffect(() => {
    const fetchPayments = () => {
      apiClient.getAll<{ success: boolean; data: Payment[] }>('payments')
        .then(response => {
          if (response.success) {
            setPayments(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch payments:', error)
          // Устанавливаем демо данные для разработки
          setPayments([
            {
              _id: '1',
              member: { _id: '1', first_name: 'Emma', last_name: 'Williams', email: 'emma@email.com' },
              amount: 340,
              payment_type: 'boarding',
              payment_method: 'card',
              status: 'paid',
              due_date: '2024-12-01T00:00:00Z',
              paid_date: '2024-11-28T00:00:00Z',
              invoice_number: 'INV-2024-001',
              description: 'Monthly boarding fee for Thunder',
              createdAt: '2024-11-28T00:00:00Z',
              isActive: true
            },
            {
              _id: '2',
              member: { _id: '2', first_name: 'James', last_name: 'Brown', email: 'james@email.com' },
              amount: 85,
              payment_type: 'lesson',
              payment_method: 'cash',
              status: 'paid',
              due_date: '2024-12-19T00:00:00Z',
              paid_date: '2024-12-19T00:00:00Z',
              invoice_number: 'INV-2024-002',
              description: 'Private lesson with Sarah',
              createdAt: '2024-12-19T00:00:00Z',
              isActive: true
            },
            {
              _id: '3',
              member: { _id: '3', first_name: 'Sophie', last_name: 'Davis', email: 'sophie@email.com' },
              amount: 420,
              payment_type: 'boarding',
              payment_method: 'transfer',
              status: 'pending',
              due_date: '2024-12-01T00:00:00Z',
              invoice_number: 'INV-2024-003',
              description: 'Monthly boarding fee for Star',
              createdAt: '2024-11-25T00:00:00Z',
              isActive: true
            },
            {
              _id: '4',
              member: { _id: '4', first_name: 'Robert', last_name: 'Wilson', email: 'robert@email.com' },
              amount: 45,
              payment_type: 'event',
              payment_method: 'card',
              status: 'paid',
              due_date: '2024-12-28T00:00:00Z',
              paid_date: '2024-12-15T00:00:00Z',
              invoice_number: 'INV-2024-004',
              description: 'Winter Dressage Competition registration',
              createdAt: '2024-12-15T00:00:00Z',
              isActive: true
            },
            {
              _id: '5',
              member: { _id: '5', first_name: 'Lisa', last_name: 'Anderson', email: 'lisa@email.com' },
              amount: 150,
              payment_type: 'membership',
              payment_method: 'transfer',
              status: 'overdue',
              due_date: '2024-11-15T00:00:00Z',
              invoice_number: 'INV-2024-005',
              description: 'Annual membership renewal',
              createdAt: '2024-11-10T00:00:00Z',
              isActive: true
            }
          ])
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchPayments()
  }, [])

  const handleAddSuccess = () => {
    // Refresh the payments list
    const fetchPayments = () => {
      apiClient.getAll<{ success: boolean; data: Payment[] }>('payments')
        .then(response => {
          if (response.success) {
            setPayments(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch payments:', error)
        })
    }
    fetchPayments()
  }

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment)
    setShowEditForm(true)
  }

  const handleEditSuccess = () => {
    // Refresh the payments list
    const fetchPayments = () => {
      apiClient.getAll<{ success: boolean; data: Payment[] }>('payments')
        .then(response => {
          if (response.success) {
            setPayments(response.data)
          }
        })
        .catch(error => {
          console.error('Failed to fetch payments:', error)
        })
    }
    fetchPayments()
    setEditingPayment(null)
  }

  const handleCloseEditForm = () => {
    setShowEditForm(false)
    setEditingPayment(null)
  }

  const handleViewPayment = (payment: Payment) => {
    setViewingPayment(payment)
    setShowDetailView(true)
  }

  const handleCloseDetailView = () => {
    setShowDetailView(false)
    setViewingPayment(null)
  }

  const handleDeletePayment = async (payment: Payment) => {
    if (window.confirm(`Вы уверены, что хотите удалить платеж "${payment.invoice_number || payment.description}"? Это действие нельзя отменить.`)) {
      try {
        await apiClient.delete('payments', payment._id)
        handleAddSuccess() // Refresh the list
      } catch (error) {
        console.error('Failed to delete payment:', error)
        alert('Ошибка при удалении платежа')
      }
    }
  }

  const handleArchivePayment = async (payment: Payment) => {
    if (window.confirm(`Вы уверены, что хотите ${payment.isActive ? 'архивировать' : 'восстановить'} платеж "${payment.invoice_number || payment.description}"?`)) {
      try {
        await apiClient.update('payments', payment._id, { isActive: !payment.isActive })
        handleAddSuccess() // Refresh the list
      } catch (error) {
        console.error('Failed to archive/restore payment:', error)
        alert('Ошибка при архивировании/восстановлении платежа')
      }
    }
  }

  const filteredPayments = payments.filter(payment =>
    payment.member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.payment_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (payment.invoice_number && payment.invoice_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (payment.description && payment.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ).filter(payment => showArchived ? true : payment.isActive !== false)

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
      case 'pending': return 'Ожидает'
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()}₽`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Платежи</h1>
          <p className="text-gray-600">Управляйте платежами и финансовыми операциями</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Создать платеж</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск платежей..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm text-gray-700">Показать архивированные</span>
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Платеж
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Участник
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Тип
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сумма
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Срок оплаты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className={`hover:bg-gray-50 ${payment.isActive === false ? 'opacity-60 bg-gray-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.invoice_number || 'Платеж'}
                          {payment.isActive === false && (
                            <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Архивирован
                            </span>
                          )}
                        </div>
                        {payment.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{payment.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white text-xs font-medium">
                          {payment.member.first_name[0]}{payment.member.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {payment.member.first_name} {payment.member.last_name}
                        </div>
                        {payment.member.email && (
                          <div className="text-sm text-gray-500">{payment.member.email}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeColor(payment.payment_type)}`}>
                      {getPaymentTypeLabel(payment.payment_type)}
                    </span>
                    <div className="text-xs text-gray-500 mt-1">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                    {payment.paid_date && (
                      <div className="text-xs text-gray-500 mt-1">
                        Оплачено: {formatDate(payment.paid_date)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(payment.due_date)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleViewPayment(payment)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Просмотр информации о платеже"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditPayment(payment)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Редактировать платеж"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleArchivePayment(payment)}
                        className={`${payment.isActive === false ? 'text-green-600 hover:text-green-900' : 'text-orange-600 hover:text-orange-900'}`}
                        title={payment.isActive === false ? 'Восстановить платеж' : 'Архивировать платеж'}
                      >
                        {payment.isActive === false ? <RotateCcw className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                      </button>
                      <button 
                        onClick={() => handleDeletePayment(payment)}
                        className="text-red-600 hover:text-red-900"
                        title="Удалить платеж"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Платежи не найдены</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm ? 'Попробуйте изменить критерии поиска' : 'Начните с создания первого платежа'}
            </p>
            {!searchTerm && (
              <button 
                onClick={() => setShowAddForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                Создать платеж
              </button>
            )}
          </div>
        )}
      </div>

      <PaymentForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
        mode="create"
      />

      <PaymentForm
        isOpen={showEditForm}
        onClose={handleCloseEditForm}
        onSuccess={handleEditSuccess}
        payment={editingPayment}
        mode="edit"
      />

      <PaymentDetail
        isOpen={showDetailView}
        onClose={handleCloseDetailView}
        payment={viewingPayment}
      />
    </div>
  )
}

export default Payments