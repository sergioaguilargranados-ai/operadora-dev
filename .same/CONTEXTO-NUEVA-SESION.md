# 🎯 CONTEXTO PARA NUEVA SESIÓN - SESIÓN 18 DIC 2025

**Fecha actualización:** 20 de Diciembre de 2025 - 21:30 CST
**Versión actual:** v2.144
**Estado:** ✅ Centro de Comunicación Completado

---

## 📖 DOCUMENTOS CRÍTICOS - LEER PRIMERO

### **1️⃣ CONTEXTO-PROYECTO-MASTER.md** (⭐ MÁS IMPORTANTE)
**Ubicación:** `.same/CONTEXTO-PROYECTO-MASTER.md`

**Contiene:**
- Memoria completa del proyecto
- Accesos (GitHub, Vercel, Neon DB)
- Comandos importantes
- Estructura del proyecto
- Estado de módulos

**🔥 LEER PRIMERO**

---

### **2️⃣ SISTEMA-DOCUMENTACION.md** (⭐ CRÍTICO)
**Ubicación:** `.same/SISTEMA-DOCUMENTACION.md`

**Contiene:**
- **⚠️ Estructura de directorios (TODO en `operadora-dev/`)**
- Configuración Vercel (Root Directory)
- npm vs bun (usar npm en producción)
- **Estilo de comunicación: CONCISO, no informes largos**
- Qué documentos actualizar siempre

**🚨 LEER ANTES DE HACER CAMBIOS**

---

### **3️⃣ todos.md** (Changelog)
**Ubicación:** `.same/todos.md`

**Contiene:**
- Changelog de todas las versiones
- Tareas completadas
- **Tareas pendientes de esta sesión**

---

## 🎯 ESTADO DE ESTA SESIÓN (18 DIC 2025)

### **✅ COMPLETADO (v2.130)**

#### **1. Datos de Prueba Generados**
- ✅ 10 transacciones de pago creadas
  - Diferentes métodos: Stripe (6) + PayPal (4)
  - Diferentes status: completed (5), pending (2), failed (2), refunded (1)
  - Archivo: `migrations/009_test_data_payments_approvals.sql`
  - Script: `scripts/setup-payments-approvals.js`

- ✅ Tabla `payment_transactions` creada
  - Archivo: `migrations/008_create_payment_transactions.sql`
  - Columnas: id, booking_id, user_id, amount, currency, status, payment_method, etc.

- ✅ 8 aprobaciones de viaje creadas
  - Status: pending (3), approved (3), rejected (2)
  - Con fechas, montos, razones de viaje, etc.

**Verificar:**
```bash
cd operadora-dev
node -e "const {Pool}=require('pg');require('dotenv').config({path:'.env.local'});const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});p.query('SELECT COUNT(*) FROM payment_transactions').then(r=>{console.log('Pagos:',r.rows[0].count);return p.query('SELECT COUNT(*) FROM travel_approvals')}).then(r=>{console.log('Aprobaciones:',r.rows[0].count);p.end()})"
```

#### **2. API Corregida**
- ✅ `/api/quotes` (GET, POST, PUT)
  - Cambiado `pool.query()` → `dbQuery()`
  - Corregidos errores de sintaxis (cierres duplicados)
  - Archivo: `src/app/api/quotes/route.ts`

#### **3. Funcionalidad: Cambio de Contraseña**
- ✅ Modal en perfil (`src/app/perfil/page.tsx`)
  - Botón "Cambiar contraseña" con ícono Lock
  - Modal con 3 campos: actual, nueva, confirmar
  - Validaciones: mínimo 8 caracteres, coincidencia
  - Toasts de éxito/error

- ✅ API `/api/auth/change-password` (POST)
  - Valida contraseña actual con bcrypt
  - Hash de nueva contraseña
  - Actualiza en BD
  - Archivo: `src/app/api/auth/change-password/route.ts`

---

## 🚧 PENDIENTE - 13 TAREAS REPORTADAS

### **📋 Lista Completa de Pendientes**

#### **Prioridad Alta (Errores 500/401)**
1. ❌ **Error 401** en `/api/bookings`
   - Problema: Falta autenticación JWT
   - Solución: Agregar middleware de auth o hacer pública la API
   - Archivo: `src/app/api/bookings/route.ts`

2. ❌ **Error 500** en `/api/corporate/stats?tenantId=1`
   - Problema: SQL o servicio falla
   - Archivo: `src/app/api/corporate/stats/route.ts`
   - Ver: `src/services/CorporateService.ts`

3. ❌ **Error 401** en `/api/commissions?action=stats`
   - Dashboard financiero
   - Archivo: buscar en `src/app/api/`

4. ❌ **Error 500** en `/api/payments?tenantId=1&limit=20`
   - Archivo: `src/app/api/payments/route.ts`
   - Ya tiene datos de prueba, verificar query SQL

5. ❌ **Error 500** en `/api/approvals/pending?tenantId=1`
   - Archivo: `src/app/api/approvals/pending/route.ts`
   - Ya tiene datos de prueba, verificar query SQL

6. ❌ **Error 500** en `/api/search?type=hotel&city=cancun...`
   - Archivo: `src/app/api/search/route.ts`
   - Problema reportado antes, verificar SQL

#### **Botones "Volver"**
7. ❌ **Dashboard Corporativo** - Agregar botón "Volver" a homepage
   - Archivo: `src/app/dashboard/corporate/page.tsx`

8. ❌ **Transacciones de Pago** - Agregar botón "Volver"
   - Archivo: `src/app/dashboard/payments/page.tsx`

9. ❌ **Aprobaciones de Viaje** - Agregar botón "Volver"
   - Archivo: `src/app/approvals/page.tsx`

#### **Dashboard Corporativo**
10. ❌ **Botón "Personalizar periodo"** - Sin funcionalidad
    - Agregar modal para seleccionar fechas
    - Archivo: `src/app/dashboard/corporate/page.tsx`

11. ❌ **Botón "Exportar reporte"** - Sin funcionalidad
    - Exportar a Excel/PDF
    - Archivo: `src/app/dashboard/corporate/page.tsx`

#### **Dashboard Financiero**
12. ❌ **Botones "Acciones Rápidas"** - Todos deshabilitados
    - Agregar funcionalidad a cada botón
    - Archivo: `src/app/dashboard/payments/page.tsx` o financiero

13. ❌ **Chatbot** - Mejorar diseño + hacer flotante
    - Cambiar ícono robot → cara humana robótica
    - Mover a homepage y hacerlo flotante (todas las páginas)
    - Archivo: `src/components/ChatWidget.tsx`

#### **Cotizaciones**
14. ❌ **Exportación a Excel** - Solo tiene PDF
    - Agregar botón "Exportar Excel"
    - Exportar todos los registros visibles
    - Archivo: `src/app/dashboard/quotes/page.tsx`

15. ❌ **Configurar SMTP** - Para envío de emails
    - Usuario debe configurar variables en Vercel:
      - `SMTP_HOST`
      - `SMTP_PORT`
      - `SMTP_USER`
      - `SMTP_PASS`
    - Archivo ya existe: probablemente usa nodemailer
    - Buscar en: `src/app/api/quotes/[id]/send/route.ts`

#### **Búsqueda de Vuelos**
16. ❌ **Botón "Nueva búsqueda"** - No mantiene filtros
    - Debe mantener origen, destino, fechas
    - Archivo: buscar página de resultados de vuelos

17. ❌ **Botón "Reservar Ahora"** - No funciona
    - Mostrar pantalla de confirmación
    - Integrar con métodos de pago
    - Al pagar, crear reserva automáticamente
    - Archivo: página de detalles de vuelo

18. ❌ **Error 401** al aplicar filtros en Reservas
    - Archivo: `src/app/reservas/page.tsx` o similar

#### **Ofertas Especiales**
19. ❌ **Botón "Volver"** en página de detalles
    - Agregar flecha de regreso

20. ❌ **Botón "Reservar Ahora"** - Falta confirmación
    - Mostrar costos, detalles
    - Integrar pago
    - Crear reserva

#### **Notificaciones**
21. ❌ **Sistema de registro** para no registrados
    - Si no está registrado, pedir registro
    - Archivo: `src/app/notificaciones/page.tsx` o similar

22. ❌ **Selección de medios** - Email, SMS, WhatsApp
    - Agregar checkboxes para seleccionar

23. ❌ **Activar/Desactivar** - Palomita/tache
    - Habilitar funcionalidad

#### **Explora el Mundo**
24. ❌ **Página de detalle de ciudades**
    - 8 fotos de cada ciudad
    - Enlaces a paquetes, vuelos, hoteles
    - Archivo: crear nuevo o buscar existente

25. ❌ **Integración Amadeus City Search**
    - API: `https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/city-search`
    - Información: ciudades, aeropuertos, atractivos, fotos
    - Archivo: crear `src/services/providers/AmadeusCitySearch.ts`

#### **Itinerarios con IA** (⭐ IMPORTANTE)
26. ❌ **Creador de Itinerarios con IA**
    - **Fase 1:** Cliente da info (destino, días, presupuesto, preferencias)
    - **Fase 2:** IA pregunta detalles (interacción estilo chat)
    - **Fase 3:** Cliente aprueba/modifica (chat iterativo)
    - **Fase 4:** IA genera itinerario en formato del formulario existente
    - Integrar con mismo modelo del chatbot
    - Archivo: `src/app/dashboard/itineraries/page.tsx` - agregar modo "IA"

#### **Integración Amadeus - Nuevos Módulos**
27. ❌ **Autos y Transfers**
    - API: `https://developers.amadeus.com/self-service/category/cars-and-transfers`
    - Crear servicio: `src/services/providers/AmadeusCarRental.ts`

28. ❌ **Tours y Actividades**
    - API: `https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/tours-and-activities`
    - Crear servicio: `src/services/providers/AmadeusTours.ts`

29. ❌ **Revisar plan Amadeus**
    - Verificar qué servicios están disponibles con el plan actual

---

## 🗂️ ESTRUCTURA DEL PROYECTO

```
/home/project/
├── .git/                              ← Repositorio Git (raíz)
├── operadora-dev/                     ← ⭐ TODO EL CÓDIGO AQUÍ
│   ├── src/                           ← Código fuente
│   │   ├── app/                       ← Next.js App Router
│   │   │   ├── api/                   ← APIs REST
│   │   │   ├── dashboard/             ← Dashboards
│   │   │   ├── perfil/                ← Perfil (✅ cambio contraseña)
│   │   │   └── ...
│   │   ├── components/                ← Componentes React
│   │   │   ├── ui/                    ← shadcn/ui
│   │   │   └── ChatWidget.tsx         ← Chatbot
│   │   ├── services/                  ← Servicios
│   │   │   ├── CorporateService.ts
│   │   │   ├── ApprovalService.ts
│   │   │   └── providers/             ← Proveedores externos
│   │   └── lib/                       ← Utilidades
│   │       └── db.ts                  ← Helper de BD
│   │
│   ├── .same/                         ← 📚 TODA LA DOCUMENTACIÓN
│   │   ├── CONTEXTO-PROYECTO-MASTER.md    ← ⭐ Leer primero
│   │   ├── SISTEMA-DOCUMENTACION.md       ← ⭐ Estructura y reglas
│   │   ├── todos.md                       ← Changelog
│   │   ├── CONTEXTO-NUEVA-SESION.md       ← Este archivo
│   │   └── ...
│   │
│   ├── migrations/                    ← Migraciones SQL
│   │   ├── 008_create_payment_transactions.sql  ← ✅ Nueva
│   │   └── 009_test_data_payments_approvals.sql ← ✅ Nueva
│   │
│   ├── scripts/                       ← Scripts Node
│   │   └── setup-payments-approvals.js    ← ✅ Nuevo
│   │
│   ├── package.json                   ← Dependencias
│   ├── package-lock.json              ← npm lock (NO bun.lock)
│   ├── .npmrc                         ← Config: legacy-peer-deps=true
│   ├── next.config.js                 ← Config Next.js
│   └── .env.local                     ← Variables de entorno
│
├── backup-inicial-no-usar.sm/        ← ⚠️ Backup histórico (NO TOCAR)
└── uploads/                           ← Uploads temporales
```

---

## ⚙️ CONFIGURACIÓN CRÍTICA

### **Vercel Deploy**
```
Dashboard → Settings → Build & Development Settings
Root Directory: operadora-dev
Package Manager: npm (detectado automáticamente)
Build Command: npm run build
Install Command: npm install
```

### **Variables de Entorno (.env.local)**
```bash
DATABASE_URL=postgresql://...         # Neon PostgreSQL
JWT_SECRET=...                         # Auth
ENCRYPTION_SECRET_KEY=...             # Encriptación
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=... # Stripe
STRIPE_SECRET_KEY=...
BLOB_READ_WRITE_TOKEN=...             # Vercel Blob
# Pendiente configurar:
# SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
# AMADEUS_API_KEY, AMADEUS_API_SECRET
```

### **Base de Datos**
```
Host: ep-green-sky-afxrsbva.c-2.us-west-2.aws.neon.tech
Database: neondb
```

---

## 🔧 COMANDOS ÚTILES

### **Desarrollo**
```bash
cd /home/project/operadora-dev
npm run dev                    # Servidor dev (localhost:3000)
npm run build                  # Build producción
npm run lint                   # Linter
```

### **Base de Datos**
```bash
# Verificar datos de prueba
node -e "const {Pool}=require('pg');require('dotenv').config({path:'.env.local'});const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});p.query('SELECT status, payment_method, COUNT(*) FROM payment_transactions GROUP BY status, payment_method').then(r=>{console.table(r.rows);p.end()})"

# Verificar aprobaciones
node -e "const {Pool}=require('pg');require('dotenv').config({path:'.env.local'});const p=new Pool({connectionString:process.env.DATABASE_URL,ssl:{rejectUnauthorized:false}});p.query('SELECT status, COUNT(*) FROM travel_approvals GROUP BY status').then(r=>{console.table(r.rows);p.end()})"
```

---

## 💡 PLAN SUGERIDO PARA PRÓXIMA SESIÓN

### **Opción 1: Corregir Errores Críticos (APIs)**
1. Corregir errores 500/401 (tareas 1-6)
2. Verificar con datos de prueba existentes
3. Probar en localhost

**Tiempo estimado:** 30-45 min

---

### **Opción 2: Completar UX/Botones**
1. Agregar botones "Volver" (tareas 7-9)
2. Habilitar botones deshabilitados (tareas 10-13)
3. Mejorar chatbot (tarea 13)

**Tiempo estimado:** 20-30 min

---

### **Opción 3: Creador de Itinerarios con IA** (⭐ Complejo)
1. Diseñar flujo de 4 fases
2. Integrar con chatbot existente
3. Generar prompts para IA
4. Rellenar formulario automáticamente

**Tiempo estimado:** 60-90 min

---

### **Opción 4: Integración Amadeus Completa**
1. City Search API
2. Autos y Transfers
3. Tours y Actividades
4. Página de detalles de ciudades

**Tiempo estimado:** 60-90 min

---

## 📋 CHECKLIST PARA PRÓXIMO AGENTE

Antes de empezar:
- [ ] Leer `CONTEXTO-PROYECTO-MASTER.md`
- [ ] Leer `SISTEMA-DOCUMENTACION.md` (estructura y comunicación)
- [ ] Leer este archivo (CONTEXTO-NUEVA-SESION.md)
- [ ] Verificar servidor dev corriendo: `npm run dev`
- [ ] Verificar datos de prueba en BD (comandos arriba)

Al terminar:
- [ ] Actualizar `todos.md` con changelog
- [ ] Actualizar este archivo con progreso
- [ ] Crear versión con `versioning` tool
- [ ] Comunicación concisa (ver SISTEMA-DOCUMENTACION.md)

---

## 🌐 ACCESOS

| Servicio | URL | Notas |
|----------|-----|-------|
| **Producción** | https://app.asoperadora.com | Deploy automático desde GitHub |
| **Dev Local** | http://localhost:3000 | Servidor dev en SAME |
| **GitHub** | https://github.com/sergioaguilargranados-ai/operadora-dev | Repo |
| **Neon DB** | Console Neon | PostgreSQL |

---

## ✅ RESUMEN EJECUTIVO

**Lo que se hizo:**
- 10 transacciones de pago + 8 aprobaciones (datos de prueba)
- Cambio de contraseña funcional en perfil
- API /api/quotes corregida

**Lo que falta:**
- 13 errores de API (500/401)
- Botones "Volver" en 3 páginas
- Funcionalidades deshabilitadas en dashboards
- Creador de Itinerarios con IA
- Integración Amadeus completa

**Prioridad:**
1. Errores de API (bloquean uso)
2. Botones y UX (mejora experiencia)
3. Itinerarios IA (funcionalidad nueva)
4. Amadeus (expansión de servicios)

---

**Versión:** v2.130
**Build:** 18 Dic 2025, 13:45 CST
**Status:** 🚧 En progreso - 1 de 14 tareas completadas

🎯 **Siguiente agente:** Elegir una opción del plan sugerido y continuar desde ahí.
