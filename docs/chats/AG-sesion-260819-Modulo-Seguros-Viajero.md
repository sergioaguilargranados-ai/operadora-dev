# 💬 Sesión AG: Módulo de Contratación y Gestión de Seguro de Viajero (`/seguros`)

**Fecha:** 19 de Agosto de 2026 - 10:19 CST  
**Versión inicial:** v2.487  
**Versión final:** v2.488  
**Rama:** `dev`  
**Participantes:** Sergio (Operadora Dev), AntiGravity AI Assistant

---

## 🎯 Objetivo de la Sesión
Diseñar, desarrollar e integrar en el portal de AS Operadora la plataforma integral de **Seguros de Viajero y Asistencia Médica Internacional (`/seguros`)**, actuando con rigor técnico e insurtech para incluir cálculo dinámico de primas, cumplimiento estricto del Tratado Schengen, catálogo de coberturas hospitalarias y de equipaje, leyendas regulatorias, auto-completado con reservas activas del cliente y emisión inmediata de certificados de póliza con número de folio internacional.

---

## 🛠️ Componentes Desarrollados

### 1. Base de Datos y Persistencia PostgreSQL
- **Tabla `travel_insurance_policies`:**
  - Estructura con `policy_number` (único, ej. `AS-POL-2026-8942`), `tenant_id`, `user_id`, `booking_id`, `plan_code`, `plan_name`, `destination_region`, `start_date`, `end_date`, `total_days`, `passengers_count`, `total_price`, `currency`, `insured_travelers` (JSONB), `emergency_contact` (JSONB), `coverage_details` (JSONB), `status`, `payment_status`.
- **Script de Semillado (`scripts/seed-insurance-module.js`):**
  - Creación de tabla, registro de feature flag `travel_insurance` en `features`, creación de permisos `insurance:view`, `insurance:create`, `insurance:manage` y asignación a roles de cliente y staff.

### 2. Backend & APIs REST
- **`POST /api/insurance/quote`:**
  - Cotizador en tiempo real considerando factor de destino (Nacional, Europa/Schengen, EE.UU./Canadá, Sudamérica, Asia, Cruceros), días de cobertura y grupos de edad de los viajeros (<65 años, 65-74 años, 75+ años).
  - Devuelve los 3 planes insurtech estructurados con tipo de cambio oficial MXN.
- **`GET & POST /api/insurance/policies`:**
  - Endpoint seguro de emisión de pólizas y consulta con soporte multi-rol (filtro por usuario o vista global para staff).

### 3. Frontend Portal Web (`/seguros`)
- **Pestaña 1: Cotizar & Contratar:**
  - Flujo guiado en 4 pasos:
    1. *Destino y Fechas:* con vinculación de reservas existentes para auto-completar en 1 clic.
    2. *Selección de Plan:* Comparativa visual de 3 planes (Plan Escapadas $30k USD, Plan Internacional Plus / Schengen ⭐ $60k USD, Plan Mundial Platinum & Cruceros $150k USD).
    3. *Datos de Asegurados:* Nombre completo, tipo y número de documento (Pasaporte/INE/CURP), fecha de nacimiento, email y contacto de emergencia en país de origen.
    4. *Resumen y Emisión:* Desglose de prima, aceptación de condiciones y generación de póliza activa con voucher descargable.
- **Pestaña 2: Mis Pólizas:**
  - Listado de pólizas vigentes, próximas y concluidas con descarga de certificado PDF y botón de asistencia directa 24/7.
- **Pestaña 3: Guía de Asistencia & Coberturas:**
  - Directorio de centrales de emergencia (WhatsApp México, Europa, EE.UU.) y protocolo paso a paso ante urgencias.

### 4. Navegación e Integración Multi-Tenant
- Inclusión del ítem `Seguros de Viajero` (`ShieldCheck`, badge `24/7`) en `GESTIÓN DE RESERVAS` y `MI CUENTA & VIAJES` en `PortalSidebar.tsx` y `navigation_menu_items`.
- Cierre de ciclo con el botón "Solicitar" en la pantalla de perfil móvil (`/mobile/perfil`).

---

## 🔍 Control de Calidad y Despliegue
- **Versión:** `v2.488`
- **Compilación:** `npm run build` verificado con 0 errores.
- **Rama Git:** `dev`
