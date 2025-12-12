"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  name: string
  email: string
  phone?: string
  memberSince?: string
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

    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verificar credenciales (simulado)
    const usersData = getFromStorage('as_users')
    const users = JSON.parse(usersData || '[]') as Array<User & { password: string }>
    const foundUser = users.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      setToStorage('as_user', JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    if (!mounted) return false

    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verificar si el email ya existe
    const usersData = getFromStorage('as_users')
    const users = JSON.parse(usersData || '[]') as Array<User & { password: string }>
    const emailExists = users.some((u) => u.email === email)

    if (emailExists) {
      return false
    }

    // Crear nuevo usuario
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      password, // En producción, esto debería estar hasheado
      phone,
      memberSince: new Date().toISOString()
    }

    users.push(newUser)
    setToStorage('as_users', JSON.stringify(users))

    // Auto login después del registro
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    setToStorage('as_user', JSON.stringify(userWithoutPassword))

    return true
  }

  const logout = () => {
    setUser(null)
    removeFromStorage('as_user')
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
