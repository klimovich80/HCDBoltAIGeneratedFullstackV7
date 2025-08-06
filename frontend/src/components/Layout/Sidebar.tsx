import React from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users as Horse, Calendar, Trophy, Package, CreditCard, Users, LogOut } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth()

  const navigation = [
    { name: 'Панель управления', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Лошади', href: '/horses', icon: Horse },
    { name: 'Занятия', href: '/lessons', icon: Calendar },
    { name: 'Мероприятия', href: '/events', icon: Trophy },
    { name: 'Снаряжение', href: '/equipment', icon: Package },
    { name: 'Платежи', href: '/payments', icon: CreditCard },
    ...(user?.role === 'admin' || user?.role === 'trainer'
      ? [{ name: 'Пользователи', href: '/users', icon: Users }]
      : [])
  ]

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <Horse className="h-8 w-8 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">Equestrian CRM</h1>
        </div>
      </div>

      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${isActive
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="absolute bottom-0 w-64 p-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Выйти
        </button>
      </div>
    </div>
  )
}

export default Sidebar