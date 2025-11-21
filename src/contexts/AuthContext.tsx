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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Cargar usuario del localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('as_user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verificar credenciales (simulado)
    const users = JSON.parse(localStorage.getItem('as_users') || '[]') as Array<User & { password: string }>
    const foundUser = users.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem('as_user', JSON.stringify(userWithoutPassword))
      return true
    }

    return false
  }

  const register = async (name: string, email: string, password: string, phone?: string): Promise<boolean> => {
    // Simular llamada API
    await new Promise(resolve => setTimeout(resolve, 500))

    // Verificar si el email ya existe
    const users = JSON.parse(localStorage.getItem('as_users') || '[]') as Array<User & { password: string }>
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
    localStorage.setItem('as_users', JSON.stringify(users))

    // Auto login después del registro
    const { password: _, ...userWithoutPassword } = newUser
    setUser(userWithoutPassword)
    localStorage.setItem('as_user', JSON.stringify(userWithoutPassword))

    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('as_user')
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
