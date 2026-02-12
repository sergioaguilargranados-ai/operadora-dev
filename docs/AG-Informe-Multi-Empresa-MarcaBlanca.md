# 📊 AG-Informe: Multi-Empresa y Marca Blanca - Estado Actual y Pendientes

**Fecha:** 11 de Febrero de 2026  
**Versión actual del proyecto:** v2.312  
**Última actualización:** 11 de Febrero de 2026 - 19:30 CST  
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

### 4. Middleware — 75% Listo (actualizado desde 70%)

| Funcionalidad | Estado | Detalle |
|:-------------|:------:|:--------|
| Detección de host/subdominio | ✅ | Headers `x-tenant-host`, `x-tenant-subdomain` |
| Detección de dominio custom | ⚠️ | Detecta pero retorna null — falta conexión a BD |
| ~~Protección de rutas~~ | ✅ | **v2.311** — JWT decode en Edge + redirect por rol |
| Cookie sync con AuthContext | ✅ | **v2.311** — `as_user`, `as_token` cookies |
| Tabla de rutas protegidas | ✅ | **v2.311** — admin, agency, agent con roles requeridos |
| Access denied toast | ✅ | **v2.311** — Redirect con parámetros indicando rol faltante |
| Cookie de referral `?r=CODIGO` | ✅ | **v2.311** — Guarda en cookie `as_referral` con 30 días TTL |
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

### 8. Frontend White-Label — 85% Listo (actualizado desde 0%)

| Componente | Estado | Detalle |
|:-----------|:------:|:--------|
| `WhiteLabelContext.tsx` | ✅ | **v2.304** — Context completo con `detectTenant()`, `applyTenantConfig()` |
| `useWhiteLabel()` hook | ✅ | **v2.304** — Hook principal + `useBrandColors()` + `useIsWhiteLabel()` |
| `WhiteLabelProvider` en layout | ✅ | **v2.304** — Envuelve toda la app en `layout.tsx` |
| `BrandStyles.tsx` | ✅ | **v2.304** — Inyecta CSS variables dinámicas por tenant con cleanup |
| CSS Variables defaults | ✅ | **v2.312** — `globals.css` con `--brand-primary/secondary/accent` + derivados |
| `Logo.tsx` dinámico | ✅ | **v2.304** — 3 modos: WL+logo, WL sin logo, default AS |
| `BrandFooter.tsx` | ✅ | **v2.312** — Footer reutilizable con datos del tenant + "Powered by" |
| `ChatWidget.tsx` dinámico | ✅ | **v2.312** — Saludo, colores y nombre del tenant |
| `WhatsAppWidget.tsx` dinámico | ✅ | **v2.312** — Teléfono del tenant + mensaje personalizado |
| `UserMenu.tsx` con brand colors | ✅ | **v2.312** — Avatar usa `--brand-primary` |
| Testing mode `?tenant=mmta` | ✅ | **v2.304** — Para probar white-label en localhost |
| `/api/tenant/detect` | ✅ | **v2.304** — API funcional por host/subdomain/domain |
| Emails con branding | ❌ | Templates de email usando colores/logo del tenant |
| Favicon/title dinámico | ❌ | Dynamic metadata según tenant |

---

### 9. Admin UI Tenants — 90% Listo (actualizado desde 25%)

| Componente | Prioridad | Descripción |
|:-----------|:---------:|:------------|
| Página `/admin/tenants` | ✅ | **v2.304** — CRUD completo con formularios |
| Formulario creación de tenant | ✅ | Nombre, tipo, logo, colores, dominio |
| Configuración White-Label UI | ✅ | Editor visual de branding: footer, support, meta, social |
| Gestión de usuarios por tenant | ⚠️ | Lista visible, falta add/remove desde UI |

---

### D. Pendientes White-Label Fase 2

| Componente | Prioridad | Descripción |
|:-----------|:---------:|:------------|
| ~~Guardar `?r=CODIGO` en cookie~~ | ~~🟡~~ | ✅ **COMPLETADO v2.311** — Middleware guarda cookie `as_referral` |
| Markup de precios por agencia | 🟡 MEDIA | Aplicar sobreprecio configurable al White-Label |
| Registro auto-vinculado a agencia | 🟡 MEDIA | Leer cookie de referral y vincular automáticamente |
| Favicon/title dinámico por tenant | 🟠 BAJA | Cambiar favicon y `<title>` según agencia |
| Emails con branding del tenant | 🟡 MEDIA | Templates de email usando colores/logo del tenant |
| Conexión middleware a BD (Edge) | 🟡 MEDIA | Vercel KV / Edge Cache para config de tenants |

---

## 📊 Resumen de Completitud (Actualizado v2.312)

| Capa | % Completado | Estado | Faltante Principal |
|:-----|:------------:|:------:|:------------------|
| Base de Datos | **95%** | 🟢 | — |
| Backend Services | **90%** | 🟢 | Markup de precios |
| API Routes | **85%** | 🟢 | — |
| TypeScript Types | **100%** | 🟢 | — |
| Middleware | **75%** | 🟡 | Conexión a BD para detectar tenant (Edge) |
| Dashboard Agencia | **80%** | 🟢 | — |
| Sistema Referrals | **90%** | 🟢 | Auto-vinculación en registro |
| Frontend White-Label | **85%** | � | Emails dinámicos, favicon/title |
| Admin UI Tenants | **90%** | � | Gestión usuarios por tenant |
| **PROMEDIO GENERAL** | **~88%** | � | **Pendientes menores: emails, favicon, markup** |

### Progresión:

```
v2.302 (10 Feb): ~45% general
v2.311 (11 Feb): ~70% general → +25% en un día
v2.312 (11 Feb): ~88% general → +18% (rendering white-label + admin CRUD verificado)
```

---

## 📋 LISTA DE OBSERVACIONES (OBS) — Marca Blanca

Lista detallada de observaciones pendientes, priorizadas:

### OBS-001: ~~WhiteLabelContext no existe~~ — ✅ RESUELTO v2.304+v2.312
- **Descripción:** Context y hooks implementados y funcionales
- **Implementado:** `WhiteLabelContext.tsx` con `useWhiteLabel()`, `useBrandColors()`, `useIsWhiteLabel()`
- **Plus:** `BrandStyles.tsx` inyecta CSS variables dinámicas al DOM
- **Plus:** `globals.css` incluye defaults para evitar flash de contenido sin estilo
- **Estado:** ✅ Completado

### OBS-002: Middleware no conecta a BD para detectar tenant — � PARCIAL
- **Descripción:** El middleware detecta subdominios y pasa headers, pero no consulta BD directamente
- **Workaround implementado:** El `WhiteLabelContext` hace fetch a `/api/tenant/detect` desde el cliente
- **Impacto residual:** Primera carga tiene latencia extra del fetch (pero es cached después)
- **Solución ideal:** Vercel KV o Edge Cache para config pre-cargada
- **Estado:** ⚠️ Funcional con workaround client-side

### OBS-003: ~~Logo y colores no cambian por tenant~~ — ✅ RESUELTO v2.304+v2.312
- **Logo:** `Logo.tsx` soporta 3 modos (WL+logo, WL sin logo, default AS)
- **Colores:** CSS variables `--brand-primary/secondary/accent` con derivados hover/light/bg
- **Componentes migrados:** UserMenu, ChatWidget, WhatsAppWidget
- **Estado:** ✅ Completado

### OBS-004: ~~Cookie de referral no persiste al navegar~~ — ✅ RESUELTO v2.311
- **Implementado:** Middleware guarda cookie `as_referral` con 30 días TTL al detectar `?r=CODIGO`
- **Estado:** ✅ Completado

### OBS-005: ~~No hay CRUD visual de tenants~~ — ✅ RESUELTO v2.304
- **Implementado:** `/admin/tenants` con CRUD completo:
  - Crear/editar/eliminar tenants
  - Formulario con datos legales, colores, logo, dominio
  - Configuración White-Label: footer, soporte, meta, social
  - Color pickers para primario/secundario/acento
- **Estado:** ✅ Completado

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

### OBS-008: ~~Footer no se personaliza por agencia~~ — ✅ RESUELTO v2.312
- **Implementado:** Componente `BrandFooter.tsx` reutilizable
- **Datos dinámicos:** Contacto, email, teléfono, redes sociales, links legales del tenant
- **Badge:** "Powered by AS Operadora" en modo white-label
- **Estado:** ✅ Completado

### OBS-009: Favicon y title no cambian por tenant — 🟠 BAJO
- **Descripción:** El favicon y `<title>` siempre dicen "AS Operadora"
- **Impacto:** Los favoritos y tabs del browser muestran la marca equivocada
- **Solución:** Dynamic metadata en `layout.tsx` leyendo del WhiteLabelContext
- **Estado:** ❌ No iniciado

### OBS-010: No hay onboarding para nuevas agencias — 🟠 BAJO
- **Descripción:** No existe flujo de auto-registro de agencias
- **Impacto:** Solo SUPER_ADMIN puede registrar agencias manualmente (desde `/admin/tenants`)
- **Solución:** Formulario público de solicitud → aprobación por admin → setup automático
- **Estado:** ❌ No iniciado

---

## 🎯 Plan de Implementación Actualizado (v2.312)

### ~~Fase 1: Rendering White-Label~~ — ✅ COMPLETADA v2.304+v2.312
1. ~~Crear `WhiteLabelContext.tsx` + `useWhiteLabel()` hook~~ ✅
2. ~~Implementar API `/api/tenants/detect`~~ ✅
3. ~~CSS variables dinámicas aplicadas globalmente~~ ✅
4. ~~Logo dinámico en Header + colores dinámicos~~ ✅
5. ~~Footer dinámico~~ ✅

### Fase 2: Referral Persistente + Polish (1-2 días)
6. ~~Cookie `as_referral` al detectar `?r=CODIGO`~~ ✅
7. Auto-vinculación en registro con cookie de referral
8. ~~CRUD completo de tenants en Super Admin panel~~ ✅
9. Favicon/title dinámico por tenant

### Fase 3: Markup + Branding Email (2-3 días)
10. Campo `markup_percentage` + aplicación en precios
11. Templates de email dinámicos con logo/colores del tenant

### Fase 4: Edge Optimization (1 día)
12. Vercel KV o Edge Cache para config de tenants en middleware

**Estimado restante: 4-6 días de desarrollo**
*(Reducido significativamente — la infraestructura core está completa)*

---

## ✅ Cambios vs Versión Anterior de este Informe

| Sección | v2.302 | v2.311 | v2.312 |
|:--------|:-------|:-------|:-------|
| BD Schema | 90% | 95% | **95%** |
| Backend Service | 80% | 90% | **90%** |
| API Routes | 70% | 85% | **85%** |
| Middleware | 30% | 70% | **75%** (+referral cookie) |
| Dashboard Agencia | 0% | 80% | **80%** |
| Sistema Referrals | 0% | 85% | **90%** (+cookie persistente) |
| Frontend White-Label | 0% | 0% | **85%** (context, logo, colors, footer, widgets) |
| Admin UI Tenants | 0% | 25% | **90%** (CRUD completo verificado) |
| **PROMEDIO** | **~45%** | **~70%** | **~88%** |
