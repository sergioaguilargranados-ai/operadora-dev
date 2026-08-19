import api from './api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Device from 'expo-device'

export interface LoginCredentials {
  email: string
  password: string
  accepted_terms?: boolean
}

export interface RegisterData {
  name: string
  email: string
  password: string
  phone: string
  user_type?: 'cliente' | 'corporativo' | 'agencia'
}

export interface User {
  id: number | string
  email: string
  name: string
  phone?: string
  image?: string
  user_type?: string
  role?: string
  tenant_id?: number
  is_active?: boolean
  total_steps?: number
  referral_code?: string
  wants_travel_insurance?: boolean
}

export interface LoginResponse {
  success: boolean
  user: User
  accessToken: string
  refreshToken: string
  permissions?: any
}

class AuthService {
  /**
   * Iniciar sesión
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const deviceFingerprint = Device.modelName || 'mobile-app'

    const { data } = await api.post<any>('/auth/login', {
      ...credentials,
      device_fingerprint: deviceFingerprint,
    })

    const payload = data.data || data
    const user = payload.user
    const accessToken = payload.accessToken || data.accessToken
    const refreshToken = payload.refreshToken || data.refreshToken

    if (accessToken) {
      await AsyncStorage.setItem('accessToken', accessToken)
      await AsyncStorage.setItem('token', accessToken)
    }
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken)
    }
    if (user) {
      await AsyncStorage.setItem('user', JSON.stringify(user))
    }

    return {
      success: true,
      user,
      accessToken,
      refreshToken,
      permissions: payload.permissions,
    }
  }

  /**
   * Registrar nuevo usuario
   */
  async register(userData: RegisterData) {
    const { data } = await api.post('/auth/register', userData)
    return data
  }

  /**
   * Cerrar sesión
   */
  async logout() {
    const refreshToken = await AsyncStorage.getItem('refreshToken')
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken })
      }
    } catch (error) {
      console.error('Error during logout:', error)
    }
    await AsyncStorage.multiRemove(['accessToken', 'token', 'refreshToken', 'user'])
  }

  /**
   * Obtener usuario actual del storage
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userStr = await AsyncStorage.getItem('user')
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Verificar si el usuario está autenticado
   */
  async isAuthenticated(): Promise<boolean> {
    const token = (await AsyncStorage.getItem('accessToken')) || (await AsyncStorage.getItem('token'))
    return !!token
  }
}

export default new AuthService()
