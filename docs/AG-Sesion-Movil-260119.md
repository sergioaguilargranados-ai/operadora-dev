# 📱 Sesión App Móvil - 19 Enero 2026

**Fecha:** 19 de Enero de 2026 - 18:25 CST  
**Objetivo:** Configurar app móvil para pruebas en Expo Go  
**Estado:** Pendiente - Cambio de directorio necesario

---

## 🎯 CONTEXTO DE LA SESIÓN

Estamos configurando la aplicación móvil de AS Operadora para poder probarla en Expo Go. La app móvil ya está completada según los reportes de avances anteriores.

---

## ⚠️ PROBLEMA IDENTIFICADO

### Rutas Largas en Windows

La instalación de dependencias con `npm install` falló debido a un problema conocido de Windows con rutas que exceden 260 caracteres.

**Ruta actual problemática:**
```
G:\Otros ordenadores\Mi PC\OPERADORA\AntiGravity\operadora-dev\operadora-mobile\
```

**Errores observados:**
- `EBADF: bad file descriptor`
- `EPERM: operation not permitted`
- `UNKNOWN: unknown error`

Estos errores ocurren cuando npm intenta crear directorios anidados profundos en `node_modules` y la ruta total excede el límite de Windows.

---

## ✅ SOLUCIÓN APLICADA

**Cambio de directorio a ruta más corta**

El usuario moverá el proyecto a una ruta más corta para evitar el problema de límite de caracteres en Windows.

### Ejemplo de ruta recomendada:
```
C:\operadora-dev\
```

---

## 📝 LO QUE SE HIZO EN ESTA SESIÓN

1. ✅ **Actualización de IP local**
   - Archivo: `operadora-mobile/constants/config.ts`
   - IP actualizada: `192.168.1.8` (antes era 192.168.1.7)
   - Puerto backend: `3000`

2. ✅ **Verificación de entorno**
   - Node.js: v24.13.0 ✅
   - npm: 11.6.2 ✅

3. ❌ **Instalación de dependencias**
   - Intentado: `npm install --legacy-peer-deps`
   - Resultado: Falló por rutas largas de Windows

---

## 🔄 PRÓXIMOS PASOS (Nueva Sesión)

### 1. Mover Proyecto a Ruta Corta

**Opción A - Ruta recomendada:**
```bash
# Mover todo el proyecto a:
C:\operadora-dev\
```

**Opción B - Alternativa:**
```bash
# O cualquier ruta corta como:
C:\proyectos\operadora\
```

### 2. Actualizar Configuración

Después de mover, actualizar las referencias en:

- **AG-Contexto-Proyecto.md**: Actualizar todas las rutas
- **PLAN-ACCION-MOVIL.md**: Actualizar comandos con nueva ruta
- **Variables de entorno**: Si hay rutas absolutas

### 3. Instalar Dependencias

```bash
# En la nueva ubicación
cd C:\operadora-dev\operadora-mobile
npm install --legacy-peer-deps
```

### 4. Verificar IP Local

Si la IP cambió, actualizar en:
```
operadora-mobile/constants/config.ts
```

Verificar IP actual con:
```bash
ipconfig
# Buscar "Dirección IPv4" en adaptador Wi-Fi
```

### 5. Ejecutar Migraciones

Antes de probar la app, ejecutar:
```bash
cd C:\operadora-dev
node ejecutar-migraciones.js
```

O manualmente las migraciones:
- `migrations/015_refresh_tokens.sql`
- `migrations/017_device_tokens.sql`

### 6. Iniciar Backend

```bash
cd C:\operadora-dev
npm run dev
```

Verificar que esté en: http://localhost:3000

### 7. Iniciar App Móvil

```bash
cd C:\operadora-dev\operadora-mobile
npm start
```

### 8. Probar en Expo Go

1. Instalar Expo Go en teléfono (Android/iOS)
2. Conectar a misma red WiFi
3. Escanear QR code
4. Probar login/registro

---

## 📊 ESTADO DEL PROYECTO MÓVIL

### Backend (100% Listo)
- ✅ CORS configurado
- ✅ Refresh tokens implementados
- ✅ Device tokens para push notifications
- ✅ Endpoints de autenticación

### App Móvil (Estructura 100%)
- ✅ Proyecto creado en `operadora-mobile/`
- ✅ Configuración completa (package.json, app.json, tsconfig)
- ✅ Servicios de API y autenticación
- ✅ Store de estado global (Zustand)
- ✅ Pantallas de Login y Registro
- ✅ Navegación con tabs
- ⏳ **Dependencias pendientes de instalar**

---

## 🔧 COMANDOS ÚTILES

### Verificar versiones
```bash
node --version    # Debe ser v20+ o v24+
npm --version     # Debe ser v8+ o v11+
```

### Verificar IP
```bash
ipconfig
# Buscar "Dirección IPv4" en Wi-Fi
```

### Limpiar cache si es necesario
```bash
npm cache clean --force
```

### Instalar con legacy peer deps
```bash
npm install --legacy-peer-deps
```

---

## 📌 NOTAS IMPORTANTES

1. **Ruta corta es CRÍTICA** - Windows tiene límite de 260 caracteres
2. **Misma red WiFi** - PC y teléfono deben estar en la misma red
3. **Backend debe correr** - La app móvil necesita el backend activo
4. **IP correcta** - Verificar y actualizar IP en `config.ts` si cambió

---

## 🎯 OBJETIVO FINAL

Poder probar las funciones de la app móvil en el emulador de Expo Go, validando:
- ✅ Login funcional
- ✅ Registro de usuarios
- ✅ Navegación entre pantallas
- ✅ Conexión con backend
- ✅ Autenticación con tokens

---

**Última actualización:** 19 de Enero de 2026 - 18:25 CST  
**Próxima acción:** Mover proyecto a ruta corta e instalar dependencias
