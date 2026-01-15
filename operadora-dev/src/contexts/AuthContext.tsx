"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  memberSince?: string
  role?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, phone?: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Helper para acceder a localStorage de forma segura
const getFromStorage = (key: string): string | null => {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(key)
  } catch (error) {
    console.error('Error accessing localStorage:', error)
    return null
  }
}

const setToStorage = (key: string, value: string): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, value)
  } catch (error) {
    console.error('Error writing to localStorage:', error)
  }
}

const removeFromStorage = (key: string): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  // Cargar usuario del localStorage al iniciar (solo en el cliente)
  useEffect(() => {
    setMounted(true)
    const savedUser = getFromStorage('as_user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        removeFromStorage('as_user')
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    if (!mounted) return false

    try {
      console.log('🔵 LOGIN INICIADO:', email)

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      console.log('📡 LOGIN RESPONSE:', { success: data.success, email })

      if (data.success && data.user) {
        setUser(data.user)
        setToStorage('as_user', JSON.stringify(data.user))
        const accessToken = data.accessToken || data.token
        if (accessToken) {
          setToStorage('as_token', accessToken)
        }
        if (data.refreshToken) {
          setToStorage('as_refresh', data.refreshToken)
        }
        console.log('✅ LOGIN EXITOSO:', data.user.email)
        return true
      }

      console.log('❌ LOGIN FALLIDO:', data.error)
      return false
    } catch (error) {
      console.error('❌ LOGIN ERROR:', error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    if (!mounted) return false

    try {
      console.log('🔵 REGISTRO INICIADO:', { name, email })

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || ''
        })
      })

      const data = await response.json()

      console.log('📡 REGISTRO RESPONSE:', {
        success: data.success,
        userId: data.user?.id,
        email: data.user?.email
      })

      if (data.success && data.user) {
        // Auto-login después del registro
        setUser(data.user)
        setToStorage('as_user', JSON.stringify(data.user))
        if (data.token) {
          setToStorage('as_token', data.token)
        }
        console.log('✅ REGISTRO EXITOSO EN BD:', data.user.email)
        alert(`✅ Usuario registrado exitosamente en BD!\nID: ${data.user.id}\nEmail: ${data.user.email}`)
        return true
      }

      console.log('❌ REGISTRO FALLIDO:', data.error)
      alert(`❌ Error al registrar: ${data.error}`)
      return false
    } catch (error) {
      console.error('❌ REGISTRO ERROR:', error)
      alert(`❌ Error de conexión: ${error}`)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    removeFromStorage('as_user')
    removeFromStorage('as_token')
    removeFromStorage('as_refresh')
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
