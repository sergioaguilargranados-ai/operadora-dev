# AG-Sesión: Formulario Unificado de Registro, Aprobación Administrativa y Correo Automático v2.473

> **Fecha:** 2026-08-13 23:27 CST  
> **Versión alcanzada:** `v2.473`  
> **Repositorio:** `operadora-dev` (`origin/dev`)  

---

## 📋 Resumen de Requerimientos y Solución

### 1. Deshabilitación de Registro en Pantalla de Acceso (`/login`)
- Se deshabilitó temporalmente la opción "¿No tienes una cuenta? Regístrate gratis" en `src/app/login/page.tsx` para canalizar todo el registro a través del flujo principal del portal (`/registro-leads`).

### 2. Formulario Unificado de Registro por Perfiles (`/registro-leads`)
- El botón "Soy viajero" del header, hero y footer de la página principal direcciona a `/registro-leads?type=Viajero`.
- Selector interactivo de 5 roles: Viajero, Agencia de Viajes, Agencia de Eventos, Empresa y Proveedor.
- Campos implementados: Nombre, Email, Teléfono, Empresa, Contraseña, Confirmación, Código de invitación y Checkbox de Términos y Condiciones.

### 3. Registro con Estatus Inactivo (`is_active: false`)
- Al registrarse cualquier usuario, la cuenta se crea en la tabla `users` con **`is_active = false`** (Inactivo).
- Si intenta iniciar sesión antes de ser aprobado, el login indica: *"Tu cuenta está pendiente de aprobación por el administrador"*.

### 4. Aprobación y Disparo Automático de Correo Institucional (`PUT /api/admin/users`)
- En el **Catálogo Maestro de Usuarios** (`/dashboard/admin/users`), al alternar el estatus a **Activo** (`is_active: true`), se envía automáticamente el correo de confirmación de activación.

### 5. Parámetros de Marca Blanca en Correos Institucionales (`src/lib/email/EmailTemplates.ts` y `emailHelper.ts`)
- **Botón CTA:** Direcciona directamente a la pantalla de acceso [`https://www.as-ope-viajes.company/login`](https://www.as-ope-viajes.company/login).
- **Teléfono de Contacto:** `+52 720 815 6804` (con enlace `tel:+527208156804`).
- **Correo de Contacto:** Dirección de envío de mensajes configurada en el sistema (`contacto@asoperadora.com` / emisor SMTP / Resend).
- **Nombre de Empresa y URL:** Ajustados a los parámetros de Marca Blanca de AS Operadora de Viajes y Eventos.

---

## 📁 Archivos Modificados
- `src/lib/email/EmailTemplates.ts`: Parámetros dinámicos de Marca Blanca para teléfono, email, logo y enlaces.
- `src/lib/emailHelper.ts`: Integración de parámetros de marca blanca en `sendAccountApprovedEmail`.
- `src/app/api/admin/users/route.ts`: Endpoint `DELETE` y `PUT` con disparador de correos.
- `src/app/dashboard/admin/users/page.tsx`: Botón de papelera y confirmación de eliminación en la tabla.
- `src/app/api/inicio/register/route.ts`: Creación de usuarios con `is_active: false` por defecto.
- `src/services/AuthService.ts`: Validación de `is_active === false` durante el inicio de sesión.
- `docs/AG-Contexto-Proyecto.md`: Registro de versión `v2.473`.
