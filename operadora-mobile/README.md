# AS Operadora Mobile

Aplicación móvil de AS Operadora desarrollada con React Native + Expo.

## 🚀 Inicio Rápido

### Prerequisitos
- Node.js 18+
- npm o yarn
- Expo Go app en tu teléfono

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start

# Ejecutar en Android
npm run android

# Ejecutar en iOS
npm run ios
```

## 📱 Características

- ✅ Autenticación JWT con refresh tokens
- ✅ Búsqueda de hoteles y vuelos
- ✅ Sistema de reservas
- ✅ Push notifications
- ✅ Perfil de usuario
- ✅ Historial de reservas

## 🏗️ Estructura del Proyecto

```
operadora-mobile/
├── app/              # Pantallas (Expo Router)
├── components/       # Componentes reutilizables
├── services/         # APIs y servicios
├── store/            # Estado global (Zustand)
├── types/            # TypeScript types
├── constants/        # Configuración y constantes
└── assets/           # Imágenes y recursos
```

## 🔧 Tecnologías

- React Native
- Expo
- TypeScript
- Expo Router (navegación)
- Zustand (estado global)
- React Query (cache de datos)
- Axios (HTTP client)
- React Native Paper (UI)

## 📚 Documentación

Ver documentación completa en `.same/GUIA-INICIO-APP-MOVIL.md`

## 🌐 Backend

Esta app consume el backend Next.js ubicado en `../operadora-dev`

- API Base: `http://localhost:3000/api`
- Documentación: Ver `../.same/BACKEND-MOVIL-PREPARACION.md`
