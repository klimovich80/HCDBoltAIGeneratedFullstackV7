import React, { useState, useEffect } from 'react'
import { Search, Plus, DollarSign, Calendar } from 'lucide-react'
import { apiClient } from '../lib/api'

interface Payment {
  _id: string
  member: {
    first_name: string
    last_name: string
  }
  amount: number
  paymentType: 'lesson' | 'boarding' | 'event' | 'membership' | 'equipment' | 'other'
  paymentMethod: 'cash' | 'card' | 'transfer' | 'check'
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidDate?: string
  invoiceNumber?: string
  description?: string
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

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
              member: { first_name: 'Emma', last_name: 'Williams' },
              amount: 340,
              paymentType: 'boarding',
              paymentMethod: 'card',
              status: 'paid',
              dueDate: '2024-12-01T00:00:00Z',
              paidDate: '2024-11-28T00:00:00Z',
              invoiceNumber: 'INV-2024-001',
              description: 'Monthly boarding fee for Thunder'
            },
            {
              _id: '2',
              member: { first_name: 'James', last_name: 'Brown' },
              amount: 85,
              paymentType: 'lesson',
              paymentMethod: 'cash',
              status: 'paid',
              dueDate: '2024-12-19T00:00:00Z',
              paidDate: '2024-12-19T00:00:00Z',
              invoiceNumber: 'INV-2024-002',
              description: 'Private lesson with Sarah'
            },
            {
              _id: '3',
              member: { first_name: 'Sophie', last_name: 'Davis' },
              amount: 420,
              paymentType: 'boarding',
              paymentMethod: 'transfer',
              status: 'pending',
              dueDate: '2024-12-01T00:00:00Z',
              invoiceNumber: 'INV-2024-003',
              description: 'Monthly boarding fee for Star'
            },
            {
              _id: '4',
              member: { first_name: 'Robert', last_name: 'Wilson' },
              amount: 45,
              paymentType: 'event',
              paymentMethod: 'card',
              status: 'paid',
              dueDate: '2024-12-28T00:00:00Z',
              paidDate: '2024-12-15T00:00:00Z',
              invoiceNumber: 'INV-2024-004',
              description: 'Winter Dressage Competition registration'
            },
            {
              _id: '5',
              member: { first_name: 'Emma', last_name: 'Williams' },
              amount: 120,
              paymentType: 'lesson',
              paymentMethod: 'card',
              status: 'overdue',
              dueDate: '2024-11-15T00:00:00Z',
              invoiceNumber: 'INV-2024-005',
              description: 'Advanced dressage lesson'
            }
          ])
        })
        .finally(() => {
          setLoading(false)
        })
    }

    fetchPayments()
  }, [])

  const filteredPayments = payments.filter(payment =>
    payment.member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTotalAmount = (status?: string) => {
    const filtered = status ? payments.filter(p => p.status === status) : payments
    return filtered.reduce((sum, payment) => sum + payment.amount, 0)
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
          <p className="text-gray-600">Отслеживайте платежи и выставление счетов</p>
        </div>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Создать счет</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Общая выручка</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalAmount().toLocaleString()}₽</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Оплачено</p>
              <p className="text-2xl font-bold text-green-600">{getTotalAmount('paid').toLocaleString()}₽</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">В ожидании</p>
              <p className="text-2xl font-bold text-yellow-600">{getTotalAmount('pending').toLocaleString()}₽</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Просрочено</p>
              <p className="text-2xl font-bold text-red-600">{getTotalAmount('overdue').toLocaleString()}₽</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
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
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Счет
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
                  Срок оплаты
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.invoiceNumber || 'Не указан'}
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {payment.paymentMethod === 'cash' ? 'наличные' :
                          payment.paymentMethod === 'card' ? 'карта' :
                            payment.paymentMethod === 'transfer' ? 'перевод' : 'чек'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {payment.member.first_name} {payment.member.last_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeColor(payment.paymentType)}`}>
                      {payment.paymentType === 'lesson' ? 'занятие' :
                        payment.paymentType === 'boarding' ? 'содержание' :
                          payment.paymentType === 'event' ? 'мероприятие' :
                            payment.paymentType === 'membership' ? 'членство' :
                              payment.paymentType === 'equipment' ? 'снаряжение' : 'прочее'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {payment.amount.toLocaleString()}₽
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                      {formatDate(payment.dueDate)}
                    </div>
                    {payment.paidDate && (
                      <div className="text-sm text-gray-500">
                        Оплачено: {formatDate(payment.paidDate)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status === 'paid' ? 'оплачено' :
                        payment.status === 'pending' ? 'ожидает' :
                          payment.status === 'overdue' ? 'просрочено' : 'отменено'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-indigo-600 hover:text-indigo-900">
                        Просмотр
                      </button>
                      {payment.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900">
                          Отметить оплаченным
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Payments