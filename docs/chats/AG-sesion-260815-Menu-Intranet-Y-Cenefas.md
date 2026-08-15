# AG-Sesión: Estandarización de Layouts Intranet, Eliminación de Cenefas Duplicadas y Restauración de Menú Vertical v2.480

> **Fecha:** 2026-08-15 01:42 CST  
> **Versión alcanzada:** `v2.480`  
> **Repositorio:** `operadora-dev` (`origin/main`)  

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

---

## 📁 Archivos Principales Modificados
- `src/app/dashboard/layout.tsx` [NEW]: Layout maestro para todo el dashboard.
- `src/app/admin/layout.tsx` [NEW]: Layout maestro para todo el módulo admin.
- `src/app/dashboard/crm/layout.tsx`, `src/app/dashboard/rrhh/layout.tsx`, `src/app/dashboard/agency/layout.tsx`: Simplificación de layouts hijos.
- `src/app/dashboard/quotes/page.tsx`: Eliminación de cenefa manual y adición de banner estándar.
- `src/app/admin/tenants/page.tsx`: Eliminación de cenefa manual.
- `src/app/admin/features/page.tsx`: Eliminación de cenefa manual.
- `src/app/admin/megatravel/page.tsx`: Eliminación de cenefa manual.
- `src/app/dashboard/admin/agencies/page.tsx`: Rediseño al estilo institucional estándar en blanco/gris.
- `src/app/dashboard/page.tsx`, `src/app/dashboard/payments/page.tsx`, `src/app/dashboard/store/page.tsx`: Eliminación de cenefas repetidas y adaptación a `PortalIntranetLayout`.
- Todas las rutas en `src/app/dashboard/crm/*` y `src/app/dashboard/rrhh/*`.
- `DOCS/AG-Historico-Cambios.md`: Registro de versión `v2.480`.
- `DOCS/AG-Contexto-Proyecto.md`: Actualización de estado y versión.

