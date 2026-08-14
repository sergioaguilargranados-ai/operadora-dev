# AG-Sesión: Formulario Unificado de Registro (/registro-leads) y Creación en Catálogo Maestro de Usuarios v2.470

> **Fecha:** 2026-08-13 22:15 CST  
> **Versión alcanzada:** `v2.470`  
> **Repositorio:** `operadora-dev` (`origin/dev`)  

---

## 📋 Resumen de Requerimientos y Solución

### 1. Deshabilitación de Registro en Pantalla de Acceso (`/login`)
- Se deshabilitó temporalmente la opción "¿No tienes una cuenta? Regístrate gratis" en `src/app/login/page.tsx` para canalizar todo el registro a través del flujo principal del portal (`/registro-leads`).

### 2. Formulario Unificado de Registro por Perfiles (`/registro-leads`)
- El botón "Soy viajero" del header, hero y footer de la página principal direcciona a `/registro-leads?type=Viajero`.
- Selector interactivo de 5 roles:
  1. **Viajero** (icono `Plane`)
  2. **Agencia de Viajes** (icono `Briefcase`)
  3. **Agencia de Eventos** (icono `Users`)
  4. **Empresa** (icono `Building`)
  5. **Proveedor** (icono `Globe`)
- Campos implementados para todos los perfiles:
  - Nombre Completo *
  - Correo Electrónico *
  - Teléfono (opcional)
  - Nombre de la Empresa/Agencia * (si el tipo no es Viajero)
  - ¿Qué producto o servicio provee? * (si el tipo es Proveedor)
  - Código de invitación (opcional)
  - Contraseña * (mínimo 6 caracteres con botón toggle para ver/ocultar)
  - Confirmar contraseña * (con validación de coincidencia)
  - Checkbox obligatorio: Acepto los términos y condiciones y la política de privacidad.

### 3. Creación Inmediata de Usuario en la Tabla `users` y Catálogo Maestro (`/api/inicio/register`)
- **Problema detectado:** El query anterior intentaba insertar columnas no existentes (`status`, `company_name`) en la tabla `users`, lo que provocaba que se guardara en `expo_leads` y CRM pero no en el catálogo maestro de usuarios (`/dashboard/admin/users`).
- **Solución implementada:**
  - Se alineó la consulta a la estructura real de PostgreSQL: `(name, email, password_hash, phone, role, is_active, created_at, updated_at)`.
  - Roles mapeados al estándar del sistema:
    - **Viajero:** `CLIENT`
    - **Agencia de Viajes / Eventos:** `AGENCY`
    - **Empresa:** `CORPORATE`
    - **Proveedor:** `PROVIDER`
  - Estatus activo: `is_active = true`.
  - Enlace bidireccional: Se captura el `user_id` generado y se asocia al nuevo contacto en `crm_contacts`.
  - Ahora cada registro crea al instante tanto el contacto en el CRM como el usuario en el **Catálogo Maestro de Usuarios** (`/dashboard/admin/users`).

---

## 📁 Archivos Modificados
- `src/app/login/page.tsx`: Deshabilitación del enlace de registro en `/login`.
- `src/app/page.tsx`: Enrutamiento de todos los botones de registro a `/registro-leads`.
- `src/app/registro-leads/page.tsx`: Formulario unificado con selector de roles, contraseña, confirmación, código de invitación y términos.
- `src/app/api/inicio/register/route.ts`: Inserción correcta y segura en `users` con bcrypt y linking a `crm_contacts`.
- `docs/AG-Contexto-Proyecto.md`: Registro de versión `v2.470`.
- Footers y componentes de marca blanca actualizados a `v2.470`.
