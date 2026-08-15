# 📋 AG-Sesión: Sistema de Roles, Permisos Granulares y Organizador Dinámico de Menú v2.486

> **Fecha:** 2026-08-15 05:18 CST  
> **Versión alcanzada:** `v2.486`  
> **Rama activa:** `dev` (`operadora-dev dev`)  
> **Rama estable de producción:** `main` (`v2.374` - NO TOCAR NI EMPUJAR A MAIN)  
> **Ambiente de Pruebas:** `https://www.as-ope-viajes.company/`  
> **Propósito:** Documento de traspaso y continuación de sesión entre laptops / agentes AntiGravity.

---

## 🌟 Resumen Ejecutivo de lo Implementado

En esta sesión se diseñó, implementó y desplegó una arquitectura integral de **Control de Acceso Basado en Roles y Permisos Granulares (RBAC)** con soporte **Multi-Tenant (Marca Blanca)** y un **Organizador Dinámico del Menú de Navegación** editable visualmente desde el navegador.

---

## 🛠️ 1. Módulos y Arquitectura Entregada

### A. Gestión de Roles & Matriz de Permisos Granulares (`/admin/roles`)
Ubicación en la Intranet: **ADMINISTRACIÓN Y AJUSTES -> Administración & Sistema -> Roles & Permisos**

La pantalla cuenta con 3 pestañas interactivas:
1. **Catálogo de Roles:**
   - Visualización de 10 roles del sistema (`SUPER_ADMIN`, `ADMIN`, `MANAGER`, `AGENCY_ADMIN`, `AGENT`, `HR_MANAGER`, `CLIENT`, `EMPLOYEE`, `USER`, `GUEST`).
   - Distintivo visual para roles de `Sistema` (protegidos) vs `Personalizados / Marca Blanca`.
   - Botón **`+ Nuevo Rol`** con modal para crear roles por ámbito (Global o de una Marca Blanca específica).
   - Eliminación segura para roles personalizados sin usuarios asignados.
2. **Matriz de Permisos Granulares:**
   - Selector de rol en tiempo real.
   - Tabla interactiva clasificada en 13 módulos del sistema (`CRM`, `Cotizaciones`, `Reservaciones`, `RRHH`, `Contenido`, `Tienda`, `Facturación SAT CFDI`, `Administración`, `Viajero`, `Público`, etc.).
   - Casillas de verificación (checkboxes) por acción granular (`view`, `create`, `edit`, `delete`, `export`, `manage`, `approve`).
   - Botón **"Guardar Matriz"** que persiste los cambios en la base de datos de inmediato.
3. **🏗️ Organizador de Menú Dinámico:**
   - Visualización de las 4 secciones del menú (`INTRANET & OPERACIÓN`, `GESTIÓN DE RESERVAS`, `ADMINISTRACIÓN Y AJUSTES`, `CUENTA PERSONAL`).
   - Botones **▲ / ▼** para reordenar opciones principales o sub-opciones internas (como en *Gestión de Contenido*, *Panel de Empresas*, *Panel Agencias*, *CRM*, *RRHH*).
   - Selector desplegable **"Mover a..."** para transferir cualquier opción de una sección a otra.
   - Botón de **Ojo (Activar / Desactivar)** para ocultar o mostrar opciones.
   - Botón **"Guardar Cambios"** que actualiza el menú lateral (`PortalSidebar`) en tiempo real sin recargar.

---

## 🗄️ 2. Base de Datos y APIs Creadas

### Tablas de PostgreSQL:
1. **`roles`**: Contiene `id`, `name`, `display_name`, `description`, `is_system`, `tenant_id`.
2. **`permissions`**: Contiene `id`, `code`, `name`, `module`, `action`, `description` (44 permisos granulares).
3. **`role_permissions`**: Contiene `role_id`, `permission_id`, `created_at` (189 asignaciones base).
4. **`navigation_menu_items`**: Contiene `id`, `section_key`, `section_title`, `section_order`, `item_key`, `label`, `icon_name`, `route`, `badge`, `permission_code`, `parent_item_key`, `sort_order`, `is_active`, `tenant_id` (70 elementos de navegación precargados).

### Endpoints de API REST:
- `GET /api/auth/permissions`: Permisos de la sesión actual (o `GUEST`). Consumible por Web, PWA Móvil y la futura App Nativa.
- `GET, POST, PUT, DELETE /api/admin/roles`: CRUD de roles y matriz de permisos.
- `GET /api/admin/permissions`: Catálogo de permisos por módulo.
- `GET, PUT /api/admin/menu`: Obtención y actualización en lote de la jerarquía de navegación.
- `GET /api/admin/tenants`: Listado de tenants / marcas blancas.

### Frontend Components & Contexts:
- `src/contexts/PermissionsContext.tsx`: Contexto y hook `usePermissions()` (`can`, `hasPermission`, `hasAnyPermission`, `isSuperAdmin`).
- `src/components/auth/PermissionGate.tsx`: Componente para protección granular de UI.
- `src/components/layout/PortalSidebar.tsx`: Menú lateral dinámico reactivo con fallback local.

---

## 📜 3. Protocolo Obligatorio para Futuros Agentes

Registrado en [`DOCS/AG-Contexto-Proyecto.md`](file:///c:/operadora-dev/DOCS/AG-Contexto-Proyecto.md), siempre que se agregue una nueva función:
1. Registrarla en `/admin/features` (`FeatureService.ts`).
2. Registrar su código granular en `permissions` y asignarlo en `role_permissions`.
3. Registrar la ruta en `navigation_menu_items` para que aparezca en el menú y en el Organizador.
4. Proteger botones y vistas con `<PermissionGate permission="...">` y validar en API.
5. Versionar con `node scripts/update-version.js vX.XXX`, compilar con `npm run build` y subir **exclusivamente a `dev`**.

---

## 📁 4. Archivos Clave Modificados / Creados
- `src/app/admin/roles/page.tsx` [NEW]: Pantalla de Catálogo de Roles, Matriz de Permisos y Organizador de Menú.
- `src/app/api/admin/roles/route.ts` [NEW]: API de roles y matriz.
- `src/app/api/admin/permissions/route.ts` [NEW]: API de permisos.
- `src/app/api/admin/menu/route.ts` [NEW]: API de estructura del menú.
- `src/app/api/admin/tenants/route.ts` [NEW]: API de marcas blancas para roles.
- `src/app/api/auth/permissions/route.ts` [NEW]: API de permisos efectivos de usuario.
- `src/contexts/PermissionsContext.tsx` [NEW]: Contexto y hook de permisos.
- `src/components/auth/PermissionGate.tsx` [NEW]: Componente de renderizado condicional.
- `scripts/seed-permissions.js` [NEW]: Script de migración de roles y permisos.
- `scripts/seed-navigation-menu.js` [NEW]: Script de migración de navegación de menú.
- `src/components/layout/PortalSidebar.tsx`: Menú lateral conectado a la API de navegación y permisos.
- `src/app/dashboard/crm/contacts/page.tsx`: Vistas adaptadas a `<PermissionGate>`.
- `DOCS/AG-Contexto-Proyecto.md` & `DOCS/AG-Historico-Cambios.md`: Documentación oficial actualizada.
