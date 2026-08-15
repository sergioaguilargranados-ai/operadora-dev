# AG-Sesión: Estandarización de Layouts Intranet, Eliminación de Cenefas Duplicadas, Restauración de Menú Vertical y Roles Granulares v2.484

> **Fecha:** 2026-08-15 04:29 CST  
> **Versión alcanzada:** `v2.484`  
> **Repositorio:** `operadora-dev` (`origin/dev`)  

---

## 📋 Resumen de Requerimientos y Solución

### 1. Eliminación de Cenefas Duplicadas (`PageHeader` interno)
- Se identificó que `PortalIntranetLayout` renderiza el encabezado superior institucional (`PageHeader`) de forma global para todo el portal.
- Se eliminaron las llamadas internas redundantes a `<PageHeader>` en las 44 pantallas de CRM (`clientes`, `analytics`, `automation`, `calendar`, `campaigns`, `pipeline`, `tasks`, `whatsapp`, etc.), RRHH (`employees`, `agents`, `attendance`, `audit`, `commissions`, `contracts`, `payroll`, `recruitment`, etc.) y Tienda (`store`).
- Se reemplazaron por encabezados de página y títulos internos limpios que respetan el grid y la estética institucional sin duplicar la barra de navegación superior.

### 2. Restauración del Menú Vertical Institucional (`PortalSidebar`)
- Se implementaron los layouts maestros raíz:
  - `src/app/dashboard/layout.tsx`: Envuelve todas las vistas dentro de `/dashboard` con `PortalIntranetLayout`.
  - `src/app/admin/layout.tsx`: Envuelve todas las vistas de administración con `PortalIntranetLayout`.
- Se simplificaron los sub-layouts (`crm/layout.tsx`, `rrhh/layout.tsx`, `agency/layout.tsx`) para heredar limpiamente sin sobrecargas.
- Las vistas que antes perdían el menú vertical (como `/dashboard/admin/agencies`, `/dashboard/payments`, `/dashboard/corporate/*`, `/dashboard/quotes`, `/dashboard/admin/*`) ahora conservan de manera consistente el menú vertical lateral y el encabezado unificado.

### 3. Ajustes Específicos Adicionales
- **Cotizaciones (`/dashboard/quotes`):** Se eliminó la cabecera repetida interna con logo y menú de usuario, reemplazándola por el banner estándar con botón "Nueva Cotización" y "Exportar Excel".
- **Tenants & Marca Blanca (`/admin/tenants`):** Eliminación de cenefa manual y unificación de acciones "+ Nuevo Tenant" y "Actualizar" al banner superior.
- **Administración de Funciones (`/admin/features`):** Eliminación de cabecera manual y adaptación limpia al grid de Intranet.
- **Panel MegaTravel (`/admin/megatravel`):** Eliminación de cabecera manual con logo y unificación al layout.
- **Panel de Super Admin (`/dashboard/admin/agencies`):** Rediseño completo a la estética institucional estándar en blanco/gris (`bg-white`, bordes sutiles, KPI cards limpios, badges de estado, gráfica Recharts en tema claro), alineándolo visualmente con Operación, CRM y Dashboard.

### 4. Sincronización de Pestañas y Submenús (`v2.481`)
- **Panel de Agencias (`/dashboard/agency`):** Corrección de sincronización de `activeTab`. Al hacer clic en "Resumen General", se restablece la pestaña a `overview` correctamente.
- **Panel de Empresas (`PortalSidebar.tsx` & `/dashboard/corporate`):** Incorporación de submenú jerárquico desplegable para Empresas (*Resumen General*, *Empleados Corporativos*, *Gastos & Presupuestos*, *Métricas & CO2*, *Aprobaciones de Viaje*, *Políticas de Viaje*, *Métodos de Pago*) con sincronización de pestañas por `searchParams`.
- **Limpieza de Atajos al Fondo:** Remoción de los botones inferiores en la barra lateral (*Catálogo Clientes*, *Ir a RRHH*, *Dashboard Principal*) para evitar duplicidad y mantener un sidebar limpio y funcional.

### 5. Submenú de Gestión de Contenido (`v2.482`)
- **Gestión de Contenido (`PortalSidebar.tsx` & `/admin/content`):**
  - Incorporación de submenú jerárquico desplegable con las 13 sub-opciones de contenido (*Banner Principal*, *Promociones*, *Vuelos Destacados*, *Paquetes Turísticos*, *Catálogo Hoteles*, *Catálogo Aerolíneas*, *Videos & URLs*, *Imágenes Tours*, *Ejecución de Procesos*, *Landing Principal*, *App Móvil PWA*, *Tienda (Productos)*, *Destinos IA*).
  - Sincronización bidireccional mediante `searchParams` y carga bajo demanda de datos (`loadHotels`, `loadAirlines`, `loadTourImages`).
  - Auto-expansión del menú lateral al ingresar a rutas de administración y gestión de contenido.

### 6. Sistema Integral de Roles y Permisos Granulares (`v2.484`)
- **Base de Datos:** Semillado de 44 permisos granulares clasificados por módulo y asignación de 189 relaciones en `role_permissions`.
- **Nuevas APIs:** `GET /api/auth/permissions`, CRUD `api/admin/roles` y `GET /api/admin/permissions`.
- **Frontend:** Contexto `PermissionsProvider`, hook `usePermissions()` y componente `<PermissionGate>`.
- **UI:** Pantalla de *Gestión de Roles & Matriz de Permisos* (`/admin/roles`).
- **Menú y Páginas:** Menú lateral dinámico y vistas protegidas según permisos del rol en tiempo real.

---

## 📁 Archivos Principales Modificados
- `src/app/admin/roles/page.tsx` [NEW]: Pantalla de administración de roles y matriz de permisos granulares.
- `src/app/api/admin/roles/route.ts` [NEW]: API CRUD y asignación de matriz de roles.
- `src/app/api/admin/permissions/route.ts` [NEW]: Catálogo de permisos por módulo.
- `src/app/api/auth/permissions/route.ts` [NEW]: Endpoint de permisos efectivos de usuario.
- `src/contexts/PermissionsContext.tsx` [NEW]: Contexto y hook `usePermissions()`.
- `src/components/auth/PermissionGate.tsx` [NEW]: Componente para protección granular de UI.
- `scripts/seed-permissions.js` [NEW]: Script de migración y seeding.
- `src/components/layout/PortalSidebar.tsx`: Menú lateral dinámico gobernado por permisos.
- `src/app/dashboard/crm/contacts/page.tsx`: Adaptación a permisos granulares con `<PermissionGate>`.
- `src/app/layout.tsx`: Integración de `PermissionsProvider`.
- `DOCS/AG-Historico-Cambios.md`: Registro de versión `v2.484`.
- `DOCS/AG-Contexto-Proyecto.md`: Actualización de estado y versión `v2.484`.



