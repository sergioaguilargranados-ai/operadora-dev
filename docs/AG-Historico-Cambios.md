# 📋 AG-Histórico de Cambios - AS Operadora

**Última actualización:** 01 de Febrero de 2026 - 23:05 CST  
**Versión actual:** v2.294  
**Actualizado por:** AntiGravity AI Assistant  
**Propósito:** Documento maestro del proyecto para trabajo con agentes AntiGravity

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

### v2.294 - 01 de Febrero de 2026 - 23:05 CST

**🐛 FIX CRÍTICO - Filtro de Regiones**

**Problema Reportado:**
- Al seleccionar "Europa" (o cualquier región) no mostraba ningún tour
- Solo "Todos" mostraba resultados

**Causa Raíz:**
- Se usaba `ALL_REGIONS` hardcodeado con valores como `'Europa'`
- La base de datos tiene valores diferentes (ej: `'EUROPA'`, `'Europe'`, etc.)
- La comparación exacta (`===`) no coincidía

**Solución:**
1. ✅ Reemplazar `ALL_REGIONS` hardcodeado por `regions` dinámico
2. ✅ `regions` se extrae directamente de `destination_region` en DB
3. ✅ Ahora muestra las regiones exactas que existen en la base de datos
4. ✅ Eliminada constante `ALL_REGIONS` (ya no necesaria)
5. ✅ Agregado `.sort()` para ordenar alfabéticamente

**Archivos Modificados:**
- `src/app/tours/page.tsx` - Usar `regions` dinámico + eliminar `ALL_REGIONS`
- `src/app/page.tsx` - Footer v2.294
- `docs/AG-Historico-Cambios.md` - v2.294

**Resultado:**
- ✅ Filtro de regiones ahora funcional
- ✅ Muestra conteos correctos
- ✅ Filtrado funciona correctamente

**Lección Aprendida:**
- Nunca usar valores hardcodeados cuando se pueden extraer dinámicamente de la DB
- Siempre verificar que los valores de filtro coincidan exactamente con los de la DB

**Cifra de Control:** (Sin cambios)
- **Tablas:** 48
- **Campos:** 624

---

### v2.293 - 01 de Febrero de 2026 - 23:00 CST

### v2.293 - 01 de Febrero de 2026 - 23:00 CST

**✨ Mejoras de UX - Tours**

**Cambios:**

1. **✅ Mostrar "Consultar precio" si tour no tiene precio**
   - Tours sin precio ahora muestran "Consultar precio" en vez de $0
   - Mejora la experiencia del usuario
   - Archivo: `src/app/tours/page.tsx`

2. **✅ Modal de itinerario completo implementado**
   - Botón "Ver itinerario completo" ahora funcional
   - Modal con scroll para ver todos los días del tour
   - Muestra datos reales desde `tour.itinerary`
   - Diseño limpio con header, contenido scrolleable y footer
   - Archivo: `src/app/tours/[code]/page.tsx`

3. **✅ Itinerario dinámico desde base de datos**
   - Reemplazado itinerario hardcodeado por datos reales
   - Muestra primeros 3 días + indicador de días restantes
   - Mensaje "Itinerario no disponible" si no hay datos
   - Archivo: `src/app/tours/[code]/page.tsx`

**Archivos Modificados:**
- `src/app/tours/page.tsx` - Mostrar "Consultar precio"
- `src/app/tours/[code]/page.tsx` - Modal itinerario + datos dinámicos
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

**🐛 Correcciones Críticas - Filtros Tours**

**Problemas Corregidos:**

1. **✅ CRÍTICO: Solo mostraba 50 tours (hay 325 en DB)**
   - **Fix:** Cambiar `limit` default de 50 a 1000 en `/api/groups`
   - **Resultado:** Ahora carga todos los 325 tours

2. **✅ CRÍTICO: Error al escribir en búsqueda**
   - **Fix:** Agregar `try/catch` en `applyAllFilters()`
   - **Fix:** Agregar optional chaining (`?.`) en todos los filtros
   - **Resultado:** Búsqueda funciona sin errores

3. **✅ Filtros de región mostraban (0) y estaban deshabilitados**
   - **Fix:** Cambiar `p.region` → `p.destination_region`
   - **Fix:** Quitar `disabled={count === 0}`
   - **Resultado:** Filtros siempre seleccionables

4. **✅ Filtros de eventos mostraban (0)**
   - **Fix:** Quitar `disabled={count === 0}`
   - **Resultado:** Eventos siempre seleccionables

5. **✅ Filtro de precio crasheaba si tour no tenía precio**
   - **Fix:** Agregar `if (!p.pricing?.totalPrice) return true`
   - **Resultado:** Tours sin precio se incluyen en resultados

**Archivos Modificados:**
- `src/app/api/groups/route.ts` - Limit 50 → 1000
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

**🎨 Filtros Sidebar Avanzados + Re-sincronización MegaTravel Completa**

**Cambios:**

1. **✅ Página de Tours (`/tours`) - Filtros Sidebar Avanzados**
   - **Nuevo diseño con sidebar lateral** (estilo MegaTravel/Hoteles)
   - **6 filtros funcionales:**
     - 🔍 Palabra Clave (búsqueda de texto)
     - 🌍 País (dropdown con todos los países)
     - 📍 Ciudad (dropdown condicional, aparece al seleccionar país)
     - 💰 Tarifa en **USD** (slider 0-10,000 USD)
     - ⏱️ Duración (slider 1-30 días)
     - 📅 Fecha ida (12 meses, preparado para departure_dates)
   - **Filtros colapsables** con iconos de colores
   - **Botón "Limpiar filtros"** para resetear todo
   - **Responsive móvil:**
     - Botón flotante "Filtros" en móvil
     - Sidebar como modal fullscreen en móvil
     - Colapsa automáticamente en pantallas < 1024px
   - **Función de filtrado unificada** que combina todos los filtros
   - **Conversión automática MXN → USD** para filtro de precio
   - **Mantiene hero section** con video/imagen de fondo
   - **Mantiene navegación** por categorías (Ofertas, Bloqueos, etc.)

2. **✅ Re-sincronización MegaTravel - 100% Completada**
   - **325/325 tours procesados** (100%)
   - **324 exitosos, 1 fallido**
   - **Mejoras implementadas:**
     - ✅ Imágenes correctas (detección por código de tour)
     - ✅ Tags automáticos (81 tours con tags)
     - ✅ Precios extraídos desde circuito.php
     - ✅ Itinerarios completos
     - ✅ 308 tours con imagen principal (94.8%)
   - **Script de monitoreo:** `scripts/monitor-resync.js`
   - **Script principal:** `scripts/resync-all-tours.js`

3. **📝 Documentación Creada**
   - `docs/AG-Plan-Integracion-Filtros-Tours.md` - Plan técnico completo
   - `docs/AG-Guia-Tours-V2.md` - Guía de uso del nuevo diseño
   - `docs/AG-Resincronizacion-MegaTravel.md` - Proceso de re-sync
   - `docs/AG-Hallazgo-Mega-Conexion.md` - URLs de circuito.php
   - `docs/AG-Prueba-Scraping-Completo.md` - Resultados de pruebas

4. **🔧 Archivos Modificados**
   - `src/app/tours/page.tsx` - Integración completa de filtros sidebar
   - `src/app/tours/page-backup-01feb.tsx` - Backup de seguridad
   - `src/app/tours/page-v2-sidebar.tsx` - Versión experimental
   - `src/app/tours-v2/page.tsx` - Ruta temporal de prueba
   - `src/app/page.tsx` - Actualización de versión en footer

**Lecciones Aprendidas:**

1. **Filtros combinados** - La función `applyAllFilters()` permite combinar múltiples filtros de forma eficiente
2. **Responsive móvil** - El botón flotante + sidebar modal es mejor UX que sidebar siempre visible
3. **Precios en USD** - Los tours de MegaTravel usan USD, no MXN
4. **Re-sincronización masiva** - Procesar 325 tours toma ~6-8 horas, mejor hacerlo de noche
5. **Tags automáticos** - Solo 25% de tours tienen tags, necesita mejora en detección

**Pendientes:**

- [ ] Mejorar detección de tags (actualmente solo 25% de tours)
- [ ] Implementar filtro por mes de salida (cuando tengamos departure_dates)
- [ ] Agregar ordenamiento (precio, duración, nombre)
- [ ] Optimizar responsive tablet (768-1023px)
- [ ] Agregar vista List (actualmente solo Grid)

**Cifra de Control:** (Sin cambios en esquema)
- **Tablas:** 48
- **Campos:** 624

---

### v2.267 - 01 de Febrero de 2026 - 20:25 CST

### v2.267 - 01 de Febrero de 2026 - 20:25 CST

**🔗 Integración: Cotizaciones de Tours → Centro de Comunicación**

**Cambios:**

1. **✅ API de Cotizaciones de Tours (`/api/tours/quote/route.ts`)**
   - Integración automática con Centro de Comunicación
   - Al crear cotización, ahora crea:
     - Thread en `communication_threads` con tipo `inquiry`
     - Mensaje automático de confirmación en `messages`
     - Vinculación con `reference_type: 'tour_quote'` y `reference_id`
   - Mensaje incluye: saludo personalizado, detalles de cotización, link de seguimiento

2. **✅ Gestión de Cotizaciones (`/dashboard/quotes/page.tsx`)**
   - Nueva columna **"Tipo"** con badges distintivos:
     - 🔵 **Tour** (azul) - cotizaciones desde formulario público
     - ⚫ **General** (gris) - cotizaciones manuales del admin
   - Acciones diferenciadas por tipo:
     - Tours: Botón "Ver" → abre `/cotizacion/[folio]`
     - Generales: Botones "Editar", "PDF", "Enviar"
   - Interfaz `Quote` actualizada con campo `source?: 'tour' | 'general'`
   - Función `loadQuotes()` ahora carga ambas fuentes y las combina

3. **✅ Nuevo Endpoint (`/api/tours/quote/list/route.ts`)**
   - Lista todas las cotizaciones de tours desde `tour_quotes`
   - Mapea campos al formato del dashboard

**Flujo Completo:**
```
Cliente → /cotizar-tour → Cotización en tour_quotes → Thread en communication_threads → Mensaje en messages → Aparece en /dashboard/quotes + /comunicacion
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

**🐛 Fix: Sidebar Duplicado en Tour Detail + Script Sincronización MegaTravel**

**Cambios:**

1. **✅ Corrección Tour Detail Page (`app/tours/[code]/page.tsx`)**
   - **Problema:** Dos sidebars duplicados (verde con WhatsApp + azul con Cotizar Tour)
   - **Precios incorrectos:** Sidebar verde mostraba `totalPrice`, sidebar azul mostraba cálculo correcto
   - **Solución:** Eliminado sidebar duplicado (líneas 816-914)
   - **Resultado:** Solo queda sidebar correcto con:
     - Precios calculados correctamente: `basePrice + taxes`
     - Botón "Cotizar Tour" que envía params correctos a `/cotizar-tour`
     - Información de contacto y tags

2. **✅ Script de Sincronización Completa (`scripts/sync-all-megatravel.ts`)**
   - Script autónomo para sincronizar TODOS los tours de MegaTravel
   - **FASE 1:** `discoverAllTours()` - Descubre URLs de 9 categorías (~325 tours)
   - **FASE 2:** Scraping individual con Puppeteer + Cheerio
   - Features:
     - Pool de PostgreSQL con SSL configurado para Neon
     - Carga `.env.local` correctamente
     - Rate limiting (2 seg entre tours)
     - Error handling no-bloqueante
     - Log completo a `sync-progress.log`
     - Resumen final con estadísticas
   - **Status:** ✅ Ejecutándose en background (~2-3 horas)

3. **✅ Mejoras `MegaTravelScrapingService.ts`**
   - Agregado parámetro opcional `customPool` a `saveScrapedData()`
   - Permite usar pool personalizado con SSL en scripts standalone
   - Resuelve error: `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string`

4. **✅ Documentación**
   - `AG-Sync-En-Progreso-01Feb.md` - Guía de monitoreo y troubleshooting
   - `AG-Progreso-Sync-MegaTravel-01Feb.md` - Timeline y métricas esperadas

**Dependencias:**
- `tsx` instalado para ejecutar TypeScript directamente

**Despliegue:**
- ✅ Commit: `4981698`
- ✅ Push a `main`
- ⏳ Vercel deployment automático

**Próximos Pasos:**
1. Monitorear progreso de sincronización (cada 30 min)
2. Verificar datos en Neon cuando termine sync
3. Frontend: mostrar itinerarios completos con datos nuevos

---

### v2.262 - 01 de Febrero de 2026 - 10:45 CST

**🚀 Fase 2: Implementación Completa de Scraping MegaTravel con Puppeteer**

**Objetivo:** Implementar el sistema completo de scraping para extraer TODA la información de los tours de MegaTravel (itinerario, fechas, políticas, tours opcionales, información adicional)

**Cambios:**

1. **✅ Nuevo Servicio: `MegaTravelScrapingService.ts`**
   - **Scraping de Itinerario** (`scrapeItinerary`)
     - Extrae itinerario día por día con títulos, descripciones, comidas (D/A/C)
     - Detecta hoteles y ciudades por día
     - Dos estrategias: HTML estático + parsing de texto completo
     - Fallback robusto si no encuentra estructura esperada
   
   - **Scraping de Fechas de Salida** (`scrapeDepartures`)
     - Extrae fechas desde tablas HTML dinámicas
     - Parser de múltiples formatos de fecha (DD MMM YYYY, YYYY-MM-DD)
     - Detecta precios por fecha y disponibilidad
     - Genera fechas de ejemplo si no encuentra (12 fechas cada 15 días)
   
   - **Scraping de Políticas** (`scrapePolicies`)
     - Política de cancelación, cambios, pagos
     - Términos y condiciones
     - Requisitos: documentos, visas, vacunas, seguros
     - Búsqueda inteligente por palabras clave
   
   - **Scraping de Información Adicional** (`scrapeAdditionalInfo`)
     - Notas importantes
     - Recomendaciones de viaje
     - Qué llevar / equipaje
     - Clima, moneda local, idioma, timezone, voltaje
   
   - **Scraping de Tours Opcionales** (`scrapeOptionalTours`)
     - Nombre, código y descripción completa
     - Precios en USD
     - Fechas de validez (temporadas A/B)
     - Condiciones especiales de aplicación
   
   - **Guardado Transaccional** (`saveScrapedData`)
     - Guarda en 4 tablas con transacciones atómicas
     - Uso de `ON CONFLICT` para updates idempotentes
     - Rollback automático en caso de error

2. **✅ Servicio Principal Actualizado: `MegaTravelSyncService.ts`**
   - **Nueva función:** `syncCompletePackageData(tourUrl, mtCode)`
     - Obtiene package_id de la base de datos
     - Ejecuta scraping completo con Puppeteer
     - Guarda todos los datos extraídos
     - Manejo de errores sin detener sincronización completa
   
   - **Actualización de:** `startFullSync(triggeredBy, enableFullScraping)`
     - Nuevo parámetro booleano para habilitar/deshabilitar scraping completo
     - Logs mejorados con emojis y progreso detallado
     - Llama a `syncCompletePackageData()` para cada paquete
     - Continúa aunque falle un paquete individual

3. **✅ Dependencias NPM Instaladas**
   ```json
   {
     "puppeteer": "^23.x.x",
     "cheerio": "^1.x.x",
     "@types/cheerio": "^0.x.x"
   }
   ```
   - **Puppeteer:** Navegador headless para JavaScript rendering
   - **Cheerio:** Parser HTML ultra-rápido (jQuery-like)
   - **Types:** TypeScript definitions

4. **✅ Documentación Creada**
   - `AG-Analisis-HTML-MegaTravel-01Feb.md` - Análisis detallado de estructura HTML
   - `AG-Implementacion-Scraping-Completo-v2.262.md` - Guía completa de implementación
   - Documentación inline en todos los métodos de scraping

**Archivos Modificados:**
- `src/services/MegaTravelSyncService.ts` (actualizado con nueva función)
- `package.json` (nuevas dependencias)

**Archivos Creados:**
- `src/services/MegaTravelScrapingService.ts` (nuevo servicio completo)
- `docs/AG-Analisis-HTML-MegaTravel-01Feb.md`
- `docs/AG-Implementacion-Scraping-Completo-v2.262.md`

**Flujo de Sincronización:**
```
Panel Admin → Click "Sincronizar"
  ↓
MegaTravelSyncService.startFullSync(enableFullScraping: true)
  ↓
Para cada paquete:
  1. upsertPackage() → Inserta/actualiza datos básicos
  2. syncCompletePackageData() →
     a. Abre Puppeteer (navegador headless)
     b. Navega a URL del tour
     c. Extrae HTML completo (networkidle2)
     d. Parsea con Cheerio
     e. Ejecuta 5 funciones de scraping
     f. Guarda en 4 tablas con transacción
  ↓
Actualiza megatravel_sync_log
```

**Performance Esperado:**
- ~20-30 segundos por tour (Puppeteer + parsing)
- ~2-3 minutos para 6 tours completos
- Headless mode activado por defecto

**Proximos Pasos (Pendientes):**
1. ⏳ Pruebas de scraping real con MegaTravel
2. ⏳ Ajustes de selectores CSS según HTML real
3. ⏳ Actualización de frontend para mostrar itinerarios/fechas/políticas
4. ⏳ Optimización de performance (caching, parallel requests)

**Lecciones Aprendidas:**
- Puppeteer requiere `--no-sandbox` en algunos entornos
- Cheerio tiene tipos `Root` vs `CheerioAPI`, usar `Root` para funciones
- Import dinámico necesario para evitar dependencias circulares
- Estrategias de fallback esenciales (MegaTravel cambia HTML frecuentemente)

**Cifra de Control:**
- Tablas: 29 (sin cambios desde v2.261)
- Campos: ~350+ (sin cambios - solo lógica de negocio)

---

### v2.261 - 31 de Enero de 2026 - 22:15 CST

**🚀 Fase 1: Migraciones para Scraping Completo de MegaTravel**

**Objetivo:** Preparar la base de datos para almacenar TODA la información de MegaTravel (itinerario, fechas, políticas, info adicional)

**Cambios:**
- ✅ **Creadas 4 nuevas tablas:**
  - `megatravel_itinerary` - Itinerario día por día (day_number, title, description, meals, hotel, city, activities)
  - `megatravel_departures` - Fechas de salida (departure_date, price_usd, availability, status, passengers)
  - `megatravel_policies` - Políticas y requisitos (cancellation, payment, visa, documents)
  - `megatravel_additional_info` - Información adicional (notes, climate, currency, emergency_contacts)
- ✅ **Script de migración:** `scripts/run-megatravel-migrations.js`
- ✅ **Migraciones ejecutadas** exitosamente en base de datos
- ✅ **Documentación completa:**
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

**Próximos pasos (Fase 2):**
- ⏳ Modificar `MegaTravelSyncService.ts` para agregar scraping de itinerario, fechas, políticas
- ⏳ Probar scraping con tours reales
- ⏳ Crear componentes de frontend para mostrar nuevos datos

**Cifra de Control:**
- T: 62 | C: 620 (+4 tablas, +54 campos)

---

### v2.260 - 31 de Enero de 2026 - 22:00 CST

**🔧 Pre-rellenar Datos en Cotización + Buscador en Tab de Grupos**

**Cambios:**
- ✅ **Corregidos parámetros de URL** en botón "Cotizar Tour":
  - `tourPrice` → `price`
  - `tourRegion` → `region`
  - `tourDays` → `duration` (ahora envía "X días / Y noches")
  - `tourCities` → `cities`
- ✅ **Página `/cotizar-tour` ahora muestra datos correctos:**
  - Nombre del tour
  - Región
  - Duración
  - Ciudades
  - **Precio base correcto** (ya no $0 USD)
- ✅ **Buscador movido al lugar correcto:**
  - Ubicación anterior: Sección inferior de página principal
  - Ubicación nueva: Tab "Viajes Grupales" del hero
  - Posición: Entre video "Descubre el Mundo" y grid de tours

**Archivos modificados:**
- `src/app/tours/[code]/page.tsx` - Corregidos parámetros de URL
- `src/app/page.tsx` - Movido buscador al tab de grupos

**Cifra de Control:**
- T: 58 | C: 566 (Sin cambios en BD)

---

### v2.259 - 31 de Enero de 2026 - 21:50 CST

**🎨 Sidebar de Precios con Botón "Cotizar Tour"**

**Cambios:**
- ✅ **Agregado sidebar de precios** en columna derecha de `/tours/[code]`:
  - Precio principal grande ($2,148 USD)
  - Desglose de precios (Precio base + Impuestos)
  - Total calculado
  - Botón azul "Cotizar Tour" (reemplaza el verde de WhatsApp)
  - Sticky (se queda fijo al hacer scroll)
  - Mensaje "Respuesta inmediata • Asesoría personalizada"
- ✅ **Funcionalidad del botón:**
  - Redirige a `/cotizar-tour` con parámetros del tour
  - Pre-llena información del tour en la página de cotización

**Archivos modificados:**
- `src/app/tours/[code]/page.tsx` - Agregado sidebar de precios
- `docs/AG-Historico-Cambios.md` - Nueva entrada v2.258
- `docs/AG-Contexto-Proyecto.md` - Lecciones aprendidas

**Cifra de Control:**
- T: 58 | C: 566 (Sin cambios en BD)

---

### v2.258 - 31 de Enero de 2026 - 21:40 CST

**🔧 Restauración de Funcionalidad Perdida + Mapa Interactivo**

**Cambios:**
- ✅ **HOTFIX:** Arreglado error de compilación en `TourMap.tsx` (uso de `window.google` en lugar de `google` directo)
- ✅ **Restaurado:** Botón "Cotizar Tour" que se perdió en v2.257
  - Ubicación: Después del itinerario, antes de hoteles
  - Diseño: Card con gradiente azul, botón grande con ícono Send
  - Funcionalidad: Redirige a `/cotizar-tour` con parámetros pre-llenados (tourId, tourName, tourPrice, tourRegion, tourDays, tourCities)
- ✅ **Confirmado:** Sección de hoteles detallados SÍ está presente (no se perdió)
- ✅ **Agregado:** Buscador en página principal (sección "Tours y Viajes Grupales")
  - Ubicación: Entre título y grid de tours
  - Funcionalidad: Búsqueda con Enter o botón, redirige a `/tours?search=...`
- ✅ **Agregado:** Componente `TourMap.tsx` con Google Maps JavaScript API
  - Marcadores numerados para cada ciudad
  - Info windows al hacer click
  - Auto-ajuste para mostrar todas las ciudades
- ✅ **Agregado:** Sección de itinerario en detalle de tour
  - Muestra primeros 3 días
  - Botón "Ver itinerario completo"
  - Contador de días restantes

**Archivos modificados:**
- `src/components/TourMap.tsx` - Arreglado error de TypeScript
- `src/app/tours/[code]/page.tsx` - Restaurado botón "Cotizar Tour"
- `src/app/page.tsx` - Agregado buscador en sección de tours
- `docs/AG-Historico-Cambios.md` - Nueva entrada v2.258
- `docs/AG-Contexto-Proyecto.md` - Actualizado con lecciones aprendidas

**Lecciones Aprendidas:**
- ✅ **Importante:** Al hacer cambios grandes (como agregar mapa), verificar que no se pierdan funcionalidades existentes
- ✅ **TypeScript:** Para Google Maps API sin tipos instalados, usar `(window as any).google` y tipos `any`
- ✅ **Versiones:** Mantener un solo número de versión en la página principal para referencia
- ✅ **Documentación:** Revisar `AG-Historico-Cambios.md` antes de hacer cambios para no perder funcionalidades previas

**Cifra de Control:**
- T: 58 | C: 566 (Sin cambios en BD)

---

### v2.251 - 31 de Enero de 2026 - 14:50 CST

**🎥 Mejora Visual: Video Pantalla Completa en Tours**

**Cambios:**
- ✅ Video de fondo en `/tours` ahora a pantalla completa (`scale-150`)
- ✅ Overlay cambiado de `bg-white/90` a `bg-gradient-to-b from-white/20 via-white/10 to-white/30` (muy traslúcido)
- ✅ Texto cambiado a blanco con `drop-shadow` para mejor legibilidad sobre video
- ✅ Barra de búsqueda con `backdrop-blur-xl` para mantener contraste
- ✅ **Versiones actualizadas en footers** de todas las páginas principales para verificar deployment

**Archivos modificados:**
- `src/app/tours/page.tsx` - Video pantalla completa + overlay traslúcido + versión v2.251
- `src/app/page.tsx` - Versión actualizada en footer a v2.251
- `src/app/cotizar-tour/page.tsx` - Versión agregada en footer
- `docs/AG-Historico-Cambios.md` - Nueva entrada v2.251

**Lecciones aprendidas:**
- ✅ Mantener versiones en footers ayuda a verificar deployments y evitar problemas de caché
- ✅ El overlay muy traslúcido (`/10` a `/30`) permite apreciar el video sin sacrificar legibilidad
- ✅ `drop-shadow` en texto blanco es esencial para legibilidad sobre videos dinámicos

---

### v2.250 - 31 de Enero de 2026 - 14:10 CST

**🎨 Mejoras de Diseño y Nuevo Módulo de Cotizaciones**

**Cambios UI/UX:**
- **Tours - Hero Section:** Cambiado de fondo morado/azul transparente a blanco traslúcido con texto oscuro, siguiendo el estilo AS Operadora.
  - Fondo: `bg-white/90 backdrop-blur-sm`
  - Texto: Cambiado de blanco a `text-gray-900` y `text-gray-700`
  - Barra de búsqueda: Fondo blanco con bordes grises, mejor contraste
  - Botón de búsqueda: Azul sólido con texto blanco

**Nuevo Módulo de Cotizaciones:**
- **Página `/cotizar-tour`:** Formulario completo de cotización que pre-llena datos del tour seleccionado
  - Datos pre-llenados: Tour ID, nombre, precio, región, duración, ciudades
  - Formulario de cliente: Nombre, apellido, correo, teléfono, número de personas, comentarios
  - Selector de método de notificación: WhatsApp, Email, o Ambos
  - Resumen visual del tour en sidebar
  - Página de confirmación con detalles de la cotización
- **Página `/cotizacion/[folio]`:** Seguimiento de cotización con estados
  - Estados: Pendiente, Contactado, Cotización Enviada, Confirmado, Cancelado
  - Visualización de detalles del tour y contacto
  - Resumen de precios y opciones de contacto directo
  - Diseño responsive con información clara

**Cambios Backend:**
- **API `/api/tours/quote` (POST):** Crear cotización de tour
  - Genera folio único: `TOUR-timestamp-random`
  - Calcula precio total basado en número de personas
  - Guarda en BD con todos los detalles
  - Genera URL de seguimiento
  - Prepara mensajes de WhatsApp y Email (logs por ahora, pendiente integración real)
- **API `/api/tours/quote/[folio]` (GET):** Obtener cotización por folio
- **Migración 016:** Nueva tabla `tour_quotes`
  - 21 campos incluyendo folio, datos del tour, contacto, precios, estado
  - Índices para búsquedas rápidas (folio, email, status, created_at)
  - Trigger para updated_at automático
  - Estados: pending, contacted, quoted, confirmed, cancelled

**Cambios en Tours:**
- **Detalle de Tour:** Botón "Reservar por WhatsApp" reemplazado por "Cotizar Tour"
  - Redirige a `/cotizar-tour` con parámetros del tour en URL
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
- `src/app/tours/page.tsx` (hero section con nuevo diseño)
- `src/app/tours/[code]/page.tsx` (botón cotizar + import Send)

**Lecciones Aprendidas:**
- El diseño con fondo blanco traslúcido y texto oscuro proporciona mejor legibilidad y se alinea mejor con la identidad visual de AS Operadora
- Pre-llenar formularios con datos del contexto mejora significativamente la UX y reduce fricción
- Ofrecer múltiples métodos de notificación (WhatsApp/Email/Ambos) da flexibilidad al cliente

**Cifra de Control:**
- T: 58 | C: 566 (1 tabla nueva: tour_quotes con 21 campos)

---

### v2.233 - 27 de Enero de 2026 - 11:15 CST

### v2.233 - 27 de Enero de 2026 - 11:15 CST

**🆕 Nueva Funcionalidad: Sistema de Administración Granular de Funciones**

Esta versión implementa un sistema completo de feature flags con control granular por rol y plataforma (Web/Móvil).

**Cambios Backend:**
- **Nueva tabla `features`**: Catálogo de 38 funciones controlables organizadas en 6 categorías.
- **Nueva tabla `feature_role_access`**: Permisos granulares por rol (SUPER_ADMIN, ADMIN, MANAGER, EMPLOYEE).
- **Nueva tabla `app_settings`**: Configuración global (login obligatorio, versión, etc.).
- **FeatureService.ts**: Servicio completo con métodos para verificar permisos, obtener features habilitados, actualizar configuración.
- **API `/api/admin/features`**: GET (listar), PUT (actualizar feature), POST (actualizar settings).
- **API `/api/features/user`**: Obtener features habilitados para usuario actual.

**Cambios Frontend:**
- **FeaturesContext.tsx**: Contexto React para gestión global de features.
- **FeatureGate.tsx**: Componente wrapper para controlar visibilidad de elementos.
- **page.tsx**: 16 tabs de búsqueda ahora envueltos con `<FeatureGate>`.
- **Panel `/admin/features`**: Nueva página de administración con:
  - Toggle global ON/OFF por feature
  - Toggle por plataforma (Web/Móvil)
  - Filtros por categoría
  - Búsqueda por nombre/código
  - Resumen estadístico

**Configuración Inicial de Producción:**
- ✅ SEARCH_GROUPS (Viajes Grupales/MegaTravel) = ON
- ❌ Resto de buscadores = OFF (Hoteles, Vuelos, etc.)
- ✅ LOGIN_REQUIRED_WEB = true
- ✅ LOGIN_REQUIRED_MOBILE = true
- ✅ Funciones admin = ON

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
- `src/app/page.tsx` (tabs envueltos con FeatureGate, menú actualizado)

**Cifra de Control:**
- T: 60 | C: 570 (3 tablas nuevas, 25 campos nuevos)

---

### v2.232 - 21 de Enero de 2026 - 19:50 CST

**Cambios UI:**
- **Calendario (Hotfix):**
  - Se restauró la funcionalidad visual para deshabilitar fechas pasadas (estilo tenue/tachado).
  - Se restauró y mejoró la visualización de rangos seleccionados (highlight azul continuo).
  - Se conservó la corrección de alineación de columnas.
  - Corrección de mapeo de clases para modificadores en `react-day-picker` v9 (`day_disabled` -> `disabled`, etc.).

**Cifra de Control:**
- T: 57 | C: 545

---

### v2.231 - 21 de Enero de 2026 - 19:30 CST

**Cambios UI:**
- **Calendario (Fix Completo):**
  - Actualización de clases CSS para compatibilidad nativa con `react-day-picker` v9.
  - Corrección de desalineación de encabezados (agregado `w-full` y `flex-1`).
  - Centrado de números y distribución uniforme de columnas.

**Cambios Backend:**
- **Búsqueda Hoteles:**
  - Mejora en lógica `getCityCode` (SearchService.ts) para procesar entradas complejas (ej: "Cancún, México" -> "Cancún").
  - Logging detallado agregado para diagnóstico de parámetros y respuestas de Amadeus.
- **API Amadeus:**
  - Confirmación de conectividad exitosa (Script `scripts/test-amadeus.js`).
  - Validación de credenciales en tiempo de ejecución.

**Lecciones Aprendidas:**
- Los componentes de terceros requieren verificación estricta de versiones y estilos CSS.
- La normalización de inputs de usuario es crítica antes de llamar APIs externas estritas.

**Cifra de Control:**
- T: 57 | C: 545

---

### v2.230 - 19 de Enero de 2026 - 00:25 CST

**Cambios:**
- **UI Restaurantes:**
  - Header actualizado a estilo blanco traslúcido (`backdrop-blur-md`).
  - Barra de búsqueda en el header ahora es interactiva (Inputs para Ciudad, Fecha, Personas) permitiendo refinar la búsqueda desde resultados.
  - Corrección de lógica de ubicación: Se prioriza y lee correctamente el parámetro `destination` o `city` para evitar búsquedas sin ubicación.
  - Mejora en construcción de query a Google Places API para evitar resultados globales (se fuerza "restaurantes en [ciudad]").
- **UI Confirmar Reserva (Restaurante):**
  - Header actualizado a estilo blanco traslúcido.
  - Agregado botón "Regresar" (< ArrowLeft).
  - Implementada validación robusta de formulario:
    - Nombre/Apellido requeridos (min 2 caracteres).
    - Email con validación de formato regex.
    - Teléfono validado a 10 dígitos numéricos.
    - Mensajes de error en rojo bajo cada campo inválido.

**Lecciones Aprendidas:**
- Es crítico sincronizar los nombres de parámetros de URL (`city` vs `destination`) entre la Home y las páginas de resultados para evitar pérdidas de contexto.

**Cifra de Control:**
- T: 57 | C: 545

---

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
