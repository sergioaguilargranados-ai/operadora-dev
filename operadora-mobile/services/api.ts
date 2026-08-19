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

// Request interceptor: add JWT Bearer token
api.interceptors.request.use(
  async (reqConfig) => {
    try {
      const token = (await AsyncStorage.getItem('accessToken')) || (await AsyncStorage.getItem('token'))
      if (token) {
        reqConfig.headers.Authorization = `Bearer ${token}`
      }
    } catch (e) {
      console.warn('Error reading token from storage', e)
    }
    return reqConfig
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isAuthRoute =
      originalRequest?.url?.includes('/auth/login') ||
      originalRequest?.url?.includes('/auth/register') ||
      originalRequest?.url?.includes('/auth/refresh')

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('Sesión expirada')
        }

        const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, {
          refreshToken,
        })

        const newAccessToken = data?.data?.accessToken || data?.accessToken || data?.token
        if (newAccessToken) {
          await AsyncStorage.setItem('accessToken', newAccessToken)
          await AsyncStorage.setItem('token', newAccessToken)
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          return api(originalRequest)
        }
      } catch (refreshErr) {
        await AsyncStorage.multiRemove(['accessToken', 'token', 'refreshToken', 'user'])
        return Promise.reject(refreshErr)
      }
    }

    return Promise.reject(error)
  }
)

export default api
