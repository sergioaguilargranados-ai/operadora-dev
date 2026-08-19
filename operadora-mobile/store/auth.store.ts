import { create } from 'zustand'
import AuthService, { User, LoginCredentials, RegisterData } from '../services/auth.service'
import { useTenantStore } from './tenant.store'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null

  // Actions
  login: (credentials: LoginCredentials) => Promise<boolean>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  setUser: (user: User | null) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (credentials) => {
    try {
      set({ error: null, isLoading: true })
      const res = await AuthService.login(credentials)

      if (res.user) {
        set({
          user: res.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        })

        // Cargar branding del tenant del usuario
        const tenantId = res.user.tenant_id || 1
        useTenantStore.getState().loadTenant(tenantId)
        return true
      }
      set({ isLoading: false, error: 'No se pudo iniciar sesión' })
      return false
    } catch (error: any) {
      const msg =
        error?.response?.data?.error?.message ||
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        (typeof error?.response?.data === 'string' ? error.response.data : null) ||
        error?.message ||
        'Contraseña o correo incorrectos'
      set({ error: msg, isLoading: false, isAuthenticated: false })
      return false
    }
  },

  register: async (userData) => {
    try {
      set({ error: null, isLoading: true })
      await AuthService.register(userData)
      set({ isLoading: false })
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error?.message || error.message || 'Error al registrarse'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await AuthService.logout()
      useTenantStore.getState().reset()
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Logout error:', error)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  checkAuth: async () => {
    try {
      const isAuth = await AuthService.isAuthenticated()
      if (isAuth) {
        const user = await AuthService.getCurrentUser()
        if (user) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          })
          const tenantId = user.tenant_id || 1
          useTenantStore.getState().loadTenant(tenantId)
          return
        }
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
      useTenantStore.getState().loadTenant(1)
    } catch (error) {
      console.error('Check auth error:', error)
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      })
    }
  },

  setUser: (user) => set({ user }),
  clearError: () => set({ error: null }),
}))

export default useAuthStore
