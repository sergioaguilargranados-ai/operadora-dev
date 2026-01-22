# 📱 Guía Completa - Configuración de Emulador Android para App Móvil

**Fecha:** 20 de Enero de 2026  
**Objetivo:** Configurar emulador Android para probar la app móvil sin teléfono físico  
**Tiempo estimado:** 1-2 horas (primera vez)

---

## 📋 ÍNDICE

1. [Resumen de lo que Tenemos](#resumen)
2. [Pasos Manuales Pendientes](#pasos-manuales)
3. [Instalación de Android Studio](#android-studio)
4. [Configuración del Emulador](#configuracion-emulador)
5. [Probar la App Móvil](#probar-app)
6. [Solución de Problemas](#problemas)

---

## 🎯 RESUMEN DE LO QUE TENEMOS {#resumen}

### ✅ Completado en la Sesión Anterior:

1. **IP Actualizada**: `192.168.100.8` en `operadora-mobile/constants/config.ts`
2. **Dependencias Instaladas**: 1330 paquetes instalados con `npm install --legacy-peer-deps`
3. **Proyecto Listo**: Todo el código está en `c:\operadora-dev\operadora-mobile\`

### ⏳ Pendiente:

1. **Cerrar proceso de Expo** que quedó atascado
2. **Instalar Android Studio**
3. **Crear emulador Android**
4. **Probar la app**

---

## 🔧 PASOS MANUALES PENDIENTES {#pasos-manuales}

### Paso 1: Cerrar Proceso de Expo Atascado

Si dejaste una terminal abierta con Expo corriendo:

```bash
# Presiona Ctrl+C en la terminal donde está Expo
# O cierra la terminal directamente
```

Si no puedes cerrarla, mata el proceso:

```bash
# Buscar proceso en puerto 8081
netstat -ano | findstr :8081

# Matar el proceso (reemplaza [PID] con el número que aparece)
taskkill /PID [PID] /F
```

### Paso 2: Limpiar Cache de Expo

```bash
cd c:\operadora-dev\operadora-mobile

# Limpiar cache
npx expo start -c
```

**IMPORTANTE:** Si al ejecutar `npx expo start -c` se queda atascado en "Waiting on http://localhost:8081", presiona `Ctrl+C` y continúa con la instalación de Android Studio.

---

## 📥 INSTALACIÓN DE ANDROID STUDIO {#android-studio}

### Paso 1: Descargar Android Studio

1. Ir a: **https://developer.android.com/studio**
2. Click en **"Download Android Studio"**
3. Aceptar términos y condiciones
4. Descargar el instalador (aproximadamente 1 GB)

### Paso 2: Instalar Android Studio

1. **Ejecutar el instalador** descargado
2. Click en **"Next"** en la pantalla de bienvenida
3. **Seleccionar componentes** (dejar todo marcado):
   - ✅ Android Studio
   - ✅ Android Virtual Device
4. Click en **"Next"**
5. **Ubicación de instalación**: Dejar por defecto o elegir otra
   - Por defecto: `C:\Program Files\Android\Android Studio`
6. Click en **"Install"**
7. Esperar instalación (5-10 minutos)
8. Click en **"Finish"**

### Paso 3: Configuración Inicial de Android Studio

1. **Primera ejecución**: Se abrirá el asistente de configuración
2. Seleccionar **"Do not import settings"** → OK
3. Click en **"Next"** en la pantalla de bienvenida
4. **Tipo de instalación**: Seleccionar **"Standard"** → Next
5. **Tema**: Elegir Light o Dark (tu preferencia) → Next
6. **Verificar configuración**: Revisar que incluya:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device
7. Click en **"Next"** → **"Finish"**
8. **Esperar descarga de componentes** (15-30 minutos)
   - Descargará Android SDK, herramientas, etc.
   - Tamaño total: ~3-4 GB

### Paso 4: Configurar Variables de Entorno (Importante)

Después de instalar Android Studio:

1. Abrir **"Variables de entorno"**:
   - Presiona `Win + R`
   - Escribe: `sysdm.cpl`
   - Enter → Pestaña "Opciones avanzadas" → "Variables de entorno"

2. **Crear variable ANDROID_HOME**:
   - En "Variables del sistema" → Click "Nueva"
   - Nombre: `ANDROID_HOME`
   - Valor: `C:\Users\[TU_USUARIO]\AppData\Local\Android\Sdk`
   - Click "Aceptar"

3. **Agregar a PATH**:
   - En "Variables del sistema" → Seleccionar "Path" → "Editar"
   - Click "Nuevo" y agregar:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\emulator`
     - `%ANDROID_HOME%\tools`
   - Click "Aceptar" en todas las ventanas

4. **Verificar instalación**:
   ```bash
   # Abrir nueva terminal (PowerShell o CMD)
   adb --version
   # Debe mostrar: Android Debug Bridge version X.X.X
   ```

---

## 📱 CONFIGURACIÓN DEL EMULADOR {#configuracion-emulador}

### Paso 1: Abrir Device Manager

1. Abrir **Android Studio**
2. En la pantalla de bienvenida:
   - Click en **"More Actions"** (tres puntos verticales)
   - Seleccionar **"Virtual Device Manager"**

   O si ya tienes un proyecto abierto:
   - Menu **"Tools"** → **"Device Manager"**

### Paso 2: Crear Dispositivo Virtual

1. En Device Manager, click en **"Create Device"**

2. **Seleccionar Hardware**:
   - Categoría: **"Phone"**
   - Dispositivo recomendado: **"Pixel 5"** o **"Pixel 6"**
   - Click **"Next"**

3. **Seleccionar System Image** (Versión de Android):
   - Pestaña: **"Recommended"**
   - Seleccionar: **"Tiramisu"** (API Level 33) o **"UpsideDownCake"** (API Level 34)
   - Si no está descargado, verás un link **"Download"** junto al nombre
     - Click en "Download"
     - Aceptar licencia
     - Esperar descarga (~1-2 GB)
   - Click **"Next"**

4. **Configurar AVD**:
   - AVD Name: Dejar por defecto o poner: `Pixel_5_API_33`
   - **Configuración avanzada** (opcional):
     - RAM: 2048 MB (mínimo) o 4096 MB (recomendado)
     - VM heap: 512 MB
     - Internal Storage: 2048 MB
   - Click **"Finish"**

### Paso 3: Iniciar Emulador

1. En **Device Manager**, verás tu dispositivo creado
2. Click en el botón **▶️ (Play)** junto al dispositivo
3. **Esperar que inicie** (2-5 minutos la primera vez)
4. Verás una ventana con un teléfono Android virtual

**Consejos:**
- La primera vez es lenta, las siguientes veces es más rápido
- Puedes minimizar la ventana del emulador
- No cierres el emulador mientras pruebes la app

---

## 🚀 PROBAR LA APP MÓVIL {#probar-app}

### Paso 1: Verificar que el Emulador Esté Corriendo

```bash
# En una terminal, ejecutar:
adb devices

# Debe mostrar algo como:
# List of devices attached
# emulator-5554   device
```

Si no aparece ningún dispositivo, reinicia el emulador.

### Paso 2: Iniciar Expo

Abre una terminal en el directorio del proyecto móvil:

```bash
cd c:\operadora-dev\operadora-mobile

# Iniciar Expo con cache limpio
npx expo start -c
```

**Deberías ver:**
```
› Metro waiting on exp://192.168.100.8:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press w │ open web

› Press j │ open debugger
› Press r │ reload app
› Press m │ toggle menu
```

### Paso 3: Abrir en Emulador

Con el emulador corriendo y Expo iniciado:

1. **Presiona la tecla `a`** en la terminal donde está Expo
2. Expo detectará el emulador automáticamente
3. Instalará Expo Go en el emulador (primera vez)
4. Abrirá tu app

**Esperar:**
- Primera vez: 2-3 minutos (instala Expo Go + compila)
- Siguientes veces: 30-60 segundos

### Paso 4: Verificar que la App Cargue

Deberías ver:
1. **Splash screen** de AS Operadora (fondo azul)
2. **Pantalla de Login** con:
   - Logo de AS Operadora
   - Campos de Email y Password
   - Botón de "Iniciar Sesión"
   - Link de "Registrarse"

---

## ✅ PROBAR FUNCIONALIDADES

### 1. Login

**Credenciales de prueba:**
```
Email: admin@asoperadora.com
Password: Password123!
```

**Otros usuarios:**
```
superadmin@asoperadora.com / Password123!
manager@empresa.com / Password123!
empleado@empresa.com / Password123!
```

### 2. Navegación

Después de login, deberías ver:
- **Tab Bar** en la parte inferior con:
  - 🏠 Inicio
  - 🔍 Buscar
  - 📋 Reservas
  - 👤 Perfil

### 3. Funcionalidades a Probar

**Búsqueda de Vuelos:**
1. Ir a tab "Buscar"
2. Seleccionar "Vuelos"
3. Llenar formulario
4. Ver resultados

**Búsqueda de Hoteles:**
1. Ir a tab "Buscar"
2. Seleccionar "Hoteles"
3. Llenar formulario
4. Ver resultados
5. **Toggle a vista de Mapa** (funcionalidad exclusiva móvil)

**Mis Reservas:**
1. Ir a tab "Reservas"
2. Ver lista de reservas
3. Click en una reserva para ver detalles

**Perfil:**
1. Ir a tab "Perfil"
2. Ver información del usuario
3. Cerrar sesión

---

## 🐛 SOLUCIÓN DE PROBLEMAS {#problemas}

### Problema 1: "Expo no detecta el emulador"

**Solución:**
```bash
# 1. Verificar que el emulador esté corriendo
adb devices

# 2. Si no aparece, reiniciar ADB
adb kill-server
adb start-server

# 3. Verificar nuevamente
adb devices

# 4. Reiniciar Expo
# Presiona Ctrl+C en Expo
npx expo start -c
# Presiona 'a'
```

### Problema 2: "Metro Bundler atascado en 'Waiting on localhost:8081'"

**Solución:**
```bash
# 1. Cerrar Expo (Ctrl+C)

# 2. Matar proceso en puerto 8081
netstat -ano | findstr :8081
taskkill /PID [número_que_aparece] /F

# 3. Limpiar cache de npm
npm cache clean --force

# 4. Reiniciar
npx expo start -c
```

### Problema 3: "Error: Unable to resolve module"

**Solución:**
```bash
# 1. Limpiar cache de Expo
npx expo start -c

# 2. Si persiste, reinstalar dependencias
cd c:\operadora-dev\operadora-mobile
rmdir /s /q node_modules
npm install --legacy-peer-deps
```

### Problema 4: "Emulador muy lento"

**Soluciones:**
1. **Aumentar RAM del emulador**:
   - Device Manager → Click en ✏️ (editar) junto al dispositivo
   - Advanced Settings → RAM: 4096 MB
   - Apply

2. **Habilitar aceleración de hardware**:
   - Verificar que Intel HAXM esté instalado
   - Android Studio → SDK Manager → SDK Tools → Intel x86 Emulator Accelerator (HAXM)

3. **Cerrar otras aplicaciones** pesadas mientras usas el emulador

### Problema 5: "Cannot connect to backend"

**Verificar:**
```bash
# 1. Backend debe estar corriendo
cd c:\operadora-dev
npm run dev

# 2. Verificar que esté en http://localhost:3000

# 3. Verificar IP en config.ts
# Debe ser: 192.168.100.8 (tu IP local)
```

**Si cambió tu IP:**
```bash
# Verificar IP actual
ipconfig

# Buscar "Dirección IPv4" en adaptador Wi-Fi
# Actualizar en: operadora-mobile/constants/config.ts
```

### Problema 6: "Expo Go no se instala en emulador"

**Solución:**
```bash
# Instalar manualmente
adb install [ruta_al_apk_de_expo_go]

# O usar build directo
npx expo run:android
```

---

## 📊 CHECKLIST DE VERIFICACIÓN

### Antes de Empezar:
- [ ] Proceso de Expo anterior cerrado
- [ ] Cache de Expo limpiado
- [ ] Terminal lista en `c:\operadora-dev\operadora-mobile`

### Instalación de Android Studio:
- [ ] Android Studio descargado
- [ ] Android Studio instalado
- [ ] Configuración inicial completada
- [ ] SDK descargado (3-4 GB)
- [ ] Variables de entorno configuradas
- [ ] `adb --version` funciona

### Configuración de Emulador:
- [ ] Device Manager abierto
- [ ] Dispositivo virtual creado (Pixel 5/6)
- [ ] System Image descargado (Tiramisu/UpsideDownCake)
- [ ] Emulador iniciado correctamente
- [ ] `adb devices` muestra el emulador

### Probar App:
- [ ] Expo iniciado con `npx expo start -c`
- [ ] Presionado `a` para abrir en Android
- [ ] App cargada en emulador
- [ ] Login funcional
- [ ] Navegación entre tabs funciona
- [ ] Búsquedas funcionan
- [ ] Mapas se muestran correctamente

---

## 🎯 RESUMEN DE COMANDOS

### Comandos Principales:

```bash
# 1. Ir al directorio del proyecto móvil
cd c:\operadora-dev\operadora-mobile

# 2. Iniciar Expo con cache limpio
npx expo start -c

# 3. Abrir en emulador Android (presionar en terminal de Expo)
a

# 4. Verificar dispositivos conectados
adb devices

# 5. Reiniciar ADB si es necesario
adb kill-server
adb start-server

# 6. Limpiar cache de npm
npm cache clean --force

# 7. Reinstalar dependencias (si es necesario)
npm install --legacy-peer-deps
```

---

## 📱 ALTERNATIVA: Usar Teléfono Real

Si logras instalar Expo Go en tu teléfono:

### Soluciones para Problema de Instalación:

**Opción 1: Limpiar Google Play Store**
```
1. Configuración → Aplicaciones → Google Play Store
2. Almacenamiento → Borrar caché y datos
3. Reiniciar teléfono
4. Intentar instalar Expo Go nuevamente
```

**Opción 2: Descargar APK Directamente**
```
1. Ir a: https://expo.dev/go
2. Descargar APK de Expo Go
3. En teléfono: Configuración → Seguridad → Permitir instalación de fuentes desconocidas
4. Instalar APK manualmente
```

**Opción 3: Usar Navegador Web**
```
# En lugar de Expo Go, puedes probar en navegador
npx expo start --web
# Presiona 'w' en la terminal de Expo
```

---

## 💡 CONSEJOS FINALES

### Para Desarrollo Diario:

1. **Deja el emulador abierto** mientras desarrollas (no lo cierres entre pruebas)
2. **Hot Reload**: Los cambios en el código se reflejan automáticamente
3. **Presiona `r`** en Expo para recargar manualmente si es necesario
4. **Presiona `m`** para abrir el menú de desarrollo en el emulador

### Atajos de Teclado en Expo:

```
a - Abrir en Android
i - Abrir en iOS (solo Mac)
w - Abrir en Web
r - Reload app
m - Toggle menu
j - Open debugger
c - Clear cache and restart
```

### Recursos Útiles:

- **Documentación Expo**: https://docs.expo.dev
- **Documentación React Native**: https://reactnative.dev
- **Android Studio**: https://developer.android.com/studio/intro

---

## 🎓 PRÓXIMOS PASOS

Una vez que tengas todo funcionando:

1. **Probar todas las funcionalidades** de la app
2. **Reportar cualquier error** que encuentres
3. **Sugerir mejoras** de UX/UI
4. **Preparar para producción**:
   - Configurar Google Maps API keys reales
   - Probar en dispositivo físico
   - Generar build de producción con EAS

---

**Documento creado:** 20 de Enero de 2026 - 03:45 CST  
**Actualizado por:** AntiGravity AI Assistant  
**Versión:** 1.0

---

🎯 **¡Éxito con la configuración!**  
📧 **Cualquier duda, consulta este documento primero**  
🚀 **Nos vemos cuando tengas todo listo para probar**
