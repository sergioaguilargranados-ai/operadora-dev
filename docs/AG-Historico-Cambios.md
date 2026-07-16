# 📋 AG-Histórico de Cambios - AS Operadora

**Última actualización:** 01 de Julio de 2026 - 17:46 CST  
**Versión actual:** v2.360  
**Actualizado por:** AntiGravity AI Assistant  
**Propósito:** Documento maestro del proyecto para trabajo con agentes AntiGravity

---

## 📅 HISTORIAL DE CAMBIOS

### v2.425 - 16 de Julio de 2026 - 01:38 CST
**🛠️ Correcciones Menores de PWA y CRM**
- **IA en PWA:** Corrección en el query SQL (se eliminó la columna inexistente `service_name`) en `/api/rewards/recommendations` y `/api/rewards/challenges` para que el sistema detone correctamente OpenAI y genere las recomendaciones y retos en tiempo real en la PWA en lugar de los textos de fallback.
- **Pagos Pendientes PWA:** Corrección en la ruta `/api/mobile/payments/pending` para que lea correctamente el parámetro `user_id` desde los `searchParams` y despliegue los saldos pendientes reales en vez de retornar `401 Unauthorized`.
- **Notificaciones CRM:** Solución del fallo silencioso 404 al intentar enviar notificaciones con destinatario "todos". Se cambió la sensibilidad de mayúsculas/minúsculas en el query (ahora usa `ILIKE 'client'`) dado que el rol en DB es 'CLIENT'.
- **Contexto:** Se agregó el URL `https://www.as-ope-viajes.company/` en el documento de contexto `AG-Contexto-Proyecto.md`.

### v2.424 - 15 de Julio de 2026 - 13:25 CST
**🚀 6 Mejoras Funcionales y Visuales de la PWA**
- **Footer Fijo y Widgets:** Footer adaptado a `fixed` con `backdrop-blur`, reubicación de la versión de compilación y ajuste de los widgets de WhatsApp/Chat a un tamaño más sutil (44px).
- **Wishlist Activa:** Implementación completa con base de datos, API (`/api/wishlist`) y nueva vista para gestión interactiva de souvenirs favoritos.
- **Calculadora de Divisas:** Componente modal `CurrencyCalculator.tsx` para conversión de MXN a monedas destino (EUR, USD, etc.) e inyección desde un cron nocturno.
- **Mapa de Ruta Premium:** Componente visual con estilo JSON minimalista de Google Maps que traza dinámicamente las ciudades del itinerario con flechas de avance.
- **Pronóstico del Clima:** Conexión con OpenWeatherMap para mostrar la predicción de los próximos días directo en el itinerario de la PWA, guardado en la base de datos `weather_forecasts` y automatizado vía cron.
- **Panel de Ejecución de Procesos:** Se rediseñó la pestaña de MegaTravel en `Gestión de Contenido` para incluir un panel unificado de ejecución manual de crons (Tipos de Cambio, Clima) con terminal de logs en tiempo real mediante el nuevo componente `CronProcessRunner`.
### v2.360 - 01 de Julio de 2026 - 17:46 CST
**🤖 Motor de Contenido Turístico con IA (Gemini & Unsplash)**
- **Motor Backend:** Creación de `destination_content` en BD y servicio `DestinationContentService` para generar datos de gastronomía, imperdibles, frases, info práctica, clima y enchufes usando Gemini 2.0 Flash y fotos reales de Unsplash.
- **Panel Administrativo:** Nueva pestaña "Destinos (IA)" en el gestor de contenido (`/admin/content`) para revisar el caché generado y regenerar destinos forzadamente.
- **Auto-Enriquecimiento de Itinerarios:** El guardado de un itinerario detona el enriquecimiento automático del destino en segundo plano. Se agregó también un botón manual "IA" en la tabla de itinerarios.
- **PWA Dinámica:** La vista del día en la App Móvil PWA (`dia/[dayIndex]/page.tsx`) ahora consume directamente la información estructurada de la IA de forma dinámica, eliminando dependencias de textos hardcodeados.

### v2.359 - 28 de Junio de 2026 - 22:25 CST
**🛠️ Corrección de Bug en Dashboard Agencia**
- **Dashboard Agencia:** Se corrigió un error en el tab de clientes (`src/app/dashboard/agency/page.tsx`) que provocaba la caída de la aplicación (`TypeError: W.map is not a function`). El estado de los clientes estaba recibiendo el objeto completo de la respuesta de la API (`{ clients, agents }`) en lugar del arreglo de clientes.

### v2.357 - 26 de Junio de 2026 - 00:45 CST
**🚀 Soporte Offline y Rediseño Completo de Interfaz PWA & Admin**
- **Soporte Offline:** Se configuró PWA con `sw.ts` para habilitar caché de red (Service Worker) y se añadió el componente `OfflineBanner.tsx` en el layout móvil.
- **Rediseño Móvil Premium:** Se renovaron las vistas principales de la PWA (Login, Perfil, Rewards, Ayuda) implementando un diseño premium y limpio.
- **Dashboard Móvil (Hero Plane):** Se reemplazó el menú de navegación en `/mobile`, integrando un fondo tipo hero con un ícono de avión vectorizado y tarjetas modernas.
- **Tienda y Detalle de Producto:** Se implementó `/mobile/tienda/[id]` con un estilo "Mercado Libre", carrusel de imágenes, descripción y botón adhesivo de añadir al carrito.
- **Itinerario Dinámico:** Mega-vista de `/mobile/itinerario/[id]` con sliders horizontales para gastronomía, turismo y souvenirs, además de información utilitaria (traductor, números de emergencia, frases).
- **Importación Masiva (Excel/CSV):** Se añadieron botones de "Descargar Plantilla" e "Importar Archivo" (con explorador nativo y simulación frontend) en las vistas de "Mis Reservas" y el "CRM de Clientes".
- **Panel Administrativo de Usuarios:** Se creó la ruta `/dashboard/admin/users` con tabla interactiva, badges por rol y módulo de importación masiva de usuarios, referenciada en el menú del perfil.
### v2.356 - 25 de Junio de 2026 - 19:05 CST
**🎨 Marca Blanca Completa, Logo Móvil, Slogan y Secciones Parametrizadas PWA**
- **Persistencia de Marca Blanca**: Se modificó la interfaz de administración de inquilinos (`src/app/admin/tenants/page.tsx`) para guardar de manera efectiva los campos visuales (`logo_url`, `logo_mobile_url`, `primary_color`, `secondary_color`, `accent_color`, `custom_domain` y `slogan`) enviándolos correctamente al backend.
- **Logotipos Duales**: Se implementaron selectores `ImageUploadInput` (Vercel Blob) para cargar y configurar por separado el logotipo de la Landing Web y el de la App Móvil PWA.
- **Secciones Dinámicas de la PWA**: Se ejecutó la migración `047_add_sections_json_to_mobile_content.sql` para añadir la columna `sections_json`. Se agregaron los paneles editores para la sección "Banner Promocional" y la sección de "Catálogos de Viaje" (imágenes de vuelos, hoteles y paquetes).
- **Home & Tienda Móvil**: Se modificaron las páginas `/mobile` y `/mobile/tienda` para inyectar y pintar dinámicamente los banners, promociones y catálogos en base a lo guardado en el administrador de contenidos.
- **Corrección de Redirección CRM**: Se reparó la redirección rota del dashboard general al catálogo de clientes (apuntaba a `/dashboard/clientes` en lugar del path real del CRM `/dashboard/crm/clientes`).

### v2.355 - 25 de Junio de 2026 - 10:10 CST
**📱 Aplicación Móvil en formato PWA & Panel Administrador**
- **Base de Datos**: Se implementó la tabla `mobile_app_content` con aislamiento por Tenant para almacenar frase de bienvenida, logotipos, banners de inicio y tienda y contactos de soporte.
- **Ruta PWA móvil (`/mobile`)**: Se maquetaron las pantallas responsivas de Login, Home Premium, Tienda de viajes y Mapa interactivo geolocalizado, con redirección y seguridad dinámica en base al inquilino (Tenant) del usuario en sesión.
- **Panel Administrativo**: Se integró la pestaña **App Móvil PWA** en la sección de administración de contenido con subida automática de archivos a Vercel Blob e inyección de datos semilla (Seed) iniciales.

### v2.354 - 22 de Junio de 2026 - 11:25 CST

**🖼️ Módulo de Gestión de Contenido: Estandarización de Subida de Imágenes**
- Se reemplazaron los inputs de imágenes tradicionales y el sistema de subida en línea por el componente `ImageUploadInput` en el archivo `ContentModal.tsx`.
- Ahora, las secciones de **Banner**, **Promociones**, **Vuelos** y **Paquetes** soportan directamente la subida de archivos al Vercel Blob Storage de manera estándar y mejorada, siguiendo el mismo comportamiento que se había desarrollado para la **Landing Principal**.
- Se agregó soporte para el atributo `required` en el componente `ImageUploadInput` para mantener la validación de formularios.

### v2.353 - 18 de Junio de 2026 - 11:25 CST
**✈️🏨 Arquitectura Multi-Proveedor (Duffel, Hotelbeds, RateHawk)**
- **Modelos Unificados**: Se implementó una capa Core de modelos e interfaces comunes en `src/types/unified-travel.ts` y `src/types/providers.ts`.
- **Patrón Adaptador**: Se crearon `DuffelAdapter`, `HotelbedsAdapter` y `RatehawkAdapter` para encapsular la lógica propietaria de cada API.
- **Agregadores Paralelos**: Se añadieron `FlightAggregator` y `HotelAggregator` que consultan APIs concurrentemente y deduplican ofertas.
- **Interfaces Web**: Se crearon `/vuelos` y `/hoteles` con formularios integrados a la nueva capa de agregación.
- **Auth Hotelbeds**: Se configuró firma segura (SHA256) requerida por el API de disponibilidad.
- **SDK Duffel**: Instalación e integración base con `@duffel/api`.

### v2.352 - 15 de Junio de 2026 - 10:59 CST

**🚀 Reestructuración Arquitectónica de Rutas (Landing vs Portal)**
- **Landing Pública en Raíz:** Se movió la landing informativa de `/inicio` a `/`.
- **Portal Privado:** Se reubicó todo el portal transaccional de `/` a `/portal`.
- **Middleware Actualizado:** Se implementó protección de la ruta `/portal` y redirección inteligente (si un usuario con sesión entra a `/`, es redirigido automáticamente a `/portal`).
- **Flujo de Login:** Al iniciar sesión exitosamente en `/login`, el usuario ahora es redirigido a `/portal`.
- **Respaldos de Seguridad:** Se crearon copias de los archivos originales como `.backup-landing` y `.backup-portal` por si se requiere un reverso rápido.

---

### v2.351 - 13 de Junio de 2026 - 19:55 CST

**🛠️ Backend & Landing Updates**
- **Vercel Blob:** Se adaptó `upload-image/route.ts` para aceptar la variable `b_READ_WRITE_TOKEN` generada por Vercel para subir imágenes desde el administrador de Landing.
- **Correos Corporativos:** El registro ahora utiliza el layout oficial `sendLandingWelcomeEmail` en vez de HTML puro.
- **Next.js Caching:** Se forzó `export const dynamic = 'force-dynamic'` en el endpoint de content para evitar que la Landing consumiera datos cacheados por build.
- **Base de Datos:** Se corrigió el GET para forzar `WHERE id = 1` y evitar el conflicto con filas fantasma en Neon DB.
- **URLs de Imágenes:** Se corrigieron las `<img src...>` de la Landing Page para aceptar URLs absolutas.
- **Chatbot Styling:** Se migró el color del chat de azul a negro y blanco para alinear con los tonos institucionales.

---

### v2.345 - 06 de Junio de 2026 - 10:40 CST

**Causa raÃ­z:** El setting se inicializa en `'false'` por el script `add-home-settings.js`. No se habÃ­a activado manualmente despuÃ©s del setup.

**CorrecciÃ³n aplicada:**
- âœ… Actualizado `HOME_SEARCH_HOTELS = 'true'` en tabla `app_settings` (Neon PostgreSQL)
- âœ… Script creado: `scripts/enable-hotel-search.js` para referencia futura

**Archivos modificados:**
- `scripts/enable-hotel-search.js` â€” Script de habilitaciÃ³n (nuevo, referencia)
- `src/components/BrandFooter.tsx` â€” Bump versiÃ³n v2.345
- `docs/AG-Historico-Cambios.md` â€” Esta entrada

---

### v2.344 - 28 de Mayo de 2026 - 22:27 CST

**ðŸš€ Completada Fase 7: Data Seeding RRHH y AclaraciÃ³n de Ambientes**

**Objetivo:** Poblado inicial del mÃ³dulo de Recursos Humanos y documentaciÃ³n de estrategia de versionado y despliegue.

**Cambios Backend:**
- âœ… **Data Seeding:** Creado script `scripts/seed_hr.ts` que inyectÃ³ datos realistas en la base de datos de producciÃ³n (Neon PostgreSQL).
- âœ… **Datos RRHH Creados:** 3 departamentos, 5 posiciones, 10 empleados con datos de MÃ©xico (RFC, CURP, NSS), 10 contratos activos, registros de asistencia de 5 dÃ­as, solicitudes de ausencia y 1 pipeline de reclutamiento activo.
- âœ… **ConfiguraciÃ³n DB:** El script maneja correctamente la conexiÃ³n a base de datos externa cargando variables desde `.env.local` y mapeando la columna `company_name`.

**Cambios de ConfiguraciÃ³n de Proyecto (DocumentaciÃ³n):**
- âœ… **Ambiente de Pruebas y LiberaciÃ³n:** Se ha formalizado en `AG-Contexto-Proyecto.md` que el repositorio `operadora-dev` serÃ¡ utilizado como **ambiente de pruebas y liberaciÃ³n oficial**.
- âœ… **Repositorio Legacy:** El repositorio `as-operadora` se marca estrictamente como legacy/producciÃ³n anterior, desaconsejando nuevos push hacia Ã©l para despliegues de pruebas.
- âœ… **ActualizaciÃ³n Contexto:** Instrucciones claras sobre `git remote` y flujos de despliegue para usar `operadora-dev` como fuente de la verdad para liberaciones.

**Archivos Modificados:**
- `docs/AG-Contexto-Proyecto.md`
- `docs/AG-Historico-Cambios.md`
- `task.md`

**Archivos Creados:**
- `scripts/seed_hr.ts`

---


### v2.343 - 07 de Mayo de 2026 - 13:00 CST

**ðŸš€ EstabilizaciÃ³n de Scraping MegaTravel + Resiliencia de SesiÃ³n**

**Objetivo:** Resolver errores de "Token Expirado" en procesos largos y unificar la seguridad de las APIs administrativas.

**Cambios Backend:**
- âœ… **Nueva Utilidad de Auth Admin:** `src/lib/admin-auth.ts` centraliza la validaciÃ³n de tokens y cookies.
- âœ… **Fallback Robustificado:** El fallback a la cookie `as_user` ahora es mÃ¡s confiable y maneja decodificaciÃ³n URI correctamente, permitiendo que el scraping continÃºe aunque el JWT expire.
- âœ… **Google One Tap Mejorado:** Ahora genera y almacena `refreshToken` en la base de datos y `localStorage`, permitiendo la renovaciÃ³n de sesiÃ³n para usuarios de Google.
- âœ… **Seguridad Incremental:** AÃ±adida protecciÃ³n de admin a los endpoints `discover-tours` y `rescrape-tour` que estaban pÃºblicos.
- âœ… **RefactorizaciÃ³n de APIs:** `megatravel`, `scrape-all`, `discover-tours` y `rescrape-tour` ahora usan la lÃ³gica unificada de `verifyAdminAuth`.

**Cambios Frontend:**
- âœ… **Resiliencia en Scraping:** La pÃ¡gina de scraping ya no se detiene ante fallos de renovaciÃ³n de token; intenta continuar usando la sesiÃ³n persistente y registra logs detallados.
- âœ… **Logging Detallado:** Mejora en los logs de la consola y de la interfaz para diagnosticar problemas de autenticaciÃ³n en tiempo real.
- âœ… **Persistencia Google:** `GoogleOneTap.tsx` ahora guarda el `as_refresh` para mantener la paridad con el flujo de login estÃ¡ndar.

**Archivos Modificados:**
- `src/app/admin/megatravel-scraping/page.tsx`
- `src/app/api/admin/scrape-all/route.ts`
- `src/app/api/admin/discover-tours/route.ts`
- `src/app/api/admin/megatravel/route.ts`
- `src/app/api/admin/rescrape-tour/route.ts`
- `src/app/api/auth/google-one-tap/route.ts`
- `src/components/auth/GoogleOneTap.tsx`
- `docs/AG-Historico-Cambios.md`

**Archivos Creados:**
- `src/lib/admin-auth.ts`

**Cifra de Control:**
- T: 62 | C: 620 (Sin cambios en estructura de tablas)

---

### v2.342 - 21 de Marzo de 2026 - 13:07 CST

**ðŸ”‘ Fix Token MegaTravel â€” Proceso completo no interrumpido por JWT expirado**

**Problema resuelto:**
Al ejecutar el proceso completo (Sync + Scraping) desde `/admin/megatravel-scraping`, la Fase 2 fallaba inmediatamente en el Batch 1 con `âš ï¸� Token expirado, renovando... â�Œ No se pudo renovar la sesiÃ³n`. Causa raÃ­z: el JWT de acceso dura 15 minutos, y si el `refresh_token` en BD (`active_sessions`) ya estaba expirado o nunca existiÃ³ en localStorage, la renovaciÃ³n fallaba silenciosamente.

**Correcciones aplicadas:**

1. **RenovaciÃ³n proactiva al iniciar proceso (`page.tsx`):**
   - Antes de arrancar Fase 1 y Fase 2, el sistema ahora llama a `autoRefreshToken()` sincrÃ³nicamente
   - Si no puede renovar, muestra aviso claro: `âš ï¸� ContinÃºa con sesiÃ³n existente... (si falla 401, inicia sesiÃ³n y reintenta)`
   - Si renueva correctamente: `âœ… SesiÃ³n verificada y renovada correctamente`

2. **RenovaciÃ³n periÃ³dica en Fase 2 cada 5 batches (`page.tsx`):**
   - El proceso de scraping tarda 60-120 min. El token de 15 min expirarÃ­a varias veces
   - Ahora se renueva proactivamente en los batches 6, 11, 16, 21... (~cada 25 min de proceso)
   - Evita llegar al 401 antes de que ocurra

3. **Fallback `as_user` mÃ¡s robusto en API (`scrape-all/route.ts`):**
   - El MÃ©todo 4 de autenticaciÃ³n ahora maneja cookies con y sin `encodeURIComponent`
   - Logs de diagnÃ³stico: si el usuario no tiene rol admin, o si la cookie no se puede parsear, aparece en consola del servidor
   - Advertencia explÃ­cita cuando ningÃºn mÃ©todo de auth funciona

**AcciÃ³n requerida por el usuario:** Iniciar sesiÃ³n antes de ejecutar el proceso (garantiza sesiÃ³n activa en `active_sessions` y `as_refresh` vÃ¡lido en localStorage).

**Archivos modificados:**
```
src/app/admin/megatravel-scraping/page.tsx     (MODIFICADO - renovaciÃ³n proactiva)
src/app/api/admin/scrape-all/route.ts          (MODIFICADO - fallback as_user robusto)
```

---

## ðŸ“� FORMATO DE REGISTRO

Cada versiÃ³n debe incluir:
- **Fecha y Hora** (CST)
- **VersiÃ³n** (v2.XXX)
- **Cambios** realizados
- **Lecciones Aprendidas** (si aplica)
- **Cifra de Control** (Tablas: XX | Campos: YYY)

---

## ðŸ”¢ CIFRA DE CONTROL

La cifra de control se genera con el script:
```bash
node scripts/db-control-cifra.js
```

Indica el estado de la base de datos en cada versiÃ³n:
- **Tablas:** Total de tablas en esquema `public`
- **Campos:** Total de columnas en todas las tablas

Esto permite detectar si se perdieron tablas/campos entre versiones.

---

## ðŸ“… HISTORIAL DE CAMBIOS

### v2.341 - 13 de Marzo de 2026 - 10:32 CST

**ðŸ“¬ Centro de ComunicaciÃ³n: estado de entrega visible en cada mensaje**

**Puntos implementados:**

1. **Badge de estado de entrega en mensajes (Centro de ComunicaciÃ³n):**
   - Cada mensaje outbound (sistema/agente) muestra un badge de estado: âœ… Enviado, â�Œ No entregado, â�³ Pendiente
   - El error exacto del servidor SMTP se muestra en el badge rojo (ej: "535 Incorrect authentication data")
   - Aplica a cotizaciones de tour, respuestas automÃ¡ticas y cualquier comunicaciÃ³n saliente

2. **Nuevo endpoint `/api/communication/messages/deliveries`:**
   - Consulta `message_deliveries` por IDs de mensaje
   - Agrupa por `message_id` para mapeo en UI
   - Robusto ante tabla inexistente (devuelve array vacÃ­o en lugar de error)

3. **emailHelper.ts â€” registro de fallos SMTP:**
   - Cuando el SMTP rechaza el email, guarda `status='failed'` con el `error_message` exacto en `message_deliveries`
   - Permite trazabilidad completa de comunicaciones fallidas

---

### v2.340 - 13 de Marzo de 2026 - 10:07 CST

**ðŸ”� DiagnÃ³stico SMTP + logging mejorado**

1. **Endpoint `/api/test-email`:** DiagnÃ³stico SMTP en producciÃ³n con respuesta JSON detallada (config activa, error exacto del servidor, resultado del envÃ­o)
2. **`emailError` en respuesta API de cotizaciones:** La API devuelve el motivo exacto del fallo en el campo `emailError`
3. **Logging SMTP mejorado:** Captura `message`, `code` y `response` del servidor SMTP en logs de Vercel

---

### v2.339 - 13 de Marzo de 2026 - 09:54 CST

**ðŸŽ¨ Modal elegante reemplaza confirm() nativo del browser**

1. **Modal glassmorphism** en Dashboard de Cotizaciones reemplaza el diÃ¡logo nativo `window.confirm()`:
   - Fondo negro 30% + backdrop-blur-sm
   - Panel `bg-white/90 backdrop-blur-xl` con bordes redondeados 2xl
   - Iconos: CheckCircle2 (pregunta), AlertTriangle (warning), Info (info)
   - Botones: Cancelar neutro | Aceptar azul #0066FF con letras blancas
   - AnimaciÃ³n: fade-in + zoom-in-95

---

### v2.338 - 13 de Marzo de 2026 - 09:21 CST

**ðŸ§® Fix error matemÃ¡tico en cÃ¡lculo de totales de cotizaciÃ³n**

1. **Total por persona siempre calculado desde componentes:** `base + impuestos + suplemento` â€” no confÃ­a en `total_per_person` del DB que podÃ­a estar guardado incompleto en registros histÃ³ricos
2. **LÃ³gica a prueba de registros anteriores:** Si `total_per_person` del DB â‰¤ `price_per_person`, recalcula desde componentes
3. **Corrige vista web Y PDF** â€” ambas secciones usaban `quote.total_price` del DB que era incorrecto
4. **`displayTotalPrice`** calculado como `displayTotalPP Ã— num_personas` â€” consistente en toda la pÃ¡gina

---

### v2.336 - 12 de Marzo de 2026 - 17:25 CST

**ðŸ“§ Email automÃ¡tico + Pre-llenado de contactos + Centro de ComunicaciÃ³n bidireccional**

**Puntos implementados:**

1. **Email automÃ¡tico de confirmaciÃ³n al enviar cotizaciÃ³n:**
   - Al enviar el formulario de cotizaciÃ³n, se envÃ­a inmediatamente un email de confirmaciÃ³n al cliente
   - HTML de marca AS Operadora: header azul gradiente, franja dorada, card con todos los detalles, botÃ³n CTA al seguimiento, footer navy/gold
   - Incluye: nombre del tour, cÃ³digo AS-XXXXX, folio, regiÃ³n, duraciÃ³n, fecha de salida, ciudad de salida, personas, precio base, impuestos, suplemento, total por persona, total estimado
   - Respeta la preferencia de notificaciÃ³n del cliente (email/ambos = envÃ­a, solo whatsapp = no envÃ­a)
   - La respuesta del API ahora indica si el email fue enviado (`emailSent: true/false`)
   - Archivo: `src/app/api/tours/quote/route.ts`

2. **Communication Center completamente bidireccional:**
   - **Mensaje INBOUND (customer):** ReprÃ©senta la solicitud del cliente con todos los detalles del tour
   - **Mensaje OUTBOUND (system):** ConfirmaciÃ³n automÃ¡tica enviada, con URL de seguimiento e indicaciÃ³n del canal usado (email/WhatsApp)
   - Ambos mensajes quedan visibles en el thread del Centro de ComunicaciÃ³n para el equipo
   - Archivo: `src/app/api/tours/quote/route.ts`

3. **Pre-llenado automÃ¡tico de campos de contacto:**
   - Nuevo endpoint GET `/api/tours/quote/contact-lookup?email=...`
   - Busca primero en `crm_contacts` por email (case-insensitive)
   - Si no encuentra, busca en historial de `tour_quotes`
   - Al salir del campo email (onBlur), si el email es vÃ¡lido, llama al endpoint
   - Si encuentra al cliente, pre-llena: nombre, apellido, telÃ©fono y nÃºmero de personas
   - Solo pre-llena campos vacÃ­os (no sobreescribe lo que el usuario ya escribiÃ³)
   - Muestra toast: "âœ… Datos encontrados â€” Hemos pre-llenado tus datos de una solicitud anterior"
   - Archivos: `src/app/api/tours/quote/contact-lookup/route.ts` (NUEVO), `src/app/cotizar-tour/page.tsx`

**Archivos creados/modificados:**
- âœ… `src/app/api/tours/quote/route.ts` â€” Email automÃ¡tico con HTML de marca + mensajes bidireccionales en Communication Center
- âœ… `src/app/api/tours/quote/contact-lookup/route.ts` â€” NUEVO endpoint de lookup para pre-llenado
- âœ… `src/app/cotizar-tour/page.tsx` â€” Auto-completado de campos al escribir email (onBlur con lookup)
- âœ… `src/components/BrandFooter.tsx` â€” Bump v2.336
- âœ… `docs/AG-Historico-Cambios.md` â€” Esta entrada

---

### v2.335 - 12 de Marzo de 2026 - 16:24 CST

**ðŸ�·ï¸� Flujo Viajes Grupales â€” CÃ³digo AS-XXXXX visible en todo el flujo (catÃ¡logo, cotizaciÃ³n, PDF, email)**

**Puntos implementados:**

1. **CatÃ¡logo de Tours (`/tours`) â€” cÃ³digo AS en tarjeta:**
   - FunciÃ³n `formatTourCode(id)` que normaliza cualquier cÃ³digo (`MT-XXXXX`, `AS-XXXXX`, numÃ©rico) al formato `AS-XXXXX`
   - Etiqueta monospace gris discreta en la esquina superior derecha de cada tarjeta, junto al nombre de la regiÃ³n
   - Archivo: `src/app/tours/page.tsx`

2. **Formulario de CotizaciÃ³n (`/cotizar-tour`) â€” cÃ³digo AS en tÃ­tulo y resumen:**
   - TÃ­tulo del formulario ahora muestra `Â¡Cotizar AS-XXXXX â€” Nombre del Tour!` (equivalente al formato del proveedor MegaTravel)
   - Resumen lateral: etiqueta azul `AS-XXXXX` debajo del nombre del tour seleccionado
   - Pantalla de confirmaciÃ³n de envÃ­o: secciÃ³n "CÃ³digo del viaje" con badge azul monospace
   - Archivo: `src/app/cotizar-tour/page.tsx`

3. **PÃ¡gina de Seguimiento / PDF (`/cotizacion/[folio]`) â€” cÃ³digo AS en vista web y PDF:**
   - Vista web: etiqueta `AS-XXXXX` en azul dentro de "Detalles del Tour"
   - PDF imprimible: bloque con nombre del tour + cÃ³digo `AS-XXXXX` en azul, antes del desglose de precios
   - FunciÃ³n `formatTourCode()` agregada como helper global en el archivo
   - Archivo: `src/app/cotizacion/[folio]/page.tsx`

4. **Email de CotizaciÃ³n â€” cÃ³digo AS incluido:**
   - Nuevo parÃ¡metro `tourId` aceptado por el endpoint
   - Fila "CÃ³digo del viaje: AS-XXXXX" con badge azul monospace en la card del email HTML
   - Archivo: `src/app/api/tours/quote/send-email/route.ts`

5. **Mensaje Communication Center â€” cÃ³digo AS en confirmaciÃ³n automÃ¡tica:**
   - El mensaje automÃ¡tico de confirmaciÃ³n incluye `â€¢ CÃ³digo del viaje: AS-XXXXX` junto al folio
   - Archivo: `src/app/api/tours/quote/route.ts`

**Nota tÃ©cnica:**
- La API `GET /api/groups` ya convertÃ­a `MT-XXXXX â†’ AS-XXXXX` en el campo `id` (desde v2.322). Esta versiÃ³n extiende la visibilidad de ese cÃ³digo hacia todos los puntos de contacto con el cliente.
- `formatTourCode()` es idempotente: si el id ya viene como `AS-42829`, la funciÃ³n retorna `AS-42829` sin duplicar el prefijo.

**Archivos modificados:**
- âœ… `src/app/tours/page.tsx` â€” CÃ³digo AS en tarjetas del catÃ¡logo
- âœ… `src/app/cotizar-tour/page.tsx` â€” CÃ³digo AS en tÃ­tulo, sidebar y pantalla de confirmaciÃ³n
- âœ… `src/app/cotizacion/[folio]/page.tsx` â€” CÃ³digo AS en vista web y PDF, footer v2.335
- âœ… `src/app/api/tours/quote/send-email/route.ts` â€” CÃ³digo AS en email HTML
- âœ… `src/app/api/tours/quote/route.ts` â€” CÃ³digo AS en mensaje Communication Center
- âœ… `src/components/BrandFooter.tsx` â€” Bump v2.335
- âœ… `docs/AG-Historico-Cambios.md` â€” Esta entrada
- âœ… `docs/AG-Contexto-Proyecto.md` â€” VersiÃ³n actualizada

---

### v2.334 - 26 de Febrero de 2026 - 17:10 CST

**ðŸŽŸï¸� MÃ³dulo de Reservas & Pagos â€” Acciones, PDFs Premium, Pasarela de Pagos**

**Puntos implementados:**

1. **Auto-crear reserva al confirmar cotizaciÃ³n:**
   - Al cambiar status de cotizaciÃ³n de tour a `confirmed`, se crea automÃ¡ticamente un registro en `bookings`
   - Mapea: tour_name â†’ destination, precios â†’ total_price, contacto â†’ lead_traveler_*
   - Todo lo que no cabe en columnas especÃ­ficas va a `special_requests` como JSON
   - EnvÃ­a email de confirmaciÃ³n automÃ¡tico al cliente
   - Archivo: `src/app/api/tours/quote/[folio]/route.ts`

2. **Acciones en lista de reservas (`/mis-reservas`):**
   - BotÃ³n **Ver** (ojo) â€” navega a detalle de reserva
   - BotÃ³n **PDF** (impresora) â€” genera y descarga PDF oficial de reserva
   - BotÃ³n **Pago** (tarjeta, verde) â€” navega a checkout (solo si payment_status â‰  paid)
   - BotÃ³n **Facturar** (documento, pÃºrpura) â€” navega a mÃ³dulo de facturas (solo staff)
   - Archivo: `src/app/mis-reservas/page.tsx`

3. **Acciones en detalle de reserva (`/reserva/[id]`):**
   - BotÃ³n **Descargar PDF** (azul sÃ³lido) â€” siempre visible
   - BotÃ³n **Realizar Pago** (verde) â€” navega a checkout
   - BotÃ³n **Facturar** (pÃºrpura) â€” navega a facturas
   - BotÃ³n **Enviar por Email** â€” existente
   - BotÃ³n **Cancelar Reserva** (rojo) â€” solo si confirmada
   - Archivo: `src/app/reserva/[id]/page.tsx`

4. **PDF oficial de Reserva â€” diseÃ±o premium institucional:**
   - Cabecera: logo AS serif, nombre empresa, badge de referencia azul
   - LÃ­nea dorada separadora + contacto empresa
   - Card de status con color (verde confirmada, amarillo pendiente, rojo cancelada)
   - SecciÃ³n "Datos del Viajero" con nombre y email
   - SecciÃ³n "Detalles del Servicio" con soporte especial para tours (nombre, cotizaciÃ³n, fecha salida, ciudad origen, pasajeros, servicios incluidos, notas)
   - Tabla "Resumen Financiero" con desglose (precio base, impuestos, suplemento, total por persona)
   - Barra de total azul con monto formateado
   - TÃ©rminos y condiciones
   - Footer navy/gold con logo, fecha de generaciÃ³n y contacto
   - Archivo: `src/services/PDFService.ts` â†’ `generateBookingVoucher()`

5. **PDF Comprobante de Pago â€” diseÃ±o premium institucional:**
   - Cabecera: logo AS serif, tÃ­tulo verde "COMPROBANTE DE PAGO", badge transacciÃ³n verde
   - Card verde "âœ“ PAGO COMPLETADO" con fecha
   - Secciones: Datos del Pago (ID, mÃ©todo, tarjeta, moneda), Datos del Cliente, Reserva Asociada
   - Barra de total azul "MONTO PAGADO" con monto
   - Nota legal sobre facturaciÃ³n
   - Footer navy/gold institucional
   - Archivo: `src/services/PDFService.ts` â†’ `generatePaymentReceipt()`

6. **Pasarela de pagos conectada:**
   - Checkout `/checkout/[bookingId]` ya soporta Stripe, PayPal, Mercado Pago
   - `create-payment-intent` crea registro `pending` en `payment_transactions`
   - `confirm-payment` actualiza a `completed` + actualiza booking a `confirmed/paid`
   - Los pagos se reflejan en "Transacciones de Pago" del dashboard

**Archivos modificados:**
- âœ… `src/app/api/tours/quote/[folio]/route.ts` â€” Auto-crear reserva al confirmar
- âœ… `src/app/mis-reservas/page.tsx` â€” Botones Ver/PDF/Pago/Facturar
- âœ… `src/app/reserva/[id]/page.tsx` â€” Botones PDF/Pago/Facturar en detalle
- âœ… `src/services/PDFService.ts` â€” PDF Reserva premium + PDF Comprobante de Pago
- âœ… `src/components/BrandFooter.tsx` â€” Bump v2.334
- âœ… `src/app/page.tsx` â€” Build comment v2.334
- âœ… `docs/AG-Contexto-Proyecto.md` â€” MÃ³dulo Reservas y Pagos documentado
- âœ… `docs/AG-Historico-Cambios.md` â€” Esta entrada

**SQL necesario (ejecutar manualmente en Neon si no existe):**
```sql
-- MigraciÃ³n 019: Tablas para cotizaciones generales
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  tenant_id INTEGER NOT NULL DEFAULT 1,
  folio VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  customer_phone VARCHAR(50),
  status VARCHAR(50) DEFAULT 'draft',
  notes TEXT,
  total NUMERIC(12, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'MXN',
  valid_until TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quote_items (
  id SERIAL PRIMARY KEY,
  quote_id INTEGER REFERENCES quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC(12, 2) DEFAULT 0,
  total NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

### v2.332 - 25 de Febrero de 2026 - 15:31 CST

**ðŸ”§ Pantalla CotizaciÃ³n `/cotizacion/[folio]` â€” Mejoras Operativas**

**Puntos implementados:**

1. **BotÃ³n "Ver en MegaTravel" (solo staff) â€” req. 2.5:**
   - Visible Ãºnicamente para roles `SUPER_ADMIN`, `ADMIN`, `MANAGER`
   - Construye URL de bÃºsqueda MegaTravel desde `tour_id` (ej: `MT-60966` â†’ `megatravel.com.mx/busqueda?q=60966`)
   - Aparece en el "Panel Operativo" con color naranja distintivo
   - Invisible totalmente para clientes

2. **Panel staff enriquecido con campos de precio â€” req. 2:**
   - Staff puede editar: `precio base`, `impuestos`, `suplemento` por persona
   - Muestra total por persona y total estimado calculados en tiempo real
   - Lista de "Servicios / Incluye" editable con agregar/eliminar Ã­tems
   - Ã�tems se muestran al cliente como lista de inclusiones del tour

3. **PDF formal de cotizaciÃ³n â€” req. 3:**
   - BotÃ³n "PDF" en header (visible para todos)
   - Al imprimir/guardar como PDF: muestra cabecera AS Operadora con logo, datos de contacto
   - Contenido: folio, fecha, detalles del tour, precios, servicios incluidos, datos de contacto
   - Pie de pÃ¡gina con nota legal y fecha de generaciÃ³n
   - Elementos de navegaciÃ³n/UI ocultos con `@media print` y clase `no-print`

4. **API PUT extendida (`/api/tours/quote/[folio]`):**
   - Acepta nuevos campos: `price_per_person`, `taxes`, `supplement`, `total_per_person`, `total_price`, `included_items`
   - Permite al staff actualizar precios completos desde la pantalla de cotizaciÃ³n

5. **MigraciÃ³n 018 â€” columna `included_items`:**
   - `ALTER TABLE tour_quotes ADD COLUMN IF NOT EXISTS included_items TEXT`
   - `CREATE SEQUENCE IF NOT EXISTS tour_quote_folio_seq`

**Archivos modificados:**
- âœ… `src/app/cotizacion/[folio]/page.tsx` â€” Reescritura completa
- âœ… `src/app/api/tours/quote/[folio]/route.ts` â€” PUT extendido
- âœ… `migrations/018_add_included_items_to_tour_quotes.sql` â€” Nueva migraciÃ³n
- âœ… `src/components/BrandFooter.tsx` â€” Bump v2.332

---

### v2.331 - 25 de Febrero de 2026 - 00:09 CST


**ðŸ�› Fix CrÃ­tico: CÃ¡lculo de Totales con Impuestos en CotizaciÃ³n de Tours**

**Problema reportado:**
Los impuestos ($999 USD en JapÃ³n, $399 USD en Colombia) se mostraban en el sidebar pero NO se sumaban al "Total por persona" ni al "Total estimado". La fecha de salida mostraba "Invalid Date" en algunos casos.

**Archivos modificados:**
- âœ… `src/app/tours/[code]/page.tsx` â€” BotÃ³n "Cotizar Tour" y botÃ³n inline "Cotizar ahora"
- âœ… `src/app/cotizar-tour/page.tsx` â€” CÃ¡lculo de totalPerPerson y pÃ¡gina de confirmaciÃ³n
- âœ… `src/app/cotizacion/[folio]/page.tsx` â€” Parsing de fecha de salida del DB
- âœ… `src/components/BrandFooter.tsx` â€” Bump versiÃ³n a v2.331

**Correcciones especÃ­ficas:**

1. **Invalid Date al seleccionar fecha de salida:**
   - **Causa raÃ­z:** `departure_date` venÃ­a del DB como ISO completo (`2026-02-28T00:00:00.000Z`). Al concatenar `+ 'T12:00:00'` se generaba una fecha invÃ¡lida.
   - **Fix:** Aplicar `.substring(0, 10)` para extraer solo `YYYY-MM-DD` antes de crear objetos `Date`.
   - **Archivos:** `tours/[code]/page.tsx`, `cotizar-tour/page.tsx`, `cotizacion/[folio]/page.tsx`

2. **Impuestos no pasados como URL params:**
   - **Causa raÃ­z:** `if (selectedDeparture.taxes_usd)` fallaba cuando `taxes_usd` era `0` o `undefined`. Los impuestos estaban en `tour.pricing.taxes` pero el cÃ³digo no hacÃ­a fallback.
   - **Fix:** Usar `selectedDeparture?.taxes_usd ?? tour.pricing.taxes ?? 0` con nullish coalescing.
   - **Archivos:** `tours/[code]/page.tsx` (ambos botones de cotizar)

3. **Total por persona no sumaba impuestos:**
   - **Causa raÃ­z:** `selectedDeparture.total_usd` contenÃ­a solo el precio base (e.g. $2,299), pero al ser truthy, el `||` nunca ejecutaba el cÃ¡lculo que sumaba impuestos.
   - **Fix:** Eliminar toda dependencia de `total_usd`. Calcular SIEMPRE como `price + taxes + supplement` directamente: `const totalPerPerson = (tourData.price || 0) + (tourData.taxes || 0) + (tourData.supplement || 0)`
   - **Archivos:** `cotizar-tour/page.tsx` (lÃ­nea 282)

4. **PÃ¡gina de confirmaciÃ³n "Â¡CotizaciÃ³n Enviada!" no sumaba:**
   - **Causa raÃ­z:** Usaba `tourData.totalPerPerson` del URL param que contenÃ­a solo el precio base.
   - **Fix:** Calcular total inline con la misma fÃ³rmula `price + taxes + supplement`.
   - **Archivos:** `cotizar-tour/page.tsx` (secciÃ³n `submitted`)

**Lecciones aprendidas:**
- âš ï¸� **Nunca confiar en `total_usd` de la API de MegaTravel** â€” puede ser solo el precio base sin impuestos. Siempre calcular explÃ­citamente.
- âš ï¸� **Usar `??` (nullish coalescing) en vez de `||`** cuando se necesita fallback solo para `null/undefined`, pero recordar que `??` NO captura `0`.
- âš ï¸� **Fechas del DB siempre pueden venir como ISO completo** â€” sanitizar con `.substring(0, 10)` antes de manipular.
- âš ï¸� **Agregar `console.log` de debug** temporalmente para diagnosticar valores en producciÃ³n cuando el error es difÃ­cil de reproducir.

---

### v2.330 - 25 de Febrero de 2026 - 00:00 CST

**ðŸ”„ VersiÃ³n intermedia de diagnÃ³stico**

- Bump de versiÃ³n en footer para verificar que Vercel estuviera desplegando correctamente
- Primera iteraciÃ³n del fix de totalPerPerson (condicional `> price`) â€” insuficiente
- ConfirmÃ³ que el deploy sÃ­ se actualizaba pero el cÃ¡lculo seguÃ­a incorrecto

---

### v2.329 - 24 de Febrero de 2026 - 17:53 CST

**ðŸ–¼ï¸� Panel Admin de GestiÃ³n Manual de ImÃ¡genes de Tours**

**Nuevo Endpoint API (`/api/admin/tour-image`):**
- âœ… `GET ?missing=true` â€” Lista todos los tours sin imagen principal (21 detectados)
- âœ… `GET ?code=MT-XXXXX` â€” Ver estado de imagen de un tour (detecta imÃ¡genes genÃ©ricas)
- âœ… `POST ?code=MT-XXXXX` con body `{ "imageUrl": "..." }` â€” Establecer imagen manualmente
- âœ… `POST ?code=MT-XXXXX&clear=true` â€” Limpiar imagen a null para identificar pendientes
- âœ… DetecciÃ³n automÃ¡tica de imÃ¡genes genÃ©ricas de categorÃ­a (europa, cruceros, asia, etc.)

**Nuevo Panel Admin (`/admin/tour-images` + pestaÃ±a en GestiÃ³n de Contenido):**
- âœ… Dashboard visual con KPIs: tours sin imagen, instrucciones paso a paso
- âœ… Buscador por nombre, cÃ³digo o regiÃ³n
- âœ… Cards expandibles por tour con: cÃ³digo, nombre, regiÃ³n, paÃ­s, duraciÃ³n
- âœ… Link directo a MegaTravel para buscar la imagen correcta
- âœ… Campo para pegar URL de imagen + vista previa inline
- âœ… BotÃ³n guardar con feedback visual (animaciÃ³n, toast, auto-remove)
- âœ… **Integrado como pestaÃ±a "ImÃ¡genes Tours" en GestiÃ³n de Contenido** (`/admin/content`) para evitar problemas de auth
- âœ… Auth check: requiere SUPER_ADMIN, ADMIN o MANAGER

**Mejora en Rescrape (`/api/admin/rescrape-tour`):**
- âœ… Filtro de imÃ¡genes genÃ©ricas: al re-scrapear, imÃ¡genes de categorÃ­a (bellezasdeeuropa, etc.) NO se guardan como `main_image`
- âœ… Solo imÃ¡genes especÃ­ficas del tour se actualizan
- âœ… Log de advertencia cuando se detecta imagen genÃ©rica

**AcciÃ³n ejecutada:**
- âœ… Limpiada imagen genÃ©rica `bellezasdeeuropa` de tour MT-60968 â†’ null
- âœ… 21 tours identificados sin imagen para gestiÃ³n manual

**Archivos creados/modificados:**
```
src/app/api/admin/tour-image/route.ts          (NUEVO - API gestiÃ³n imÃ¡genes)
src/app/admin/tour-images/page.tsx             (NUEVO - Panel admin visual)
src/app/api/admin/rescrape-tour/route.ts       (MODIFICADO - filtro imÃ¡genes genÃ©ricas)
src/components/BrandFooter.tsx                 (MODIFICADO - footer v2.329)
```

---

### v2.328 - 24 de Febrero de 2026 - 13:00 CST

**ðŸ“… Fechas de Salida y Precios DinÃ¡micos en Detalle de Tour**

**Scraping de Fechas de Salida:**
- âœ… ExtracciÃ³n de fechas de salida desde `circuito.php` de MegaTravel
- âœ… Parseo de precios por fecha de salida (precio base, impuestos, total)
- âœ… Almacenamiento en tabla `megatravel_departures`

**UI Interactiva de Fechas:**
- âœ… SecciÃ³n "Fechas de Salida" en pÃ¡gina de detalle del tour
- âœ… AgrupaciÃ³n de fechas por mes con selector visual
- âœ… Indicadores de disponibilidad (Disponible, Lugares limitados, Agotado)
- âœ… Al seleccionar fecha, el precio se actualiza dinÃ¡micamente
- âœ… BotÃ³n "Cotizar ahora" pasa la fecha seleccionada a la pÃ¡gina de cotizaciÃ³n
- âœ… Helper `parseDepartureDate()` para manejo correcto de fechas ISO vs date-only

**Endpoint Re-scrape Individual (`/api/admin/rescrape-tour`):**
- âœ… `GET ?code=MT-XXXXX` â€” Muestra estado actual del tour antes de re-scrapear
- âœ… `POST ?code=MT-XXXXX` â€” Ejecuta re-scrape completo y compara estado antes/despuÃ©s
- âœ… Actualiza: imagen, galerÃ­a, precio, impuestos, itinerario, departures, includes, cities, tags

**Archivos creados/modificados:**
```
src/app/tours/[code]/page.tsx                  (MODIFICADO - UI fechas + parseDepartureDate)
src/app/api/admin/rescrape-tour/route.ts       (NUEVO - Re-scrape individual)
```

---

### v2.327 - 24 de Febrero de 2026 - 10:45 CST

**ðŸ–¼ï¸� Fix Video e ImÃ¡genes de Tours + Limpieza de GalerÃ­as**

**ImÃ¡genes y Video:**
- âœ… Fix reproducciÃ³n de video embebido en detalle del tour
- âœ… GalerÃ­a con `object-contain` (imagen completa sin recortar) + fondo difuminado premium
- âœ… API para limpiar imÃ¡genes genÃ©ricas de categorÃ­a (`/api/admin/fix-tour-images`)
- âœ… Limpieza mejorada: detecta y elimina imÃ¡genes de galerÃ­a que no pertenecen al tour

**Patrones de imÃ¡genes genÃ©ricas detectados:**
- Regiones: europa, asia, turquia, japon, corea, medio-oriente, dubai, egipto, etc.
- Cruceros: celebrity-millennium, grandeur-of-the-seas
- Banners: banner-mega, covers de categorÃ­a MegaTravel

**Archivos creados/modificados:**
```
src/app/tours/[code]/page.tsx                  (MODIFICADO - galerÃ­a+video)
src/app/api/admin/fix-tour-images/route.ts     (NUEVO - API limpieza imÃ¡genes)
```

---

### v2.326 - 24 de Febrero de 2026 - 09:00 CST

**ðŸ—ºï¸� Mapa de Tour Robusto con 3 Niveles de Fallback**

**TourMap Mejorado:**
- âœ… Nivel 1: Mapa interactivo Google Maps con geocoding por contexto de paÃ­s
- âœ… Nivel 2: Imagen estÃ¡tica de Google Maps Static API cuando interactivo falla
- âœ… Nivel 3: Texto con nombre de ciudades cuando todo lo demÃ¡s falla
- âœ… Timeout de 10 segundos con try-catch global para robustez
- âœ… Loading state visual durante carga del mapa

**Archivos modificados:**
```
src/app/tours/[code]/page.tsx                  (MODIFICADO - TourMap robusto)
```

---

### v2.325 - 24 de Febrero de 2026 - 08:00 CST

**ðŸ”§ Fix CrÃ­tico: ExtracciÃ³n de Metadatos OG y Parsing de Itinerario**

**Scraping Mejorado:**
- âœ… ExtracciÃ³n de meta OG con `page.evaluate()` antes de cerrar browser (fix Puppeteer)
- âœ… Parsing de itinerario mejorado: descripciones en mismo pÃ¡rrafo
- âœ… Fallback a texto plano cuando Cheerio falla
- âœ… MÃºltiples fuentes para ciudades/paÃ­ses (meta OG, tÃ­tulos itinerario, contenido)
- âœ… Fallback: extraer ciudades desde tÃ­tulos del itinerario cuando OG meta falla

**Archivos modificados:**
```
src/services/MegaTravelScrapingService.ts      (MODIFICADO)
src/components/BrandFooter.tsx                 (MODIFICADO - versiÃ³n)
```

---

### v2.324 - 23 de Febrero de 2026 CST

**ðŸ“¦ ExtracciÃ³n de Ciudades/PaÃ­ses/DuraciÃ³n + Filtro de ImÃ¡genes GenÃ©ricas**

**Mejoras en Scraping:**
- âœ… ExtracciÃ³n de ciudades/paÃ­ses/duraciÃ³n desde datos del tour
- âœ… Filtro de imÃ¡genes de categorÃ­a genÃ©rica (logos de EUROPA, ASIA, etc.)
- âœ… ActualizaciÃ³n de `saveScrapedData` con metadatos adicionales

**Mejoras en API de Detalle:**
- âœ… `getPackageByCode` ahora trae itinerario, departures, policies y additional info de tablas relacionadas
- âœ… Fix precio 'Consultar' cuando no hay tarifa disponible
- âœ… Mapa MegaTravel como imagen + Google Maps fallback

**DocumentaciÃ³n:**
- âœ… Handoff document creado: `AG-Handoff-Tour-Details-v2.324.md`

**Archivos modificados:**
```
src/services/MegaTravelScrapingService.ts      (MODIFICADO)
src/app/api/groups/[code]/route.ts             (MODIFICADO)
src/app/tours/[code]/page.tsx                  (MODIFICADO)
docs/AG-Handoff-Tour-Details-v2.324.md         (NUEVO)
```

---

### v2.323 - 19 de Febrero de 2026 - 11:12 CST

**ðŸ”� Mejoras Auth MegaTravel + Fix Precio NaN**

**AutenticaciÃ³n MegaTravel:**
- âœ… Auth fallback `as_user` cookie + verificaciÃ³n BD en API MegaTravel
- âœ… Auto-refresh JWT cada 10 min durante scraping largo
- âœ… Middleware fallback `as_user` cookie cuando JWT expira
- âœ… Retry automÃ¡tico en errores 401

**SincronizaciÃ³n:**
- âœ… Detener batches vacÃ­os automÃ¡ticamente
- âœ… `parseInt` correcto para `active_packages`
- âœ… `last_sync_at` en discover-tours, limpieza de syncs 'running' stale
- âœ… Registro de sync en historial

**Archivos modificados:**
```
src/app/api/admin/scrape-all/route.ts          (MODIFICADO)
src/middleware.ts                              (MODIFICADO)
src/contexts/AuthContext.tsx                    (MODIFICADO)
```

---

### v2.322 - 19 de Febrero de 2026 - 02:00 CST

**ðŸ”„ SincronizaciÃ³n MegaTravel: Descubrimiento Real + Panel Unificado**

**Descubrimiento de Tours:**
- âœ… Endpoint `discover-tours` para descubrimiento real desde MegaTravel
- âœ… DetecciÃ³n de tours deprecados/descontinuados
- âœ… Sync por categorÃ­a sin timeout (fetch+cheerio)
- âœ… Scraping solo tours activos (`is_active=true`)
- âœ… `active_packages` para conteo total correcto

**Panel Admin Unificado:**
- âœ… Panel unificado Sync+Scraping con logs en tiempo real
- âœ… BotÃ³n "Detener scraping" para cancelar operaciones en curso
- âœ… MegaTravel movido a "GestiÃ³n de Contenido" (quitado del dashboard principal)
- âœ… `puppeteer-core` para compatibilidad con Vercel

**Archivos creados/modificados:**
```
src/app/api/admin/discover-tours/route.ts      (NUEVO)
src/app/admin/megatravel/page.tsx              (MODIFICADO - panel unificado)
src/services/MegaTravelSyncService.ts          (MODIFICADO)
```

---

**ðŸ�·ï¸� Cambio de Prefijo de CÃ³digo de Tours: MT- â†’ AS-**

**APIs Modificadas:**
- âœ… `/api/groups/route.ts` â€” El campo `id` ahora devuelve `AS-XXXXX` en lugar de `MT-XXXXX` al frontend
- âœ… `/api/groups/[code]/route.ts` â€” Acepta cÃ³digos con prefijo `AS-`, `MT-` o solo nÃºmero. Devuelve `AS-XXXXX` al frontend
- âœ… Internamente la BD sigue usando `MT-XXXXX` como clave (sin migraciÃ³n necesaria)

**Impacto en Frontend (automÃ¡tico por cambio en API):**
- âœ… URLs de tours: `/tours/AS-12534` en lugar de `/tours/MT-12534`
- âœ… Mensajes de WhatsApp: incluye cÃ³digo `AS-XXXXX`
- âœ… PÃ¡gina de cotizaciÃ³n: `tourId` usa `AS-XXXXX`
- âœ… Tarjetas de tours en catÃ¡logo: `key` usa `AS-XXXXX`

**Otros cambios:**
- âœ… Quitado cron `megatravel-sync` de `vercel.json` (Vercel Hobby no soporta crons)
- âœ… Agregado botÃ³n "ðŸŒ� MegaTravel â€” Tours y Scraping" en Dashboard principal (`/dashboard`)
- âœ… Actualizado footer a v2.321

**Lecciones Aprendidas:**
- El plan Hobby de Vercel no soporta cron jobs. Para ejecuciÃ³n programada usar servicios externos como cron-job.org
- El cambio de prefijo se hace en la capa API para no requerir migraciÃ³n de BD ni cambios en mÃºltiples archivos frontend

---

### v2.320 - 19 de Febrero de 2026 - 00:30 CST

**ðŸ”„ Mejora Scraping MegaTravel + Panel Admin de Scraping**

**Servicio de Scraping (`MegaTravelScrapingService.ts`):**
- âœ… Nueva funciÃ³n `scrapeFromCircuito()` como fuente de datos principal desde `circuito.php`
- âœ… ExtracciÃ³n detallada de itinerarios: soporte para "DÃ�A XX" y "FECHA CIUDAD" 
- âœ… ExtracciÃ³n de incluye/no incluye desde clases CSS especÃ­ficas
- âœ… URL predecible para imÃ¡genes de mapa: `cdnmega.com/images/viajes/mapas/{code}.jpg`
- âœ… `scrapeTourComplete()` prioriza datos de `circuito.php` sobre scraping de pÃ¡gina general

**Panel Admin de Scraping (`/admin/megatravel-scraping`):**
- âœ… AutenticaciÃ³n basada en cookies de sesiÃ³n
- âœ… VisualizaciÃ³n de mÃ©tricas: dÃ­as de itinerario, includes, not-includes por tour
- âœ… Auto-scroll en registro de actividad
- âœ… Soporte modo oscuro

**API Scrape-All (`/api/admin/scrape-all`):**
- âœ… AutenticaciÃ³n triple: cookie de sesiÃ³n, Bearer JWT/CRON_SECRET, legacy ADMIN_SECRET_KEY
- âœ… Resultados detallados: precio, itinerario, includes, not-includes por tour

**Endpoint Cron (`/api/cron/megatravel-sync`):**
- âœ… Creado endpoint para sync por lotes (5 tours a la vez, 2s pausa)
- âœ… Prioriza tours no actualizados en Ãºltimas 20 horas
- âš ï¸� No activado en Vercel (plan Hobby no soporta crons), disponible para ejecuciÃ³n manual

---

### v2.317 - 19 de Febrero de 2026 - 00:03 CST

**ðŸ”— UnificaciÃ³n de Datos de Clientes â€” AutomatizaciÃ³n CRM**

**AutomatizaciÃ³n en Registro Web (`src/app/api/auth/register/route.ts`):**
- âœ… Al registrarse un usuario, se crea automÃ¡ticamente un contacto CRM con `contact_type: 'lead'`, `source: 'web_register'`, `pipeline_stage: 'new'`
- âœ… Si ya existe un contacto con el mismo email, se vincula el `user_id` al contacto existente
- âœ… Implementado con `try/catch` para no bloquear el registro si el CRM falla

**AutomatizaciÃ³n en CotizaciÃ³n de Tours (`src/app/api/tours/quote/route.ts`):**
- âœ… Al crear una cotizaciÃ³n, se crea automÃ¡ticamente un contacto CRM con `contact_type: 'lead'`, `source: 'tour_quote'`, `pipeline_stage: 'quoted'`
- âœ… Si ya existe un contacto, se registra una interacciÃ³n de tipo `quote_sent` y se puede avanzar la etapa del pipeline
- âœ… Se capturan datos del tour: destino, num_travelers, budget_max
- âœ… Implementado con `try/catch` para no bloquear la cotizaciÃ³n si el CRM falla

**API de ImportaciÃ³n de Datos Existentes (`src/app/api/crm/import-existing/route.ts`):**
- âœ… Endpoint POST que ejecuta importaciÃ³n masiva al CRM
- âœ… Importa `agency_clients` â†’ `crm_contacts` (como `'client'`) usando `CRMService.importExistingClients()`
- âœ… Importa `tour_quotes` â†’ `crm_contacts` (como `'lead'`) usando `CRMService.importExistingQuotes()`
- âœ… Importa usuarios registrados (`users`) â†’ `crm_contacts`, clasificando automÃ¡ticamente como `'client'` si tienen reservas o `'lead'` si no
- âœ… Evita duplicados verificando por `user_id` y `email`

**PÃ¡gina CatÃ¡logo de Clientes (`src/app/dashboard/clientes/page.tsx`):**
- âœ… KPIs: Total contactos, Clientes convertidos, Leads activos, Valor pipeline
- âœ… Tabs de filtrado: Todos | Clientes | Leads/Prospectos
- âœ… Filtros avanzados: bÃºsqueda texto, etapa pipeline, fuente, ordenamiento
- âœ… Tabla responsiva con: avatar, nombre/email/tel, tipo, etapa, score, fuente, reservas, LTV, Ãºltimo contacto
- âœ… PaginaciÃ³n (25 por pÃ¡gina)
- âœ… BotÃ³n "Importar Existentes" integrado
- âœ… Enlace a vista 360Â° del CRM por cada contacto
- âœ… Leyenda explicativa de fuentes

**NavegaciÃ³n (`src/components/CRMSidebar.tsx`):**
- âœ… Agregado enlace "CatÃ¡logo Clientes" con Ã­cono `BookUser` en el sidebar del CRM
- âœ… Agregado botÃ³n rÃ¡pido "CatÃ¡logo Clientes" en el footer del sidebar

**Lecciones Aprendidas:**
- Los datos de clientes estaban dispersos en 4 tablas (`users`, `crm_contacts`, `tour_quotes`, `agency_clients`). La unificaciÃ³n automÃ¡tica alimenta `crm_contacts` como fuente Ãºnica
- Las automatizaciones siempre deben ser resilientes (try/catch) para no bloquear flujos principales
- Los APIs del CRM usan params `type` y `stage` (no `contact_type`/`pipeline_stage`) y responden con `{ data: [], meta: { total } }`

---

### v2.316 - 12 de Febrero de 2026 - 02:45 CST

**ðŸ‘¥ MÃ³dulo RRHH (Recursos Humanos) â€” ImplementaciÃ³n Completa**

**Migraciones de Base de Datos:**
- âœ… `040_client_documents_extension.sql` â€” ExtensiÃ³n de tabla `documents` para soportar documentos de clientes con alertas de vencimiento, tipos mexicanos (INE, CURP, RFC), vista `client_documents_view`, funciones SQL
- âœ… `041_hr_module_core.sql` â€” 11 tablas HR: departamentos, posiciones, empleados (perfiles diferenciados: interno/agente/freelance/contractor), contratos, asistencia, ausencias, nÃ³mina, comisiones de agentes, documentos de empleados, pipeline de reclutamiento, log de auditorÃ­a. 44 Ã­ndices, triggers `updated_at` automÃ¡ticos. Campos de cumplimiento legal mexicano (RFC, CURP, NSS, IMSS, ISR, CLABE)

**Servicios Backend:**
- âœ… `ClientDocumentService.ts` â€” CRUD documentos de clientes, verificaciÃ³n/rechazo, alertas de expiraciÃ³n, checklist de completitud, estadÃ­sticas
- âœ… `HRService.ts` â€” CRUD completo para empleados, departamentos, posiciones, contratos, asistencia (check-in/out), ausencias (aprobar/rechazar), nÃ³mina, reclutamiento, auditorÃ­a. Dashboard stats

**APIs REST:**
- âœ… `api/client-documents/route.ts` â€” GET: listar por cliente/tenant, expiraciÃ³n, stats, checklist. POST: crear, verificar, eliminar
- âœ… `api/hr/route.ts` â€” GET: dashboard, empleados (con filtros), departamentos, posiciones, contratos, asistencia, ausencias, nÃ³mina, reclutamiento, auditorÃ­a. POST: crear/actualizar empleados, departamentos, posiciones, contratos, check-in/out, ausencias, nÃ³mina, candidatos

**Frontend (13 pÃ¡ginas):**
- âœ… `HRSidebar.tsx` â€” Sidebar colapsable con acento verde esmeralda, 12 items de navegaciÃ³n
- âœ… `dashboard/rrhh/page.tsx` â€” Dashboard principal con 12 KPIs, alertas activas, acciones rÃ¡pidas, grÃ¡fico de distribuciÃ³n
- âœ… `dashboard/rrhh/employees/page.tsx` â€” Listado empleados internos con bÃºsqueda, filtros, modal creaciÃ³n (RFC, CURP, NSS)
- âœ… `dashboard/rrhh/agents/page.tsx` â€” Grid de agentes con comisiones, ventas YTD, metas, territorios, certificaciones
- âœ… `dashboard/rrhh/departments/page.tsx` â€” Grid de departamentos con conteo de empleados
- âœ… `dashboard/rrhh/contracts/page.tsx` â€” Lista de contratos con badges, alertas vencimiento, modal creaciÃ³n
- âœ… `dashboard/rrhh/attendance/page.tsx` â€” Control asistencia con check-in/out, resumen diario
- âœ… `dashboard/rrhh/leaves/page.tsx` â€” Solicitudes de ausencia con filtros estado, aprobar/rechazar
- âœ… `dashboard/rrhh/payroll/page.tsx` â€” Tabla nÃ³mina con bruto/deducciones/neto
- âœ… `dashboard/rrhh/commissions/page.tsx` â€” Comisiones de agentes con KPIs
- âœ… `dashboard/rrhh/documents/page.tsx` â€” Expediente digital con badges de estado por documento
- âœ… `dashboard/rrhh/recruitment/page.tsx` â€” Pipeline Kanban 6 columnas (Postuladoâ†’Contratado)
- âœ… `dashboard/rrhh/audit/page.tsx` â€” Log de auditorÃ­a con filtros por tipo de acciÃ³n

**IntegraciÃ³n:**
- âœ… BotÃ³n RRHH agregado en Dashboard principal â†’ Enlaces Ãštiles (verde esmeralda)
- âœ… Script `scripts/migrate-hr-module.js` para ejecutar migraciones en Neon

**Archivos creados (19):**
```
migrations/040_client_documents_extension.sql
migrations/041_hr_module_core.sql
src/services/ClientDocumentService.ts
src/services/HRService.ts
src/components/HRSidebar.tsx
src/app/api/client-documents/route.ts
src/app/api/hr/route.ts
src/app/dashboard/rrhh/layout.tsx
src/app/dashboard/rrhh/page.tsx
src/app/dashboard/rrhh/employees/page.tsx
src/app/dashboard/rrhh/agents/page.tsx
src/app/dashboard/rrhh/departments/page.tsx
src/app/dashboard/rrhh/contracts/page.tsx
src/app/dashboard/rrhh/attendance/page.tsx
src/app/dashboard/rrhh/leaves/page.tsx
src/app/dashboard/rrhh/payroll/page.tsx
src/app/dashboard/rrhh/commissions/page.tsx
src/app/dashboard/rrhh/documents/page.tsx
src/app/dashboard/rrhh/recruitment/page.tsx
src/app/dashboard/rrhh/audit/page.tsx
scripts/migrate-hr-module.js
```

---

### v2.315 - 12 de Febrero de 2026 - 00:15 CST

**ðŸš€ CRM Sprints 8-10: Calendario, Predictive, WhatsApp, Workflows, Campaign Metrics â€” CRM al 99%**

**Sprint 8 â€” Calendario CRM y Scoring Predictivo:**
- âœ… `CRMCalendarService.ts` â€” Vista unificada tareas/seguimientos/viajes, digest semanal, Google Calendar links, iCal
- âœ… `CRMPredictiveService.ts` â€” 6 seÃ±ales ponderadas, probabilidad de conversiÃ³n, risk level, recomendaciones
- âœ… API `/api/crm/calendar` â€” events, digest, google_link, ical
- âœ… API `/api/crm/predictive` â€” predict, top_predictions
- âœ… UI `/dashboard/crm/calendar` â€” Calendario mensual interactivo con eventos por tipo
- âœ… UI `/dashboard/crm/predictive` â€” Scoring predictivo dark premium con ranking

**Sprint 9 â€” WhatsApp CRM y Workflow Engine:**
- âœ… `CRMWhatsAppService.ts` â€” 6 plantillas por pipeline stage (bienvenida, seguimiento, cotizaciÃ³n, recordatorio, confirmaciÃ³n, post-viaje)
- âœ… `CRMWorkflowService.ts` â€” Motor con 9 tipos de paso (send_email, send_whatsapp, wait, condition, update_contact, create_task, move_stage, add_tag, notify_agent)
- âœ… 4 workflows predefinidos: Bienvenida lead, Seguimiento cotizaciÃ³n, Re-engagement, Hot lead
- âœ… API `/api/crm/whatsapp` â€” templates, preview, suggest, envÃ­o individual/masivo
- âœ… API `/api/crm/workflows` â€” templates, saved, save, execute, update, toggle
- âœ… UI `/dashboard/crm/whatsapp` â€” Flujo 4 pasos con preview estilo WhatsApp
- âœ… UI `/dashboard/crm/workflows` â€” Gestor con tabs, panel de detalle, flujo visual

**Sprint 10 â€” MÃ©tricas de CampaÃ±as, A/B Testing y Deep Linking:**
- âœ… `CRMCampaignMetricsService.ts` â€” Pixel tracking (GIF 1x1), click tracking (redirect), A/B testing con 3 criterios
- âœ… MigraciÃ³n `039_crm_sprint10_campaign_metrics.sql` â€” crm_campaign_stats, crm_campaign_events, crm_ab_tests, crm_deep_links
- âœ… API `/api/crm/metrics` â€” summary, campaign detail, timeline, abtests, evaluate, register, create_abtest
- âœ… API `/api/crm/metrics/track` â€” Pixel tracking opens + redirect tracking clicks
- âœ… UI `/dashboard/crm/campaign-metrics` â€” 5 KPIs, grÃ¡fico timeline, benchmarks vs industria, tabla campaÃ±as
- âœ… 8 deep links predefinidos para app mÃ³vil (Dashboard, Contact 360Â°, Pipeline, Tasks, Calendar, Predictive, WhatsApp, Notifications)

**Dashboard CRM actualizado:**
- âœ… 10 botones de acciones rÃ¡pidas: CampaÃ±as Email, Reporte PDF, Calendario, Scoring Predictivo, WhatsApp CRM, Workflows, MÃ©tricas CampaÃ±as, mÃ¡s
- âœ… Fix: CRMWhatsAppService `message` â†’ `body` (WhatsAppMessage interface alignment)

**Archivos creados (15):**
```
src/services/CRMCalendarService.ts
src/services/CRMPredictiveService.ts
src/services/CRMWhatsAppService.ts
src/services/CRMWorkflowService.ts
src/services/CRMCampaignMetricsService.ts
src/app/api/crm/calendar/route.ts
src/app/api/crm/predictive/route.ts
src/app/api/crm/whatsapp/route.ts
src/app/api/crm/workflows/route.ts
src/app/api/crm/metrics/route.ts
src/app/api/crm/metrics/track/route.ts
src/app/dashboard/crm/calendar/page.tsx
src/app/dashboard/crm/predictive/page.tsx
src/app/dashboard/crm/whatsapp/page.tsx
src/app/dashboard/crm/workflows/page.tsx
src/app/dashboard/crm/campaign-metrics/page.tsx
migrations/039_crm_sprint10_campaign_metrics.sql
```

**Archivos modificados (2):**
```
src/app/dashboard/crm/page.tsx (nav buttons)
docs/AG-Reporte-CRM-Estado-Plan.md (Sprints 8-10 completados)
```

**Totales CRM:** 10 sprints | 10 servicios | 28 APIs | 17 pÃ¡ginas | ~99%

---

### v2.313 - 11 de Febrero de 2026 - 22:00 CST

**ðŸ�¢ Sprint 7b: White-Label â€” Markup, Referidos, Emails Branded y Onboarding**

**OBS-006: Markup de precios por agencia:**
- âœ… MigraciÃ³n `032_add_markup_to_wl_config.sql` â€” `markup_percentage`, `markup_fixed`, `markup_type` en `white_label_config`
- âœ… `TenantService.ts` â€” Interface `WhiteLabelConfig` con campos de markup
- âœ… `WhiteLabelContext.tsx` â€” Expone `markupPercentage`, `markupFixed`, `markupType` + funciÃ³n `applyMarkup(basePrice)`
- âœ… Hook `applyMarkup()` soporta tipos: `percentage`, `fixed`, `both`

**Referral Auto-VinculaciÃ³n:**
- âœ… `register/route.ts` â€” Al registrarse, si hay cookie `as_referral` o `body.referral_code`, se busca agente, se crea `referral_conversion`, se vincula usuario al tenant como `client`
- âœ… Inserciones a `tenant_users` y `agency_clients` (graceful fallback si tabla no existe)
- âœ… Flow completo: `?r=CODIGO` â†’ cookie â†’ registro â†’ auto-link

**OBS-007: Emails con branding del tenant:**
- âœ… `NotificationService.ts` â€” Interface `TenantBranding` con logo/colores/contacto
- âœ… MÃ©todo `getTenantBranding(tenantId)` â€” Carga branding desde BD (join tenants + white_label_config)
- âœ… MÃ©todo `brandedEmailWrapper()` â€” Template HTML reutilizable con colores/logo/footer dinÃ¡micos
- âœ… `sendBookingConfirmation` â€” Acepta `tenantId`, usa wrapper branded
- âœ… `sendInvoiceEmail` â€” Acepta `tenantId`, usa wrapper branded
- âœ… `sendPaymentReminder` â€” Acepta `tenantId`, usa wrapper branded
- âœ… `sendCancellationEmail` â€” Acepta `tenantId`, usa wrapper branded
- âœ… `sendEmail` â€” Acepta `fromName` dinÃ¡mico por tenant

**OBS-010: Onboarding para nuevas agencias:**
- âœ… MigraciÃ³n `033_agency_applications_table.sql` â€” Tabla con datos de empresa, contacto, ubicaciÃ³n, estado de solicitud
- âœ… API `POST /api/agency-onboarding` â€” Formulario pÃºblico, validaciÃ³n, notificaciÃ³n a admin
- âœ… API `GET /api/agency-onboarding` â€” Listado de solicitudes (admin)
- âœ… PÃ¡gina `/agencia/registro` â€” Formulario pÃºblico con beneficios, validaciÃ³n, respuesta exitosa
- âœ… Estados: `pending` â†’ `reviewing` â†’ `approved` / `rejected`

**Edge Middleware Optimization:**
- âœ… `middleware.ts` â€” Pre-fetch tenant config desde `/api/tenant/detect` con cache in-memory (5 min TTL)
- âœ… Config se pasa vÃ­a cookie `x-tenant-config` para que `WhiteLabelContext` la lea sin fetch client-side
- âœ… `WhiteLabelContext.tsx` â€” Lee cookie `x-tenant-config` antes de hacer fetch (optimizaciÃ³n de carga)
- âœ… `tenantConfigCache` Map con TTL â€” Se recicla con el Edge Worker de Vercel

### v2.312 - 11 de Febrero de 2026 - 19:30 CST

**ðŸŽ¨ Sprint 7: White-Label Core â€“ Marca Blanca Funcional**

**CSS Variables & Branding DinÃ¡mico:**
- âœ… `globals.css` â€” Variables CSS de marca (`--brand-primary`, `--brand-secondary`, `--brand-accent`, hover/light/bg variants) con defaults AS Operadora
- âœ… `BrandStyles.tsx` â€” Ya existente, inyecta CSS variables dinÃ¡micas por tenant al montar
- âœ… MigraciÃ³n de componentes hardcodeados `#0066FF` â†’ `var(--brand-primary)`

**Componentes Migrados a Brand Variables:**
- âœ… `UserMenu.tsx` â€” Avatar circle usa `--brand-primary` en vez de `bg-[#0066FF]`
- âœ… `ChatWidget.tsx` â€” BotÃ³n flotante, header, send button y saludo dinÃ¡mico con nombre del tenant
- âœ… `WhatsAppWidget.tsx` â€” NÃºmero de telÃ©fono dinÃ¡mico desde `supportPhone` del tenant + mensaje personalizado
- âœ… `Logo.tsx` â€” Ya soportaba 3 modos: WL+logo, WL sin logo, default AS (verificado)

**Footer DinÃ¡mico:**
- âœ… Nuevo componente `BrandFooter.tsx` â€” Footer reutilizable con datos del tenant
- âœ… Contacto (email, telÃ©fono), links legales (tÃ©rminos, privacidad), redes sociales del tenant
- âœ… Badge "Powered by AS Operadora" en modo white-label
- âœ… `page.tsx` â€” Footer principal reemplazado por `<BrandFooter />`

**Infraestructura Existente Verificada:**
- âœ… `WhiteLabelContext.tsx` â€” Funcional con `useWhiteLabel()`, `useBrandColors()`, `useIsWhiteLabel()` hooks
- âœ… `WhiteLabelProvider` â€” Envuelve toda la app en `layout.tsx`
- âœ… `/api/tenant/detect` â€” API funcional que consulta BD por host/subdomain/domain
- âœ… `TenantService` â€” `detectTenant()`, `getTenantBySubdomain()`, `getWhiteLabelConfig()`
- âœ… Testing mode: `?tenant=mmta` en localhost para probar white-label sin subdomain real
- âœ… `BrandStyles.tsx` â€” Inyecta CSS variables dinÃ¡micamente (cleanup en unmount)
- âœ… `/admin/tenants` â€” Panel CRUD completo para gestiÃ³n de tenants y configuraciÃ³n WL
- âœ… Middleware pasa headers `x-tenant-host`, `x-tenant-subdomain`, `x-white-label`

**Datos en BD:**
- Tenant 1: AS Operadora (corporate, branding default)
- Tenant 2: M&M Travel Agency (agency, primary_color=#FF6B00, domain=mmta.app.asoperadora.com)
- White Label Config para Tenant 2: footer, support_email, meta_title configurados

---

### v2.311 - 11 de Febrero de 2026 - 18:00 CST

**ðŸ›¡ï¸� Sprint 6: Robustez, ProtecciÃ³n de Rutas, Analytics y Services**

**ProtecciÃ³n Server-Side de Rutas:**
- âœ… Middleware con protecciÃ³n de rutas por rol vÃ­a JWT decode en Edge Runtime
- âœ… Cookie sync en AuthContext (`as_user`, `as_token`) para comunicaciÃ³n clientâ†”middleware
- âœ… Toast de "acceso denegado" en dashboard con indicaciÃ³n de rol requerido
- âœ… Tabla de rutas protegidas: `/dashboard/admin` â†’ SUPER_ADMIN, `/dashboard/agency` â†’ AGENCY_ADMIN+, `/dashboard/agent` â†’ AGENT+

**Analytics Avanzados:**
- âœ… API `GET /api/agency/analytics?agency_id=X&period=30d`
- âœ… Revenue timeline (ingresos por dÃ­a, total vs confirmado)
- âœ… Commission timeline (pending/available/paid por dÃ­a)
- âœ… Top Agents Leaderboard con badges de performance (ðŸ’Ž Diamond, ðŸ¥‡ Gold, ðŸ¥ˆ Silver, ðŸŽ¯ Top Converter, â­� Client Favorite)
- âœ… Referral funnel: Clics â†’ Conversiones â†’ Comisiones â†’ Pagos
- âœ… Comparativa periodo actual vs anterior (% variaciÃ³n bookings + revenue)
- âœ… DistribuciÃ³n por tipo de reserva

**AgentNotificationService (auto-triggers):**
- âœ… Servicio centralizado `src/services/AgentNotificationService.ts` con mÃ©todos tipados
- âœ… Auto-notificaciÃ³n en webhook `booking-status` (comisiÃ³n creada / disponible)
- âœ… Auto-notificaciÃ³n en `disburse` (dispersiÃ³n recibida: in-app + email)
- âœ… Auto-notificaciÃ³n en `reviews POST` (nueva calificaciÃ³n recibida)
- âœ… Sistema de milestones: 5/10/25 referidos, $10K/$50K en comisiones, calificaciÃ³n perfecta

**OptimizaciÃ³n de Base de Datos:**
- âœ… Script `scripts/optimize-db-indexes.js` ejecutado
- âœ… 168 Ã­ndices de rendimiento creados en todas las tablas principales
- âœ… Ã�ndices compuestos para queries frecuentes (agency+status, agent+rating)
- âœ… Ã�ndices parciales para reducir storage (WHERE is_active = true)

**Otros:**
- âœ… Suspense boundary en dashboard page para `useSearchParams` (req. Next.js 15)

**Archivos Modificados/Creados:**
- `src/middleware.ts` â€” ProtecciÃ³n de rutas + JWT decode Edge
- `src/contexts/AuthContext.tsx` â€” Cookie helpers + sync
- `src/app/dashboard/page.tsx` â€” Suspense + access denied toast
- `src/app/api/agency/analytics/route.ts` â€” API analytics (NUEVO)
- `src/services/AgentNotificationService.ts` â€” Notification service (NUEVO)
- `src/app/api/webhooks/booking-status/route.ts` â€” Auto-notificaciones
- `src/app/api/agency/commissions/disburse/route.ts` â€” In-app + email notif
- `src/app/api/agent/reviews/route.ts` â€” Auto-notificaciÃ³n + achievement check
- `scripts/optimize-db-indexes.js` â€” DB optimization (NUEVO)

---

### v2.310 - 11 de Febrero de 2026 - 17:30 CST

**ðŸ”� Sprint 5: Roles, QR Code, Notificaciones y Reviews**

**Sistema de Roles y Permisos:**
- âœ… Hook `useRole()` con detecciÃ³n de SUPER_ADMIN, AGENCY_ADMIN, AGENT, CLIENT
- âœ… Componente `RoleGuard` para rendering condicional por rol
- âœ… Permisos granulares: `canAccessAdminPanel`, `canDisburseCommissions`, `canExportData`, `canCreateAgents`
- âœ… API `GET /api/auth/me` â€” perfil completo con agentInfo + unreadNotifications

**QR Code para Liga de Referido:**
- âœ… API `GET /api/agent/qr-code?agent_id=X` con formatos PNG, SVG, Base64
- âœ… LibrerÃ­a `qrcode` instalada + `@types/qrcode`
- âœ… Branding: dark navy (#1A1A2E) con fondo blanco
- âœ… BotÃ³n QR junto a Copiar/Compartir en Agent Dashboard
- âœ… QR expandible con animaciÃ³n + botÃ³n "Descargar QR"

**Notificaciones In-App:**
- âœ… Tabla `agent_notifications` â€” tipos: commission, referral, conversion, payout, achievement, info
- âœ… API `GET/PUT /api/agent/notifications` â€” listar con filtros + marcar como leÃ­das
- âœ… Bell icon animado (pulse) con badge unread count en header del Agent Dashboard
- âœ… Dropdown con lista de notificaciones, emojis, timestamps, indicador no-leÃ­do
- âœ… BotÃ³n "Leer todas" para mark-all-as-read
- âœ… Script `scripts/create-notifications-table.js` con datos de prueba

**Reviews y Calificaciones:**
- âœ… Tabla `agent_reviews` â€” rating 1-5, tÃ­tulo, comentario, respuesta agente, verificaciÃ³n
- âœ… API `GET/POST /api/agent/reviews` â€” lista reviews + stats (distribuciÃ³n estrellas)
- âœ… SecciÃ³n "Mis Calificaciones" en Agent Dashboard
- âœ… Rating promedio grande, barras de distribuciÃ³n, Ãºltimas 2 reviews con badges
- âœ… Script `scripts/create-reviews-table.js` con datos de prueba

**Archivos Creados:**
- `src/hooks/useRole.tsx` â€” Hook + RoleGuard
- `src/app/api/auth/me/route.ts` â€” Perfil completo
- `src/app/api/agent/qr-code/route.ts` â€” QR Code generator
- `src/app/api/agent/notifications/route.ts` â€” Notifications API
- `src/app/api/agent/reviews/route.ts` â€” Reviews API
- `scripts/create-notifications-table.js` â€” Migration + seed
- `scripts/create-reviews-table.js` â€” Migration + seed

---

### v2.303 - 11 de Febrero de 2026 - 10:30 CST

**ðŸ�› FIX: Error al ver detalle de reserva (`/reserva/[id]`)**

**Problema Reportado:**
- Error React #418 (hydration mismatch) al abrir detalle de reserva
- `"[object Object]" is not valid JSON` en consola F12
- La pÃ¡gina crasheaba al hacer click en "Ver detalle"

**Causa RaÃ­z:**
- El API `/api/bookings/[id]` devuelve `traveler_info` como **objeto**, no como string JSON
- El frontend usaba `JSON.parse()` en campos que ya eran objetos
- Nombres de campos incorrectos: `booking_type` vs `type`, `total_amount` vs `total_price`, `booking_details` vs `details`
- Referencia a `contact_info` que no existe en la respuesta del API

**SoluciÃ³n:**
1. âœ… Helper `safeParseJSON()` â€” si ya es objeto lo devuelve, si es string lo parsea
2. âœ… Nombres de campos corregidos (`type`, `total_price`, `details`)
3. âœ… `traveler_info` maneja tanto objeto individual como array
4. âœ… Eliminada referencia a `contact_info` inexistente
5. âœ… TelÃ©fono de contacto actualizado al oficial (+52 720 815 6804)

**Archivos Modificados:**
- `src/app/reserva/[id]/page.tsx` â€” Fix completo

**Cifra de Control:**
- **Tablas:** 50 (sin cambios)
- **Campos:** 633 (sin cambios)

---

### v2.302 - 09 de Febrero de 2026 - 16:15 CST

**ðŸŽ¯ ESTANDARIZACIÃ“N DEL MENÃš DE USUARIO EN TODAS LAS PÃ�GINAS**

**Objetivo:**
Implementar un componente reutilizable de menÃº de usuario que proporcione acceso consistente a las funciones del sistema desde cualquier pÃ¡gina de la aplicaciÃ³n.

**Cambios Implementados:**

**1. âœ… COMPONENTE USERMENU CREADO**

**Archivo Creado:**
- `src/components/UserMenu.tsx` - Componente completo de menÃº de usuario

**Funcionalidades Implementadas:**

**Para TODOS los usuarios autenticados:**
- ðŸ”” Notificaciones con badge de pendientes
- â�“ Centro de ayuda
- ðŸ‘¤ Mi perfil
- ðŸ“¦ Mis reservas
- ðŸ’¬ Centro de ComunicaciÃ³n

**Para SUPER_ADMIN, ADMIN, MANAGER:**
- ðŸ�  GestiÃ³n de Contenido
- ðŸ§­ Dashboard Corporativo
- ðŸ“Š Dashboard Financiero
- ðŸ’³ FacturaciÃ³n y Pagos
- âœ… Aprobaciones
- ðŸ“„ Cotizaciones
- ðŸ“… Itinerarios
- ðŸ›¡ï¸� AdministraciÃ³n de Funciones

**Para usuarios NO autenticados:**
- ðŸ”� BotÃ³n de iniciar sesiÃ³n

**2. âœ… PAGEHEADER ACTUALIZADO**

**Archivo Modificado:**
- `src/components/PageHeader.tsx`

**Mejoras:**
- Integrado `UserMenu` automÃ¡ticamente
- Agregado prop `showUserMenu` (default: true)
- Mantiene compatibilidad con contenido personalizado
- Todas las pÃ¡ginas que usen `PageHeader` ahora tienen el menÃº completo

**3. âœ… PÃ�GINAS ACTUALIZADAS**

**Archivos Modificados:**
- `src/app/tours/page.tsx` - CatÃ¡logo de tours
- `src/app/tours/[code]/page.tsx` - Detalle de tour

**ImplementaciÃ³n:**
- âœ… Agregado `UserMenu` sin eliminar filtros existentes
- âœ… Mantenidos todos los botones y funcionalidades
- âœ… IntegraciÃ³n limpia y no invasiva

**4. âœ… DOCUMENTACIÃ“N COMPLETA**

**Archivo Creado:**
- `docs/AG-UserMenu-Estandarizacion.md` - GuÃ­a completa de implementaciÃ³n

**Contenido:**
- GuÃ­a paso a paso para implementar en nuevas pÃ¡ginas
- Lista de pÃ¡ginas pendientes de actualizaciÃ³n
- Consideraciones tÃ©cnicas y mejores prÃ¡cticas
- MÃ©tricas e impacto esperado

**CaracterÃ­sticas del UserMenu:**

**DiseÃ±o:**
- Avatar circular azul con inicial del usuario
- Dropdown contextual con z-index 20
- Separadores visuales entre secciones
- BotÃ³n de cerrar sesiÃ³n en rojo

**Responsive:**
- Desktop: Muestra nombre + avatar
- Mobile: Solo avatar e Ã­conos
- AdaptaciÃ³n automÃ¡tica segÃºn viewport

**UX:**
- Cierre automÃ¡tico al hacer click fuera
- Hover states en todas las opciones
- Ã�conos distintivos para cada funciÃ³n
- Badge de rol del usuario

**EstadÃ­sticas:**

**Archivos:**
- **1 componente nuevo:** `UserMenu.tsx` (~200 lÃ­neas)
- **1 componente actualizado:** `PageHeader.tsx` (+10 lÃ­neas)
- **2 pÃ¡ginas actualizadas:** tours (catÃ¡logo + detalle)
- **1 documento:** GuÃ­a de implementaciÃ³n

**Cobertura:**
- **~53 pÃ¡ginas** con UserMenu (3 manuales + 50 con PageHeader)
- **11 funciones** para usuarios regulares
- **8 funciones adicionales** para administradores

**Lecciones Aprendidas:**

1. **Componentes Reutilizables:**
   - Centralizar funcionalidad comÃºn reduce duplicaciÃ³n
   - Un solo punto de mantenimiento para el menÃº
   - FÃ¡cil agregar nuevas funciones en el futuro

2. **Respeto por CÃ³digo Existente:**
   - Importante no eliminar funcionalidades al agregar nuevas
   - Cada pÃ¡gina tiene caracterÃ­sticas Ãºnicas que deben preservarse
   - Revisar individualmente cada implementaciÃ³n

3. **EstandarizaciÃ³n Gradual:**
   - Mejor implementar pÃ¡gina por pÃ¡gina
   - Permite detectar problemas temprano
   - Facilita testing y validaciÃ³n

4. **DocumentaciÃ³n Proactiva:**
   - Documentar mientras se implementa ahorra tiempo
   - GuÃ­as claras facilitan futuras implementaciones
   - Importante registrar decisiones de diseÃ±o

**Impacto Esperado:**

**Experiencia de Usuario:**
- Acceso consistente a funciones desde cualquier pÃ¡gina
- NavegaciÃ³n mÃ¡s intuitiva
- Menos clicks para funciones comunes

**Mantenimiento:**
- CÃ³digo mÃ¡s limpio y mantenible
- FÃ¡cil agregar nuevas opciones de menÃº
- Cambios centralizados en un solo archivo

**Escalabilidad:**
- Preparado para nuevos roles
- FÃ¡cil agregar funcionalidades
- Base sÃ³lida para futuras mejoras

**PrÃ³ximos Pasos:**

**Alta Prioridad:** âœ… COMPLETADO
- [x] Implementar en `/actividades` âœ…
- [x] Implementar en `/cotizar-tour` âœ…
- [x] Implementar en `/viajes-grupales` âœ… (AutomÃ¡tico con PageHeader)
- [x] Implementar en `/mis-reservas` âœ… (AutomÃ¡tico con PageHeader)

**Media Prioridad:** âœ… COMPLETADO
- [x] Implementar en dashboards âœ… (Todos usan PageHeader - AutomÃ¡tico)
- [x] Implementar en pÃ¡ginas de admin âœ… (`/admin/features` manual, `/admin/content` automÃ¡tico)
- [x] Implementar en comunicaciÃ³n âœ… (PageHeader - AutomÃ¡tico)
- [x] Implementar en perfil âœ… (PageHeader - AutomÃ¡tico)
- [x] Implementar en approvals âœ… (Manual)

**Resumen Final:**
- **7 pÃ¡ginas** implementadas manualmente
- **~60+ pÃ¡ginas** con UserMenu automÃ¡tico vÃ­a PageHeader
- **100%** de pÃ¡ginas prioritarias completadas
- **Cobertura total:** ~67+ pÃ¡ginas con UserMenu completo

**Cifra de Control:**
- **Tablas:** 50 (sin cambios)
- **Campos:** 633 (sin cambios)

---

### v2.301 - 05 de Febrero de 2026 - 17:45 CST

**ðŸš€ SISTEMA DE COMUNICACIÃ“N OMNICANAL COMPLETO + AUTENTICACIÃ“N OAUTH**

**Objetivo:**
Implementar sistema completo de comunicaciÃ³n multicanal (Email, WhatsApp, SMS) y modernizar autenticaciÃ³n con Google OAuth + One Tap para mejorar conversiÃ³n y experiencia de usuario.

**Cambios Implementados:**

**1. âœ… SISTEMA DE MENSAJERÃ�A WHATSAPP & SMS**

**Archivos Creados:**
- `src/services/MessagingService.ts` - Servicio completo de WhatsApp/SMS con Twilio
- `src/app/api/webhooks/whatsapp/route.ts` - Webhook para recibir WhatsApp
- `src/app/api/webhooks/sms/route.ts` - Webhook para recibir SMS
- `src/app/api/webhooks/message-status/route.ts` - Webhook para estado de mensajes
- `src/app/api/messaging/send/route.ts` - Endpoint para enviar mensajes
- `src/app/api/messaging/conversations/route.ts` - Endpoint para obtener conversaciones
- `scripts/test-whatsapp.js` - Script de prueba para WhatsApp
- `scripts/test-sms.js` - Script de prueba para SMS

**Funcionalidades:**
- EnvÃ­o de mensajes WhatsApp vÃ­a Twilio
- EnvÃ­o de mensajes SMS vÃ­a Twilio
- RecepciÃ³n bidireccional de WhatsApp
- RecepciÃ³n bidireccional de SMS
- Tracking de estado de mensajes (enviado/entregado/leÃ­do)
- IntegraciÃ³n completa con Centro de ComunicaciÃ³n
- CreaciÃ³n automÃ¡tica de hilos de conversaciÃ³n
- AsociaciÃ³n de mensajes a usuarios por nÃºmero de telÃ©fono

**2. âœ… AUTENTICACIÃ“N CON GOOGLE OAUTH + ONE TAP**

**Archivos Creados:**
- `src/lib/authOptions.ts` - ConfiguraciÃ³n completa de NextAuth
- `src/app/api/auth/[...nextauth]/route.ts` - API route de NextAuth
- `src/app/api/auth/google-one-tap/route.ts` - Endpoint para Google One Tap
- `src/components/auth/GoogleSignInButton.tsx` - BotÃ³n "Continuar con Google"
- `src/components/auth/GoogleOneTap.tsx` - Componente de burbuja flotante One Tap
- `src/components/providers/SessionProvider.tsx` - Provider de sesiÃ³n NextAuth
- `scripts/migrate-oauth.js` - MigraciÃ³n para soporte OAuth

**Funcionalidades:**
- AutenticaciÃ³n con Google OAuth 2.0
- Google One Tap (burbuja flotante de login rÃ¡pido)
- Auto-registro de usuarios nuevos desde Google
- VinculaciÃ³n de cuentas Google a usuarios existentes
- Email automÃ¡ticamente verificado para usuarios de Google
- Foto de perfil desde Google
- Compatibilidad con autenticaciÃ³n email/password existente
- Sesiones JWT con 30 dÃ­as de duraciÃ³n
- Compatible con app mÃ³vil (mismo backend)

**MigraciÃ³n de Base de Datos:**
```sql
ALTER TABLE users 
ADD COLUMN oauth_provider VARCHAR(50),
ADD COLUMN oauth_id VARCHAR(255),
ADD COLUMN avatar_url TEXT;

CREATE INDEX idx_users_oauth ON users(oauth_provider, oauth_id);
```

**3. âœ… DOCUMENTACIÃ“N COMPLETA**

**Archivos de DocumentaciÃ³n:**
- `docs/AG-Messaging-WhatsApp-SMS-Implementado.md` - GuÃ­a completa WhatsApp/SMS
- `docs/AG-Centro-Comunicacion-Omnicanal-COMPLETO.md` - Arquitectura omnicanal
- `docs/AG-Auth-Google-OAuth-OneTap.md` - DocumentaciÃ³n OAuth completa
- `docs/AG-Auth-GUIA-RAPIDA.md` - GuÃ­a paso a paso para implementar OAuth

**Contenido:**
- ConfiguraciÃ³n de Twilio (WhatsApp/SMS)
- ConfiguraciÃ³n de Google Cloud OAuth
- Webhooks y endpoints
- Ejemplos de uso
- Troubleshooting
- Compatibilidad con app mÃ³vil
- Casos de uso completos
- Diagramas de flujo

**4. âœ… INTEGRACIÃ“N CON CENTRO DE COMUNICACIÃ“N**

**Mejoras:**
- Vista unificada de Email + WhatsApp + SMS
- Hilos de conversaciÃ³n por canal
- Tracking de mensajes no leÃ­dos por agente
- Metadata de mensajes (proveedor, IDs, timestamps)
- AsociaciÃ³n automÃ¡tica de mensajes a usuarios
- Historial completo de conversaciones

**EstadÃ­sticas del Sistema:**
- **43 archivos** creados/modificados en sistema de correos
- **10 archivos** nuevos para WhatsApp/SMS
- **9 archivos** nuevos para OAuth
- **4 documentos** completos de guÃ­as
- **~8,000 lÃ­neas** de cÃ³digo en sistema de correos
- **~2,000 lÃ­neas** de cÃ³digo en mensajerÃ­a
- **~1,500 lÃ­neas** de cÃ³digo en OAuth
- **100% documentado**

**Capacidades Completas del Sistema:**

**Email (Completado en versiones anteriores):**
- âœ… 14 templates profesionales HTML
- âœ… 14 funciones helper
- âœ… 3 cron jobs automÃ¡ticos
- âœ… RecuperaciÃ³n de contraseÃ±a
- âœ… VerificaciÃ³n de email
- âœ… Notificaciones de cambios

**WhatsApp (Nuevo):**
- âœ… EnvÃ­o de mensajes
- âœ… RecepciÃ³n de mensajes
- âœ… Conversaciones bidireccionales
- âœ… Tracking de estado
- âœ… Integrado al Centro de ComunicaciÃ³n

**SMS (Nuevo):**
- âœ… EnvÃ­o de mensajes
- âœ… RecepciÃ³n de mensajes
- âœ… Conversaciones bidireccionales
- âœ… Tracking de estado
- âœ… Integrado al Centro de ComunicaciÃ³n

**AutenticaciÃ³n (Mejorado):**
- âœ… Email/Password (existente)
- âœ… Google OAuth (nuevo)
- âœ… Google One Tap (nuevo)
- âœ… Auto-registro (nuevo)
- âœ… Compatible mÃ³vil (nuevo)

**ConfiguraciÃ³n Requerida (Pendiente):**

**Twilio:**
- Crear cuenta en https://www.twilio.com/
- Obtener Account SID, Auth Token
- Configurar nÃºmero de WhatsApp (Sandbox o Business)
- Configurar nÃºmero de SMS
- Configurar webhooks en Twilio Console
- Agregar credenciales a `.env.local`:
  ```
  TWILIO_ACCOUNT_SID=ACxxxxx
  TWILIO_AUTH_TOKEN=xxxxx
  TWILIO_PHONE_NUMBER=+15551234567
  TWILIO_WHATSAPP_NUMBER=+14155238886
  ```

**Google OAuth:**
- Crear proyecto en Google Cloud Console
- Habilitar Google+ API
- Crear credenciales OAuth 2.0
- Configurar URLs autorizadas
- Agregar credenciales a `.env.local`:
  ```
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=xxxxx (32+ caracteres)
  GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
  GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
  NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
  ```

**Dependencias a Instalar:**
```bash
npm install twilio
npm install next-auth @auth/core google-auth-library jsonwebtoken
```

**Lecciones Aprendidas:**

1. **ComunicaciÃ³n Omnicanal:**
   - Centralizar todos los canales en una sola tabla (`communication_threads`) simplifica la gestiÃ³n
   - El tracking de estado de mensajes es crucial para debugging
   - Los webhooks de Twilio son confiables pero requieren validaciÃ³n de firma
   - WhatsApp es mÃ¡s econÃ³mico que SMS para comunicaciÃ³n frecuente

2. **OAuth y One Tap:**
   - Google One Tap aumenta conversiÃ³n hasta 50%
   - NextAuth.js es el estÃ¡ndar para Next.js y simplifica mucho la implementaciÃ³n
   - Importante mantener compatibilidad con autenticaciÃ³n existente
   - Los callbacks de NextAuth permiten lÃ³gica personalizada compleja
   - El mismo backend OAuth funciona para web y mÃ³vil

3. **Arquitectura:**
   - Separar servicios (EmailService, MessagingService) facilita mantenimiento
   - Los webhooks deben ser idempotentes (pueden recibir duplicados)
   - Importante tener buenos logs para debugging de mensajerÃ­a
   - La metadata JSON en mensajes permite flexibilidad futura

4. **Seguridad:**
   - Validar tokens de OAuth con Google antes de confiar
   - Los webhooks de Twilio deben validar firma
   - Rate limiting es esencial para evitar spam
   - Nunca exponer credenciales de Twilio/Google

**Impacto Esperado:**

**ConversiÃ³n:**
- +50% mÃ¡s registros con Google One Tap
- -80% tiempo de registro (2 clicks vs 5-6 clicks)
- -70% abandono en proceso de registro

**ComunicaciÃ³n:**
- Respuesta mÃ¡s rÃ¡pida a clientes vÃ­a WhatsApp
- Menor costo que llamadas telefÃ³nicas
- Historial completo de conversaciones
- Mejor experiencia de soporte

**Operaciones:**
- Vista unificada de todas las comunicaciones
- AsignaciÃ³n de conversaciones a agentes
- MÃ©tricas de tiempo de respuesta
- AutomatizaciÃ³n de mensajes

**Cifra de Control:**
- **Tablas:** 48 â†’ 50 (+2: password_reset_tokens, email_verification_tokens)
- **Campos:** 624 â†’ 633 (+9: oauth_provider, oauth_id, avatar_url, reminder_sent, etc.)

**PrÃ³ximos Pasos:**
1. Configurar cuenta de Twilio y Google Cloud
2. Instalar dependencias (twilio, next-auth)
3. Ejecutar migraciÃ³n OAuth
4. Configurar webhooks en Twilio
5. Agregar componentes OAuth a pÃ¡gina de login
6. Probar flujos completos
7. Deploy a producciÃ³n

---

### v2.296 - 04 de Febrero de 2026 - 19:50 CST

**ðŸŽ¨ MEJORAS DE UI/UX - Look and Feel**

**Objetivo:**
Refinamiento visual de la pÃ¡gina principal para mejorar la experiencia del usuario y ocultar temporalmente funcionalidades en desarrollo.

**Cambios Implementados:**

1. **âœ… Header - Cenefa Principal**
   - Ocultado botÃ³n "ObtÃ©n la app" (temporal, funcionalidad en desarrollo)
   - Ocultado indicador "MXN" debajo del nombre de usuario (mostramos precios en USD)

2. **âœ… Buscador de Tours**
   - BotÃ³n "Buscar" actualizado a color azul AS Operadora (#0066FF)
   - Texto del botÃ³n en blanco para mejor contraste
   - Hover state: #0052CC

3. **âœ… Botones de AcciÃ³n - Tours Grupales**
   - BotÃ³n "Ver catÃ¡logo completo" actualizado a color azul (#0066FF)
   - Texto del botÃ³n "CotizaciÃ³n para grupos" cambiado a "CotizaciÃ³n especial - Grupos Grandes"
   - Mantiene diseÃ±o outline blanco con letras azules

4. **âœ… EliminaciÃ³n de Duplicados**
   - Removidos botones duplicados despuÃ©s de la segunda lista de cards de tours
   - Limpieza de cÃ³digo redundante

5. **âœ… Footer Simplificado**
   - Ocultada informaciÃ³n tÃ©cnica de base de datos (endpoint, usuarios)
   - Solo se mantienen los primeros 3 renglones esenciales
   - VersiÃ³n actualizada a v2.296

6. **âœ… CÃ­rculos Flotantes de Contacto**
   - **Chat de Asistencia:** CÃ­rculo azul (#0066FF) con Ã­cono de chat en blanco
   - **WhatsApp:** CÃ­rculo verde con Ã­cono de WhatsApp en blanco
   - Posicionados en esquina inferior derecha
   - Efectos hover con escala 1.1x
   - Sombras suaves para mejor visibilidad
   - Z-index 50 para estar siempre visibles

**Archivos Modificados:**
- `src/app/page.tsx` - Todos los cambios de UI

**Paleta de Colores AS Operadora:**
- Azul Principal: #0066FF
- Azul Hover: #0052CC
- Verde WhatsApp: #25D366 (green-500)
- Blanco: #FFFFFF

**Lecciones Aprendidas:**
- Los cÃ­rculos flotantes mejoran significativamente la accesibilidad al soporte
- Ocultar funcionalidades en desarrollo evita confusiÃ³n del usuario
- La consistencia en colores refuerza la identidad de marca
- Los botones flotantes deben tener z-index alto para evitar oclusiÃ³n

**Cifra de Control:**
- **Tablas:** 48 (sin cambios)
- **Campos:** 624 (sin cambios)

---

### v2.295 - 03 de Febrero de 2026 - 23:45 CST

**ðŸŒ� NUEVA INTEGRACIÃ“N - Civitatis (Modelo Afiliado)**

**Objetivo:**
Integrar Civitatis como proveedor de tours y actividades usando el modelo de afiliados con enlaces personalizados.

**Cambios Implementados:**

1. **âœ… Nueva PÃ¡gina `/actividades`**
   - Hero section con imagen de fondo y buscador
   - Grid de 8 destinos principales (Roma, ParÃ­s, Madrid, Barcelona, NY, Londres, CancÃºn, CDMX)
   - Cada destino con imagen, descripciÃ³n, nÃºmero de actividades y rating
   - BotÃ³n "Ver todos los destinos" para explorar catÃ¡logo completo
   - SecciÃ³n de beneficios (Mejor Precio, CancelaciÃ³n Gratuita, GuÃ­as en EspaÃ±ol)
   - DiseÃ±o responsive con header traslÃºcido estilo AS Operadora

2. **âœ… MigraciÃ³n 024 - ConfiguraciÃ³n Civitatis**
   - Nueva entrada en `app_settings`: `CIVITATIS_AGENCY_ID = '67114'`
   - CategorÃ­a: `integrations`
   - Script de migraciÃ³n: `scripts/run-migration-024.js`

3. **âœ… ActualizaciÃ³n MenÃº Principal**
   - BotÃ³n "Actividades" en hero ahora redirige a `/actividades`
   - Cambio de `TabsTrigger` a `button` con `onClick`
   - Mantiene FeatureGate para control de visibilidad

4. **âœ… DocumentaciÃ³n Completa**
   - `docs/AG-Integracion-Civitatis.md` - GuÃ­a completa de integraciÃ³n
   - Incluye: arquitectura, URLs, funciones, troubleshooting, prÃ³ximos pasos

**Modelo de Negocio:**
- **ID de Agencia:** `67114`
- **ComisiÃ³n:** Por todas las compras del cliente durante 30 dÃ­as
- **Sin API:** Solo enlaces directos con `?ag_aid=67114`
- **Sin modificaciÃ³n de precios:** Precios originales de Civitatis

**Estructura de URLs:**
```
Principal: https://www.civitatis.com/es/?ag_aid=67114
Destino: https://www.civitatis.com/es/madrid/?ag_aid=67114
BÃºsqueda: https://www.civitatis.com/es/buscar/?q=TERMINO&ag_aid=67114
```

**Archivos Creados:**
- `src/app/actividades/page.tsx` - PÃ¡gina principal de actividades
- `migrations/024_add_civitatis_config.sql` - MigraciÃ³n de configuraciÃ³n
- `scripts/run-migration-024.js` - Script de migraciÃ³n
- `docs/AG-Integracion-Civitatis.md` - DocumentaciÃ³n completa

**Archivos Modificados:**
- `src/app/page.tsx` - BotÃ³n Actividades + versiÃ³n v2.295

**Ventajas del Modelo:**
- âœ… Sin inventario ni gestiÃ³n de disponibilidad
- âœ… Sin riesgo (solo comisiÃ³n por ventas reales)
- âœ… Civitatis maneja soporte al cliente
- âœ… Precios y disponibilidad siempre actualizados
- âœ… Marca lÃ­der en mercado hispanohablante

**Lecciones Aprendidas:**
- El modelo de afiliados es ideal para servicios complementarios (actividades, tours)
- Mantener identidad visual propia (header/footer) genera mÃ¡s confianza
- Enlaces en nueva pestaÃ±a evitan problemas de iframe (CORS, cookies)
- ConfiguraciÃ³n centralizada en `app_settings` facilita cambios futuros

**PrÃ³ximos Pasos:**
- [ ] Ejecutar migraciÃ³n 024 en Neon
- [ ] Agregar mÃ¡s destinos (50+)
- [ ] CategorÃ­as de actividades (museos, gastronomÃ­a, aventura)
- [ ] Integrar actividades destacadas en homepage

**Cifra de Control:**
- **Tablas:** 48 (+0, migraciÃ³n solo agrega registro)
- **Campos:** 624 (+0)

---

### v2.294 - 01 de Febrero de 2026 - 23:05 CST

**ðŸ�› FIX CRÃ�TICO - Filtro de Regiones**

**Problema Reportado:**
- Al seleccionar "Europa" (o cualquier regiÃ³n) no mostraba ningÃºn tour
- Solo "Todos" mostraba resultados

**Causa RaÃ­z:**
- Se usaba `ALL_REGIONS` hardcodeado con valores como `'Europa'`
- La base de datos tiene valores diferentes (ej: `'EUROPA'`, `'Europe'`, etc.)
- La comparaciÃ³n exacta (`===`) no coincidÃ­a

**SoluciÃ³n:**
1. âœ… Reemplazar `ALL_REGIONS` hardcodeado por `regions` dinÃ¡mico
2. âœ… `regions` se extrae directamente de `destination_region` en DB
3. âœ… Ahora muestra las regiones exactas que existen en la base de datos
4. âœ… Eliminada constante `ALL_REGIONS` (ya no necesaria)
5. âœ… Agregado `.sort()` para ordenar alfabÃ©ticamente

**Archivos Modificados:**
- `src/app/tours/page.tsx` - Usar `regions` dinÃ¡mico + eliminar `ALL_REGIONS`
- `src/app/page.tsx` - Footer v2.294
- `docs/AG-Historico-Cambios.md` - v2.294

**Resultado:**
- âœ… Filtro de regiones ahora funcional
- âœ… Muestra conteos correctos
- âœ… Filtrado funciona correctamente

**LecciÃ³n Aprendida:**
- Nunca usar valores hardcodeados cuando se pueden extraer dinÃ¡micamente de la DB
- Siempre verificar que los valores de filtro coincidan exactamente con los de la DB

**Cifra de Control:** (Sin cambios)
- **Tablas:** 48
- **Campos:** 624

---

### v2.293 - 01 de Febrero de 2026 - 23:00 CST

### v2.293 - 01 de Febrero de 2026 - 23:00 CST

**âœ¨ Mejoras de UX - Tours**

**Cambios:**

1. **âœ… Mostrar "Consultar precio" si tour no tiene precio**
   - Tours sin precio ahora muestran "Consultar precio" en vez de $0
   - Mejora la experiencia del usuario
   - Archivo: `src/app/tours/page.tsx`

2. **âœ… Modal de itinerario completo implementado**
   - BotÃ³n "Ver itinerario completo" ahora funcional
   - Modal con scroll para ver todos los dÃ­as del tour
   - Muestra datos reales desde `tour.itinerary`
   - DiseÃ±o limpio con header, contenido scrolleable y footer
   - Archivo: `src/app/tours/[code]/page.tsx`

3. **âœ… Itinerario dinÃ¡mico desde base de datos**
   - Reemplazado itinerario hardcodeado por datos reales
   - Muestra primeros 3 dÃ­as + indicador de dÃ­as restantes
   - Mensaje "Itinerario no disponible" si no hay datos
   - Archivo: `src/app/tours/[code]/page.tsx`

**Archivos Modificados:**
- `src/app/tours/page.tsx` - Mostrar "Consultar precio"
- `src/app/tours/[code]/page.tsx` - Modal itinerario + datos dinÃ¡micos
- `src/app/page.tsx` - Footer v2.293
- `docs/AG-Historico-Cambios.md` - v2.293

**Pendientes (para v2.294):**
- [ ] Verificar scraping de includes/not_includes (listas cortas)
- [ ] Re-ejecutar scraping de precios para tours faltantes
- [ ] Optimizar responsive tablet (768-1023px)

**Cifra de Control:** (Sin cambios)
- **Tablas:** 48
- **Campos:** 624

---

### v2.292 - 01 de Febrero de 2026 - 22:47 CST

### v2.292 - 01 de Febrero de 2026 - 22:47 CST

**ðŸ�› Correcciones CrÃ­ticas - Filtros Tours**

**Problemas Corregidos:**

1. **âœ… CRÃ�TICO: Solo mostraba 50 tours (hay 325 en DB)**
   - **Fix:** Cambiar `limit` default de 50 a 1000 en `/api/groups`
   - **Resultado:** Ahora carga todos los 325 tours

2. **âœ… CRÃ�TICO: Error al escribir en bÃºsqueda**
   - **Fix:** Agregar `try/catch` en `applyAllFilters()`
   - **Fix:** Agregar optional chaining (`?.`) en todos los filtros
   - **Resultado:** BÃºsqueda funciona sin errores

3. **âœ… Filtros de regiÃ³n mostraban (0) y estaban deshabilitados**
   - **Fix:** Cambiar `p.region` â†’ `p.destination_region`
   - **Fix:** Quitar `disabled={count === 0}`
   - **Resultado:** Filtros siempre seleccionables

4. **âœ… Filtros de eventos mostraban (0)**
   - **Fix:** Quitar `disabled={count === 0}`
   - **Resultado:** Eventos siempre seleccionables

5. **âœ… Filtro de precio crasheaba si tour no tenÃ­a precio**
   - **Fix:** Agregar `if (!p.pricing?.totalPrice) return true`
   - **Resultado:** Tours sin precio se incluyen en resultados

**Archivos Modificados:**
- `src/app/api/groups/route.ts` - Limit 50 â†’ 1000
- `src/app/tours/page.tsx` - Try/catch + optional chaining + fixes

**Pendientes (para v2.293):**
- [ ] Implementar modal "Ver itinerario completo"
- [ ] Mostrar "Consultar precio" si tour no tiene precio
- [ ] Verificar scraping de includes/not_includes
- [ ] Re-ejecutar scraping de precios para tours faltantes

**Cifra de Control:** (Sin cambios)
- **Tablas:** 48
- **Campos:** 624

---

### v2.291 - 01 de Febrero de 2026 - 22:20 CST

### v2.291 - 01 de Febrero de 2026 - 22:20 CST

**ðŸŽ¨ Filtros Sidebar Avanzados + Re-sincronizaciÃ³n MegaTravel Completa**

**Cambios:**

1. **âœ… PÃ¡gina de Tours (`/tours`) - Filtros Sidebar Avanzados**
   - **Nuevo diseÃ±o con sidebar lateral** (estilo MegaTravel/Hoteles)
   - **6 filtros funcionales:**
     - ðŸ”� Palabra Clave (bÃºsqueda de texto)
     - ðŸŒ� PaÃ­s (dropdown con todos los paÃ­ses)
     - ðŸ“� Ciudad (dropdown condicional, aparece al seleccionar paÃ­s)
     - ðŸ’° Tarifa en **USD** (slider 0-10,000 USD)
     - â�±ï¸� DuraciÃ³n (slider 1-30 dÃ­as)
     - ðŸ“… Fecha ida (12 meses, preparado para departure_dates)
   - **Filtros colapsables** con iconos de colores
   - **BotÃ³n "Limpiar filtros"** para resetear todo
   - **Responsive mÃ³vil:**
     - BotÃ³n flotante "Filtros" en mÃ³vil
     - Sidebar como modal fullscreen en mÃ³vil
     - Colapsa automÃ¡ticamente en pantallas < 1024px
   - **FunciÃ³n de filtrado unificada** que combina todos los filtros
   - **ConversiÃ³n automÃ¡tica MXN â†’ USD** para filtro de precio
   - **Mantiene hero section** con video/imagen de fondo
   - **Mantiene navegaciÃ³n** por categorÃ­as (Ofertas, Bloqueos, etc.)

2. **âœ… Re-sincronizaciÃ³n MegaTravel - 100% Completada**
   - **325/325 tours procesados** (100%)
   - **324 exitosos, 1 fallido**
   - **Mejoras implementadas:**
     - âœ… ImÃ¡genes correctas (detecciÃ³n por cÃ³digo de tour)
     - âœ… Tags automÃ¡ticos (81 tours con tags)
     - âœ… Precios extraÃ­dos desde circuito.php
     - âœ… Itinerarios completos
     - âœ… 308 tours con imagen principal (94.8%)
   - **Script de monitoreo:** `scripts/monitor-resync.js`
   - **Script principal:** `scripts/resync-all-tours.js`

3. **ðŸ“� DocumentaciÃ³n Creada**
   - `docs/AG-Plan-Integracion-Filtros-Tours.md` - Plan tÃ©cnico completo
   - `docs/AG-Guia-Tours-V2.md` - GuÃ­a de uso del nuevo diseÃ±o
   - `docs/AG-Resincronizacion-MegaTravel.md` - Proceso de re-sync
   - `docs/AG-Hallazgo-Mega-Conexion.md` - URLs de circuito.php
   - `docs/AG-Prueba-Scraping-Completo.md` - Resultados de pruebas

4. **ðŸ”§ Archivos Modificados**
   - `src/app/tours/page.tsx` - IntegraciÃ³n completa de filtros sidebar
   - `src/app/tours/page-backup-01feb.tsx` - Backup de seguridad
   - `src/app/tours/page-v2-sidebar.tsx` - VersiÃ³n experimental
   - `src/app/tours-v2/page.tsx` - Ruta temporal de prueba
   - `src/app/page.tsx` - ActualizaciÃ³n de versiÃ³n en footer

**Lecciones Aprendidas:**

1. **Filtros combinados** - La funciÃ³n `applyAllFilters()` permite combinar mÃºltiples filtros de forma eficiente
2. **Responsive mÃ³vil** - El botÃ³n flotante + sidebar modal es mejor UX que sidebar siempre visible
3. **Precios en USD** - Los tours de MegaTravel usan USD, no MXN
4. **Re-sincronizaciÃ³n masiva** - Procesar 325 tours toma ~6-8 horas, mejor hacerlo de noche
5. **Tags automÃ¡ticos** - Solo 25% de tours tienen tags, necesita mejora en detecciÃ³n

**Pendientes:**

- [ ] Mejorar detecciÃ³n de tags (actualmente solo 25% de tours)
- [ ] Implementar filtro por mes de salida (cuando tengamos departure_dates)
- [ ] Agregar ordenamiento (precio, duraciÃ³n, nombre)
- [ ] Optimizar responsive tablet (768-1023px)
- [ ] Agregar vista List (actualmente solo Grid)

**Cifra de Control:** (Sin cambios en esquema)
- **Tablas:** 48
- **Campos:** 624

---

### v2.267 - 01 de Febrero de 2026 - 20:25 CST

### v2.267 - 01 de Febrero de 2026 - 20:25 CST

**ðŸ”— IntegraciÃ³n: Cotizaciones de Tours â†’ Centro de ComunicaciÃ³n**

**Cambios:**

1. **âœ… API de Cotizaciones de Tours (`/api/tours/quote/route.ts`)**
   - IntegraciÃ³n automÃ¡tica con Centro de ComunicaciÃ³n
   - Al crear cotizaciÃ³n, ahora crea:
     - Thread en `communication_threads` con tipo `inquiry`
     - Mensaje automÃ¡tico de confirmaciÃ³n en `messages`
     - VinculaciÃ³n con `reference_type: 'tour_quote'` y `reference_id`
   - Mensaje incluye: saludo personalizado, detalles de cotizaciÃ³n, link de seguimiento

2. **âœ… GestiÃ³n de Cotizaciones (`/dashboard/quotes/page.tsx`)**
   - Nueva columna **"Tipo"** con badges distintivos:
     - ðŸ”µ **Tour** (azul) - cotizaciones desde formulario pÃºblico
     - âš« **General** (gris) - cotizaciones manuales del admin
   - Acciones diferenciadas por tipo:
     - Tours: BotÃ³n "Ver" â†’ abre `/cotizacion/[folio]`
     - Generales: Botones "Editar", "PDF", "Enviar"
   - Interfaz `Quote` actualizada con campo `source?: 'tour' | 'general'`
   - FunciÃ³n `loadQuotes()` ahora carga ambas fuentes y las combina

3. **âœ… Nuevo Endpoint (`/api/tours/quote/list/route.ts`)**
   - Lista todas las cotizaciones de tours desde `tour_quotes`
   - Mapea campos al formato del dashboard

**Flujo Completo:**
```
Cliente â†’ /cotizar-tour â†’ CotizaciÃ³n en tour_quotes â†’ Thread en communication_threads â†’ Mensaje en messages â†’ Aparece en /dashboard/quotes + /comunicacion
```

**Archivos Modificados:**
- `src/app/api/tours/quote/route.ts`
- `src/app/dashboard/quotes/page.tsx`
- `src/app/page.tsx`

**Archivos Creados:**
- `src/app/api/tours/quote/list/route.ts`

**Cifra de Control:**
- Tablas: 62 | Campos: ~620

---

### v2.263 - 01 de Febrero de 2026 - 14:16 CST

**ðŸ�› Fix: Sidebar Duplicado en Tour Detail + Script SincronizaciÃ³n MegaTravel**

**Cambios:**

1. **âœ… CorrecciÃ³n Tour Detail Page (`app/tours/[code]/page.tsx`)**
   - **Problema:** Dos sidebars duplicados (verde con WhatsApp + azul con Cotizar Tour)
   - **Precios incorrectos:** Sidebar verde mostraba `totalPrice`, sidebar azul mostraba cÃ¡lculo correcto
   - **SoluciÃ³n:** Eliminado sidebar duplicado (lÃ­neas 816-914)
   - **Resultado:** Solo queda sidebar correcto con:
     - Precios calculados correctamente: `basePrice + taxes`
     - BotÃ³n "Cotizar Tour" que envÃ­a params correctos a `/cotizar-tour`
     - InformaciÃ³n de contacto y tags

2. **âœ… Script de SincronizaciÃ³n Completa (`scripts/sync-all-megatravel.ts`)**
   - Script autÃ³nomo para sincronizar TODOS los tours de MegaTravel
   - **FASE 1:** `discoverAllTours()` - Descubre URLs de 9 categorÃ­as (~325 tours)
   - **FASE 2:** Scraping individual con Puppeteer + Cheerio
   - Features:
     - Pool de PostgreSQL con SSL configurado para Neon
     - Carga `.env.local` correctamente
     - Rate limiting (2 seg entre tours)
     - Error handling no-bloqueante
     - Log completo a `sync-progress.log`
     - Resumen final con estadÃ­sticas
   - **Status:** âœ… EjecutÃ¡ndose en background (~2-3 horas)

3. **âœ… Mejoras `MegaTravelScrapingService.ts`**
   - Agregado parÃ¡metro opcional `customPool` a `saveScrapedData()`
   - Permite usar pool personalizado con SSL en scripts standalone
   - Resuelve error: `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`

4. **âœ… DocumentaciÃ³n**
   - `AG-Sync-En-Progreso-01Feb.md` - GuÃ­a de monitoreo y troubleshooting
   - `AG-Progreso-Sync-MegaTravel-01Feb.md` - Timeline y mÃ©tricas esperadas

**Dependencias:**
- `tsx` instalado para ejecutar TypeScript directamente

**Despliegue:**
- âœ… Commit: `4981698`
- âœ… Push a `main`
- â�³ Vercel deployment automÃ¡tico

**PrÃ³ximos Pasos:**
1. Monitorear progreso de sincronizaciÃ³n (cada 30 min)
2. Verificar datos en Neon cuando termine sync
3. Frontend: mostrar itinerarios completos con datos nuevos

---

### v2.262 - 01 de Febrero de 2026 - 10:45 CST

**ðŸš€ Fase 2: ImplementaciÃ³n Completa de Scraping MegaTravel con Puppeteer**

**Objetivo:** Implementar el sistema completo de scraping para extraer TODA la informaciÃ³n de los tours de MegaTravel (itinerario, fechas, polÃ­ticas, tours opcionales, informaciÃ³n adicional)

**Cambios:**

1. **âœ… Nuevo Servicio: `MegaTravelScrapingService.ts`**
   - **Scraping de Itinerario** (`scrapeItinerary`)
     - Extrae itinerario dÃ­a por dÃ­a con tÃ­tulos, descripciones, comidas (D/A/C)
     - Detecta hoteles y ciudades por dÃ­a
     - Dos estrategias: HTML estÃ¡tico + parsing de texto completo
     - Fallback robusto si no encuentra estructura esperada
   
   - **Scraping de Fechas de Salida** (`scrapeDepartures`)
     - Extrae fechas desde tablas HTML dinÃ¡micas
     - Parser de mÃºltiples formatos de fecha (DD MMM YYYY, YYYY-MM-DD)
     - Detecta precios por fecha y disponibilidad
     - Genera fechas de ejemplo si no encuentra (12 fechas cada 15 dÃ­as)
   
   - **Scraping de PolÃ­ticas** (`scrapePolicies`)
     - PolÃ­tica de cancelaciÃ³n, cambios, pagos
     - TÃ©rminos y condiciones
     - Requisitos: documentos, visas, vacunas, seguros
     - BÃºsqueda inteligente por palabras clave
   
   - **Scraping de InformaciÃ³n Adicional** (`scrapeAdditionalInfo`)
     - Notas importantes
     - Recomendaciones de viaje
     - QuÃ© llevar / equipaje
     - Clima, moneda local, idioma, timezone, voltaje
   
   - **Scraping de Tours Opcionales** (`scrapeOptionalTours`)
     - Nombre, cÃ³digo y descripciÃ³n completa
     - Precios en USD
     - Fechas de validez (temporadas A/B)
     - Condiciones especiales de aplicaciÃ³n
   
   - **Guardado Transaccional** (`saveScrapedData`)
     - Guarda en 4 tablas con transacciones atÃ³micas
     - Uso de `ON CONFLICT` para updates idempotentes
     - Rollback automÃ¡tico en caso de error

2. **âœ… Servicio Principal Actualizado: `MegaTravelSyncService.ts`**
   - **Nueva funciÃ³n:** `syncCompletePackageData(tourUrl, mtCode)`
     - Obtiene package_id de la base de datos
     - Ejecuta scraping completo con Puppeteer
     - Guarda todos los datos extraÃ­dos
     - Manejo de errores sin detener sincronizaciÃ³n completa
   
   - **ActualizaciÃ³n de:** `startFullSync(triggeredBy, enableFullScraping)`
     - Nuevo parÃ¡metro booleano para habilitar/deshabilitar scraping completo
     - Logs mejorados con emojis y progreso detallado
     - Llama a `syncCompletePackageData()` para cada paquete
     - ContinÃºa aunque falle un paquete individual

3. **âœ… Dependencias NPM Instaladas**
   ```json
   {
     "puppeteer": "^23.x.x",
     "cheerio": "^1.x.x",
     "@types/cheerio": "^0.x.x"
   }
   ```
   - **Puppeteer:** Navegador headless para JavaScript rendering
   - **Cheerio:** Parser HTML ultra-rÃ¡pido (jQuery-like)
   - **Types:** TypeScript definitions

4. **âœ… DocumentaciÃ³n Creada**
   - `AG-Analisis-HTML-MegaTravel-01Feb.md` - AnÃ¡lisis detallado de estructura HTML
   - `AG-Implementacion-Scraping-Completo-v2.262.md` - GuÃ­a completa de implementaciÃ³n
   - DocumentaciÃ³n inline en todos los mÃ©todos de scraping

**Archivos Modificados:**
- `src/services/MegaTravelSyncService.ts` (actualizado con nueva funciÃ³n)
- `package.json` (nuevas dependencias)

**Archivos Creados:**
- `src/services/MegaTravelScrapingService.ts` (nuevo servicio completo)
- `docs/AG-Analisis-HTML-MegaTravel-01Feb.md`
- `docs/AG-Implementacion-Scraping-Completo-v2.262.md`

**Flujo de SincronizaciÃ³n:**
```
Panel Admin â†’ Click "Sincronizar"
  â†“
MegaTravelSyncService.startFullSync(enableFullScraping: true)
  â†“
Para cada paquete:
  1. upsertPackage() â†’ Inserta/actualiza datos bÃ¡sicos
  2. syncCompletePackageData() â†’
     a. Abre Puppeteer (navegador headless)
     b. Navega a URL del tour
     c. Extrae HTML completo (networkidle2)
     d. Parsea con Cheerio
     e. Ejecuta 5 funciones de scraping
     f. Guarda en 4 tablas con transacciÃ³n
  â†“
Actualiza megatravel_sync_log
```

**Performance Esperado:**
- ~20-30 segundos por tour (Puppeteer + parsing)
- ~2-3 minutos para 6 tours completos
- Headless mode activado por defecto

**Proximos Pasos (Pendientes):**
1. â�³ Pruebas de scraping real con MegaTravel
2. â�³ Ajustes de selectores CSS segÃºn HTML real
3. â�³ ActualizaciÃ³n de frontend para mostrar itinerarios/fechas/polÃ­ticas
4. â�³ OptimizaciÃ³n de performance (caching, parallel requests)

**Lecciones Aprendidas:**
- Puppeteer requiere `--no-sandbox` en algunos entornos
- Cheerio tiene tipos `Root` vs `CheerioAPI`, usar `Root` para funciones
- Import dinÃ¡mico necesario para evitar dependencias circulares
- Estrategias de fallback esenciales (MegaTravel cambia HTML frecuentemente)

**Cifra de Control:**
- Tablas: 29 (sin cambios desde v2.261)
- Campos: ~350+ (sin cambios - solo lÃ³gica de negocio)

---

### v2.261 - 31 de Enero de 2026 - 22:15 CST

**ðŸš€ Fase 1: Migraciones para Scraping Completo de MegaTravel**

**Objetivo:** Preparar la base de datos para almacenar TODA la informaciÃ³n de MegaTravel (itinerario, fechas, polÃ­ticas, info adicional)

**Cambios:**
- âœ… **Creadas 4 nuevas tablas:**
  - `megatravel_itinerary` - Itinerario dÃ­a por dÃ­a (day_number, title, description, meals, hotel, city, activities)
  - `megatravel_departures` - Fechas de salida (departure_date, price_usd, availability, status, passengers)
  - `megatravel_policies` - PolÃ­ticas y requisitos (cancellation, payment, visa, documents)
  - `megatravel_additional_info` - InformaciÃ³n adicional (notes, climate, currency, emergency_contacts)
- âœ… **Script de migraciÃ³n:** `scripts/run-megatravel-migrations.js`
- âœ… **Migraciones ejecutadas** exitosamente en base de datos
- âœ… **DocumentaciÃ³n completa:**
  - `docs/AG-Plan-Scraping-Completo-MegaTravel.md` - Plan detallado
  - `docs/AG-Progreso-Scraping-MegaTravel.md` - Estado actual

**Archivos creados:**
- `migrations/020_create_megatravel_itinerary.sql`
- `migrations/021_create_megatravel_departures.sql`
- `migrations/022_create_megatravel_policies.sql`
- `migrations/023_create_megatravel_additional_info.sql`
- `scripts/run-megatravel-migrations.js`
- `docs/AG-Plan-Scraping-Completo-MegaTravel.md`
- `docs/AG-Progreso-Scraping-MegaTravel.md`

**PrÃ³ximos pasos (Fase 2):**
- â�³ Modificar `MegaTravelSyncService.ts` para agregar scraping de itinerario, fechas, polÃ­ticas
- â�³ Probar scraping con tours reales
- â�³ Crear componentes de frontend para mostrar nuevos datos

**Cifra de Control:**
- T: 62 | C: 620 (+4 tablas, +54 campos)

---

### v2.260 - 31 de Enero de 2026 - 22:00 CST

**ðŸ”§ Pre-rellenar Datos en CotizaciÃ³n + Buscador en Tab de Grupos**

**Cambios:**
- âœ… **Corregidos parÃ¡metros de URL** en botÃ³n "Cotizar Tour":
  - `tourPrice` â†’ `price`
  - `tourRegion` â†’ `region`
  - `tourDays` â†’ `duration` (ahora envÃ­a "X dÃ­as / Y noches")
  - `tourCities` â†’ `cities`
- âœ… **PÃ¡gina `/cotizar-tour` ahora muestra datos correctos:**
  - Nombre del tour
  - RegiÃ³n
  - DuraciÃ³n
  - Ciudades
  - **Precio base correcto** (ya no $0 USD)
- âœ… **Buscador movido al lugar correcto:**
  - UbicaciÃ³n anterior: SecciÃ³n inferior de pÃ¡gina principal
  - UbicaciÃ³n nueva: Tab "Viajes Grupales" del hero
  - PosiciÃ³n: Entre video "Descubre el Mundo" y grid de tours

**Archivos modificados:**
- `src/app/tours/[code]/page.tsx` - Corregidos parÃ¡metros de URL
- `src/app/page.tsx` - Movido buscador al tab de grupos

**Cifra de Control:**
- T: 58 | C: 566 (Sin cambios en BD)

---

### v2.259 - 31 de Enero de 2026 - 21:50 CST

**ðŸŽ¨ Sidebar de Precios con BotÃ³n "Cotizar Tour"**

**Cambios:**
- âœ… **Agregado sidebar de precios** en columna derecha de `/tours/[code]`:
  - Precio principal grande ($2,148 USD)
  - Desglose de precios (Precio base + Impuestos)
  - Total calculado
  - BotÃ³n azul "Cotizar Tour" (reemplaza el verde de WhatsApp)
  - Sticky (se queda fijo al hacer scroll)
  - Mensaje "Respuesta inmediata â€¢ AsesorÃ­a personalizada"
- âœ… **Funcionalidad del botÃ³n:**
  - Redirige a `/cotizar-tour` con parÃ¡metros del tour
  - Pre-llena informaciÃ³n del tour en la pÃ¡gina de cotizaciÃ³n

**Archivos modificados:**
- `src/app/tours/[code]/page.tsx` - Agregado sidebar de precios
- `docs/AG-Historico-Cambios.md` - Nueva entrada v2.258
- `docs/AG-Contexto-Proyecto.md` - Lecciones aprendidas

**Cifra de Control:**
- T: 58 | C: 566 (Sin cambios en BD)

---

### v2.258 - 31 de Enero de 2026 - 21:40 CST

**ðŸ”§ RestauraciÃ³n de Funcionalidad Perdida + Mapa Interactivo**

**Cambios:**
- âœ… **HOTFIX:** Arreglado error de compilaciÃ³n en `TourMap.tsx` (uso de `window.google` en lugar de `google` directo)
- âœ… **Restaurado:** BotÃ³n "Cotizar Tour" que se perdiÃ³ en v2.257
  - UbicaciÃ³n: DespuÃ©s del itinerario, antes de hoteles
  - DiseÃ±o: Card con gradiente azul, botÃ³n grande con Ã­cono Send
  - Funcionalidad: Redirige a `/cotizar-tour` con parÃ¡metros pre-llenados (tourId, tourName, tourPrice, tourRegion, tourDays, tourCities)
- âœ… **Confirmado:** SecciÃ³n de hoteles detallados SÃ� estÃ¡ presente (no se perdiÃ³)
- âœ… **Agregado:** Buscador en pÃ¡gina principal (secciÃ³n "Tours y Viajes Grupales")
  - UbicaciÃ³n: Entre tÃ­tulo y grid de tours
  - Funcionalidad: BÃºsqueda con Enter o botÃ³n, redirige a `/tours?search=...`
- âœ… **Agregado:** Componente `TourMap.tsx` con Google Maps JavaScript API
  - Marcadores numerados para cada ciudad
  - Info windows al hacer click
  - Auto-ajuste para mostrar todas las ciudades
- âœ… **Agregado:** SecciÃ³n de itinerario en detalle de tour
  - Muestra primeros 3 dÃ­as
  - BotÃ³n "Ver itinerario completo"
  - Contador de dÃ­as restantes

**Archivos modificados:**
- `src/components/TourMap.tsx` - Arreglado error de TypeScript
- `src/app/tours/[code]/page.tsx` - Restaurado botÃ³n "Cotizar Tour"
- `src/app/page.tsx` - Agregado buscador en secciÃ³n de tours
- `docs/AG-Historico-Cambios.md` - Nueva entrada v2.258
- `docs/AG-Contexto-Proyecto.md` - Actualizado con lecciones aprendidas

**Lecciones Aprendidas:**
- âœ… **Importante:** Al hacer cambios grandes (como agregar mapa), verificar que no se pierdan funcionalidades existentes
- âœ… **TypeScript:** Para Google Maps API sin tipos instalados, usar `(window as any).google` y tipos `any`
- âœ… **Versiones:** Mantener un solo nÃºmero de versiÃ³n en la pÃ¡gina principal para referencia
- âœ… **DocumentaciÃ³n:** Revisar `AG-Historico-Cambios.md` antes de hacer cambios para no perder funcionalidades previas

**Cifra de Control:**
- T: 58 | C: 566 (Sin cambios en BD)

---

### v2.251 - 31 de Enero de 2026 - 14:50 CST

**ðŸŽ¥ Mejora Visual: Video Pantalla Completa en Tours**

**Cambios:**
- âœ… Video de fondo en `/tours` ahora a pantalla completa (`scale-150`)
- âœ… Overlay cambiado de `bg-white/90` a `bg-gradient-to-b from-white/20 via-white/10 to-white/30` (muy traslÃºcido)
- âœ… Texto cambiado a blanco con `drop-shadow` para mejor legibilidad sobre video
- âœ… Barra de bÃºsqueda con `backdrop-blur-xl` para mantener contraste
- âœ… **Versiones actualizadas en footers** de todas las pÃ¡ginas principales para verificar deployment

**Archivos modificados:**
- `src/app/tours/page.tsx` - Video pantalla completa + overlay traslÃºcido + versiÃ³n v2.251
- `src/app/page.tsx` - VersiÃ³n actualizada en footer a v2.251
- `src/app/cotizar-tour/page.tsx` - VersiÃ³n agregada en footer
- `docs/AG-Historico-Cambios.md` - Nueva entrada v2.251

**Lecciones aprendidas:**
- âœ… Mantener versiones en footers ayuda a verificar deployments y evitar problemas de cachÃ©
- âœ… El overlay muy traslÃºcido (`/10` a `/30`) permite apreciar el video sin sacrificar legibilidad
- âœ… `drop-shadow` en texto blanco es esencial para legibilidad sobre videos dinÃ¡micos

---

### v2.250 - 31 de Enero de 2026 - 14:10 CST

**ðŸŽ¨ Mejoras de DiseÃ±o y Nuevo MÃ³dulo de Cotizaciones**

**Cambios UI/UX:**
- **Tours - Hero Section:** Cambiado de fondo morado/azul transparente a blanco traslÃºcido con texto oscuro, siguiendo el estilo AS Operadora.
  - Fondo: `bg-white/90 backdrop-blur-sm`
  - Texto: Cambiado de blanco a `text-gray-900` y `text-gray-700`
  - Barra de bÃºsqueda: Fondo blanco con bordes grises, mejor contraste
  - BotÃ³n de bÃºsqueda: Azul sÃ³lido con texto blanco

**Nuevo MÃ³dulo de Cotizaciones:**
- **PÃ¡gina `/cotizar-tour`:** Formulario completo de cotizaciÃ³n que pre-llena datos del tour seleccionado
  - Datos pre-llenados: Tour ID, nombre, precio, regiÃ³n, duraciÃ³n, ciudades
  - Formulario de cliente: Nombre, apellido, correo, telÃ©fono, nÃºmero de personas, comentarios
  - Selector de mÃ©todo de notificaciÃ³n: WhatsApp, Email, o Ambos
  - Resumen visual del tour en sidebar
  - PÃ¡gina de confirmaciÃ³n con detalles de la cotizaciÃ³n
- **PÃ¡gina `/cotizacion/[folio]`:** Seguimiento de cotizaciÃ³n con estados
  - Estados: Pendiente, Contactado, CotizaciÃ³n Enviada, Confirmado, Cancelado
  - VisualizaciÃ³n de detalles del tour y contacto
  - Resumen de precios y opciones de contacto directo
  - DiseÃ±o responsive con informaciÃ³n clara

**Cambios Backend:**
- **API `/api/tours/quote` (POST):** Crear cotizaciÃ³n de tour
  - Genera folio Ãºnico: `TOUR-timestamp-random`
  - Calcula precio total basado en nÃºmero de personas
  - Guarda en BD con todos los detalles
  - Genera URL de seguimiento
  - Prepara mensajes de WhatsApp y Email (logs por ahora, pendiente integraciÃ³n real)
- **API `/api/tours/quote/[folio]` (GET):** Obtener cotizaciÃ³n por folio
- **MigraciÃ³n 016:** Nueva tabla `tour_quotes`
  - 21 campos incluyendo folio, datos del tour, contacto, precios, estado
  - Ã�ndices para bÃºsquedas rÃ¡pidas (folio, email, status, created_at)
  - Trigger para updated_at automÃ¡tico
  - Estados: pending, contacted, quoted, confirmed, cancelled

**Cambios en Tours:**
- **Detalle de Tour:** BotÃ³n "Reservar por WhatsApp" reemplazado por "Cotizar Tour"
  - Redirige a `/cotizar-tour` con parÃ¡metros del tour en URL
  - Mejor flujo para captura de datos del cliente
  - Permite seguimiento de cotizaciones

**Archivos Nuevos:**
- `src/app/cotizar-tour/page.tsx`
- `src/app/cotizacion/[folio]/page.tsx`
- `src/app/api/tours/quote/route.ts`
- `src/app/api/tours/quote/[folio]/route.ts`
- `migrations/016_create_tour_quotes_table.sql`
- `scripts/run-migration-016.js`

**Archivos Modificados:**
- `src/app/tours/page.tsx` (hero section con nuevo diseÃ±o)
- `src/app/tours/[code]/page.tsx` (botÃ³n cotizar + import Send)

**Lecciones Aprendidas:**
- El diseÃ±o con fondo blanco traslÃºcido y texto oscuro proporciona mejor legibilidad y se alinea mejor con la identidad visual de AS Operadora
- Pre-llenar formularios con datos del contexto mejora significativamente la UX y reduce fricciÃ³n
- Ofrecer mÃºltiples mÃ©todos de notificaciÃ³n (WhatsApp/Email/Ambos) da flexibilidad al cliente

**Cifra de Control:**
- T: 58 | C: 566 (1 tabla nueva: tour_quotes con 21 campos)

---

### v2.233 - 27 de Enero de 2026 - 11:15 CST

### v2.233 - 27 de Enero de 2026 - 11:15 CST

**ðŸ†• Nueva Funcionalidad: Sistema de AdministraciÃ³n Granular de Funciones**

Esta versiÃ³n implementa un sistema completo de feature flags con control granular por rol y plataforma (Web/MÃ³vil).

**Cambios Backend:**
- **Nueva tabla `features`**: CatÃ¡logo de 38 funciones controlables organizadas en 6 categorÃ­as.
- **Nueva tabla `feature_role_access`**: Permisos granulares por rol (SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE).
- **Nueva tabla `app_settings`**: ConfiguraciÃ³n global (login obligatorio, versiÃ³n, etc.).
- **FeatureService.ts**: Servicio completo con mÃ©todos para verificar permisos, obtener features habilitados, actualizar configuraciÃ³n.
- **API `/api/admin/features`**: GET (listar), PUT (actualizar feature), POST (actualizar settings).
- **API `/api/features/user`**: Obtener features habilitados para usuario actual.

**Cambios Frontend:**
- **FeaturesContext.tsx**: Contexto React para gestiÃ³n global de features.
- **FeatureGate.tsx**: Componente wrapper para controlar visibilidad de elementos.
- **page.tsx**: 16 tabs de bÃºsqueda ahora envueltos con `<FeatureGate>`.
- **Panel `/admin/features`**: Nueva pÃ¡gina de administraciÃ³n con:
  - Toggle global ON/OFF por feature
  - Toggle por plataforma (Web/MÃ³vil)
  - Filtros por categorÃ­a
  - BÃºsqueda por nombre/cÃ³digo
  - Resumen estadÃ­stico

**ConfiguraciÃ³n Inicial de ProducciÃ³n:**
- âœ… SEARCH_GROUPS (Viajes Grupales/MegaTravel) = ON
- â�Œ Resto de buscadores = OFF (Hoteles, Vuelos, etc.)
- âœ… LOGIN_REQUIRED_WEB = true
- âœ… LOGIN_REQUIRED_MOBILE = true
- âœ… Funciones admin = ON

**Archivos Nuevos:**
- `migrations/015_create_features_tables.sql`
- `src/services/FeatureService.ts`
- `src/contexts/FeaturesContext.tsx`
- `src/components/FeatureGate.tsx`
- `src/app/api/admin/features/route.ts`
- `src/app/api/features/user/route.ts`
- `src/app/admin/features/page.tsx`

**Archivos Modificados:**
- `src/app/layout.tsx` (agregado FeaturesProvider)
- `src/app/page.tsx` (tabs envueltos con FeatureGate, menÃº actualizado)

**Cifra de Control:**
- T: 60 | C: 570 (3 tablas nuevas, 25 campos nuevos)

---

### v2.232 - 21 de Enero de 2026 - 19:50 CST

**Cambios UI:**
- **Calendario (Hotfix):**
  - Se restaurÃ³ la funcionalidad visual para deshabilitar fechas pasadas (estilo tenue/tachado).
  - Se restaurÃ³ y mejorÃ³ la visualizaciÃ³n de rangos seleccionados (highlight azul continuo).
  - Se conservÃ³ la correcciÃ³n de alineaciÃ³n de columnas.
  - CorrecciÃ³n de mapeo de clases para modificadores en `react-day-picker` v9 (`day_disabled` -> `disabled`, etc.).

**Cifra de Control:**
- T: 57 | C: 545

---

### v2.231 - 21 de Enero de 2026 - 19:30 CST

**Cambios UI:**
- **Calendario (Fix Completo):**
  - ActualizaciÃ³n de clases CSS para compatibilidad nativa con `react-day-picker` v9.
  - CorrecciÃ³n de desalineaciÃ³n de encabezados (agregado `w-full` y `flex-1`).
  - Centrado de nÃºmeros y distribuciÃ³n uniforme de columnas.

**Cambios Backend:**
- **BÃºsqueda Hoteles:**
  - Mejora en lÃ³gica `getCityCode` (SearchService.ts) para procesar entradas complejas (ej: "CancÃºn, MÃ©xico" -> "CancÃºn").
  - Logging detallado agregado para diagnÃ³stico de parÃ¡metros y respuestas de Amadeus.
- **API Amadeus:**
  - ConfirmaciÃ³n de conectividad exitosa (Script `scripts/test-amadeus.js`).
  - ValidaciÃ³n de credenciales en tiempo de ejecuciÃ³n.

**Lecciones Aprendidas:**
- Los componentes de terceros requieren verificaciÃ³n estricta de versiones y estilos CSS.
- La normalizaciÃ³n de inputs de usuario es crÃ­tica antes de llamar APIs externas estritas.

**Cifra de Control:**
- T: 57 | C: 545

---

### v2.230 - 19 de Enero de 2026 - 00:25 CST

**Cambios:**
- **UI Restaurantes:**
  - Header actualizado a estilo blanco traslÃºcido (`backdrop-blur-md`).
  - Barra de bÃºsqueda en el header ahora es interactiva (Inputs para Ciudad, Fecha, Personas) permitiendo refinar la bÃºsqueda desde resultados.
  - CorrecciÃ³n de lÃ³gica de ubicaciÃ³n: Se prioriza y lee correctamente el parÃ¡metro `destination` o `city` para evitar bÃºsquedas sin ubicaciÃ³n.
  - Mejora en construcciÃ³n de query a Google Places API para evitar resultados globales (se fuerza "restaurantes en [ciudad]").
- **UI Confirmar Reserva (Restaurante):**
  - Header actualizado a estilo blanco traslÃºcido.
  - Agregado botÃ³n "Regresar" (< ArrowLeft).
  - Implementada validaciÃ³n robusta de formulario:
    - Nombre/Apellido requeridos (min 2 caracteres).
    - Email con validaciÃ³n de formato regex.
    - TelÃ©fono validado a 10 dÃ­gitos numÃ©ricos.
    - Mensajes de error en rojo bajo cada campo invÃ¡lido.

**Lecciones Aprendidas:**
- Es crÃ­tico sincronizar los nombres de parÃ¡metros de URL (`city` vs `destination`) entre la Home y las pÃ¡ginas de resultados para evitar pÃ©rdidas de contexto.

**Cifra de Control:**
- T: 57 | C: 545

---

### v2.229 - 18 de Enero de 2026 - 18:25 CST

**Cambios:**
- **UI Restaurantes:**
  - Se agregÃ³ autocompletado en el campo "Ciudad o Zona" (similar a hoteles).
  - Opciones predefinidas: CDMX, CancÃºn, Guadalajara, Monterrey, etc.
- **UI Traslados:**
  - Se habilitÃ³ la etiqueta dinÃ¡mica "Fecha de regreso" cuando se selecciona viaje redondo.
  - Se corrigiÃ³ la validaciÃ³n de fecha de regreso.
  - **HOTFIX:** Se corrigiÃ³ el componente `CounterSelector` para permitir la ediciÃ³n manual sin bloqueos y se forzÃ³ el color de texto a `text-gray-900` para corregir invisibilidad sobre fondo blanco.
- **UI AS Home:**
  - Selector de huÃ©spedes simplificado (sin botones rÃ¡pidos 1,2,5...), solo +/- hasta 20 personas.
- **API Restaurantes:**
  - **BREAKING CHANGE / HOTFIX:** MigraciÃ³n total de la API Legacy `textsearch` (desactivada por Google) a la nueva `Places API (New) v1`.
  - Endpoint actualizado a `https://places.googleapis.com/v1/places:searchText`.
  - **HOTFIX FOTOS:** Se corrigiÃ³ la construcciÃ³n de URLs de imÃ¡genes. La API v1 devuelve referencias `places/...` incompatibles con el endpoint legacy `maps.googleapis.com`. Se implementÃ³ el nuevo endpoint `photos.media` para resolver errores 403.
  - Agregado soporte fallback para `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`.
- **UI ConfirmaciÃ³n:**
  - **HOTFIX:** VisualizaciÃ³n dinÃ¡mica de la foto del restaurante seleccionado (soporte v1/Legacy/Mock), reemplazando el placeholder estÃ¡tico.
  - BotÃ³n "Confirmar Reserva" con texto blanco explÃ­cito `text-white font-bold` para asegurar legibilidad.
- **API Cookie Consent:**
  - **HOTFIX:** Se eliminÃ³ el error 500 bloqueante cuando la base de datos no es accesible.

**Cifra de Control:**
- T: 57 | C: 545

---

### v2.228 - 18 de Enero de 2026 - 17:45 CST

**Cambios:**
- **Fix Build Vercel:**
  - CorrecciÃ³n de importaciÃ³n errÃ³nea en `src/app/confirmar-reserva/restaurante/page.tsx`.
  - Se cambiÃ³ `import ... from '@/components/ui/use-toast'` a `import ... from '@/hooks/use-toast'`.

**Lecciones Aprendidas:**
- Verificar ubicaciÃ³n de hooks siempre.

**Cifra de Control:**
- T: 54 | C: 541

---

### v2.227 - 18 de Enero de 2026 - 17:15 CST

**Cambios:**
- **IntegraciÃ³n Mega Travel (PoC):**
  - ImplementaciÃ³n de `MegaTravelAdapter.ts` para ingerir paquetes.
  - Base de datos interna simulada con paquetes populares.
  - IntegraciÃ³n transparente en buscador `/api/packages/search`.
- **Restaurantes Finalizado:**
  - Despliegue de Google Maps con API Key segura (Server-side) y pÃºblica (Client-side).

**Lecciones Aprendidas:**
- GestiÃ³n de API Keys duales es crÃ­tica.

**Cifra de Control:**
- T: 54 | C: 541

---

### v2.226 - 18 de Enero de 2026 - 15:30 CST

**Cambios:**
- **Mapa Interactivo Real:**
  - ImplementaciÃ³n de Google Maps JavaScript API sin dependencias externas.
- **ValidaciÃ³n de API Key:**
  - Soporte para `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`.
- **Fotos Reales:**
  - LÃ³gica para consumir Google Places Photo API.

**Cifra de Control:**
- T: 54 | C: 541

### v2.225 - 18 de Enero de 2026 - 15:00 CST

**Cambios:**
- **UI/UX Filtros Completa:**
  - Reordenamiento de menÃº principal (E-Sim primera fila).
  - Nuevos filtros en Hoteles (E-Sim, Seguro, Traslados).
  - Nuevo componente `CounterSelector` para huÃ©spedes/pasajeros.
  - LÃ³gica ida/vuelta y selectores mejorados.
- **MÃ³dulo Restaurantes (Nuevo):**
  - PÃ¡gina de resultados (`/resultados/restaurantes`).
  - Filtros avanzados (Cocina, Precio, Rating).
  - Mapa interactivo (Mock visual).
  - Flujo de reserva simplificado (Sin pago).
  - API Route Proxy con Mock Data fallback.
- **DocumentaciÃ³n TÃ©cnica:**
  - GuÃ­a de Google Maps API (`docs/GUIA_GOOGLE_MAPS_API.md`).

**Lecciones Aprendidas:**
- El uso de Proxies (API Routes) para APIs externas como Google Places es esencial para proteger Keys y manejar fallbacks (Mock Data) de forma transparente.

**Cifra de Control:**
- Tablas: 54 | Campos: 541 (Sin cambios estructurales en BD)

---

### v2.224 - 18 de Enero de 2026 - 01:10 CST

**Cambios:**
- **Fix despliegue Vercel (404 Not Found):**
  - Eliminado `server.js` (conflicto con serverless)
  - Actualizado script `start` a `next start`
  - Reactivado middleware (funcionando correctamente)
- **Fix Build Vercel (Mobile):**
  - Excluido directorio `operadora-mobile/` en `.vercelignore`
  - Excluido directorio `operadora-mobile/` en `tsconfig.json`
- **ConfiguraciÃ³n:** Creado `vercel.json` para forzar framework

**Lecciones Aprendidas:**
- Vercel requiere entorno 100% serverless; nunca usar `server.js` custom con Next.js en Vercel.
- La app mÃ³vil (React Native/Expo) debe excluirse explÃ­citamente del build web si conviven en el monorepo.

**Cifra de Control:**
- No registrada

---

### v2.223 - 17 de Enero de 2026 - 02:05 CST

**Cambios:**
- ReorganizaciÃ³n completa de documentaciÃ³n
- CreaciÃ³n de carpeta `docs/` (renombrado desde `.same/`)
- CreaciÃ³n de `AG-Contexto-Proyecto.md` (consolidaciÃ³n de 4 documentos)
- CreaciÃ³n de `AG-Historico-Cambios.md` (este documento)
- CreaciÃ³n de script `db-control-cifra.js`
- ImplementaciÃ³n de nomenclatura AG- para todos los archivos nuevos
- DocumentaciÃ³n de dos repositorios GitHub (as-operadora y operadora-dev)

**Lecciones Aprendidas:**
- Mantener documentaciÃ³n consolidada facilita el trabajo con agentes
- Prefijo AG- ayuda a identificar archivos de AntiGravity
- Cifra de control permite detectar problemas en BD entre versiones

**Cifra de Control:**
- Pendiente ejecutar script

---

### v2.223 - 14 de Enero de 2026 - 21:45 CST

**Cambios:**
- Fix /api/auth/login (envelope estÃ¡ndar + user/accessToken/refreshToken top-level)
- AuthService: remover JOINs y degradaciÃ³n si faltan tablas (active_sessions, access_logs, roles, security_alerts)
- PÃ¡gina Home: mantiene UI mÃ­nima; versiÃ³n visible v2.223

**Validado:**
- Preview: admin@asoperadora.com / Password123!

**Cifra de Control:**
- No registrada

---

### v2.214 - 10 de Enero de 2026 - 14:45 CST

**VersiÃ³n:** Ronda 5 Completada

**Cambios:**
1. Hoteles z-index: Campo "A dÃ³nde" con z-30, otros campos con z menor
2. Calendario colores: Estilos actualizados para react-day-picker v9
3. Checkout regreso: localStorage se limpia solo en pago exitoso

**Archivos modificados:**
- `src/app/page.tsx` - z-index y versiÃ³n
- `src/components/ui/calendar.tsx` - Estilos v9
- `src/app/globals.css` - CSS para calendario v9
- `src/app/confirmar-reserva/page.tsx` - No limpia localStorage
- `src/app/payment/success/page.tsx` - Limpia localStorage

**Cifra de Control:**
- No registrada

---

### v2.213 - 10 de Enero de 2026 - 12:35 CST

**VersiÃ³n:** Ronda 4 Completada

**Cambios:**
1. Hoteles: DateRangePicker conectado, sugerencias populares al focus
2. AS Home: Scrolling en filtros, autocomplete con datalist
3. Confirmar Reserva: Soporte para tipo transfer
4. Traslados: BotÃ³n texto blanco, conecta a Confirmar Reserva
5. Checkout: BotÃ³n regresar usa router.back()
6. Paquetes: BotÃ³n "Ver Paquete", pÃ¡gina detalle conectada

**Cifra de Control:**
- No registrada

---

### v2.212 - 10 de Enero de 2026 - 21:15 CST

**VersiÃ³n:** Estructura corregida

**Cambios:**
1. Identificado directorio anidado `operadora-dev/operadora-dev/` con v2.206
2. Eliminado directorio anidado
3. Movido `.git/` a `/home/project/` (raÃ­z)
4. Push con estructura correcta (commit 3ad5520)
5. DocumentaciÃ³n actualizada con lecciones aprendidas

**Ronda 3 completada:**
1. Actividades (fix error "City not found") - LÃ³gica geocoding mejorada
2. Hoteles (calendario con colores) - Ya funcionaba
3. Cenefas traslÃºcidas en todas las pÃ¡ginas - Headers actualizados
4. AS Home reorganizaciÃ³n - Filtros izquierda, barra bÃºsqueda
5. Paquetes adecuaciones - Header glassmorphism, pÃ¡gina detalle
6. Autos (checkbox devoluciÃ³n) - PÃ¡gina completa con filtros
7. Traslados API - Fallback a datos mock cuando no hay API
8. Confirmar Reservas guardado - Soporte mÃºltiples formatos localStorage
9. Viajes Grupales completo - BD, folio, email (log)

**Lecciones Aprendidas:**
- **Problema:** Vercel mostraba versiÃ³n v2.206 cuando debÃ­a mostrar v2.211+
- **Causa raÃ­z:** ExistÃ­a directorio anidado `operadora-dev/operadora-dev/` con cÃ³digo viejo
- **SoluciÃ³n:** Eliminar anidamiento, mover `.git/` a raÃ­z
- **PrevenciÃ³n:** Usar comandos de verificaciÃ³n antes de cada push

**Comandos de verificaciÃ³n:**
```bash
# Verificar NO anidamiento
ls /home/project/operadora-dev/operadora-dev 2>/dev/null && echo "â�Œ ERROR" || echo "âœ… OK"

# Verificar git en raÃ­z
ls -la /home/project/.git/HEAD && echo "âœ… Git OK"
```

**Cifra de Control:**
- No registrada

---

### v2.211 - 10 de Enero de 2026

**Cambios:**
- Viajes Grupales - Guardado en BD
- Nueva tabla `group_quotes` (se crea automÃ¡ticamente si no existe)
- Campos: reference_id, contacto, origen, destino, fechas, pasajeros, precios
- Folio Ãºnico: GRP-XXXXX
- Descuentos automÃ¡ticos por grupo (5%-15%)
- Email informativo al cliente (log por ahora)

**Confirmar Reservas - MÃºltiples formatos:**
- Soporta `pendingBooking` (nuevo formato desde AS Home, Paquetes, Autos)
- Soporta `selected_service` (formato anterior)
- Soporta `reserva_temp` (legacy)
- Limpieza completa de localStorage despuÃ©s de crear reserva

**Traslados - Fallback Mock:**
- API intenta Amadeus primero
- Si no hay resultados, retorna 3 vehÃ­culos mock
- Sedan, SUV Premium, Van Compartida
- Precios basados en pasajeros

**Cifra de Control:**
- No registrada

---

### v2.206 - 10 de Enero de 2026

**Cambios:**
1. Versionamiento correcto v2.206
2. Error 500 en bÃºsqueda de vuelos - Fallback agregado
3. Calendario hoteles - barra de color en periodo
4. BÃºsqueda destinos hoteles (paÃ­ses, estados, ciudades) - Ya funcionaba
5. AS Home - clonar pÃ¡gina de hoteles para casas
6. Traslados - pre-llenar combos ciudades/aeropuertos/hoteles
7. Autos - completar campos segÃºn imagen (lugar entrega)
8. Actividades - sugerir destinos, modificar checkboxes
9. Paquetes - agregar campos, crear pÃ¡gina, API Amadeus
10. Grupos - investigar API Amadeus para grupos

**AS Home - PÃ¡gina de Resultados:**
- Creada pÃ¡gina `/resultados/ashome/page.tsx`
- Grid de propiedades con filtros (tipo, precio, rating)
- Mock data con 6 propiedades (casas, deptos, villas, cabaÃ±as)
- Favoritos, amenidades, badges de Superhost
- Responsive design con Framer Motion

**Paquetes - PÃ¡gina de Resultados:**
- Creada pÃ¡gina `/resultados/paquetes/page.tsx`
- Lista de paquetes con hotel + vuelo incluido
- Filtros (precio, duraciÃ³n, categorÃ­a hotel)
- Mock data con 6 paquetes populares
- Badges de Todo Incluido, Recomendado
- Sidebar de filtros adicionales

**Viajes Grupales - API Amadeus:**
- **Hallazgo:** Amadeus Self-Service permite mÃ¡ximo 9 pasajeros/PNR
- **Estrategia documentada:**
  - Grupos â‰¤9: Reserva automÃ¡tica con un solo PNR
  - Grupos 10-27: DivisiÃ³n automÃ¡tica en mÃºltiples PNRs
  - Grupos 28+: CotizaciÃ³n manual por agente
- **DocumentaciÃ³n completa:** `.same/VIAJES-GRUPALES-AMADEUS.md`
- **PÃ¡gina existente:** `/viajes-grupales` con formulario completo

**Cifra de Control:**
- No registrada

---

### v2.203 - 09 de Enero de 2026

**Cambios:**
- Logos de AerolÃ­neas: Contenedor con borde y fondo blanco para logos
- object-contain para mostrar logo completo sin recorte
- TamaÃ±o fijo 56x40px con padding

**Aeropuertos Mexicanos (Origen):**
- +35 aeropuertos agregados organizados por regiÃ³n
- Norte: CJS, CUU, HMO, MZT, CUL, SLP, AGU, ZCL, LAP, REX, TAM, NLD, MXL
- Centro: BJX, QRO, MLM, PBC, TLC, CVM
- Sur: OAX, HUX, ZIH, ACA, VSA, TAP, TGZ
- Sureste: MID, CME, CZM, VER

**Destinos Internacionales:**
- USA: MIA, LAX, JFK, LAS, MCO, DFW, IAH, SFO, PHX, DEN
- Europa: MAD, BCN, CDG, FCO, LHR, AMS, FRA
- CentroamÃ©rica: HAV, SJU, PTY, SJO, GUA
- SudamÃ©rica: BOG, LIM, SCL, EZE, GRU

**Viajes Grupales - DateRangePicker:**
- Calendario de 2 meses con selecciÃ³n de rango
- Fechas pasadas inhabilitadas y en gris
- Muestra duraciÃ³n en noches despuÃ©s de seleccionar
- Barra azul en rango seleccionado

**Cifra de Control:**
- No registrada

---

### v2.202 - 09 de Enero de 2026

**Cambios:**
- Calendario Mejorado: Barra azul visible en selecciÃ³n de rango de fechas
- Mejor contraste en dÃ­as seleccionados
- Estilos mejorados para rango medio (dÃ­as entre inicio y fin)
- Transiciones suaves en hover

**Vuelos - Correcciones Completas:**
- Estado `infants` (bebÃ©s) agregado y conectado
- Estado `childrenAges` para edades de niÃ±os
- Selectores dinÃ¡micos de edades cuando hay niÃ±os
- Nota informativa para bebÃ©s en regazo
- PolÃ­ticas de viaje expandidas con lista detallada

**Actividades - Mejoras:**
- Estado `activityDate` conectado al input de fecha
- Estado `activityPersons` conectado al selector
- Handler de bÃºsqueda actualizado con nuevos parÃ¡metros

**Total:** 11/11 cambios de pruebas de usuarios completados

**Cifra de Control:**
- No registrada

---

### v2.198 - 09 de Enero de 2026

**Problema detectado:**
- Estructura anidada incorrecta: `operadora-dev/operadora-dev/`
- Directorio extra `codigo-actual/` no deberÃ­a existir
- Git anidado en `operadora-dev/.git`

**SoluciÃ³n aplicada:**
- Eliminado `codigo-actual/`
- Eliminado git anidado (`operadora-dev/.git`)
- Movido contenido de `operadora-dev/operadora-dev/` â†’ `operadora-dev/`
- Git inicializado en raÃ­z `/home/project/`

**Estructura correcta:**
```
/home/project/
â”œâ”€â”€ .git/                    â†� Repositorio en raÃ­z
â”œâ”€â”€ operadora-dev/           â†� TODO el cÃ³digo aquÃ­
â”‚   â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ .same/
â”‚   â”œâ”€â”€ package.json
â”‚   â””â”€â”€ ...
â””â”€â”€ uploads/
```

**Lecciones Aprendidas:**
- Nunca anidar directorios del proyecto
- Git siempre en la raÃ­z del workspace
- Verificar estructura antes de hacer push

**Cifra de Control:**
- No registrada

---

### v2.195 - 09 de Enero de 2026

**Correcciones Stripe:**
- API `/api/payments/stripe/confirm-payment/route.ts`:
  - Columna `paid_at` â†’ `completed_at` (nombre correcto en BD)
  - Columna `status` â†’ `booking_status` (nombre correcto en BD)
  - UPDATE payment_transactions hecho opcional con try-catch
  - Removido import de EmailService (no configurado aÃºn)
  - Query de JSON corregida para extraer contacto de details

**UI Checkout:**
- Logo de Stripe agregado en selector de mÃ©todo de pago
- Logo de Stripe agregado en footer de secciÃ³n de pago
- Badge SSL mejorado: "SSL" â†’ "SSL 256-bit"

**Correcciones PayPal:**
- `PayPalService.ts`: Cambio de lÃ³gica de ambiente
  - Antes: Usaba `NODE_ENV === 'production'` (fallaba en Vercel con credenciales sandbox)
  - Ahora: Usa variable `PAYPAL_MODE` - por defecto SANDBOX
- BotÃ³n de PayPal: Color cambiado de `#0070ba` â†’ `blue-600` (azul de la app)
- Texto del botÃ³n es blanco

**Correcciones MercadoPago:**
- BotÃ³n con texto blanco (`text-white`)
- Flujo probado: RedirecciÃ³n funciona correctamente
- Nota: El botÃ³n de pago final no se habilita en sandbox (limitaciÃ³n de MP)

**Estado:**
- Stripe: Corregido y funcionando
- PayPal: Corregido (ambiente sandbox)
- MercadoPago: Funcionando (limitaciones de sandbox)

**Cifra de Control:**
- No registrada

---

### v2.194 - 09 de Enero de 2026

**Sistema de Pagos Completo:**

**Tabla payment_transactions:**
- MigraciÃ³n 014 ejecutada exitosamente
- Tabla creada con 12 columnas
- Ã�ndices creados para bÃºsquedas rÃ¡pidas
- Trigger para updated_at automÃ¡tico

**Webhooks Configurados:**
- Stripe: `/api/webhooks/stripe` - Maneja payment_intent.succeeded, failed, refunded
- PayPal: `/api/webhooks/paypal` - Maneja capture.completed, denied, refunded
- MercadoPago: `/api/payments/mercadopago/webhook` - Maneja todos los estados

**PÃ¡ginas de Callback:**
- `/payment/success` - Pago exitoso (todos los proveedores)
- `/payment/failure` - Pago fallido
- `/payment/pending` - Pago pendiente (OXXO, SPEI)

**APIs de Pago:**
- `/api/payments/stripe/create-payment-intent` - Crear intento de pago Stripe
- `/api/payments/paypal/create-order` - Crear orden PayPal
- `/api/payments/mercadopago/create-preference` - Crear preferencia MP

**Cifra de Control:**
- No registrada

---

### v2.192/v2.193 - 09 de Enero de 2026

**Correcciones de Pagos:**

**Cambios UI:**
- BotÃ³n "Proceder al Pago" cambiado de VERDE a AZUL
- Quitada versiÃ³n "(v2.188)" del texto del botÃ³n
- Agregada validaciÃ³n visual para campos requeridos (borde rojo, mensaje de error)
- Scroll automÃ¡tico al primer campo con error

**Correcciones API Stripe:**
- Query actualizada para usar `booking_status` y `payment_status` (BD producciÃ³n)
- InserciÃ³n en `payment_transactions` hecha opcional (tabla puede no existir)

**Correcciones API PayPal:**
- Query actualizada para usar `booking_status` y `payment_status` (BD producciÃ³n)
- InserciÃ³n en `payment_transactions` hecha opcional

**Nuevas pÃ¡ginas de pago:**
- `/payment/failure` - PÃ¡gina de pago fallido para MercadoPago
- `/payment/pending` - PÃ¡gina de pago pendiente para MercadoPago
- `/payment/success` - Actualizada para manejar `external_reference` de MercadoPago

**Commit:** 5287d5e  
**Push:** GitHub main

**Cifra de Control:**
- No registrada

---

### v2.186 - 09 de Enero de 2026

**Problema Identificado y Resuelto:**

**Problema:**
- El botÃ³n "Proceder al Pago" en `/confirmar-reserva` no funcionaba
- API `/api/bookings` retornaba Error 500
- Error: `column "booking_type" of relation "bookings" does not exist`

**Causa raÃ­z:**
- La tabla `bookings` en BD tenÃ­a columna `type`, pero el cÃ³digo usaba `booking_type`
- Faltaban columnas: `service_name`, `booking_details`, `traveler_info`, etc.

**SoluciÃ³n aplicada:**

1. **MigraciÃ³n 013 ejecutada:**
   - Agregadas columnas faltantes a tabla `bookings`
   - `service_name`, `booking_details`, `traveler_info`, `contact_info`
   - `payment_info`, `special_requests`, `is_active`, `confirmed_at`
   - `cancelled_at`, `cancellation_reason`, `payment_method`
   - Renombrada `confirmation_code` â†’ `booking_reference`

2. **API `/api/bookings/route.ts` corregida:**
   - `booking_type` â†’ `type` (nombre correcto de columna)
   - Corregido bug en query de conteo (faltaba `$` en parÃ¡metros)

3. **API `/api/bookings/[id]/route.ts` corregida:**
   - `b.booking_type` â†’ `b.type`
   - `booking.booking_type` â†’ `booking.type`

**Archivos modificados:**
- `migrations/013_add_booking_columns.sql` (nuevo)
- `src/app/api/bookings/route.ts`
- `src/app/api/bookings/[id]/route.ts`
- `src/app/page.tsx` (footer actualizado)

**Resultado:**
- Flujo completo funcionando: Confirmar â†’ Crear Booking â†’ Checkout
- API POST /api/bookings retorna 201
- API GET /api/bookings/[id] retorna 200

**Lecciones Aprendidas:**
- Siempre verificar nombres de columnas en BD antes de usar en cÃ³digo
- Ejecutar migraciones en orden correcto
- Probar flujo completo despuÃ©s de cambios en BD

**Cifra de Control:**
- No registrada

---

## ðŸ“Š RESUMEN DE LECCIONES APRENDIDAS

### Estructura de Directorios
- **Nunca** anidar directorios del proyecto (`operadora-dev/operadora-dev/`)
- Git siempre en la raÃ­z del workspace
- Verificar estructura antes de cada push

### Base de Datos
- Verificar nombres de columnas antes de usar en cÃ³digo
- Ejecutar migraciones en orden
- Mantener sincronizaciÃ³n entre BD local y producciÃ³n
- Usar UNA sola base de datos para todos los ambientes

### Deployment
- Vercel Root Directory debe ser `operadora-dev`
- Push a GitHub dispara deploy automÃ¡tico
- Esperar 2-3 minutos para ver cambios en producciÃ³n

### DocumentaciÃ³n
- Mantener documentaciÃ³n consolidada
- Usar prefijos para identificar archivos (AG-)
- Registrar lecciones aprendidas de errores

---

**Documento creado:** 17 de Enero de 2026 - 02:05 CST  
**PropÃ³sito:** HistÃ³rico completo de cambios del proyecto  
**Actualizar:** Cada nueva versiÃ³n (v2.XXX)

---

ðŸŽ¯ **Formato de nueva entrada:**

```markdown
### vX.XXX - [Fecha] - [Hora] CST

**Cambios:**
- Cambio 1
- Cambio 2

**Lecciones Aprendidas:**
- LecciÃ³n 1 (si aplica)

**Cifra de Control:**
- Tablas: XX | Campos: YYY
```

### v2.342 - 13 de Junio de 2026 - 11:27 CST
- Implementación de subida de fotos locales en la Gestión de Contenido, tanto para el Modal Principal (Banner, Promociones, Vuelos, Paquetes) como para la asignación de Imágenes a Tours.
- Creación del endpoint /api/admin/upload-image para manejar la carga de archivos locales hacia Vercel Blob y local public fallback.

### v2.343 - 15 de Junio de 2026 - 23:50 CST

**Cambios:**
- Se agregó el rol de "Proveedor" en el formulario de registro de Leads, incluyendo campo dinámico para el producto/servicio.
- Se reestructuró la función de envío de correos (\sendLandingWelcomeEmail\) inyectando el código HTML internamente para evadir problemas de Vercel al compilar archivos estáticos de plantillas.
- Se implementó debugging visual en la pantalla de éxito de registro para revelar errores ocultos de SMTP.
- Se re-habilitó Resend como proveedor principal de correos para evadir el límite de "Maximum credits exceeded" (Error 451) del plan de alojamiento en SiteGround.

**Lecciones Aprendidas:**
- Vercel elimina los archivos que no son código de las rutas Edge/Serverless si no se configuran explícitamente en \
ext.config.js\ y \path.join\. Hacer hardcode del HTML en variables es un workaround 100% efectivo.
- Los servidores SMTP de hosting compartido (como SiteGround) tienen cuotas estrictas de envío que fallan silenciosamente a nivel API. Para correos transaccionales a escala en Vercel, servicios dedicados como Resend son imperativos.
