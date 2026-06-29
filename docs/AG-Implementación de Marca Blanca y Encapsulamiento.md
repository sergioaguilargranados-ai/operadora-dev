# Implementación de Marca Blanca y Encapsulamiento (Mobile PWA)

Este documento detalla la arquitectura técnica y los cambios implementados para lograr la lógica de Marca Blanca (White Label) en la aplicación móvil, así como el aislamiento (encapsulamiento) de las rutas para separar la experiencia del cliente final (viajero) de la del agente o administrador.

---

## 1. Modelo de Datos y Vinculación de Usuarios

### Problema
Inicialmente, no todos los usuarios estaban fuertemente vinculados a un *tenant* (agencia) de manera directa en la tabla base de usuarios.

### Solución
- **Adición de `tenant_id`:** Se agregó la columna `tenant_id` (INT) a la tabla `users` como llave foránea conectada a `tenants.id`.
- **Comportamiento Predeterminado:** Los usuarios que no tienen un *tenant* específico toman por defecto el `tenant_id = 1` correspondiente a la agencia central (AS Operadora).
- **Ventaja:** Esto permite vincular a cualquier usuario (agente o viajero) directa y permanentemente a una agencia desde el momento de su registro, agilizando las consultas en todo el sistema sin depender exclusivamente de tablas intermedias (`tenant_users`).

---

## 2. Login Móvil en Dos Pasos (Identidad Dinámica)

### Problema
Para publicar una única aplicación genérica en las tiendas (App Store / Google Play) o como una única URL PWA, el sistema no tiene forma de saber a qué agencia pertenece un usuario antes de iniciar sesión.

### Solución: Flujo "Two-Step Login"
Se modificó el componente principal del Login (`src/app/mobile/login/page.tsx`) para funcionar en dos fases:

1. **Paso 1 (Identificación Neutra):** 
   Se solicita únicamente el **Correo electrónico** con un diseño neutro, utilizando por defecto el logotipo y marca de AS Operadora (o la marca configurada en el subdominio principal).
2. **Endpoint de Búsqueda:** 
   Al presionar "Siguiente", el cliente invoca al nuevo endpoint `/api/mobile/tenant-lookup?email=...`. Este endpoint busca al usuario en la base de datos, extrae su `tenant_id`, y recupera la configuración visual de la tabla `white_label_config` o `tenants` (logotipo, color primario y nombre de la empresa).
3. **Paso 2 (Transición Dinámica):** 
   Si el correo pertenece a una agencia en particular (ej. Viajes del Sol), la pantalla transiciona suavemente. El logotipo original es reemplazado por el de la agencia y los colores de los botones cambian a los del *tenant*. Finalmente, se despliega el campo de **Contraseña** para completar el inicio de sesión bajo un entorno visual 100% marca blanca.

---

## 3. Aislamiento y Seguridad (Middleware)

### Problema
Dado que la PWA y el Dashboard Administrativo viven en el mismo ecosistema de Next.js (`src/app/mobile` vs `src/app/dashboard`), un usuario viajero podría, en teoría, intentar acceder a rutas administrativas tecleando `/dashboard`, o un administrador podría terminar en la vista de viajeros (`/mobile`).

### Solución: Encapsulamiento por Rol y Ruta
Se establecieron reglas restrictivas de alcance global en el archivo `src/middleware.ts` para crear un aislamiento (sandbox):

- **Aislamiento del Cliente (Viajeros):**
  Si un usuario autenticado tiene un rol de nivel cliente (`role === 'CLIENT'`), **se le bloquea terminantemente el acceso** a las rutas que comiencen con `/dashboard` o `/portal`. Cualquier intento de acceso a estas rutas lo redirigirá de manera forzada a `/mobile`.
  
- **Aislamiento Administrativo (Agentes/Admins):**
  A la inversa, si el usuario tiene un perfil administrativo o de agente (`role !== 'CLIENT'`), **se le bloquea el acceso al entorno PWA** (`/mobile`). Cualquier intento de entrar a la PWA lo devolverá inmediatamente a `/dashboard`. Esto garantiza la completa separación de las experiencias.

---

## 4. Consideraciones Futuras (Subdominios)

De momento, el encapsulamiento se basa en el **path** (`/mobile` vs `/dashboard`) y el **rol**. 
Para perfeccionar el encapsulamiento, especialmente a nivel DNS y visibilidad en navegador, se recomienda (en una fase posterior) establecer la PWA bajo un subdominio estrictamente separado:

- **PWA Viajeros:** `app.asoperadora.com` o `viajes.asoperadora.com` (Redirige su tráfico estricto a las rutas `/mobile` ocultando el path en la URL).
- **Portal de Agentes:** `portal.asoperadora.com` (Redirige su tráfico estricto a `/dashboard`).

Esto brindaría la posibilidad de que, al abrir la aplicación a través del subdominio de una agencia específica (ej. `viajesdelsol.asoperadora.com`), el logotipo y la marca de la agencia puedan cargarse en el **Paso 1** sin siquiera necesidad de ingresar el correo previamente.
