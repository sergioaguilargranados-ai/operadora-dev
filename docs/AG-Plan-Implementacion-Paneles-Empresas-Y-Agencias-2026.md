# 📋 AG-Plan-Implementacion-Paneles-Empresas-Y-Agencias-2026

**Fecha de Emisión:** 21 de Agosto de 2026 - 16:05 CST  
**Versión del Proyecto:** `v2.510`  
**Rama de Trabajo:** `dev` (`operadora-dev.git`)  
**Autor:** AntiGravity AI Principal Architect  
**Objetivo:** Guía técnica de arquitectura, especificaciones de Base de Datos y Prompts listos para ejecutar en paralelo en otros equipos/agentes para la eliminación total de Mocks y conexión 100% real de **Panel de Empresas (`/dashboard/corporate`)** y **Panel de Agencias (`/dashboard/agency`)**.

---

## 🏗️ 1. CONTEXTO GENERAL Y ARQUITECTURA TÉCNICA

### Stack del Proyecto
- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Recharts, Framer Motion.
- **Backend:** Next.js Serverless API Routes (`src/app/api/...`).
- **Base de Datos:** PostgreSQL (Neon Cloud) gestionado con `@/lib/db`.
- **Autenticación & Sesión:** JWT + Contexto `useAuth()` (`user.tenant_id`, `user.id`, `user.role`).
- **Control de Acceso:** RBAC Granular con `<PermissionGate>` y `usePermissions()`.
- **Multi-Tenant (Marca Blanca):** Todo aislamiento de datos DEBE filtrarse estrictamente por `tenant_id` o `agency_id`. **NUNCA usar fallbacks quemados como `|| 2` o `|| 1`**.

### Repositorios y Entorno
- **Repositorio:** `https://github.com/sergioaguilargranados-ai/operadora-dev.git`
- **Rama:** `dev` (PROHIBIDO hacer push a `main`).
- **Referencia Visual de Diseños Aprobados:** `DOCS/VID-PORTAL-31072026/` (Capturas 11 a 39).

---

## ⚡ 2. MATRIZ DE DIVISION DE TRABAJO EN PARALELO (3 WORKSTREAMS)

```
                                  [ ARQUITECTURA MASTER ]
                                             │
         ┌───────────────────────────────────┼───────────────────────────────────┐
         ▼                                   ▼                                   ▼
 ┌───────────────────────┐           ┌───────────────────────┐           ┌───────────────────────┐
 │     WORKSTREAM 1      │           │     WORKSTREAM 2      │           │     WORKSTREAM 3      │
 │   Panel de Empresas   │           │   Panel de Agencias   │           │  Configuración Agency │
 │ (Dashboard Corporate) │           │     (CRM & Ventas)    │           │ (Vercel Blob & Docs)  │
 ├───────────────────────┤           ├───────────────────────┤           ├───────────────────────┤
 │ • Resumen KPIs        │           │ • CRM Pipeline Kanban │           │ • Subida Vercel Blob  │
 │ • Empleados (BD)      │           │ • Contactos & Leads   │           │ • Logos & Branding    │
 │ • Gastos & Reportes   │           │ • Gráficas de Ventas  │           │ • Docs Persona Moral  │
 │ • Métricas & CO2      │           │ • Reportes Período    │           │ • Docs Persona Física │
 │ • Aprobaciones Viaje  │           │ • Tenant Resolution   │           │ • Stripe Connect Hook │
 └───────────────────────┘           └───────────────────────┘           └───────────────────────┘
```

---

## 📦 WORKSTREAM 1: PANEL DE EMPRESAS (`/dashboard/corporate`)

### 🎯 Objetivo
Transformar `src/app/dashboard/corporate/page.tsx` de un prototipo con datos mock estáticos en JSX a un dashboard reactivo y multi-tenant conectado 100% a la base de datos PostgreSQL Neon.

### 🗄️ Esquema de Base de Datos y Consultas Reales
1. **KPIs y Resumen (`TabResumen`):**
   - Empleados: `SELECT COUNT(*) FROM tenant_users WHERE tenant_id = $1 AND is_active = true`
   - Reservas Activas: `SELECT COUNT(*) FROM bookings WHERE tenant_id = $1 AND status IN ('confirmed', 'pending')`
   - Gastos Anual / Mensual: `SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE tenant_id = $1 AND status != 'cancelled' AND created_at >= DATE_TRUNC('year', CURRENT_DATE)`
   - Desglose por Tipo de Servicio (Donut): `SELECT COALESCE(booking_type, 'Otros') as name, COUNT(*) as count, COALESCE(SUM(total_price), 0) as total FROM bookings WHERE tenant_id = $1 GROUP BY booking_type`
   - Top Destinos: `SELECT destination as name, COUNT(*) as value FROM bookings WHERE tenant_id = $1 AND destination IS NOT NULL GROUP BY destination ORDER BY value DESC LIMIT 5`
   - Actividad Reciente: `SELECT b.id, b.booking_type, b.destination, b.total_price, b.created_at, u.name as user_name FROM bookings b JOIN users u ON b.user_id = u.id WHERE b.tenant_id = $1 ORDER BY b.created_at DESC LIMIT 5`
2. **Directorio de Empleados (`TabEmpleados`):**
   - Unificar la lógica funcional de `src/app/dashboard/corporate/employees/page.tsx` dentro de la pestaña para listar, crear, editar y subir masivamente por CSV usando `CorporateService.getEmployees()` y `CorporateService.importEmployeesFromCSV()`.
3. **Gastos & Presupuestos (`TabGastos`):**
   - Gráfica temporal: `SELECT DATE(created_at) as date, SUM(total_price) as amount FROM bookings WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '30 days' GROUP BY DATE(created_at) ORDER BY date ASC`
   - Historial de gastos: Unificar `bookings` y `payment_transactions` por tenant.
4. **Métricas & Huella CO2 (`TabMetricas`):**
   - Cálculo real: Vuelos (`distancia_km * 0.15 kg CO2`), Hoteles (`noches * 15 kg CO2`).
5. **Aprobaciones de Viaje (`TabAprobaciones`):**
   - Consultar `travel_approvals` por `tenant_id = $1`, permitiendo ejecutar `POST /api/approvals/action` con acciones de `approved` / `rejected`.

### 💻 Archivos a Modificar / Crear
- `src/app/dashboard/corporate/page.tsx` [MODIFY]
- `src/services/CorporateService.ts` [MODIFY]
- `src/app/api/corporate/stats/route.ts` [MODIFY]
- `src/app/api/corporate/expenses/route.ts` [NEW]
- `src/app/api/corporate/approvals/route.ts` [NEW]

---

### 📋 PROMPT PARA EL AGENTE 1 (Copiar y Pegar en el Chat / Equipo 1):

```markdown
Hola Agente. Actúa como Ingeniero de Software Senior Full Stack. Tu misión es conectar el **Panel de Empresas (Dashboard Corporativo)** 100% a la Base de Datos PostgreSQL Neon, eliminando todos los datos mock y respetando la arquitectura Multi-Tenant (Marca Blanca).

#### 📌 Contexto y Reglas Obligatorias:
1. Idioma: Toda comunicación y código DEBE ser en Español.
2. Rama de trabajo: "dev" en el repositorio "operadora-dev".
3. Referencia visual: Diseños de `DOCS/VID-PORTAL-31072026/` (Imágenes 28 a 39).
4. No hardcodear `tenant_id`. Obtenerlo de `const { user } = useAuth(); const tenantId = user?.tenant_id;`.
5. Si no hay datos en la base de datos para una empresa recién registrada, muestra estados vacíos elegantes ("Sin reservas registradas aún", "0 empleados"), NUNCA datos ficticios quemados.

#### 🛠️ Tareas a Ejecutar:
1. Inspecciona `src/app/dashboard/corporate/page.tsx` y `src/services/CorporateService.ts`.
2. Actualiza `CorporateService.ts` para que todos los métodos (`getDashboardStats`, `getExpenses`, `getApprovals`, `getCO2Metrics`) ejecuten consultas SQL reales a las tablas `bookings`, `tenant_users`, `travel_approvals` y `travel_policies` filtrando siempre por `WHERE tenant_id = $1`.
3. Crea las rutas de API necesarias en `src/app/api/corporate/...` para gastos, aprobaciones y estadísticas.
4. En `src/app/dashboard/corporate/page.tsx`:
   - Conecta `TabResumen` al endpoint `/api/corporate/stats`.
   - Incrusta el gestor de empleados real de `src/app/dashboard/corporate/employees/page.tsx` en `TabEmpleados` (con modal manual e importador CSV funcional).
   - Conecta `TabGastos` a la API de gastos con gráfica Recharts reactiva.
   - Conecta `TabMetricas` al cálculo real de CO2 y desglose de servicios.
   - Conecta `TabAprobaciones` a la tabla `travel_approvals` con botones funcionales para Aprobar y Rechazar.
5. Ejecuta `npm run build` para asegurar 0 errores de compilación TypeScript/Next.js.
6. Actualiza la versión con `node scripts/update-version.js v2.511` y documenta tus cambios en `DOCS/AG-Historico-Cambios.md`.
```

---

## 📦 WORKSTREAM 2: PANEL DE AGENCIAS — CRM, PIPELINE KANBAN Y VENTAS

### 🎯 Objetivo
Reemplazar los datos mock de `src/app/dashboard/agency/crm/page.tsx` y `src/app/dashboard/agency/ventas/page.tsx` conectándolos con las tablas reales del módulo CRM (`crm_leads`, `crm_contacts`, `crm_activities` creadas en migración `034_crm_core_tables.sql`) y con la agregación real de reservas de `AgencyService.ts`.

### 🗄️ Esquema de Base de Datos y Consultas Reales
1. **CRM Dashboard & Pipeline Kanban (`/dashboard/agency/crm`):**
   - KPIs:
     - Contactos totales: `SELECT COUNT(*) FROM crm_contacts WHERE tenant_id = $1`
     - Leads activos: `SELECT COUNT(*) FROM crm_leads WHERE tenant_id = $1 AND status != 'lost'`
     - Valor del Pipeline: `SELECT COALESCE(SUM(estimated_value), 0) FROM crm_leads WHERE tenant_id = $1 AND status NOT IN ('won', 'lost')`
     - Tareas vencidas: `SELECT COUNT(*) FROM crm_activities WHERE tenant_id = $1 AND status = 'pending' AND due_date < NOW()`
   - Etapas Kanban (5 columnas según imagen 16):
     - `new` (Nuevo Lead)
     - `followup` (Seguimiento)
     - `quote` (Envío de Cotización)
     - `payment` (Pago Apartado)
     - `liquidate` (Liquidación)
     - Consulta: `SELECT * FROM crm_leads WHERE tenant_id = $1 ORDER BY updated_at DESC`
   - Acciones: Arrastrar tarjeta / cambiar estado (`UPDATE crm_leads SET stage = $1 WHERE id = $2 AND tenant_id = $3`).
2. **Ventas & Rendimiento de Agencia (`/dashboard/agency/ventas`):**
   - KPIs: Ventas totales, reservas confirmadas, pendientes, ticket promedio.
   - Consulta:
     ```sql
     SELECT 
       COUNT(*) as total_reservas,
       COUNT(*) FILTER (WHERE status = 'confirmed') as confirmadas,
       COUNT(*) FILTER (WHERE status = 'pending') as pendientes,
       COALESCE(SUM(total_price), 0) as ventas_totales,
       COALESCE(AVG(total_price), 0) as ticket_promedio
     FROM bookings
     WHERE tenant_id = $1
     ```
   - Ventas por día (últimos 7 o 30 días): `SELECT DATE(created_at) as date, SUM(total_price) as ventas FROM bookings WHERE tenant_id = $1 GROUP BY DATE(created_at) ORDER BY date ASC`
   - Ventas por producto (Donut): `SELECT booking_type as name, SUM(total_price) as value FROM bookings WHERE tenant_id = $1 GROUP BY booking_type`

### 💻 Archivos a Modificar / Crear
- `src/app/dashboard/agency/crm/page.tsx` [MODIFY]
- `src/app/dashboard/agency/ventas/page.tsx` [MODIFY]
- `src/services/CRMService.ts` [MODIFY / VERIFY]
- `src/services/AgencyService.ts` [MODIFY]
- `src/app/api/crm/leads/route.ts` [NEW / MODIFY]
- `src/app/api/crm/stats/route.ts` [NEW / MODIFY]
- `src/app/api/agency/sales/route.ts` [NEW]

---

### 📋 PROMPT PARA EL AGENTE 2 (Copiar y Pegar en el Chat / Equipo 2):

```markdown
Hola Agente. Actúa como Ingeniero de Software Senior Backend & Frontend. Tu misión es conectar las pantallas de **CRM & Pipeline Kanban** y **Ventas & Rendimiento** del **Panel de Agencias** a la base de datos PostgreSQL Neon, eliminando todos los datos mock.

#### 📌 Contexto y Reglas Obligatorias:
1. Idioma: Toda comunicación y código DEBE ser en Español.
2. Rama de trabajo: "dev" en el repositorio "operadora-dev".
3. Referencia visual: Diseños de `DOCS/VID-PORTAL-31072026/` (Imágenes 15, 16, 17 y 18).
4. Usar la migración existente `migrations/034_crm_core_tables.sql` (`crm_leads`, `crm_contacts`, `crm_activities`).
5. Multi-Tenant estricto: Todo registro y consulta debe llevar `WHERE tenant_id = $1` o `agency_id = $1`. Eliminar cualquier fallback estático `|| 2`.

#### 🛠️ Tareas a Ejecutar:
1. Revisa `src/app/dashboard/agency/crm/page.tsx` y `src/app/dashboard/agency/ventas/page.tsx`.
2. Conecta `src/app/dashboard/agency/crm/page.tsx` a la API de CRM:
   - Cargar KPIs reales de prospectos, valor de pipeline y tareas vencidas.
   - Implementar el tablero Kanban de 5 columnas (`Nuevo Lead`, `Seguimiento`, `Envío Cotización`, `Pago Apartado`, `Liquidación`) consumiendo la tabla `crm_leads`.
   - Permitir mover prospectos entre etapas y crear nuevos leads/contactos guardando directamente en PostgreSQL.
3. Conecta `src/app/dashboard/agency/ventas/page.tsx`:
   - Conectar las tarjetas de KPIs a la agregación real de `bookings` filtrada por `tenant_id`.
   - Alimentar la gráfica de línea de tendencia y la dona de ventas por producto con datos SQL reales.
   - Mostrar la tabla de últimas ventas y habilitar el selector de rango de fechas.
4. En `src/app/dashboard/agency/page.tsx`, elimina la línea `const agencyId = (user as any)?.tenant_id || 2;` y sustitúyela por resolución limpia de tenant de sesión.
5. Valida con `npm run build` para asegurar 0 errores de compilación.
6. Actualiza la versión y documenta los cambios en `DOCS/AG-Historico-Cambios.md`.
```

---

## 📦 WORKSTREAM 3: CONFIGURACIÓN DE AGENCIAS, VERCEL BLOB Y LEGAL

### 🎯 Objetivo
Completar `src/app/dashboard/agency/settings/page.tsx` sustituyendo las simulaciones (`alert('Simulación: Archivo subido...')`) por el almacenamiento real de archivos en **Vercel Blob** (`@vercel/blob`) y la persistencia de documentos en `entity_documents` para Persona Física y Moral (Capturas 20 a 27).

### 🗄️ Especificación Técnica
1. **Subida Real a Vercel Blob (`/api/upload/blob` o `/api/admin/documents`):**
   - Utilizar `@vercel/blob` (`put(filename, file, { access: 'public' })`).
   - Retornar la URL pública real `https://...public.blob.vercel-storage.com/...`.
2. **Branding & Identidad Visual (Captura 22):**
   - Guardar `logo_url`, `logo_dark_url`, `mobile_logo_url`, `primary_color`, `secondary_color`, `accent_color`, `custom_domain` en la tabla `tenants` y `white_label_config`.
3. **Expediente Legal & Documentos (Capturas 25 y 26):**
   - Persona Física: INE / Pasaporte, Comprobante de Domicilio, RFC, Constancia de Situación Fiscal.
   - Persona Moral: Acta Constitutiva, RFC Empresa, Comprobante Domicilio Fiscal, Identificación Representante, Poder Notarial.
   - Guardar en la tabla `entity_documents` con `entity_type = 'agency'`, `entity_id = tenant_id`, `document_type`, `file_url`, `status = 'uploaded'`.
4. **Configuración de Pagos (Captura 24):**
   - Integración con Stripe Connect / métodos de pago externos.

### 💻 Archivos a Modificar / Crear
- `src/app/dashboard/agency/settings/page.tsx` [MODIFY]
- `src/app/api/agency/settings/route.ts` [MODIFY]
- `src/app/api/agency/documents/route.ts` [NEW]
- `src/app/api/upload/blob/route.ts` [NEW / VERIFY]

---

### 📋 PROMPT PARA EL AGENTE 3 (Copiar y Pegar en el Chat / Equipo 3):

```markdown
Hola Agente. Actúa como Ingeniero de Software Senior Especialista en Integraciones Cloud. Tu misión es implementar la subida real de archivos a **Vercel Blob** y el almacenamiento del **Expediente Legal y Configuración de Marca Blanca** de Agencias en `src/app/dashboard/agency/settings/page.tsx`.

#### 📌 Contexto y Reglas Obligatorias:
1. Idioma: Toda comunicación y código DEBE ser en Español.
2. Rama de trabajo: "dev" en el repositorio "operadora-dev".
3. Referencia visual: Diseños de `DOCS/VID-PORTAL-31072026/` (Imágenes 20 a 27).
4. Eliminar TODAS las alertas de simulación (`alert('Simulación: Archivo subido...')`).
5. Usar `@vercel/blob` para subir archivos y registrar metadatos en la tabla `entity_documents` de PostgreSQL.

#### 🛠️ Tareas a Ejecutar:
1. Revisa `src/app/dashboard/agency/settings/page.tsx` y `src/app/api/agency/settings/route.ts`.
2. Crea el endpoint `src/app/api/upload/blob/route.ts` utilizando `put` de `@vercel/blob` para recibir archivos multipart/form-data y retornar la URL permanente.
3. Crea/Actualiza `src/app/api/agency/documents/route.ts` para registrar y listar los documentos subidos por agencia en `entity_documents`.
4. En `src/app/dashboard/agency/settings/page.tsx`:
   - Conecta la subida de logotipos (logo claro, oscuro, icono) al endpoint real de Vercel Blob.
   - En la pestaña "Legal", implementa la selección de Persona Física y Persona Moral con subida individual para cada documento requerido (INE, Acta Constitutiva, Poder Notarial, RFC, Comprobante de Domicilio).
   - Muestra el estado del documento (Pendiente de subir / Subido con éxito / En revisión) y enlace para visualizarlo.
5. Verifica que los cambios de colores y logos actualicen reactivamente `white_label_config` y `tenants`.
6. Valida con `npm run build` para asegurar compilación limpia con 0 errores.
7. Actualiza versión y documenta en `DOCS/AG-Historico-Cambios.md`.
```

---

## ✅ 3. PROTOCOLO OBLIGATORIO DE CIERRE PARA CADA AGENTE

Cada agente que finalice un paquete de trabajo debe cumplir el siguiente checklist de 5 pasos antes de hacer push:
1. **Cero Mocks:** Verificar que no queden números quemados en las vistas asignadas.
2. **Multi-Tenant Seguro:** Garantizar que todo select/insert use `tenant_id` de la sesión.
3. **Compilación:** Ejecutar `npm run build` y asegurar 0 errores.
4. **Versionado:** Correr `node scripts/update-version.js v2.5XX` (usando hora CST / CDMX).
5. **Git Push:** Hacer commit descriptivo y push **únicamente a la rama `dev`**.
