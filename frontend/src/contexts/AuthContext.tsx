import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiClient } from '../lib/api'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: 'admin' | 'trainer' | 'member' | 'guest'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token')
      if (token) {
        apiClient.setToken(token)
        apiClient.getCurrentUser()
          .then(userData => {
            setUser(userData)
          })
          .catch(error => {
            console.error('Failed to get user:', error)
            localStorage.removeItem('token')
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = (email: string, password: string): Promise<void> => {
    return apiClient.login(email, password)
      .then(response => {
        if (response.success && response.user) {
          setUser(response.user)
        } else {
          throw new Error(response.message || 'Login failed')
        }
      })
      .catch(error => {
        console.error('Login error:', error)
        throw error
      })
  }

  const logout = () => {
    apiClient.logout()
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