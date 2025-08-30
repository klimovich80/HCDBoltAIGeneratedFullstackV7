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

  useEffect(() => {
    const initAuth = async () => {
      // Используем правильный ключ для токена
      const token = localStorage.getItem('authToken')
      if (token) {
        // Устанавливаем токен в API клиенте
        apiClient.setTokens(token)
        try {
          const response = await apiClient.getCurrentUser()
          if (response.success) {
            setUser(response.data || response.user || null)
          } else {
            // Очищаем токен при неудачной проверке
            localStorage.removeItem('authToken')
            apiClient.setTokens(null)
          }
        } catch (error) {
          console.error('Failed to get user:', error)
          localStorage.removeItem('authToken')
          apiClient.setTokens(null)
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
      
      if (response.success && response.token) {
        // Сохраняем токен
        apiClient.setTokens(response.token)
        localStorage.setItem('authToken', response.token)
        
        // Получаем информацию о пользователе
        const userResponse = await apiClient.getCurrentUser()
        if (userResponse.success) {
          setUser(userResponse.data || userResponse.user || null)
        } else {
          throw new Error('Failed to get user information')
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
    // Очищаем токен
    apiClient.setTokens(null)
    localStorage.removeItem('authToken')
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