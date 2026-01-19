# 📋 AG-Histórico de Cambios - AS Operadora

**Última actualización:** 17 de Enero de 2026 - 02:05 CST  
**Versión actual:** v2.226  
**Actualizado por:** AntiGravity AI Assistant  
**Propósito:** Registro cronológico de todos los cambios del proyecto

---

## 📝 FORMATO DE REGISTRO

Cada versión debe incluir:
- **Fecha y Hora** (CST)
- **Versión** (v2.XXX)
- **Cambios** realizados
- **Lecciones Aprendidas** (si aplica)
- **Cifra de Control** (Tablas: XX | Campos: YYY)

---

## 🔢 CIFRA DE CONTROL

La cifra de control se genera con el script:
```bash
node scripts/db-control-cifra.js
```

Indica el estado de la base de datos en cada versión:
- **Tablas:** Total de tablas en esquema `public`
- **Campos:** Total de columnas en todas las tablas

Esto permite detectar si se perdieron tablas/campos entre versiones.

---

## 📅 HISTORIAL DE CAMBIOS

### v2.229 - 18 de Enero de 2026 - 18:25 CST

**Cambios:**
- **UI Restaurantes:**
  - Se agregó autocompletado en el campo "Ciudad o Zona" (similar a hoteles).
  - Opciones predefinidas: CDMX, Cancún, Guadalajara, Monterrey, etc.
- **UI Traslados:**
  - Se habilitó la etiqueta dinámica "Fecha de regreso" cuando se selecciona viaje redondo.
  - Se corrigió la validación de fecha de regreso.
  - **HOTFIX:** Se corrigió el componente `CounterSelector` para permitir la edición manual sin bloqueos y se forzó el color de texto a `text-gray-900` para corregir invisibilidad sobre fondo blanco.
- **UI AS Home:**
  - Selector de huéspedes simplificado (sin botones rápidos 1,2,5...), solo +/- hasta 20 personas.
- **API Restaurantes:**
  - **BREAKING CHANGE / HOTFIX:** Migración total de la API Legacy `textsearch` (desactivada por Google) a la nueva `Places API (New) v1`.
  - Endpoint actualizado a `https://places.googleapis.com/v1/places:searchText`.
  - **HOTFIX FOTOS:** Se corrigió la construcción de URLs de imágenes. La API v1 devuelve referencias `places/...` incompatibles con el endpoint legacy `maps.googleapis.com`. Se implementó el nuevo endpoint `photos.media` para resolver errores 403.
  - Agregado soporte fallback para `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`.
- **UI Confirmación:**
  - **HOTFIX:** Visualización dinámica de la foto del restaurante seleccionado (soporte v1/Legacy/Mock), reemplazando el placeholder estático.
  - Botón "Confirmar Reserva" con texto blanco explícito `text-white font-bold` para asegurar legibilidad.
- **API Cookie Consent:**
  - **HOTFIX:** Se eliminó el error 500 bloqueante cuando la base de datos no es accesible.

**Cifra de Control:**
- T: 57 | C: 545

---

### v2.228 - 18 de Enero de 2026 - 17:45 CST

**Cambios:**
- **Fix Build Vercel:**
  - Corrección de importación errónea en `src/app/confirmar-reserva/restaurante/page.tsx`.
  - Se cambió `import ... from '@/components/ui/use-toast'` a `import ... from '@/hooks/use-toast'`.

**Lecciones Aprendidas:**
- Verificar ubicación de hooks siempre.

**Cifra de Control:**
- T: 54 | C: 541

---

### v2.227 - 18 de Enero de 2026 - 17:15 CST

**Cambios:**
- **Integración Mega Travel (PoC):**
  - Implementación de `MegaTravelAdapter.ts` para ingerir paquetes.
  - Base de datos interna simulada con paquetes populares.
  - Integración transparente en buscador `/api/packages/search`.
- **Restaurantes Finalizado:**
  - Despliegue de Google Maps con API Key segura (Server-side) y pública (Client-side).

**Lecciones Aprendidas:**
- Gestión de API Keys duales es crítica.

**Cifra de Control:**
- T: 54 | C: 541

---

### v2.226 - 18 de Enero de 2026 - 15:30 CST

**Cambios:**
- **Mapa Interactivo Real:**
  - Implementación de Google Maps JavaScript API sin dependencias externas.
- **Validación de API Key:**
  - Soporte para `NEXT_PUBLIC_GOOGLE_PLACES_API_KEY`.
- **Fotos Reales:**
  - Lógica para consumir Google Places Photo API.

**Cifra de Control:**
- T: 54 | C: 541

### v2.225 - 18 de Enero de 2026 - 15:00 CST

**Cambios:**
- **UI/UX Filtros Completa:**
  - Reordenamiento de menú principal (E-Sim primera fila).
  - Nuevos filtros en Hoteles (E-Sim, Seguro, Traslados).
  - Nuevo componente `CounterSelector` para huéspedes/pasajeros.
  - Lógica ida/vuelta y selectores mejorados.
- **Módulo Restaurantes (Nuevo):**
  - Página de resultados (`/resultados/restaurantes`).
  - Filtros avanzados (Cocina, Precio, Rating).
  - Mapa interactivo (Mock visual).
  - Flujo de reserva simplificado (Sin pago).
  - API Route Proxy con Mock Data fallback.
- **Documentación Técnica:**
  - Guía de Google Maps API (`docs/GUIA_GOOGLE_MAPS_API.md`).

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
- **Configuración:** Creado `vercel.json` para forzar framework

**Lecciones Aprendidas:**
- Vercel requiere entorno 100% serverless; nunca usar `server.js` custom con Next.js en Vercel.
- La app móvil (React Native/Expo) debe excluirse explícitamente del build web si conviven en el monorepo.

**Cifra de Control:**
- No registrada

---

### v2.223 - 17 de Enero de 2026 - 02:05 CST

**Cambios:**
- Reorganización completa de documentación
- Creación de carpeta `docs/` (renombrado desde `.same/`)
- Creación de `AG-Contexto-Proyecto.md` (consolidación de 4 documentos)
- Creación de `AG-Historico-Cambios.md` (este documento)
- Creación de script `db-control-cifra.js`
- Implementación de nomenclatura AG- para todos los archivos nuevos
- Documentación de dos repositorios GitHub (as-operadora y operadora-dev)

**Lecciones Aprendidas:**
- Mantener documentación consolidada facilita el trabajo con agentes
- Prefijo AG- ayuda a identificar archivos de AntiGravity
- Cifra de control permite detectar problemas en BD entre versiones

**Cifra de Control:**
- Pendiente ejecutar script

---

### v2.223 - 14 de Enero de 2026 - 21:45 CST

**Cambios:**
- Fix /api/auth/login (envelope estándar + user/accessToken/refreshToken top-level)
- AuthService: remover JOINs y degradación si faltan tablas (active_sessions, access_logs, roles, security_alerts)
- Página Home: mantiene UI mínima; versión visible v2.223

**Validado:**
- Preview: admin@asoperadora.com / Password123!

**Cifra de Control:**
- No registrada

---

### v2.214 - 10 de Enero de 2026 - 14:45 CST

**Versión:** Ronda 5 Completada

**Cambios:**
1. Hoteles z-index: Campo "A dónde" con z-30, otros campos con z menor
2. Calendario colores: Estilos actualizados para react-day-picker v9
3. Checkout regreso: localStorage se limpia solo en pago exitoso

**Archivos modificados:**
- `src/app/page.tsx` - z-index y versión
- `src/components/ui/calendar.tsx` - Estilos v9
- `src/app/globals.css` - CSS para calendario v9
- `src/app/confirmar-reserva/page.tsx` - No limpia localStorage
- `src/app/payment/success/page.tsx` - Limpia localStorage

**Cifra de Control:**
- No registrada

---

### v2.213 - 10 de Enero de 2026 - 12:35 CST

**Versión:** Ronda 4 Completada

**Cambios:**
1. Hoteles: DateRangePicker conectado, sugerencias populares al focus
2. AS Home: Scrolling en filtros, autocomplete con datalist
3. Confirmar Reserva: Soporte para tipo transfer
4. Traslados: Botón texto blanco, conecta a Confirmar Reserva
5. Checkout: Botón regresar usa router.back()
6. Paquetes: Botón "Ver Paquete", página detalle conectada

**Cifra de Control:**
- No registrada

---

### v2.212 - 10 de Enero de 2026 - 21:15 CST

**Versión:** Estructura corregida

**Cambios:**
1. Identificado directorio anidado `operadora-dev/operadora-dev/` con v2.206
2. Eliminado directorio anidado
3. Movido `.git/` a `/home/project/` (raíz)
4. Push con estructura correcta (commit 3ad5520)
5. Documentación actualizada con lecciones aprendidas

**Ronda 3 completada:**
1. Actividades (fix error "City not found") - Lógica geocoding mejorada
2. Hoteles (calendario con colores) - Ya funcionaba
3. Cenefas traslúcidas en todas las páginas - Headers actualizados
4. AS Home reorganización - Filtros izquierda, barra búsqueda
5. Paquetes adecuaciones - Header glassmorphism, página detalle
6. Autos (checkbox devolución) - Página completa con filtros
7. Traslados API - Fallback a datos mock cuando no hay API
8. Confirmar Reservas guardado - Soporte múltiples formatos localStorage
9. Viajes Grupales completo - BD, folio, email (log)

**Lecciones Aprendidas:**
- **Problema:** Vercel mostraba versión v2.206 cuando debía mostrar v2.211+
- **Causa raíz:** Existía directorio anidado `operadora-dev/operadora-dev/` con código viejo
- **Solución:** Eliminar anidamiento, mover `.git/` a raíz
- **Prevención:** Usar comandos de verificación antes de cada push

**Comandos de verificación:**
```bash
# Verificar NO anidamiento
ls /home/project/operadora-dev/operadora-dev 2>/dev/null && echo "❌ ERROR" || echo "✅ OK"

# Verificar git en raíz
ls -la /home/project/.git/HEAD && echo "✅ Git OK"
```

**Cifra de Control:**
- No registrada

---

### v2.211 - 10 de Enero de 2026

**Cambios:**
- Viajes Grupales - Guardado en BD
- Nueva tabla `group_quotes` (se crea automáticamente si no existe)
- Campos: reference_id, contacto, origen, destino, fechas, pasajeros, precios
- Folio único: GRP-XXXXX
- Descuentos automáticos por grupo (5%-15%)
- Email informativo al cliente (log por ahora)

**Confirmar Reservas - Múltiples formatos:**
- Soporta `pendingBooking` (nuevo formato desde AS Home, Paquetes, Autos)
- Soporta `selected_service` (formato anterior)
- Soporta `reserva_temp` (legacy)
- Limpieza completa de localStorage después de crear reserva

**Traslados - Fallback Mock:**
- API intenta Amadeus primero
- Si no hay resultados, retorna 3 vehículos mock
- Sedan, SUV Premium, Van Compartida
- Precios basados en pasajeros

**Cifra de Control:**
- No registrada

---

### v2.206 - 10 de Enero de 2026

**Cambios:**
1. Versionamiento correcto v2.206
2. Error 500 en búsqueda de vuelos - Fallback agregado
3. Calendario hoteles - barra de color en periodo
4. Búsqueda destinos hoteles (países, estados, ciudades) - Ya funcionaba
5. AS Home - clonar página de hoteles para casas
6. Traslados - pre-llenar combos ciudades/aeropuertos/hoteles
7. Autos - completar campos según imagen (lugar entrega)
8. Actividades - sugerir destinos, modificar checkboxes
9. Paquetes - agregar campos, crear página, API Amadeus
10. Grupos - investigar API Amadeus para grupos

**AS Home - Página de Resultados:**
- Creada página `/resultados/ashome/page.tsx`
- Grid de propiedades con filtros (tipo, precio, rating)
- Mock data con 6 propiedades (casas, deptos, villas, cabañas)
- Favoritos, amenidades, badges de Superhost
- Responsive design con Framer Motion

**Paquetes - Página de Resultados:**
- Creada página `/resultados/paquetes/page.tsx`
- Lista de paquetes con hotel + vuelo incluido
- Filtros (precio, duración, categoría hotel)
- Mock data con 6 paquetes populares
- Badges de Todo Incluido, Recomendado
- Sidebar de filtros adicionales

**Viajes Grupales - API Amadeus:**
- **Hallazgo:** Amadeus Self-Service permite máximo 9 pasajeros/PNR
- **Estrategia documentada:**
  - Grupos ≤9: Reserva automática con un solo PNR
  - Grupos 10-27: División automática en múltiples PNRs
  - Grupos 28+: Cotización manual por agente
- **Documentación completa:** `.same/VIAJES-GRUPALES-AMADEUS.md`
- **Página existente:** `/viajes-grupales` con formulario completo

**Cifra de Control:**
- No registrada

---

### v2.203 - 09 de Enero de 2026

**Cambios:**
- Logos de Aerolíneas: Contenedor con borde y fondo blanco para logos
- object-contain para mostrar logo completo sin recorte
- Tamaño fijo 56x40px con padding

**Aeropuertos Mexicanos (Origen):**
- +35 aeropuertos agregados organizados por región
- Norte: CJS, CUU, HMO, MZT, CUL, SLP, AGU, ZCL, LAP, REX, TAM, NLD, MXL
- Centro: BJX, QRO, MLM, PBC, TLC, CVM
- Sur: OAX, HUX, ZIH, ACA, VSA, TAP, TGZ
- Sureste: MID, CME, CZM, VER

**Destinos Internacionales:**
- USA: MIA, LAX, JFK, LAS, MCO, DFW, IAH, SFO, PHX, DEN
- Europa: MAD, BCN, CDG, FCO, LHR, AMS, FRA
- Centroamérica: HAV, SJU, PTY, SJO, GUA
- Sudamérica: BOG, LIM, SCL, EZE, GRU

**Viajes Grupales - DateRangePicker:**
- Calendario de 2 meses con selección de rango
- Fechas pasadas inhabilitadas y en gris
- Muestra duración en noches después de seleccionar
- Barra azul en rango seleccionado

**Cifra de Control:**
- No registrada

---

### v2.202 - 09 de Enero de 2026

**Cambios:**
- Calendario Mejorado: Barra azul visible en selección de rango de fechas
- Mejor contraste en días seleccionados
- Estilos mejorados para rango medio (días entre inicio y fin)
- Transiciones suaves en hover

**Vuelos - Correcciones Completas:**
- Estado `infants` (bebés) agregado y conectado
- Estado `childrenAges` para edades de niños
- Selectores dinámicos de edades cuando hay niños
- Nota informativa para bebés en regazo
- Políticas de viaje expandidas con lista detallada

**Actividades - Mejoras:**
- Estado `activityDate` conectado al input de fecha
- Estado `activityPersons` conectado al selector
- Handler de búsqueda actualizado con nuevos parámetros

**Total:** 11/11 cambios de pruebas de usuarios completados

**Cifra de Control:**
- No registrada

---

### v2.198 - 09 de Enero de 2026

**Problema detectado:**
- Estructura anidada incorrecta: `operadora-dev/operadora-dev/`
- Directorio extra `codigo-actual/` no debería existir
- Git anidado en `operadora-dev/.git`

**Solución aplicada:**
- Eliminado `codigo-actual/`
- Eliminado git anidado (`operadora-dev/.git`)
- Movido contenido de `operadora-dev/operadora-dev/` → `operadora-dev/`
- Git inicializado en raíz `/home/project/`

**Estructura correcta:**
```
/home/project/
├── .git/                    ← Repositorio en raíz
├── operadora-dev/           ← TODO el código aquí
│   ├── src/
│   ├── .same/
│   ├── package.json
│   └── ...
└── uploads/
```

**Lecciones Aprendidas:**
- Nunca anidar directorios del proyecto
- Git siempre en la raíz del workspace
- Verificar estructura antes de hacer push

**Cifra de Control:**
- No registrada

---

### v2.195 - 09 de Enero de 2026

**Correcciones Stripe:**
- API `/api/payments/stripe/confirm-payment/route.ts`:
  - Columna `paid_at` → `completed_at` (nombre correcto en BD)
  - Columna `status` → `booking_status` (nombre correcto en BD)
  - UPDATE payment_transactions hecho opcional con try-catch
  - Removido import de EmailService (no configurado aún)
  - Query de JSON corregida para extraer contacto de details

**UI Checkout:**
- Logo de Stripe agregado en selector de método de pago
- Logo de Stripe agregado en footer de sección de pago
- Badge SSL mejorado: "SSL" → "SSL 256-bit"

**Correcciones PayPal:**
- `PayPalService.ts`: Cambio de lógica de ambiente
  - Antes: Usaba `NODE_ENV === 'production'` (fallaba en Vercel con credenciales sandbox)
  - Ahora: Usa variable `PAYPAL_MODE` - por defecto SANDBOX
- Botón de PayPal: Color cambiado de `#0070ba` → `blue-600` (azul de la app)
- Texto del botón es blanco

**Correcciones MercadoPago:**
- Botón con texto blanco (`text-white`)
- Flujo probado: Redirección funciona correctamente
- Nota: El botón de pago final no se habilita en sandbox (limitación de MP)

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
- Migración 014 ejecutada exitosamente
- Tabla creada con 12 columnas
- Índices creados para búsquedas rápidas
- Trigger para updated_at automático

**Webhooks Configurados:**
- Stripe: `/api/webhooks/stripe` - Maneja payment_intent.succeeded, failed, refunded
- PayPal: `/api/webhooks/paypal` - Maneja capture.completed, denied, refunded
- MercadoPago: `/api/payments/mercadopago/webhook` - Maneja todos los estados

**Páginas de Callback:**
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
- Botón "Proceder al Pago" cambiado de VERDE a AZUL
- Quitada versión "(v2.188)" del texto del botón
- Agregada validación visual para campos requeridos (borde rojo, mensaje de error)
- Scroll automático al primer campo con error

**Correcciones API Stripe:**
- Query actualizada para usar `booking_status` y `payment_status` (BD producción)
- Inserción en `payment_transactions` hecha opcional (tabla puede no existir)

**Correcciones API PayPal:**
- Query actualizada para usar `booking_status` y `payment_status` (BD producción)
- Inserción en `payment_transactions` hecha opcional

**Nuevas páginas de pago:**
- `/payment/failure` - Página de pago fallido para MercadoPago
- `/payment/pending` - Página de pago pendiente para MercadoPago
- `/payment/success` - Actualizada para manejar `external_reference` de MercadoPago

**Commit:** 5287d5e  
**Push:** GitHub main

**Cifra de Control:**
- No registrada

---

### v2.186 - 09 de Enero de 2026

**Problema Identificado y Resuelto:**

**Problema:**
- El botón "Proceder al Pago" en `/confirmar-reserva` no funcionaba
- API `/api/bookings` retornaba Error 500
- Error: `column "booking_type" of relation "bookings" does not exist`

**Causa raíz:**
- La tabla `bookings` en BD tenía columna `type`, pero el código usaba `booking_type`
- Faltaban columnas: `service_name`, `booking_details`, `traveler_info`, etc.

**Solución aplicada:**

1. **Migración 013 ejecutada:**
   - Agregadas columnas faltantes a tabla `bookings`
   - `service_name`, `booking_details`, `traveler_info`, `contact_info`
   - `payment_info`, `special_requests`, `is_active`, `confirmed_at`
   - `cancelled_at`, `cancellation_reason`, `payment_method`
   - Renombrada `confirmation_code` → `booking_reference`

2. **API `/api/bookings/route.ts` corregida:**
   - `booking_type` → `type` (nombre correcto de columna)
   - Corregido bug en query de conteo (faltaba `$` en parámetros)

3. **API `/api/bookings/[id]/route.ts` corregida:**
   - `b.booking_type` → `b.type`
   - `booking.booking_type` → `booking.type`

**Archivos modificados:**
- `migrations/013_add_booking_columns.sql` (nuevo)
- `src/app/api/bookings/route.ts`
- `src/app/api/bookings/[id]/route.ts`
- `src/app/page.tsx` (footer actualizado)

**Resultado:**
- Flujo completo funcionando: Confirmar → Crear Booking → Checkout
- API POST /api/bookings retorna 201
- API GET /api/bookings/[id] retorna 200

**Lecciones Aprendidas:**
- Siempre verificar nombres de columnas en BD antes de usar en código
- Ejecutar migraciones en orden correcto
- Probar flujo completo después de cambios en BD

**Cifra de Control:**
- No registrada

---

## 📊 RESUMEN DE LECCIONES APRENDIDAS

### Estructura de Directorios
- **Nunca** anidar directorios del proyecto (`operadora-dev/operadora-dev/`)
- Git siempre en la raíz del workspace
- Verificar estructura antes de cada push

### Base de Datos
- Verificar nombres de columnas antes de usar en código
- Ejecutar migraciones en orden
- Mantener sincronización entre BD local y producción
- Usar UNA sola base de datos para todos los ambientes

### Deployment
- Vercel Root Directory debe ser `operadora-dev`
- Push a GitHub dispara deploy automático
- Esperar 2-3 minutos para ver cambios en producción

### Documentación
- Mantener documentación consolidada
- Usar prefijos para identificar archivos (AG-)
- Registrar lecciones aprendidas de errores

---

**Documento creado:** 17 de Enero de 2026 - 02:05 CST  
**Propósito:** Histórico completo de cambios del proyecto  
**Actualizar:** Cada nueva versión (v2.XXX)

---

🎯 **Formato de nueva entrada:**

```markdown
### vX.XXX - [Fecha] - [Hora] CST

**Cambios:**
- Cambio 1
- Cambio 2

**Lecciones Aprendidas:**
- Lección 1 (si aplica)

**Cifra de Control:**
- Tablas: XX | Campos: YYY
```
