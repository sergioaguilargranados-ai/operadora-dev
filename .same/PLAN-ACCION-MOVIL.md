# 🚀 PLAN DE ACCIÓN - Próximos Pasos

**Fecha:** 15 de Enero de 2026 - 02:15 CST  
**Estado Actual:** Proyecto móvil creado, pendiente instalación de dependencias

---

## ✅ COMPLETADO

### Backend (100%)
- ✅ CORS configurado
- ✅ Refresh tokens implementados
- ✅ Device tokens para push notifications
- ✅ Endpoints de autenticación listos
- ✅ Migraciones de base de datos creadas

### App Móvil - Estructura (100%)
- ✅ Proyecto creado en `operadora-mobile/`
- ✅ Configuración completa (package.json, app.json, tsconfig)
- ✅ Servicios de API y autenticación
- ✅ Store de estado global (Zustand)
- ✅ Pantallas de Login y Registro
- ✅ Navegación con tabs (Home, Buscar, Reservas, Perfil)
- ✅ Tema y constantes configuradas

---

## 📋 SIGUIENTE PASO: INSTALAR NODE.JS Y NPM

### Opción 1: Instalar Node.js (Recomendado)

1. **Descargar Node.js:**
   - Ir a: https://nodejs.org/
   - Descargar versión LTS (Long Term Support)
   - Versión recomendada: v20.x o superior

2. **Instalar:**
   - Ejecutar el instalador descargado
   - Seguir el asistente (opciones por defecto están bien)
   - **Importante:** Marcar la opción "Add to PATH"

3. **Verificar instalación:**
   ```bash
   node --version
   npm --version
   ```

### Opción 2: Usar NVM (Node Version Manager)

Para gestionar múltiples versiones de Node:

**Windows:**
- Descargar: https://github.com/coreybutler/nvm-windows/releases
- Instalar y ejecutar:
  ```bash
  nvm install 20
  nvm use 20
  ```

---

## 📋 PASOS DESPUÉS DE INSTALAR NODE.JS

### 1. Instalar Dependencias del Proyecto Móvil

```bash
cd "G:\Otros ordenadores\Mi PC\OPERADORA\Gravity\operadora-dev-main\operadora-dev\operadora-mobile"
npm install
```

**Tiempo estimado:** 5-10 minutos  
**Espacio en disco:** ~500 MB

### 2. Instalar Expo CLI (Opcional pero recomendado)

```bash
npm install -g expo-cli
```

### 3. Ejecutar Migraciones de Base de Datos

Antes de probar la app, ejecutar las migraciones nuevas:

```sql
-- Conectar a tu base de datos PostgreSQL y ejecutar:

-- Migración de refresh tokens
\i "G:\Otros ordenadores\Mi PC\OPERADORA\Gravity\operadora-dev-main\operadora-dev\migrations\015_refresh_tokens.sql"

-- Migración de device tokens
\i "G:\Otros ordenadores\Mi PC\OPERADORA\Gravity\operadora-dev-main\operadora-dev\migrations\017_device_tokens.sql"
```

**O usando psql desde terminal:**
```bash
psql $DATABASE_URL -f migrations/015_refresh_tokens.sql
psql $DATABASE_URL -f migrations/017_device_tokens.sql
```

### 4. Iniciar Backend (Terminal 1)

```bash
cd "G:\Otros ordenadores\Mi PC\OPERADORA\Gravity\operadora-dev-main\operadora-dev"
npm run dev
```

**Verificar que esté corriendo en:** http://localhost:3000

### 5. Obtener tu IP Local

Para que la app móvil pueda conectarse al backend:

```bash
# Windows
ipconfig
# Buscar "Dirección IPv4" en tu adaptador WiFi
# Ejemplo: 192.168.1.100
```

### 6. Configurar IP en la App Móvil

Editar: `operadora-mobile/constants/config.ts`

```typescript
const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.100:3000/api',  // ⬅️ Cambiar por tu IP
    webUrl: 'http://192.168.1.100:3000',
  },
  // ...
}
```

### 7. Iniciar App Móvil (Terminal 2)

```bash
cd "G:\Otros ordenadores\Mi PC\OPERADORA\Gravity\operadora-dev-main\operadora-dev\operadora-mobile"
npm start
```

Esto abrirá Expo DevTools en tu navegador.

### 8. Instalar Expo Go en tu Teléfono

- **Android:** Google Play Store
- **iOS:** App Store

Buscar: "Expo Go"

### 9. Escanear QR y Probar

1. Asegúrate de estar en la **misma red WiFi** que tu PC
2. Abre Expo Go en tu teléfono
3. Escanea el código QR que aparece en la terminal
4. ¡La app se cargará en tu teléfono!

### 10. Probar Autenticación

**Crear usuario de prueba:**
1. En la app, ir a "Regístrate"
2. Llenar formulario:
   - Nombre: Tu nombre
   - Email: test@ejemplo.com
   - Teléfono: 5512345678
   - Tipo: Cliente
   - Contraseña: Password123!
3. Registrarse

**Iniciar sesión:**
1. Usar el email y contraseña creados
2. Deberías ver la pantalla de inicio

---

## 🎯 FUNCIONALIDADES A DESARROLLAR (Próximas Semanas)

### Semana 1-2: Búsqueda de Hoteles
- [ ] Pantalla de búsqueda con filtros
- [ ] Integración con API de Amadeus
- [ ] Lista de resultados
- [ ] Detalles de hotel
- [ ] Galería de imágenes

### Semana 2-3: Búsqueda de Vuelos
- [ ] Pantalla de búsqueda de vuelos
- [ ] Integración con API de Amadeus
- [ ] Lista de vuelos disponibles
- [ ] Detalles de vuelo
- [ ] Selección de asientos

### Semana 3-4: Proceso de Reserva
- [ ] Carrito de compras
- [ ] Formulario de pasajeros
- [ ] Integración de pagos (Stripe/PayPal)
- [ ] Confirmación de reserva
- [ ] Email de confirmación

### Semana 4-5: Mis Reservas
- [ ] Lista de reservas activas
- [ ] Historial de reservas
- [ ] Detalles de reserva
- [ ] Cancelación de reservas
- [ ] Modificación de reservas

### Semana 5-6: Push Notifications
- [ ] Configurar Firebase Cloud Messaging
- [ ] Notificaciones de confirmación
- [ ] Recordatorios de viaje
- [ ] Ofertas personalizadas
- [ ] Actualizaciones de vuelo

### Semana 6-7: Perfil y Configuración
- [ ] Editar perfil
- [ ] Cambiar contraseña
- [ ] Preferencias de viaje
- [ ] Documentos guardados
- [ ] Métodos de pago guardados

### Semana 7-8: Pulido y Testing
- [ ] Optimización de rendimiento
- [ ] Testing en múltiples dispositivos
- [ ] Corrección de bugs
- [ ] Mejoras de UX
- [ ] Preparación para producción

---

## 📊 RESUMEN DE ARCHIVOS CREADOS

### Backend (6 archivos modificados/creados)
```
operadora-dev/
├── src/services/AuthService.ts          [MODIFICADO] +71 líneas
├── src/services/PushNotificationService.ts  [NUEVO]
├── src/app/api/notifications/unregister-device/route.ts  [MODIFICADO]
├── migrations/017_device_tokens.sql     [NUEVO]
├── .same/BACKEND-MOVIL-PREPARACION.md   [MODIFICADO]
└── .same/GUIA-INICIO-APP-MOVIL.md       [NUEVO]
```

### App Móvil (20+ archivos creados)
```
operadora-mobile/
├── package.json
├── app.json
├── tsconfig.json
├── babel.config.js
├── .gitignore
├── README.md
├── INSTRUCCIONES.md
├── constants/
│   ├── config.ts
│   └── theme.ts
├── services/
│   ├── api.ts
│   └── auth.service.ts
├── store/
│   └── auth.store.ts
└── app/
    ├── _layout.tsx
    ├── (auth)/
    │   ├── _layout.tsx
    │   ├── login.tsx
    │   └── register.tsx
    └── (tabs)/
        ├── _layout.tsx
        ├── index.tsx
        ├── search.tsx
        ├── bookings.tsx
        └── profile.tsx
```

---

## 🔧 COMANDOS ÚTILES

### Backend
```bash
# Iniciar desarrollo
npm run dev

# Build producción
npm run build

# Ejecutar migraciones
psql $DATABASE_URL -f migrations/015_refresh_tokens.sql
```

### App Móvil
```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm start

# Limpiar cache
npx expo start -c

# Android
npm run android

# iOS (solo macOS)
npm run ios
```

---

## 📚 RECURSOS

- **Node.js:** https://nodejs.org/
- **Expo Docs:** https://docs.expo.dev/
- **React Native:** https://reactnative.dev/
- **Amadeus API:** https://developers.amadeus.com/
- **Firebase:** https://firebase.google.com/

---

## ⚠️ NOTAS IMPORTANTES

1. **Node.js es REQUERIDO** para continuar con el desarrollo móvil
2. **Misma red WiFi** necesaria para probar en dispositivo físico
3. **Backend debe estar corriendo** para que la app funcione
4. **Migraciones deben ejecutarse** antes de probar autenticación
5. **IP local** debe configurarse en `constants/config.ts`

---

## 🎉 ESTADO ACTUAL

✅ **Backend:** 100% listo para móvil  
✅ **App Móvil:** Estructura completa creada  
⏳ **Siguiente:** Instalar Node.js y dependencias  
🎯 **Meta:** App funcional con login en 1-2 días

---

**Última actualización:** 15 de Enero de 2026 - 02:15 CST  
**Versión:** v2.225
