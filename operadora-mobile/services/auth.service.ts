import api from './api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Device from 'expo-device'

export interface LoginCredentials {
    email: string
    password: string
}

export interface RegisterData {
    name: string
    email: string
    password: string
    phone: string
    user_type: 'cliente' | 'corporativo' | 'agencia'
}

export interface User {
    id: number
    email: string
    name: string
    phone: string
    user_type: string
    role: string
    is_active: boolean
}

export interface LoginResponse {
    success: boolean
    user: User
    accessToken: string
    refreshToken: string
    permissions: any
}

class AuthService {
    /**
     * Iniciar sesión
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const deviceFingerprint = Device.modelName || 'unknown-device'

        const { data } = await api.post<LoginResponse>('/auth/login', {
            ...credentials,
            device_fingerprint: deviceFingerprint,
        })

        // Guardar tokens y usuario en AsyncStorage
        await AsyncStorage.setItem('accessToken', data.accessToken)
        await AsyncStorage.setItem('refreshToken', data.refreshToken)
        await AsyncStorage.setItem('user', JSON.stringify(data.user))

        return data
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
            // Llamar al endpoint de logout en el backend
            if (refreshToken) {
                await api.post('/auth/logout', { refreshToken })
            }
        } catch (error) {
            console.error('Error during logout:', error)
        }

        // Limpiar storage local
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user'])
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
        const token = await AsyncStorage.getItem('accessToken')
        return !!token
    }

    /**
     * Obtener access token
     */
    async getAccessToken(): Promise<string | null> {
        return await AsyncStorage.getItem('accessToken')
    }

    /**
     * Obtener refresh token
     */
    async getRefreshToken(): Promise<string | null> {
        return await AsyncStorage.getItem('refreshToken')
    }
}

export default new AuthService()
