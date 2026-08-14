# AG-Sesión: Formulario Unificado de Registro, Aprobación Administrativa y Correo Automático v2.471

> **Fecha:** 2026-08-13 22:33 CST  
> **Versión alcanzada:** `v2.471`  
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

### 3. Registro con Estatus Inactivo (`is_active: false`)
- Al registrarse cualquier usuario (Viajero, Agencia, Empresa, Proveedor) en `/registro-leads`:
  - Se crea la cuenta en la tabla `users` con **`is_active = false`** (Inactivo).
  - Si el usuario intenta iniciar sesión antes de ser aprobado, el sistema le notifica: *"Tu cuenta está pendiente de aprobación por el administrador"*.

### 4. Aprobación y Disparo Automático de Correo Institucional (`PUT /api/admin/users`)
- En el **Catálogo Maestro de Usuarios** (`/dashboard/admin/users`), el administrador puede revisar a los usuarios registrados.
- Al alternar el estatus de un usuario a **Activo** (`is_active: true`):
  - El backend detecta el cambio de estado (`!prevUser.is_active && is_active === true`).
  - Se invoca la función `sendAccountApprovedEmail` (`src/lib/emailHelper.ts`).
  - Se envía automáticamente un correo electrónico con plantilla institucional:
    - **Header:** AS Operadora de Viajes y Eventos.
    - **Banner:** ¡Cuenta Aprobada y Activada! con ícono de check.
    - **Cuerpo:** Mensaje personalizado informando que su solicitud ha sido revisada y aprobada exitosamente.
    - **Cuadrícula de detalles:** Nombre completo, correo de acceso, tipo de perfil y estatus activo.
    - **Botón CTA:** `[ Iniciar Sesión en el Portal ]` direccionando a `/login`.
    - **Footer:** Canales de contacto y dirección fiscal corporativa.

---

## 📁 Archivos Modificados
- `src/app/api/inicio/register/route.ts`: Creación de usuarios con `is_active: false` por defecto.
- `src/services/AuthService.ts`: Validación de `is_active === false` durante el inicio de sesión.
- `src/lib/emailHelper.ts`: Función `sendAccountApprovedEmail` con plantilla corporativa.
- `src/app/api/admin/users/route.ts`: Disparador automático de email al activar usuarios en `PUT`.
- `docs/AG-Contexto-Proyecto.md`: Registro de versión `v2.471`.
- Footers y componentes de marca blanca actualizados a `v2.471`.
