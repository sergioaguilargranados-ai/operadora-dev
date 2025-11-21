# 📱 APP MÓVIL - AS OPERADORA

## 🎯 OBJETIVO

Crear aplicación móvil nativa para iOS y Android que:
- ✅ Reutilice el **mismo backend y base de datos**
- ✅ Consuma las **mismas APIs REST** ya creadas
- ✅ Mantenga **consistencia de diseño** con la web
- ✅ Ofrezca **funcionalidades nativas** (notificaciones push, GPS, cámara)

---

# 1️⃣ OPCIONES DE TECNOLOGÍA

## **OPCIÓN A: React Native + Expo** ⭐ **RECOMENDADA**

### **¿Qué es?**
Framework de Facebook para crear apps nativas usando JavaScript/TypeScript y React.

### **Ventajas:**
- ✅ **Reutilización de código:** ~80% del código compartido entre iOS y Android
- ✅ **Consistencia:** Mismo stack que Next.js (React + TypeScript)
- ✅ **Comunidad:** Enorme ecosistema de librerías
- ✅ **Expo:** Facilita desarrollo sin Xcode/Android Studio inicialmente
- ✅ **Hot Reload:** Cambios en tiempo real
- ✅ **Puedo escribir TODO el código en Same**

### **Desventajas:**
- ⚠️ Apps ligeramente más pesadas que nativas puras
- ⚠️ Para publicar necesitas Mac (iOS) y PC/Mac (Android)

### **Stack Técnico:**
```
- React Native 0.73+
- Expo SDK 50+
- TypeScript
- React Navigation (navegación)
- React Query (cache de APIs)
- AsyncStorage (almacenamiento local)
- Expo Notifications (notificaciones push)
- Axios (llamadas HTTP)
- React Hook Form (formularios)
```

### **Tiempo de desarrollo:**
- Fase 1 (MVP): 2-3 semanas
- Fase 2 (Completa): 4-6 semanas

---

## **OPCIÓN B: Flutter**

### **¿Qué es?**
Framework de Google usando lenguaje Dart.

### **Ventajas:**
- ✅ Performance excelente (compilado a código nativo)
- ✅ UI hermosas y fluidas
- ✅ Hot Reload

### **Desventajas:**
- ❌ **Nuevo lenguaje:** Dart (no reutilizas conocimiento de JS/TS)
- ❌ **Menos consistencia** con tu stack web
- ⚠️ Puedo escribir el código, pero tú aprenderías Dart desde cero

### **Tiempo de desarrollo:**
- Fase 1 (MVP): 3-4 semanas
- Fase 2 (Completa): 6-8 semanas

---

## **OPCIÓN C: Ionic + Capacitor**

### **¿Qué es?**
App híbrida (WebView) usando tecnologías web.

### **Ventajas:**
- ✅ Reutilización máxima de código web
- ✅ Un solo codebase para web + móvil

### **Desventajas:**
- ❌ Performance inferior (es un navegador embebido)
- ❌ Experiencia menos "nativa"

---

# 2️⃣ RECOMENDACIÓN: REACT NATIVE + EXPO

## **¿Por qué?**

1. ✅ **Máxima reutilización del conocimiento actual**
   - Ya usas React en Next.js
   - Ya usas TypeScript
   - Ya usas componentes similares

2. ✅ **Reutilización del backend completo**
   - Mismas APIs REST
   - Mismo JWT
   - Misma BD PostgreSQL
   - Mismas validaciones

3. ✅ **Puedo crear TODO el código aquí en Same**
   - Estructura completa
   - Todos los componentes
   - Toda la lógica
   - Integración con APIs

4. ✅ **Expo facilita el proceso**
   - No necesitas Xcode/Android Studio para empezar
   - Puedes probar en tu celular físico (Expo Go app)
   - Compilación en la nube (EAS Build)

---

# 3️⃣ ARQUITECTURA DE LA APP MÓVIL

## **Reutilización del Backend**

```
┌─────────────────────────────────────────────┐
│         WEB (Next.js)                       │
│   - Navegador desktop/mobile               │
└───────────────┬─────────────────────────────┘
                │
                │ API REST (JSON)
                │
┌───────────────▼─────────────────────────────┐
│         BACKEND (Next.js API Routes)        │
│   - /api/auth/login                         │
│   - /api/auth/register                      │
│   - /api/hotels                             │
│   - /api/bookings                           │
│   - /api/favorites                          │
│   - /api/...                                │
└───────────────┬─────────────────────────────┘
                │
                │ SQL
                │
┌───────────────▼─────────────────────────────┐
│         POSTGRESQL (Neon)                   │
│   - users, bookings, hotels, etc.           │
└─────────────────────────────────────────────┘
                ▲
                │ API REST (JSON)
                │
┌───────────────┴─────────────────────────────┐
│         APP MÓVIL (React Native)            │
│   - iOS + Android                           │
│   - Mismas APIs                             │
│   - Misma autenticación                     │
└─────────────────────────────────────────────┘
```

**Clave:** La app móvil **NO necesita backend propio**, usa el mismo backend que la web.

---

# 4️⃣ FUNCIONALIDADES DE LA APP MÓVIL

## **Funcionalidades Cliente Final (Usuario)**

### **Autenticación:**
- ✅ Login con email/password
- ✅ Registro de cuenta
- ✅ Recuperar contraseña
- ✅ Login con Google / Apple (OAuth)
- ✅ Biométrico (Touch ID / Face ID)

### **Búsqueda y Reservas:**
- ✅ Búsqueda de vuelos
- ✅ Búsqueda de hoteles
- ✅ Búsqueda de paquetes
- ✅ Búsqueda de atracciones
- ✅ Filtros avanzados
- ✅ Mapa interactivo (GPS)
- ✅ Favoritos / Wishlist

### **Reservas:**
- ✅ Checkout completo
- ✅ Pagos con tarjeta (Stripe SDK)
- ✅ Historial de reservas
- ✅ Detalles de reserva
- ✅ Vouchers/boletos digitales (PDF + QR)
- ✅ Compartir reserva

### **Perfil:**
- ✅ Datos personales
- ✅ Viajeros frecuentes
- ✅ Métodos de pago guardados
- ✅ Documentos de viaje (pasaportes, visas)
- ✅ Preferencias de asiento/comida
- ✅ Puntos AS Club

### **Notificaciones:**
- ✅ Push notifications
  - Confirmación de reserva
  - Recordatorio de check-in
  - Cambios de vuelo
  - Ofertas personalizadas
- ✅ Email
- ✅ SMS (opcional)
- ✅ WhatsApp (opcional)

### **Funcionalidades Nativas:**
- ✅ **Cámara:** Escanear documentos (pasaporte, INE)
- ✅ **GPS:** Hoteles cercanos, mapa de ubicación
- ✅ **Calendario:** Agregar viaje al calendario del teléfono
- ✅ **Compartir:** Compartir reservas por WhatsApp/Email
- ✅ **Wallet:** Agregar boletos a Apple Wallet / Google Pay
- ✅ **Offline:** Acceso a reservas sin internet (cache)

---

## **Funcionalidades Corporativas (Opcional)**

Si el usuario es de una empresa:

- ✅ Solicitud de viaje (workflow de aprobación)
- ✅ Ver política corporativa
- ✅ Reportes de gastos
- ✅ Asignar centro de costo

---

## **Funcionalidades Agencia (Opcional)**

Si el usuario es agente de viajes:

- ✅ Dashboard de clientes
- ✅ Crear reservas para clientes
- ✅ CRM simplificado
- ✅ Comisiones ganadas
- ✅ Reportes de ventas

---

# 5️⃣ LO QUE PUEDO HACER EN SAME

## ✅ **Crear TODO el código:**

1. **Estructura del proyecto:**
```
as-operadora-mobile/
├── src/
│   ├── screens/          # Pantallas (Login, Home, Search, etc.)
│   ├── components/       # Componentes reutilizables
│   ├── navigation/       # Configuración de navegación
│   ├── services/         # API calls, auth, storage
│   ├── store/            # Estado global (Context/Redux)
│   ├── hooks/            # Custom hooks
│   ├── utils/            # Utilidades
│   ├── types/            # TypeScript types
│   └── constants/        # Constantes, colores, etc.
├── assets/               # Imágenes, fuentes, íconos
├── app.json              # Configuración Expo
├── package.json
└── tsconfig.json
```

2. **Todos los componentes:**
   - Pantallas (30-40 pantallas)
   - Componentes UI (botones, inputs, cards)
   - Navegación (tabs, stack, drawer)

3. **Toda la lógica:**
   - Integración con APIs
   - Autenticación JWT
   - Estado global
   - Cache de datos
   - Manejo de errores

4. **Servicios:**
   - API Service (axios)
   - Auth Service (JWT, biométrico)
   - Storage Service (AsyncStorage)
   - Notification Service (Push)
   - Camera Service (escaneo documentos)

5. **Documentación:**
   - README completo
   - Guía de instalación
   - Guía de compilación Android
   - Guía de compilación iOS
   - Guía de publicación en stores

---

## ❌ **Lo que NO puedo hacer en Same:**

1. ❌ **Ejecutar la app**
   - No hay emulador Android/iOS aquí
   - Necesitas Android Studio o Xcode

2. ❌ **Compilar .apk / .ipa**
   - Lo harás tú con EAS Build (Expo) o localmente

3. ❌ **Probar en dispositivos**
   - Usarás Expo Go en tu celular
   - O emuladores en tu PC/Mac

4. ❌ **Publicar en stores**
   - Lo harás tú (te guío con documentación)

---

# 6️⃣ PROCESO DE DESARROLLO

## **Fase 1: Yo creo el código aquí (1-2 días)**

1. Creo la estructura completa del proyecto
2. Configuración de Expo + TypeScript
3. Todas las pantallas principales
4. Integración con tus APIs existentes
5. Navegación completa
6. Autenticación
7. Componentes UI

**Entregable:** Proyecto completo listo para compilar

---

## **Fase 2: Tú compilas y pruebas (1-2 días)**

**Requisitos:**
- Node.js 18+
- Expo CLI
- Smartphone (para probar con Expo Go)

**Pasos:**

1. **Instalar dependencias:**
```bash
cd as-operadora-mobile
npm install
```

2. **Ejecutar en modo desarrollo:**
```bash
npx expo start
```

3. **Probar en tu celular:**
   - Descargar "Expo Go" (iOS/Android)
   - Escanear QR code
   - App se ejecuta en tu teléfono

4. **Ver cambios en tiempo real:**
   - Editas código
   - Se actualiza automáticamente en el celular

---

## **Fase 3: Compilar APK/IPA (2-3 días)**

### **Opción A: EAS Build (Expo Cloud) - Recomendado**

**Ventajas:**
- ✅ No necesitas Xcode ni Android Studio
- ✅ Compilación en la nube
- ✅ Gratis para desarrollo

**Pasos:**
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar proyecto
eas build:configure

# Build Android (APK)
eas build --platform android --profile preview

# Build iOS (requiere cuenta Apple Developer $99/año)
eas build --platform ios --profile preview
```

**Tiempo:** 10-15 minutos por build

### **Opción B: Build Local**

**Android (Windows/Mac/Linux):**
- Instalar Android Studio
- Configurar SDK
- Generar APK

**iOS (Solo Mac):**
- Instalar Xcode
- Cuenta Apple Developer
- Generar IPA

---

## **Fase 4: Publicación en Stores (3-7 días)**

### **Google Play Store:**
- Cuenta Google Play Developer: $25 (pago único)
- Tiempo de revisión: 1-3 días

### **Apple App Store:**
- Cuenta Apple Developer: $99/año
- Tiempo de revisión: 2-7 días

---

# 7️⃣ EJEMPLO DE CÓDIGO

## **Ejemplo: Pantalla de Login**

```typescript
// src/screens/LoginScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      // Llama a la misma API que la web
      await login(email, password);
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Error', 'Email o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a AS Operadora</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>
          ¿No tienes cuenta? Regístrate
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#0066FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#0066FF',
    textAlign: 'center',
    marginTop: 20,
  },
});
```

## **Ejemplo: Servicio de API**

```typescript
// src/services/api.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://tudominio.com/api'; // Tu backend existente

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Agregar token JWT a cada request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user } = response.data;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  register: async (data: RegisterData) => {
    const response = await api.post('/auth/register', data);
    const { token, user } = response.data;
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return { token, user };
  },

  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },
};

export const hotelsAPI = {
  search: async (params: SearchParams) => {
    const response = await api.get('/hotels', { params });
    return response.data.hotels;
  },

  getDetails: async (id: number) => {
    const response = await api.get(`/hotels/${id}`);
    return response.data.hotel;
  },
};

export default api;
```

---

# 8️⃣ COSTOS DE LA APP MÓVIL

## **Desarrollo:**
- **Costo:** $0 (yo creo el código)
- **Tiempo:** 1-2 semanas

## **Herramientas:**
- **Expo:** Gratis
- **EAS Build:** Gratis para desarrollo, $29/mes para producción
- **React Native:** Gratis

## **Publicación:**
- **Google Play Store:** $25 (pago único)
- **Apple App Store:** $99/año

## **Total primer año:**
- Setup: $25-124
- Mensual: $0-29 (si usas EAS Build)

---

# 9️⃣ VENTAJAS DE ESTA ESTRATEGIA

1. ✅ **Cero duplicación de código backend**
   - Un solo backend para web + móvil
   - Una sola base de datos
   - Una sola fuente de verdad

2. ✅ **Desarrollo rápido**
   - Reutilizas APIs existentes
   - Yo creo el código móvil completo
   - Tú solo compilas y publicas

3. ✅ **Mantenimiento simple**
   - Actualizas una API, funciona en web + móvil
   - No necesitas sincronizar dos backends

4. ✅ **Consistencia total**
   - Misma lógica de negocio
   - Mismos datos
   - Misma experiencia de usuario

---

# 🎯 SIGUIENTE PASO

## **¿Qué necesito para empezar?**

1. **Tu confirmación:**
   - ✅ React Native + Expo
   - ✅ Funcionalidades de Cliente Final
   - ✅ Integración con backend actual

2. **Información adicional:**
   - ¿Colores y branding específico para la app?
   - ¿Alguna funcionalidad extra para móvil?
   - ¿Prioridad: Android primero, iOS primero, o ambos?

3. **Acceso:**
   - URL del backend en producción (para configurar API_URL)
   - ¿Ya tienes cuenta de Google Play Developer?
   - ¿Ya tienes cuenta de Apple Developer?

---

## **Timeline Estimado:**

| Fase | Quién | Tiempo | Actividad |
|------|-------|--------|-----------|
| 1 | Yo (Same) | 1-2 días | Crear código completo de la app |
| 2 | Tú | 1 día | Instalar dependencias y probar en Expo Go |
| 3 | Tú | 2-3 días | Build con EAS o local |
| 4 | Tú | 3-7 días | Publicar en stores |
| **TOTAL** | - | **7-13 días** | **App en producción** |

---

¿Te parece bien esta estrategia? ¿Quieres que empiece a crear el proyecto de la app móvil?
