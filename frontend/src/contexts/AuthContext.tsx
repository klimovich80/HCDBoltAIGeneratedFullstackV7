import React, { createContext, useContext, useState, useEffect} from 'react'
import { apiClient } from '../lib/api'
import { User } from '../types/user'
import { AuthContextType, AuthProviderProps } from '../types/authContext'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

 // В AuthProvider
useEffect(() => {
  const initAuth = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      apiClient.setToken(token)
      try {
        const response = await apiClient.getCurrentUser()
        if (response.success) {
          setUser(response.data || response.user || null)
        } else {
          localStorage.removeItem('token')
          apiClient.setToken(null)
        }
      } catch (error) {
        console.error('Failed to get user:', error)
        localStorage.removeItem('token')
        apiClient.setToken(null)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }

  initAuth()
}, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.login(email, password)
      
      if (response.success) {
        // Правильное извлечение пользователя из ответа
        const user = response.user || (response as any).data?.user
        if (user) {
          setUser(user)
        } else {
          throw new Error('User data not found in response')
        }
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    apiClient.setToken(null)
    localStorage.removeItem('token')
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}