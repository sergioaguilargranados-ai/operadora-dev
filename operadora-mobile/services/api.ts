import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import config from '../constants/config'

const api = axios.create({
    baseURL: config.apiUrl,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('accessToken')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Interceptor para manejar refresh token automáticamente
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Si es 401 y no es un retry, intentar refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                const refreshToken = await AsyncStorage.getItem('refreshToken')

                if (!refreshToken) {
                    throw new Error('No refresh token available')
                }

                // Llamar al endpoint de refresh
                const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, {
                    refreshToken,
                })

                // Guardar nuevo access token
                await AsyncStorage.setItem('accessToken', data.data.accessToken)

                // Reintentar request original con nuevo token
                originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`
                return api(originalRequest)
            } catch (refreshError) {
                // Refresh falló, limpiar tokens y redirigir a login
                await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user'])
                // TODO: Navegar a pantalla de login
                return Promise.reject(refreshError)
            }
        }

        return Promise.reject(error)
    }
)

export default api
