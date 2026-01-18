# 📱 INSTRUCCIONES PARA EJECUTAR LA APP MÓVIL

## ✅ Proyecto Creado Exitosamente

La estructura del proyecto móvil ha sido creada en:
```
operadora-dev/operadora-mobile/
```

## 🚀 Próximos Pasos

### 1. Instalar Dependencias

Abre una terminal en la carpeta `operadora-mobile` y ejecuta:

```bash
cd operadora-mobile
npm install
```

Esto instalará todas las dependencias necesarias (~5-10 minutos).

### 2. Iniciar el Servidor de Desarrollo

Una vez instaladas las dependencias:

```bash
npm start
```

Esto abrirá Expo DevTools en tu navegador.

### 3. Probar en tu Dispositivo

#### Opción A: Expo Go (Más Rápido)

1. Descarga **Expo Go** en tu teléfono:
   - iOS: App Store
   - Android: Google Play

2. Escanea el código QR que aparece en la terminal:
   - iOS: Usa la cámara nativa
   - Android: Usa la app Expo Go

#### Opción B: Emulador

**Android:**
```bash
npm run android
```

**iOS (solo macOS):**
```bash
npm run ios
```

## 📱 Funcionalidades Implementadas

### ✅ Autenticación
- Login con email/contraseña
- Registro de nuevos usuarios
- Refresh token automático
- Logout

### ✅ Navegación
- Tabs inferiores (Home, Buscar, Reservas, Perfil)
- Navegación protegida (requiere login)
- Redirección automática

### ✅ Pantallas
- **Login**: Formulario completo con validación
- **Registro**: Con selección de tipo de usuario
- **Home**: Búsqueda rápida y destinos populares
- **Perfil**: Información del usuario y configuración

### ✅ Integración Backend
- Cliente HTTP con Axios
- Interceptores para tokens
- Refresh token automático
- Manejo de errores

## 🔧 Configuración

### Cambiar URL del Backend

Edita `constants/config.ts`:

```typescript
const ENV = {
  dev: {
    apiUrl: 'http://TU_IP:3000/api',  // Cambia por tu IP local
    webUrl: 'http://TU_IP:3000',
  },
  // ...
}
```

**Nota:** Para probar en dispositivo físico, usa tu IP local en lugar de `localhost`.

Para obtener tu IP:
- Windows: `ipconfig` (busca IPv4)
- Mac/Linux: `ifconfig` (busca inet)

Ejemplo: `http://192.168.1.100:3000/api`

## 📂 Estructura del Proyecto

```
operadora-mobile/
├── app/                    # Pantallas (Expo Router)
│   ├── (auth)/            # Login, Register
│   ├── (tabs)/            # Home, Search, Bookings, Profile
│   └── _layout.tsx        # Layout raíz
├── components/            # Componentes reutilizables (vacío por ahora)
├── services/              # APIs
│   ├── api.ts            # Cliente HTTP
│   └── auth.service.ts   # Servicio de autenticación
├── store/                 # Estado global
│   └── auth.store.ts     # Store de autenticación
├── constants/             # Configuración
│   ├── config.ts         # URLs del backend
│   └── theme.ts          # Colores y estilos
├── package.json
├── app.json
└── tsconfig.json
```

## 🧪 Probar la Autenticación

### 1. Asegúrate que el backend esté corriendo

```bash
cd ../  # Volver a operadora-dev
npm run dev  # O el comando que uses para iniciar
```

### 2. Crear un usuario de prueba

Desde la app móvil:
1. Ir a "Regístrate"
2. Llenar el formulario
3. Tipo de cuenta: Cliente
4. Registrarse

### 3. Iniciar sesión

Usar el email y contraseña que acabas de crear.

## 🎨 Personalización

### Cambiar Colores

Edita `constants/theme.ts`:

```typescript
export const Colors = {
  primary: '#1E40AF',      // Color principal
  secondary: '#F59E0B',    // Color secundario
  // ...
}
```

### Agregar Nuevas Pantallas

1. Crear archivo en `app/`:
   - Para pantallas públicas: `app/nueva-pantalla.tsx`
   - Para pantallas con tabs: `app/(tabs)/nueva-tab.tsx`
   - Para pantallas de auth: `app/(auth)/nueva-auth.tsx`

2. Expo Router automáticamente crea la ruta

## 📦 Dependencias Principales

- **expo**: Framework para React Native
- **expo-router**: Navegación basada en archivos
- **react-native-paper**: Componentes UI Material Design
- **zustand**: Estado global
- **axios**: Cliente HTTP
- **@tanstack/react-query**: Cache de datos
- **@react-native-async-storage/async-storage**: Almacenamiento local

## 🐛 Solución de Problemas

### Error: "Unable to resolve module"
```bash
npm install
npx expo start -c  # Limpiar cache
```

### Error: "Network request failed"
- Verifica que el backend esté corriendo
- Usa tu IP local en lugar de localhost
- Verifica que estés en la misma red WiFi

### Error en iOS: "Unable to boot simulator"
- Asegúrate de tener Xcode instalado (solo macOS)
- Abre Xcode una vez para aceptar licencias

## 📚 Recursos

- **Expo Docs**: https://docs.expo.dev/
- **React Native Paper**: https://callstack.github.io/react-native-paper/
- **Expo Router**: https://expo.github.io/router/docs/
- **Zustand**: https://github.com/pmndrs/zustand

## 🎯 Próximas Funcionalidades a Implementar

1. ✅ Autenticación (Completado)
2. 🔲 Búsqueda de Hoteles
3. 🔲 Búsqueda de Vuelos
4. 🔲 Detalles de Hotel/Vuelo
5. 🔲 Proceso de Reserva
6. 🔲 Historial de Reservas
7. 🔲 Push Notifications
8. 🔲 Pagos

## 💡 Comandos Útiles

```bash
# Iniciar desarrollo
npm start

# Limpiar cache
npx expo start -c

# Ver en Android
npm run android

# Ver en iOS
npm run ios

# Actualizar dependencias
npx expo install --fix

# Ver logs
npx expo start --dev-client
```

---

**¡Listo para desarrollar! 🚀**

Si tienes problemas, revisa la documentación completa en `.same/GUIA-INICIO-APP-MOVIL.md`
