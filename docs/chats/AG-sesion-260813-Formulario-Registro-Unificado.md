# AG-Sesión: Formulario Unificado de Registro (/registro-leads) y Ajustes de Acceso v2.469

> **Fecha:** 2026-08-13 21:56 CST  
> **Versión alcanzada:** `v2.469`  
> **Repositorio:** `operadora-dev` (`origin/dev`)  

---

## 📋 Resumen de Requerimientos y Solución

### 1. Deshabilitación de Registro en Pantalla de Acceso (`/login`)
- **Problema/Confusión:** La opción "¿No tienes una cuenta? Regístrate gratis" dentro de la pantalla de inicio de sesión llevaba a un formulario independiente (`/registro`) que no contenía el selector de roles del portal.
- **Solución:** Se deshabilitó temporalmente dicha opción en `src/app/login/page.tsx` para canalizar todo el registro a través del flujo principal del portal (`/registro-leads`).

### 2. Formulario Unificado de Registro por Perfiles (`/registro-leads`)
- **Comportamiento:**
  - El botón "Soy viajero" del header, hero y footer de la página principal direcciona a `/registro-leads?type=Viajero`.
  - El selector visual de 5 roles está presente para todos los usuarios:
    1. **Viajero** (icono `Plane`)
    2. **Agencia de Viajes** (icono `Briefcase`)
    3. **Agencia de Eventos** (icono `Users`)
    4. **Empresa** (icono `Building`)
    5. **Proveedor** (icono `Globe`)
- **Campos Incorporados para Todos los Perfiles:**
  - **Nombre Completo \***
  - **Correo Electrónico \***
  - **Teléfono (opcional)**
  - **Nombre de la Empresa/Agencia \*** *(si el tipo no es Viajero)*
  - **¿Qué producto o servicio provee? \*** *(si el tipo es Proveedor)*
  - **Código de invitación (opcional)** *(campo en mayúsculas)*
  - **Contraseña \*** *(mínimo 6 caracteres, con botón de alternancia para ver/ocultar)*
  - **Confirmar contraseña \*** *(con validación en tiempo real de coincidencia)*
  - **Checkbox obligatorio de Términos:**
    `Acepto los términos y condiciones y la política de privacidad` con enlaces directos a `/legal/terminos` y `/legal/privacidad`.

### 3. Backend e Inserción de Datos (`/api/inicio/register`)
- Al enviar el formulario:
  - Valida unicidad de correo en `users` y `crm_contacts`.
  - Encripta la contraseña con `bcrypt.hash(password, 10)`.
  - Si es **Viajero**: Crea el registro de usuario en estado `active` y rol `cliente`.
  - Si es **B2B** (Agencia, Empresa, Proveedor): Crea el usuario en estado `pending` y registra el lead en `expo_leads` y `crm_contacts`.
  - Envía correo de bienvenida corporativo vía `sendLandingWelcomeEmail`.

---

## 📁 Archivos Modificados
- `src/app/login/page.tsx`: Deshabilitación del enlace de registro en `/login`.
- `src/app/page.tsx`: Enrutamiento de todos los botones de registro a `/registro-leads`.
- `src/app/registro-leads/page.tsx`: Formulario unificado con selector de roles, contraseña, confirmación, código de invitación y términos.
- `src/app/api/inicio/register/route.ts`: Procesamiento de contraseña con bcrypt y creación en `users`, `expo_leads` y CRM.
- `docs/AG-Contexto-Proyecto.md`: Registro de versión `v2.469`.
- Footers y componentes de marca blanca actualizados a `v2.469`.
