# 📱 Configuración App Móvil - Multi-Equipo

**Fecha:** 20 de Enero de 2026 - 10:30 CST  
**Objetivo:** Ambientar app móvil en ambos equipos (Laptop y PC)  
**Estado:** Proyecto movido, pendiente instalación de dependencias

---

## 🖥️ UBICACIONES DEL PROYECTO

### Laptop (Drive)
```
G:\Otros ordenadores\Mi PC\operadora-dev\
└── operadora-mobile\
```

### PC
```
C:\operadora-dev\
└── operadora-mobile\
```

**IMPORTANTE:** Ambas ubicaciones necesitan ambientación completa e independiente.

---

## ✅ ESTADO ACTUAL

### Lo que ya está hecho:
- ✅ Proyecto movido a rutas más cortas
- ✅ Node.js v24.13.0 instalado
- ✅ npm 11.6.2 instalado
- ✅ Estructura de archivos completa
- ✅ `node_modules` existe pero dependencias incompletas

### Lo que falta:
- ⏳ Instalar dependencias correctamente
- ⏳ Verificar IP local en cada equipo
- ⏳ Ejecutar migraciones de BD
- ⏳ Probar en Expo Go

---

## 📋 PLAN DE ACCIÓN

### PASO 1: Verificar IP Local (En cada equipo)

```powershell
ipconfig
# Buscar "Dirección IPv4" en adaptador Wi-Fi
```

**Anotar la IP de cada equipo:**
- Laptop: `192.168.1.___`
- PC: `192.168.1.___`

### PASO 2: Actualizar Config (En cada equipo)

Editar: `operadora-mobile/constants/config.ts`

```typescript
const ENV = {
    dev: {
        apiUrl: 'http://[TU_IP_LOCAL]:3000/api',  // ⬅️ Cambiar por IP del equipo
        webUrl: 'http://[TU_IP_LOCAL]:3000',
    },
    // ...
}
```

### PASO 3: Limpiar e Instalar Dependencias

**En Laptop:**
```powershell
cd "G:\Otros ordenadores\Mi PC\operadora-dev\operadora-mobile"

# Eliminar node_modules existente
Remove-Item -Recurse -Force node_modules

# Limpiar cache
npm cache clean --force

# Instalar dependencias
npm install --legacy-peer-deps
```

**En PC:**
```powershell
cd C:\operadora-dev\operadora-mobile

# Eliminar node_modules existente
Remove-Item -Recurse -Force node_modules

# Limpiar cache
npm cache clean --force

# Instalar dependencias
npm install --legacy-peer-deps
```

**Tiempo estimado:** 5-10 minutos por equipo  
**Espacio requerido:** ~500MB

### PASO 4: Verificar Instalación

```powershell
# Verificar que no haya errores
npm list --depth=0

# Verificar Expo
npx expo --version
```

### PASO 5: Ejecutar Migraciones de BD

**IMPORTANTE:** Solo ejecutar UNA vez (desde cualquier equipo)

```powershell
# En la raíz del proyecto (no en operadora-mobile)
cd "G:\Otros ordenadores\Mi PC\operadora-dev"  # O C:\operadora-dev
node ejecutar-migraciones.js
```

Las migraciones necesarias:
- `015_refresh_tokens.sql` - Tokens de refresco
- `017_device_tokens.sql` - Push notifications

### PASO 6: Iniciar Backend

**En Laptop:**
```powershell
cd "G:\Otros ordenadores\Mi PC\operadora-dev"
npm run dev
```

**En PC:**
```powershell
cd C:\operadora-dev
npm run dev
```

Verificar: http://localhost:3000

### PASO 7: Iniciar App Móvil

**En Laptop:**
```powershell
cd "G:\Otros ordenadores\Mi PC\operadora-dev\operadora-mobile"
npm start
```

**En PC:**
```powershell
cd C:\operadora-dev\operadora-mobile
npm start
```

### PASO 8: Probar en Expo Go

1. Instalar **Expo Go** en teléfono (Play Store / App Store)
2. Conectar teléfono a **misma red WiFi** que el equipo
3. Escanear código QR que aparece en terminal
4. Esperar a que cargue la app
5. Probar login/registro

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### Error: "Cannot find module"
```powershell
# Reinstalar dependencias
cd operadora-mobile
Remove-Item -Recurse -Force node_modules
npm install --legacy-peer-deps
```

### Error: "Connection refused" en app móvil
- Verificar que backend esté corriendo
- Verificar IP en `config.ts` sea correcta
- Verificar que teléfono esté en misma WiFi

### Error: Rutas largas en Windows
- Ya resuelto moviendo a rutas cortas
- Si persiste, usar `npm install --legacy-peer-deps`

### Error: "EBADF" o "EPERM" durante instalación
- Cerrar VS Code y otras apps
- Ejecutar PowerShell como Administrador
- Intentar de nuevo

---

## 📝 CHECKLIST DE VERIFICACIÓN

### Por Equipo:

**Laptop (G:\Otros ordenadores\Mi PC\operadora-dev\)**
- [ ] IP local verificada
- [ ] `config.ts` actualizado con IP correcta
- [ ] `node_modules` eliminado
- [ ] Dependencias instaladas con `--legacy-peer-deps`
- [ ] Sin errores en `npm list --depth=0`
- [ ] Backend inicia correctamente
- [ ] App móvil inicia correctamente
- [ ] QR code visible en terminal
- [ ] Probado en Expo Go

**PC (C:\operadora-dev\)**
- [ ] IP local verificada
- [ ] `config.ts` actualizado con IP correcta
- [ ] `node_modules` eliminado
- [ ] Dependencias instaladas con `--legacy-peer-deps`
- [ ] Sin errores en `npm list --depth=0`
- [ ] Backend inicia correctamente
- [ ] App móvil inicia correctamente
- [ ] QR code visible en terminal
- [ ] Probado en Expo Go

### General (Una sola vez):
- [ ] Migraciones ejecutadas en BD
- [ ] Tablas `refresh_tokens` y `device_tokens` creadas

---

## 🎯 OBJETIVO FINAL

Tener la app móvil funcionando en **ambos equipos**, permitiendo:

- ✅ Desarrollo en Laptop
- ✅ Desarrollo en PC
- ✅ Pruebas en Expo Go desde cualquier equipo
- ✅ Backend compartido (misma BD Neon)
- ✅ Configuración independiente por equipo

---

## 📌 NOTAS IMPORTANTES

1. **IPs diferentes:** Cada equipo tendrá su propia IP local (192.168.1.X)
2. **Misma BD:** Ambos equipos usan la misma base de datos Neon
3. **Migraciones una vez:** Solo ejecutar migraciones UNA vez
4. **WiFi:** Teléfono debe estar en misma red que el equipo que está usando
5. **Backend activo:** Backend debe estar corriendo para que app funcione

---

## 🚀 COMANDOS RÁPIDOS

### Laptop
```powershell
# Backend
cd "G:\Otros ordenadores\Mi PC\operadora-dev"
npm run dev

# App Móvil (nueva terminal)
cd "G:\Otros ordenadores\Mi PC\operadora-dev\operadora-mobile"
npm start
```

### PC
```powershell
# Backend
cd C:\operadora-dev
npm run dev

# App Móvil (nueva terminal)
cd C:\operadora-dev\operadora-mobile
npm start
```

---

**Última actualización:** 20 de Enero de 2026 - 10:30 CST  
**Próxima acción:** Instalar dependencias en el equipo actual
