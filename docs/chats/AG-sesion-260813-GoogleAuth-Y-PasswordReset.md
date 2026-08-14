# AG-Sesión: Corrección de Autenticación Google OAuth y Recuperación de Contraseña v2.466

> **Fecha:** 2026-08-13 21:12 CST  
> **Versión alcanzada:** `v2.466`  
> **Repositorio:** `operadora-dev` (`origin/main`)  

---

## Resumen de Problemas y Diagnóstico

### 1. Error de Autenticación con Google ("Configuración de Google no disponible. Contacta al administrador.")
* **Causa:** En la app de Next.js, `process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID` se inyecta estáticamente en el bundle JS durante la compilación en Vercel. Si dicha variable de entorno no estaba configurada al compilar en Vercel, el frontend recibe `""`, detonando el bloqueo de seguridad.
* **Solución Implementada:**
  1. **Servicio Server-Side Dynamic OAuth (`src/app/api/auth/google/route.ts`):** Se creó una API route que lee `GOOGLE_CLIENT_ID` o `NEXT_PUBLIC_GOOGLE_CLIENT_ID` en tiempo de ejecución (runtime).
  2. **Manejo de Fallback en Cliente (`login/page.tsx` y `registro/page.tsx`):** Si la variable estática no viene en el bundle cliente, el botón redirige automáticamente a `/api/auth/google`, permitiendo autenticarse si la variable existe en las server functions de Vercel.
  3. **Adición de Botón en Registro:** Se incorporó la opción de registro rápido con Google en `/registro`.
  4. **Notificaciones Claras de Error:** Se capturan los parámetros `?error=config_missing`, `?error=oauth_cancelled`, etc., informando exactamente al usuario/administrador cómo resolver la configuración si faltan credenciales en Vercel o Google Cloud Console.

### 2. Formulario "Recuperar Contraseña" sin reacción
* **Causa:** El archivo `src/app/forgot-password/page.tsx` era un maquetado estático JSX que carecía de manejador `onSubmit`, estados React y llamada HTTP al backend.
* **Solución Implementada:**
  1. **Conexión con Backend (`/api/auth/forgot-password`):** Se transformó `src/app/forgot-password/page.tsx` en un formulario completamente funcional con estado de carga, validación de correo y comunicación con la API de SendGrid/SMTP.
  2. **Página de Restablecimiento (`src/app/reset-password/page.tsx`):** Se creó la interfaz que recibe el token por URL (`?token=...`), lo valida contra la base de datos (`GET /api/auth/reset-password`), permite ingresar la nueva contraseña y confirma el cambio (`POST /api/auth/reset-password`).

---

## Pasos para el Administrador (Vercel & Google Cloud Console)

Para garantizar el funcionamiento de Google OAuth en la URL pública (`https://www.as-ope-viajes.company/` o `https://app.asoperadora.com/`):

1. **Vercel Dashboard:**
   - Ir a **Settings** -> **Environment Variables**.
   - Agregar / Verificar las siguientes variables:
     - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = `<TU_GOOGLE_CLIENT_ID>`
     - `GOOGLE_CLIENT_ID` = `<TU_GOOGLE_CLIENT_ID>`
     - `GOOGLE_CLIENT_SECRET` = `<TU_GOOGLE_CLIENT_SECRET>`
     - `NEXT_PUBLIC_APP_URL` = `https://www.as-ope-viajes.company` (o el dominio principal asignado).
   - Re-desplegar (Redeploy) el proyecto en Vercel.

2. **Google Cloud Console:**
   - Ir a **APIs & Services** -> **Credentials** -> cliente OAuth.
   - En **URI de redireccionamiento autorizados**, agregar:
     - `https://www.as-ope-viajes.company/api/auth/google/callback`
     - `https://app.asoperadora.com/api/auth/google/callback`
     - `http://localhost:3000/api/auth/google/callback`

---

## Archivos Creados / Modificados
- `src/app/api/auth/google/route.ts` *(Nuevo)*
- `src/app/reset-password/page.tsx` *(Nuevo)*
- `src/app/login/page.tsx` *(Modificado)*
- `src/app/registro/page.tsx` *(Modificado)*
- `src/app/forgot-password/page.tsx` *(Modificado)*
- `docs/AG-Contexto-Proyecto.md` *(Actualizado v2.466)*
- `docs/AG-Historico-Cambios.md` *(Actualizado v2.466)*
- `docs/chats/AG-sesion-260813-GoogleAuth-Y-PasswordReset.md` *(Nuevo)*
