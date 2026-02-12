# 📊 AG-Informe: Multi-Empresa y Marca Blanca - Estado Actual y Pendientes

**Fecha:** 11 de Febrero de 2026  
**Versión actual del proyecto:** v2.311  
**Última actualización:** 11 de Febrero de 2026 - 18:00 CST  
**Propósito:** Análisis completo del estado de las funcionalidades Multi-Empresa (Multi-Tenant) y Marca Blanca (White-Label)

---

## 🎯 Visión Original

Según [ESPECIFICACION-COMPLETA.md], la plataforma fue diseñada como:

> **Sistema multi-tenant (multi-empresa), multi-moneda para gestión de viajes y eventos.**
> - **Modelo de Negocio:** B2B2C (Business to Business to Consumer)
> - Plataforma central que sirve a múltiples empresas
> - Cada empresa sirve a sus propios clientes
> - White-label para agencias

### Jerarquía de Usuarios Planeada

```
┌─────────────────────────────────────┐
│   SUPER ADMIN (AS OPERADORA)        │
│   - Administra toda la plataforma   │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┬─────────────┬──────────────┐
       │               │             │              │
   ┌───▼────┐    ┌────▼─────┐  ┌───▼──────┐  ┌───▼──────┐
   │USUARIO │    │EMPRESA/  │  │ AGENCIA  │  │ USUARIO  │
   │ FINAL  │    │CORPORAT. │  │          │  │ TERCERO  │
   └────────┘    └──────────┘  └────┬─────┘  └──────────┘
                                     │
                              ┌──────▼───────┐
                              │SUB-CLIENTES  │
                              │  DE AGENCIA  │
                              └──────────────┘
```

---

## ✅ Lo Que YA EXISTE (Implementado)

### 1. Base de Datos — 95% Lista

La estructura de BD tiene `tenant_id` como foreign key en **14+ tablas** y ahora incluye tablas de agencias:

| Componente | Estado | Detalle |
|:-----------|:------:|:--------|
| Tabla `tenants` | ✅ | company_name, legal_name, tax_id, logo_url, colors, custom_domain |
| FK `tenant_id` en users | ✅ | Aislamiento de datos por empresa |
| FK `tenant_id` en bookings | ✅ | Reservas por empresa |
| FK `tenant_id` en payments | ✅ | Pagos por empresa |
| FK `tenant_id` en documents | ✅ | Documentos por empresa |
| FK `tenant_id` en communication | ✅ | Centro de comunicación por empresa |
| Tabla `tenant_users` | ✅ | User-to-tenant mapping con roles + referral_code |
| Tabla `white_label_config` | ✅ | Configuración visual por agencia |
| Tabla `agency_clients` | ✅ | **Verificada y funcional** — clientes de agencias |
| Tabla `agency_commissions` | ✅ | **Verificada y funcional** — comisiones por booking con split agente/agencia |
| Tabla `agent_notifications` | ✅ | **NUEVO v2.310** — Notificaciones in-app para agentes |
| Tabla `agent_reviews` | ✅ | **NUEVO v2.310** — Calificaciones de agentes |
| Tabla `referral_clicks` | ✅ | Tracking de clics en ligas de referido |
| Tabla `referral_conversions` | ✅ | Tracking de conversiones de referidos |
| Tabla `commission_disbursements` | ✅ | Dispersiones/pagos de comisiones |
| Tabla `travel_policies` | ✅ | Políticas de viaje por empresa |
| Tabla `travel_approvals` | ✅ | Aprobaciones por empresa |
| **168 índices optimizados** | ✅ | **NUEVO v2.311** — Performance indexes en todas las tablas |

---

### 2. Backend Services — 90% Listos

#### TenantService.ts — 15+ métodos implementados

| Método | Estado | Función |
|:-------|:------:|:--------|
| `getTenantById()` | ✅ | Obtener tenant por ID |
| `getTenantByDomain()` | ✅ | Buscar por dominio personalizado |
| `getTenantBySubdomain()` | ✅ | Buscar por subdominio (ej: agencia1.asoperadora.com) |
| `detectTenant()` | ✅ | Detectar tenant desde host del request |
| `createTenant()` | ✅ | Crear nueva empresa/agencia |
| `updateTenant()` | ✅ | Actualizar datos del tenant |
| `getWhiteLabelConfig()` | ✅ | Obtener config visual de agencia |
| `updateWhiteLabelConfig()` | ✅ | Actualizar colores/logo/etc de agencia |
| `addUserToTenant()` | ✅ | Agregar usuario a empresa |
| `getTenantUsers()` | ✅ | Listar usuarios de empresa |
| `getUserTenants()` | ✅ | Ver a qué empresas pertenece un usuario |
| `userBelongsToTenant()` | ✅ | Verificar membresía |
| `getUserRoleInTenant()` | ✅ | Obtener rol en empresa |
| `removeUserFromTenant()` | ✅ | Remover usuario (soft delete) |
| `getTenantStats()` | ✅ | Estadísticas del tenant |
| `listTenants()` | ✅ | Listar con paginación y filtros |

#### CommissionService.ts — Implementado v2.307

| Método | Estado | Función |
|:-------|:------:|:--------|
| `calculateCommission()` | ✅ | Cálculo automático por booking + agente |
| `processBookingStatusChange()` | ✅ | Trigger confirmed→available→paid |
| `getCommissions()` | ✅ | Listar con filtros (agencia, agente, status) |

#### AgentNotificationService.ts — NUEVO v2.311

| Método | Estado | Función |
|:-------|:------:|:--------|
| `notifyCommissionCreated()` | ✅ | Auto-trigger al generar comisión |
| `notifyCommissionAvailable()` | ✅ | Auto-trigger al booking completado |
| `notifyDisbursement()` | ✅ | Auto-trigger al dispersar pago |
| `notifyReferralClick()` | ✅ | Clic en liga de referido |
| `notifyConversion()` | ✅ | Nuevo cliente referido |
| `notifyNewReview()` | ✅ | Nueva calificación recibida |
| `checkAchievements()` | ✅ | Verificar y otorgar milestones automáticos |

#### NotificationService.ts (Email) — Implementado

| Método | Estado | Función |
|:-------|:------:|:--------|
| `sendEmail()` | ✅ | Envío genérico vía SMTP |
| `sendBookingConfirmation()` | ✅ | Email de confirmación HTML premium |
| `sendInvoiceEmail()` | ✅ | Email de factura |
| `sendPaymentReminder()` | ✅ | Recordatorio de pago |
| `sendCancellationEmail()` | ✅ | Email de cancelación |

---

### 3. API Routes — 85% Listas

| Endpoint | Estado | Funcionalidad |
|:---------|:------:|:-------------|
| `GET /api/tenants` | ✅ | Listar tenants |
| `POST /api/tenants` | ✅ | Crear tenant + white-label config |
| `GET /api/tenants/[id]` | ✅ | Obtener tenant + white-label |
| `PUT /api/tenants/[id]` | ✅ | Actualizar tenant + white-label |
| `DELETE /api/tenants/[id]` | ✅ | Soft delete del tenant |
| `GET /api/agency/commissions` | ✅ | **v2.307** — Listar comisiones con filtros |
| `POST /api/agency/commissions/disburse` | ✅ | **v2.309** — Dispersión batch + email |
| `GET /api/agency/commissions/export` | ✅ | **v2.309** — Export CSV para Excel |
| `GET /api/agency/analytics` | ✅ | **v2.311** — Analytics avanzados (timelines, leaderboard, funnel) |
| `GET /api/agent/dashboard` | ✅ | **v2.306** — Dashboard completo del agente |
| `GET /api/agent/referral-link` | ✅ | **v2.307** — Liga de referido con stats |
| `GET /api/agent/qr-code` | ✅ | **v2.310** — QR Code en PNG/SVG/Base64 |
| `GET/PUT /api/agent/notifications` | ✅ | **v2.310** — Notificaciones in-app |
| `GET/POST /api/agent/reviews` | ✅ | **v2.310** — Calificaciones de agentes |
| `GET /api/auth/me` | ✅ | **v2.310** — Perfil + agentInfo + unread |
| `POST /api/webhooks/booking-status` | ✅ | **v2.307** — Auto-trigger comisiones + notificaciones |

---

### 4. Middleware — 70% Listo (actualizado desde 30%)

| Funcionalidad | Estado | Detalle |
|:-------------|:------:|:--------|
| Detección de host/subdominio | ✅ | Headers `x-tenant-id`, `x-tenant-subdomain` |
| Detección de dominio custom | ⚠️ | Detecta pero retorna null — falta conexión a BD |
| ~~Protección de rutas~~ | ✅ | **v2.311** — JWT decode en Edge + redirect por rol |
| Cookie sync con AuthContext | ✅ | **v2.311** — `as_user`, `as_token` cookies |
| Tabla de rutas protegidas | ✅ | **v2.311** — admin, agency, agent con roles requeridos |
| Access denied toast | ✅ | **v2.311** — Redirect con parámetros indicando rol faltante |
| Conexión real a BD para tenant | ❌ | TODO: Consultar `tenants` table en Edge (requiere kv/cache) |

---

### 5. Frontend — Dashboard de Agencia — 80% Listo (actualizado desde 0%)

| Componente | Estado | Detalle |
|:-----------|:------:|:--------|
| Dashboard Agent Page | ✅ | **v2.305** — Stats, gráficas, liga de referido |
| Tab Comisiones | ✅ | **v2.308** — Tabla con datos reales, badges de status |
| Tab Referidos | ✅ | **v2.306** — Clics, conversiones, tasas |
| Panel Super Admin | ✅ | **v2.309** — Vista global, dark theme, gráfica comparativa |
| QR Code expandible | ✅ | **v2.310** — Botón QR + descarga |
| Bell icon + dropdown | ✅ | **v2.310** — Notificaciones con unread count |
| Sección Reviews | ✅ | **v2.310** — Rating, distribución, reviews recientes |
| Dispersiones UI | ✅ | **v2.309** — Modal con método pago, referencia, confirmación |
| Export CSV | ✅ | **v2.309** — Descarga CSV con BOM para Excel |
| Filtros fecha/status | ✅ | **v2.309** — En tab comisiones |
| Hook `useRole()` | ✅ | **v2.310** — Permisos client-side |
| RoleGuard component | ✅ | **v2.310** — Render condicional por rol |

---

### 6. Sistema de Referidos — 85% Listo (actualizado desde 0%)

| Componente | Estado | Detalle |
|:-----------|:------:|:--------|
| Liga de referido | ✅ | **v2.306** — `mmta.app.asoperadora.com/?r=CODIGO` |
| Tabla `referral_clicks` | ✅ | Tracking de clics con IP, user-agent, UTM |
| Tabla `referral_conversions` | ✅ | Tracking de clientes que se registran |
| API `/api/agent/referral-link` | ✅ | Stats de clics + conversiones |
| QR Code para liga | ✅ | **v2.310** — Formatos PNG/SVG/Base64 |
| Detección de `?r=CODIGO` en URL | ⚠️ | **Parcial** — Falta guardar en cookie al navegar |
| Auto-vinculación de registro | ⚠️ | **Parcial** — Booking POST detecta `referral_code` |
| Markup de precios por agencia | ❌ | No implementado |

---

### 7. TypeScript Types — 100% Listos

| Tipo | Archivo | Estado |
|:-----|:--------|:------:|
| `Tenant` | types/index.ts | ✅ |
| `TenantUser` | types/index.ts | ✅ |
| `TenantType` | types/index.ts | ✅ |
| `TenantContext` | types/index.ts | ✅ |
| `WhiteLabelConfig` | TenantService.ts | ✅ |
| `TenantEntity` | types/api.ts | ✅ |
| DB types con tenant_id | types/database.ts | ✅ |

---

## ❌ Lo Que FALTA (Pendiente de Implementar)

### A. Frontend White-Label — El Pendiente Principal

| Componente | Prioridad | Descripción |
|:-----------|:---------:|:------------|
| **WhiteLabelContext.tsx** | 🔴 ALTA | Context de React para cargar y distribuir configuración de branding dinámico |
| **useWhiteLabel() hook** | 🔴 ALTA | Hook para acceder a colores, logo, nombre del tenant actual |
| **Logo dinámico en Header** | 🔴 ALTA | Mostrar logo del tenant en vez del de AS Operadora |
| **Colores dinámicos (CSS vars)** | 🔴 ALTA | Aplicar `primary_color`, `secondary_color` como variables CSS |
| **Footer personalizado** | 🟡 MEDIA | Mostrar info de la agencia en footer |
| **Emails con branding** | 🟡 MEDIA | Templates de email usando colores/logo del tenant |

---

### B. Middleware — Conexión Real a BD para Tenants

| Tarea | Prioridad | Detalle |
|:------|:---------:|:-------|
| ~~Protección de rutas por rol~~ | ~~🔴~~ | ✅ **COMPLETADO v2.311** |
| Conectar detección de subdominio a BD | 🔴 ALTA | Edge Runtime no permite Node.js pg — usar KV/cache o fetch interno |
| Conectar detección de dominio custom a BD | 🔴 ALTA | Misma limitación Edge — cache o Vercel KV |
| Pasar config white-label vía cookie/header | 🔴 ALTA | Para que `WhiteLabelContext` pueda leerla |

> **NOTA TÉCNICA:** El Edge Runtime de Next.js no permite usar `node-postgres` directamente. Opciones:
> 1. **Vercel KV / Edge Cache** — Guardar config de tenants en Redis/KV al crear/actualizar
> 2. **API interna** — fetch a `/api/tenants/detect` desde middleware (latencia)
> 3. **Hardcoded map** — Mapa estático de subdominios para primeros tenants (temporal)

---

### C. Panel de Administración de Tenants

| Componente | Prioridad | Descripción |
|:-----------|:---------:|:------------|
| Página `/admin/tenants` | 🟡 MEDIA | CRUD visual de empresas/agencias |
| Formulario de creación de tenant | 🟡 MEDIA | Nombre, tipo, logo, colores, dominio |
| Configuración White-Label UI | 🟡 MEDIA | Editor visual de branding para agencias |
| Gestión de usuarios por tenant | 🟡 MEDIA | Asignar/remover usuarios |

> **NOTA:** El Panel Super Admin (`/dashboard/admin/agencies`) ya muestra la lista de agencias con stats. Falta convertirlo en CRUD completo.

---

### D. Flujo White-Label Completo

| Componente | Prioridad | Descripción |
|:-----------|:---------:|:------------|
| Guardar `?r=CODIGO` en cookie al navegar | 🟡 MEDIA | Para que se persista al navegar entre páginas |
| Markup de precios por agencia | 🟡 MEDIA | Aplicar sobreprecio configurable al White-Label |
| Registro auto-vinculado a agencia | 🟡 MEDIA | Leer cookie de referral y vincular automáticamente |
| Favicon/title dinámico por tenant | 🟠 BAJA | Cambiar favicon y `<title>` según agencia |

---

## 📊 Resumen de Completitud (Actualizado v2.311)

| Capa | % Completado | Estado | Faltante Principal |
|:-----|:------------:|:------:|:------------------|
| Base de Datos | **95%** | 🟢 | — |
| Backend Services | **90%** | 🟢 | Markup de precios |
| API Routes | **85%** | 🟢 | CRUD admin tenants |
| TypeScript Types | **100%** | 🟢 | — |
| Middleware | **70%** | 🟡 | Conexión a BD para detectar tenant |
| Dashboard Agencia | **80%** | 🟢 | — |
| Sistema Referrals | **85%** | 🟢 | Cookie persistente + auto-vinculación |
| Frontend White-Label | **0%** | 🔴 | WhiteLabelContext, colores/logo dinámicos |
| Admin UI Tenants | **25%** | 🟠 | CRUD completo desde Super Admin |
| **PROMEDIO GENERAL** | **~70%** | 🟡 | **El gran pendiente es el rendering white-label (frontend)** |

### Progresión:

```
v2.302 (10 Feb): ~45% general
v2.311 (11 Feb): ~70% general → +25% en un día
```

---

## 📋 LISTA DE OBSERVACIONES (OBS) — Marca Blanca

Lista detallada de observaciones pendientes, priorizadas:

### OBS-001: WhiteLabelContext no existe — 🔴 CRÍTICO
- **Descripción:** No hay Context ni hook para distribuir la configuración visual del tenant actual
- **Impacto:** Sin esto, no se pueden aplicar colores, logos ni branding dinámico
- **Solución:** Crear `src/contexts/WhiteLabelContext.tsx` + `useWhiteLabel()` hook
- **Dependencia:** Requiere que el middleware pase `x-tenant-config` en headers o cookie
- **Estado:** ❌ No iniciado

### OBS-002: Middleware no conecta a BD para detectar tenant — 🔴 CRÍTICO
- **Descripción:** El middleware detecta subdominios pero siempre retorna `null` porque no consulta la BD
- **Impacto:** Ningún subdominio de agencia funcionará (ej: `mmta.asoperadora.com`)
- **Solución:** Implementar cache en Edge (Vercel KV o fetch interno a `/api/tenants/detect`)
- **Nota técnica:** Edge Runtime no soporta `node-postgres` — necesita alternativa
- **Estado:** ❌ No iniciado

### OBS-003: Logo y colores no cambian por tenant — 🔴 CRÍTICO
- **Descripción:** El Header siempre muestra "AS Operadora" con colores azules fijos
- **Impacto:** La experiencia white-label no se logra visualmente
- **Solución:** CSS variables dinámicas (`--primary-color`, `--secondary-color`) desde WhiteLabelContext
- **Dependencia:** OBS-001 y OBS-002
- **Estado:** ❌ No iniciado

### OBS-004: Cookie de referral no persiste al navegar — 🟡 MEDIO
- **Descripción:** Si un usuario viene con `?r=MMTA-CARLOS01` y navega a otra página, se pierde el código
- **Impacto:** Se pierden conversiones de referidos
- **Solución:** Middleware o componente que detecte `?r=` y guarde en cookie `as_referral` con 30 días TTL
- **Estado:** ⚠️ Parcial — Booking POST ya detecta `referral_code`, pero no se guarda en cookie al navegar

### OBS-005: No hay CRUD visual de tenants en Admin — 🟡 MEDIO
- **Descripción:** El Super Admin ve la lista de agencias pero no puede crear/editar/eliminar desde la UI
- **Impacto:** Tiene que usar APIs directamente para gestionar tenants
- **Solución:** Convertir `/dashboard/admin/agencies` en CRUD completo con formularios
- **Estado:** ⚠️ Parcial — Lista + stats existen, falta CRUD

### OBS-006: No hay markup de precios por agencia — 🟡 MEDIO
- **Descripción:** Las agencias no pueden aplicar sobreprecio a los servicios que revenden
- **Impacto:** Modelo de negocio de reventa no funciona completamente
- **Solución:** Campo `markup_percentage` en `white_label_config` + aplicación en precios mostrados
- **Estado:** ❌ No iniciado

### OBS-007: Emails no usan branding del tenant — 🟡 MEDIO
- **Descripción:** Todos los emails salen con el branding de AS Operadora
- **Impacto:** Los clientes de agencias ven "AS Operadora" en vez de su agencia
- **Solución:** Pasar `tenantId` al NotificationService y cargar branding dinámico
- **Estado:** ❌ No iniciado

### OBS-008: Footer no se personaliza por agencia — 🟠 BAJO
- **Descripción:** El footer muestra info fija de AS Operadora
- **Impacto:** Menor — usuarios del White-Label ven la marca correcta en header pero no en footer
- **Solución:** Inyectar datos del tenant en componente Footer
- **Dependencia:** OBS-001
- **Estado:** ❌ No iniciado

### OBS-009: Favicon y title no cambian por tenant — 🟠 BAJO
- **Descripción:** El favicon y `<title>` siempre dicen "AS Operadora"
- **Impacto:** Los favoritos y tabs del browser muestran la marca equivocada
- **Solución:** Dynamic metadata en `layout.tsx` leyendo del WhiteLabelContext
- **Dependencia:** OBS-001
- **Estado:** ❌ No iniciado

### OBS-010: No hay onboarding para nuevas agencias — 🟠 BAJO
- **Descripción:** No existe flujo de auto-registro de agencias
- **Impacto:** Solo SUPER_ADMIN puede registrar agencias manualmente
- **Solución:** Formulario público de solicitud → aprobación por admin → setup automático
- **Estado:** ❌ No iniciado

---

## 🎯 Plan de Implementación Actualizado

### Fase 1: Rendering White-Label (3-4 días) — OBS-001, OBS-002, OBS-003
1. Crear `WhiteLabelContext.tsx` + `useWhiteLabel()` hook
2. Implementar API `/api/tenants/detect` para que middleware pueda consultar
3. Conectar middleware → API detect → pasar config en header/cookie
4. CSS variables dinámicas aplicadas globalmente
5. Logo dinámico en Header + colores dinámicos

### Fase 2: Referral Persistente + Admin CRUD (2-3 días) — OBS-004, OBS-005
6. Cookie `as_referral` al detectar `?r=CODIGO`
7. Auto-vinculación en registro con cookie de referral
8. CRUD completo de tenants en Super Admin panel

### Fase 3: Markup + Branding Email (2-3 días) — OBS-006, OBS-007
9. Campo `markup_percentage` + aplicación en precios
10. Templates de email dinámicos con logo/colores del tenant

### Fase 4: Polish (1-2 días) — OBS-008, OBS-009, OBS-010
11. Footer personalizado
12. Favicon/title dinámico
13. Flujo de onboarding para nuevas agencias

**Estimado total: 8-12 días de desarrollo**
*(Reducido de 13-17 días gracias al avance de Sprints 3-6)*

---

## ✅ Cambios vs Versión Anterior de este Informe

| Sección | Antes (v2.302) | Ahora (v2.311) |
|:--------|:--------------|:---------------|
| BD Schema | 90% | **95%** (+agent_notifications, agent_reviews, 168 indexes) |
| Backend Service | 80% | **90%** (+CommissionService, AgentNotificationService) |
| API Routes | 70% | **85%** (+14 endpoints nuevos) |
| Middleware | 30% | **70%** (+protección rutas, JWT, cookies) |
| Dashboard Agencia | 0% | **80%** (completamente nuevo) |
| Sistema Referrals | 0% | **85%** (liga, clics, conversiones, QR) |
| Frontend White-Label | 0% | **0%** (sigue siendo el pendiente principal) |
| Admin UI Tenants | 0% | **25%** (Super Admin con lista + stats) |
| **PROMEDIO** | **~45%** | **~70%** |
