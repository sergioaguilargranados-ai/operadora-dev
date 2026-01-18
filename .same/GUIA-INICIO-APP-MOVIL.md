# 📱 GUÍA PARA INICIAR LA APP MÓVIL

**Fecha:** 15 de Enero de 2026 - 02:01 CST  
**Versión:** v2.225  
**Tecnología:** React Native + Expo  

---

## 🎯 OBJETIVO

Crear la aplicación móvil de AS Operadora usando React Native + Expo, que consuma el backend Next.js ya preparado.

---

## ✅ PREREQUISITOS COMPLETADOS

- ✅ Backend preparado para móvil (refresh tokens, CORS, device tokens)
- ✅ APIs REST funcionales (~35 endpoints)
- ✅ Base de datos PostgreSQL accesible
- ✅ Sistema de autenticación JWT

---

## 📋 PASO 1: PREPARAR ENTORNO DE DESARROLLO

### 1.1 Instalar Node.js y npm
```bash
# Verificar instalación
node --version  # Debe ser v18 o superior
npm --version   # Debe ser v9 o superior
```

### 1.2 Instalar Expo CLI
```bash
npm install -g expo-cli
# O usar npx (recomendado)
npx expo --version
```

### 1.3 Instalar Expo Go en tu móvil
- **iOS**: Descargar desde App Store
- **Android**: Descargar desde Google Play Store

### 1.4 Herramientas Opcionales (Recomendadas)
```bash
# React Native Debugger
# Descargar desde: https://github.com/jhen0409/react-native-debugger/releases

# Android Studio (para emulador Android)
# Descargar desde: https://developer.android.com/studio

# Xcode (para emulador iOS - solo macOS)
# Descargar desde App Store
```

---

## 📋 PASO 2: CREAR PROYECTO REACT NATIVE

### 2.1 Crear directorio para la app móvil
```bash
# Desde la raíz del proyecto
cd "G:\Otros ordenadores\Mi PC\OPERADORA\Gravity\operadora-dev-main"

# Crear carpeta para app móvil
mkdir operadora-mobile
cd operadora-mobile
```

### 2.2 Inicializar proyecto con Expo
```bash
# Opción 1: Proyecto básico (recomendado para empezar)
npx create-expo-app@latest . --template blank-typescript

# Opción 2: Proyecto con navegación incluida
npx create-expo-app@latest . --template tabs-typescript
```

### 2.3 Estructura de carpetas recomendada
```
operadora-mobile/
├── app/                    # Pantallas (Expo Router)
│   ├── (auth)/            # Pantallas de autenticación
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (tabs)/            # Pantallas principales con tabs
│   │   ├── index.tsx      # Home
│   │   ├── search.tsx     # Búsqueda
│   │   ├── bookings.tsx   # Mis Reservas
│   │   └── profile.tsx    # Perfil
│   └── _layout.tsx        # Layout principal
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes UI básicos
│   ├── forms/            # Formularios
│   └── cards/            # Cards de hoteles, vuelos, etc.
├── services/             # Servicios de API
│   ├── api.ts            # Cliente HTTP base
│   ├── auth.service.ts   # Autenticación
│   ├── hotel.service.ts  # Hoteles
│   └── flight.service.ts # Vuelos
├── store/                # Estado global (Zustand/Redux)
│   ├── auth.store.ts
│   ├── booking.store.ts
│   └── user.store.ts
├── types/                # TypeScript types
│   ├── api.types.ts
│   ├── models.types.ts
│   └── navigation.types.ts
├── utils/                # Utilidades
│   ├── storage.ts        # AsyncStorage helpers
│   ├── validators.ts     # Validaciones
│   └── formatters.ts     # Formateo de datos
├── constants/            # Constantes
│   ├── config.ts         # Configuración
│   └── theme.ts          # Tema (colores, fuentes)
├── assets/               # Imágenes, fuentes, etc.
├── app.json              # Configuración Expo
├── package.json
└── tsconfig.json
```

---

## 📋 PASO 3: INSTALAR DEPENDENCIAS ESENCIALES

### 3.1 Navegación
```bash
# Expo Router (navegación basada en archivos)
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

### 3.2 HTTP Client y Estado
```bash
# Axios para llamadas HTTP
npm install axios

# Zustand para estado global (alternativa: Redux Toolkit)
npm install zustand

# React Query para cache de datos
npm install @tanstack/react-query
```

### 3.3 Almacenamiento Local
```bash
# AsyncStorage para guardar tokens
npx expo install @react-native-async-storage/async-storage

# Secure Store para datos sensibles
npx expo install expo-secure-store
```

### 3.4 UI/UX
```bash
# React Native Paper (Material Design)
npm install react-native-paper

# O NativeBase (alternativa)
npm install native-base

# Iconos
npx expo install @expo/vector-icons

# Animaciones
npm install react-native-reanimated
```

### 3.5 Formularios y Validación
```bash
# React Hook Form
npm install react-hook-form

# Zod para validación
npm install zod @hookform/resolvers
```

### 3.6 Push Notifications
```bash
# Expo Notifications
npx expo install expo-notifications expo-device expo-constants
```

### 3.7 Otras utilidades
```bash
# Manejo de fechas
npm install date-fns

# Imágenes optimizadas
npx expo install expo-image

# Splash screen
npx expo install expo-splash-screen
```

---

## 📋 PASO 4: CONFIGURAR CONEXIÓN CON BACKEND

### 4.1 Crear archivo de configuración
**Archivo:** `constants/config.ts`
```typescript
const ENV = {
  dev: {
    apiUrl: 'http://localhost:3000/api',
    webUrl: 'http://localhost:3000',
  },
  staging: {
    apiUrl: 'https://operadora-dev-preview.vercel.app/api',
    webUrl: 'https://operadora-dev-preview.vercel.app',
  },
  prod: {
    apiUrl: 'https://asoperadora.com/api',
    webUrl: 'https://asoperadora.com',
  },
}

const getEnvVars = () => {
  if (__DEV__) return ENV.dev
  // Cambiar según ambiente
  return ENV.staging
}

export default getEnvVars()
```

### 4.2 Crear cliente HTTP base
**Archivo:** `services/api.ts`
```typescript
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

// Interceptor para agregar token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor para refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si es 401 y no es retry, intentar refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken')
        const { data } = await axios.post(`${config.apiUrl}/auth/refresh`, {
          refreshToken,
        })

        await AsyncStorage.setItem('accessToken', data.data.accessToken)
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        // Refresh falló, hacer logout
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user'])
        // Navegar a login
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default api
```

### 4.3 Crear servicio de autenticación
**Archivo:** `services/auth.service.ts`
```typescript
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

class AuthService {
  async login(credentials: LoginCredentials) {
    const deviceFingerprint = Device.modelName || 'unknown'
    
    const { data } = await api.post('/auth/login', {
      ...credentials,
      device_fingerprint: deviceFingerprint,
    })

    // Guardar tokens
    await AsyncStorage.setItem('accessToken', data.accessToken)
    await AsyncStorage.setItem('refreshToken', data.refreshToken)
    await AsyncStorage.setItem('user', JSON.stringify(data.user))

    return data
  }

  async register(userData: RegisterData) {
    const { data } = await api.post('/auth/register', userData)
    return data
  }

  async logout() {
    const refreshToken = await AsyncStorage.getItem('refreshToken')
    
    try {
      await api.post('/auth/logout', { refreshToken })
    } catch (error) {
      console.error('Logout error:', error)
    }

    // Limpiar storage
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user'])
  }

  async getCurrentUser() {
    const userStr = await AsyncStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  async isAuthenticated() {
    const token = await AsyncStorage.getItem('accessToken')
    return !!token
  }
}

export default new AuthService()
```

---

## 📋 PASO 5: IMPLEMENTAR AUTENTICACIÓN

### 5.1 Crear store de autenticación
**Archivo:** `store/auth.store.ts`
```typescript
import { create } from 'zustand'
import AuthService from '../services/auth.service'

interface User {
  id: number
  email: string
  name: string
  user_type: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    try {
      const data = await AuthService.login({ email, password })
      set({ user: data.user, isAuthenticated: true })
    } catch (error) {
      throw error
    }
  },

  logout: async () => {
    await AuthService.logout()
    set({ user: null, isAuthenticated: false })
  },

  checkAuth: async () => {
    try {
      const isAuth = await AuthService.isAuthenticated()
      if (isAuth) {
        const user = await AuthService.getCurrentUser()
        set({ user, isAuthenticated: true, isLoading: false })
      } else {
        set({ isLoading: false })
      }
    } catch (error) {
      set({ isLoading: false })
    }
  },
}))
```

### 5.2 Crear pantalla de Login
**Archivo:** `app/(auth)/login.tsx`
```typescript
import { useState } from 'react'
import { View, TextInput, Button, Text, StyleSheet } from 'react-native'
import { useAuthStore } from '../../store/auth.store'
import { useRouter } from 'expo-router'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = useAuthStore((state) => state.login)
  const router = useRouter()

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    try {
      await login(email, password)
      router.replace('/(tabs)')
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AS Operadora</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button title={loading ? 'Cargando...' : 'Iniciar Sesión'} onPress={handleLogin} disabled={loading} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
  },
  error: {
    color: 'red',
    marginBottom: 15,
  },
})
```

---

## 📋 PASO 6: CONFIGURAR PUSH NOTIFICATIONS

### 6.1 Crear servicio de notificaciones
**Archivo:** `services/notification.service.ts`
```typescript
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import { Platform } from 'react-native'
import api from './api'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

class NotificationService {
  async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.log('Push notifications only work on physical devices')
      return null
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('Permission not granted for push notifications')
      return null
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data

    // Registrar token en backend
    await this.registerDeviceToken(token)

    return token
  }

  async registerDeviceToken(deviceToken: string) {
    try {
      await api.post('/notifications/register-device', {
        device_token: deviceToken,
        platform: Platform.OS,
        device_name: Device.modelName,
        app_version: '1.0.0',
      })
    } catch (error) {
      console.error('Error registering device token:', error)
    }
  }

  async unregisterDeviceToken(deviceToken: string) {
    try {
      await api.post('/notifications/unregister-device', {
        device_token: deviceToken,
      })
    } catch (error) {
      console.error('Error unregistering device token:', error)
    }
  }
}

export default new NotificationService()
```

---

## 📋 PASO 7: EJECUTAR Y PROBAR

### 7.1 Iniciar servidor de desarrollo
```bash
cd operadora-mobile
npx expo start
```

### 7.2 Abrir en dispositivo
- Escanear QR con Expo Go (Android)
- Escanear QR con cámara (iOS)

### 7.3 Probar en emulador
```bash
# Android
npx expo start --android

# iOS (solo macOS)
npx expo start --ios
```

---

## 📋 PASO 8: PRÓXIMAS PANTALLAS A IMPLEMENTAR

### Prioridad Alta
1. ✅ Login / Register
2. 🔲 Home (búsqueda rápida)
3. 🔲 Búsqueda de Hoteles
4. 🔲 Búsqueda de Vuelos
5. 🔲 Detalles de Hotel
6. 🔲 Detalles de Vuelo
7. 🔲 Proceso de Reserva
8. 🔲 Mis Reservas
9. 🔲 Perfil de Usuario

### Prioridad Media
- Notificaciones
- Historial de búsquedas
- Favoritos
- Configuración
- Soporte/Chat

---

## 🔧 CONFIGURACIÓN ADICIONAL

### app.json
```json
{
  "expo": {
    "name": "AS Operadora",
    "slug": "as-operadora",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.asoperadora.app"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.asoperadora.app"
    },
    "plugins": [
      "expo-router",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#ffffff"
        }
      ]
    ]
  }
}
```

---

## 📚 RECURSOS ÚTILES

- **Expo Docs**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **React Navigation**: https://reactnavigation.org/
- **React Query**: https://tanstack.com/query/latest
- **Zustand**: https://github.com/pmndrs/zustand

---

## ⚡ COMANDOS RÁPIDOS

```bash
# Iniciar desarrollo
npx expo start

# Limpiar cache
npx expo start -c

# Actualizar dependencias
npx expo install --fix

# Build para testing
eas build --profile preview --platform android

# Publicar actualización OTA
eas update --branch production
```

---

**Siguiente paso recomendado:** Crear el proyecto con `npx create-expo-app` y configurar la estructura básica.
