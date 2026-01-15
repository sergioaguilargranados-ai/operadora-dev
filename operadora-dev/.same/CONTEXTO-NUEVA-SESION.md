# 🎯 CONTEXTO PARA NUEVA SESIÓN - SESIÓN 10 ENE 2026

**Fecha actualización:** 14 de Enero de 2026 - 21:45 CST
**Versión actual:** v2.223
**Estado:** ✅ Ronda 5 completada (3/3 puntos)
**Git:** ✅ Push exitoso - Commit 3d2939e

---

## 🚨🚨🚨 REGLAS CRÍTICAS - LEER PRIMERO 🚨🚨🚨

### **⚠️ ESTRUCTURA DE DIRECTORIOS - NO MODIFICAR**

```
/home/project/                      ← RAÍZ DEL WORKSPACE
├── .git/                           ← GIT AQUÍ (no en operadora-dev/)
├── .gitignore
├── operadora-dev/                  ← TODO EL CÓDIGO AQUÍ
│   ├── src/
│   ├── public/
│   ├── .same/                      ← Documentación
│   ├── package.json
│   ├── next.config.js
│   └── ...
└── uploads/
```

### **🔴 ERRORES QUE NO DEBEN REPETIRSE:**

| Error | Consecuencia | Solución |
|-------|-------------|----------|
| Poner `.git/` dentro de `operadora-dev/` | Git no funciona correctamente | `.git/` siempre en `/home/project/` |
| Crear `operadora-dev/operadora-dev/` | Vercel compila versión vieja | NUNCA crear directorios anidados |
| Poner código en raíz de GitHub (sin `operadora-dev/`) | Vercel error "Root Directory does not exist" | Todo debe estar DENTRO de `operadora-dev/` |
| Push forzado sin verificar estructura | Rompe el deploy | Siempre verificar estructura antes de push |

### **✅ COMANDOS DE VERIFICACIÓN (USAR SIEMPRE):**

```bash
# Verificar que NO hay anidamiento
ls /home/project/operadora-dev/operadora-dev 2>/dev/null && echo "❌ EXISTE ANIDAMIENTO" || echo "✅ OK"

# Verificar que .git está en la raíz correcta
ls -la /home/project/.git/HEAD && echo "✅ Git en raíz"

# Verificar estructura antes de push
find /home/project -maxdepth 3 -name "package.json" | grep -v node_modules
```

---

### **⚠️ BASE DE DATOS ÚNICA**

```
Host: ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech
Database: neondb
DATABASE_URL: postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require
```

- ✅ MISMA BD para Same (local) y Vercel (producción)
- ✅ Solo UNA variable DATABASE_URL en Vercel (scope: All Environments)
- ❌ NO crear bases de datos adicionales

---

### **⚠️ CONFIGURACIÓN DE VERCEL**

| Configuración | Valor | NO CAMBIAR |
|--------------|-------|------------|
| **Root Directory** | `operadora-dev` | ⚠️ CRÍTICO |
| **Build Command** | `next build` | Automático |
| **Output Directory** | `.next` | Automático |
| **Framework** | Next.js | Detectado |

---

## 📋 ESTADO ACTUAL - v2.213 (10 Ene 2026)

### **Commits recientes:**
- Pendiente push con v2.213 - Ronda 4 completada

### **Ronda 4 - COMPLETADA (6/6):**
1. ✅ Hoteles - DateRangePicker conectado, sugerencias populares al focus
2. ✅ AS Home - Scrolling en filtros, autocomplete con datalist
3. ✅ Confirmar Reserva - Soporte para tipo transfer agregado
4. ✅ Traslados - Botón texto blanco, conecta a Confirmar Reserva
5. ✅ Checkout - Botón regresar usa router.back()
6. ✅ Paquetes - Botón "Ver Paquete", página detalle conectada

### **Ronda 3 - COMPLETADA (9/9) anteriormente:**
1. ✅ Hoteles - Calendario con colores
2. ✅ AS Home - Filtros izquierda, barra búsqueda
3. ✅ Cenefas - Headers glassmorphism en todas las páginas
4. ✅ Autos - Página completa con checkbox devolución
5. ✅ Actividades - Geocoding mejorado
6. ✅ Paquetes - Header traslúcido, página detalle
7. ✅ Traslados - Fallback mock cuando no hay API
8. ✅ Confirmar Reservas - Múltiples formatos localStorage
9. ✅ Viajes Grupales - Guardado BD, folio, email

---

## 🔄 PREPARACIÓN PARA RONDA 5

### **Pendientes identificados:**

1. **APIs con datos reales** (requiere API Keys Amadeus de producción)
   - AS Home usa mock (inventario propio, no Amadeus)
   - Paquetes usa mock (Amadeus tiene API pero requiere integración especial)

2. **Errores de API restantes** (baja prioridad)
   - `/api/corporate/stats` - Error 500
   - `/api/payments` - Error 500
   - `/api/approvals/pending` - Error 500

3. **Creador de Itinerarios con IA** ⭐ (alta prioridad)
   - Fase 1: Cliente da info (destino, días, presupuesto)
   - Fase 2: IA pregunta detalles (chat interactivo)
   - Fase 3: Cliente aprueba/modifica
   - Fase 4: IA genera itinerario

4. **Configurar SMTP** para emails reales

---

## 📱 Preparación Backend para App Móvil (Fase 1-4)

**Fecha:** 10 Ene 2026 - 14:40 CST
**Versión:** v2.214
**Estado:** 🔄 En progreso (Fase 1-2 completadas)

### Cambios aplicados (no rompen la web):
1. Fase 1 - Fundamentos
   - next.config.js: Headers CORS para `/api/*`
   - Nuevo helper de respuestas: `src/types/api-response.ts`
2. Fase 2 - Auth Móvil
   - `api/auth/login`: ahora usa `AuthService` y retorna `{ user, accessToken, refreshToken }` con formato estándar
   - `api/auth/refresh`: NUEVO endpoint para obtener un nuevo `accessToken`
   - `AuthContext`: guarda `as_token` y `as_refresh` en localStorage; `logout` limpia ambos
3. Fase 3 - Push Notifications
   - `api/notifications/register-device`: NUEVO (crea tabla si no existe y hace upsert)
   - `api/notifications/unregister-device`: NUEVO (desactiva token)

### Próximos pasos (Fase 4):
- Estandarizar respuestas en endpoints críticos (`bookings`, `search`, `hotels`, `flights`)
- Documentar OpenAPI/Swagger (api-spec.yaml)

### Reglas agregadas:
- SISTEMA-DOCUMENTACION.md actualizado con sección "Compatibilidad con App Móvil" y checklist de endpoints
- Documento nuevo: `.same/BACKEND-MOVIL-PREPARACION.md` con detalles técnicos

**Nota:** Todos los cambios son retrocompatibles. La web sigue funcionando igual y gana soporte para móvil.

---

## 📱 Preparación Backend para App Móvil (Fase 5-6)

**Fecha:** 10 Ene 2026 - 14:40 CST
**Versión:** v2.217
**Estado:** 🔄 En progreso (Fase 5-6 completadas)

### Nuevos cambios (v2.217)
- view=compact añadido en:
  - /api/search (type=hotel ya soporta; flights preparado)
  - /api/hotels
  - /api/search/activities
  - /api/search/transfers
  - /api/homepage/flight-destinations
- Rate limiting:
  - /api/auth/login → IP (5/min), device (10/min)
  - /api/search → IP (60/min), device (30/min)
- Swagger UI:
  - /api/docs muestra documentación interactiva usando public/api-spec.json
  - Spec inicial cubre auth, bookings, hotels, search

### Siguientes pasos sugeridos
- Añadir view=compact en más endpoints: flights (detalles), activities detalle, transfers detalle
- Extender /api/v1/mobile/* si necesitamos payloads aún más mínimos
- Tipar progresivamente para reducir "any" en linter (no bloqueante)

---

## ⚡ Actualización rápida — 14 Ene 2026 (v2.223)

- Fix autenticación: se removieron JOINs a tablas no existentes y se agregaron fallbacks en sesiones/roles/logs (no bloquean login).
- Respuesta de /api/auth/login ahora incluye envelope estándar y también user/accessToken/refreshToken en la raíz (compatibilidad con AuthContext).
- Validado en Preview: admin@asoperadora.com / Password123! ingresa correctamente.
- Home conserva contenido mínimo; sólo se actualiza versión visible.

---

## 🔧 COMANDOS ÚTILES

```bash
# Desarrollo
cd /home/project/operadora-dev && bun dev

# Build
cd /home/project/operadora-dev && bun run build

# Linter
cd /home/project/operadora-dev && bun run lint

# Git (SIEMPRE desde /home/project/)
cd /home/project && git status
cd /home/project && git add . && git commit -m "mensaje"
cd /home/project && git push origin main
```

---

## 🌐 ACCESOS

| Servicio | URL |
|----------|-----|
| **Producción** | https://app.asoperadora.com |
| **Dev Local** | http://localhost:3000 |
| **GitHub** | https://github.com/sergioaguilargranados-ai/operadora-dev |
| **Vercel Dashboard** | (acceso del usuario) |

---

## 📝 HISTORIAL DE PROBLEMAS RESUELTOS

### **10 Ene 2026 - Problema de estructura de directorios**

**Síntoma:** Vercel mostraba versión v2.206 aunque el commit era más reciente.

**Causa raíz:** Existía un directorio anidado `operadora-dev/operadora-dev/` con código viejo. Vercel con Root Directory `operadora-dev` encontraba ese código viejo primero.

**Solución:**
1. Eliminar directorio anidado
2. Mover `.git/` a `/home/project/` (raíz del workspace)
3. Asegurar que todo el código esté en `/home/project/operadora-dev/`
4. Push con estructura correcta

**Prevención:** Usar comandos de verificación antes de cada push.

---

**Versión:** v2.213
**Build:** 10 Ene 2026, 12:35 CST
**Status:** ✅ Ronda 4 completada
