# 🔄 Handoff: Fixing Tour Details — v2.324
**Fecha:** 20 Feb 2026 12:16 CDMX  
**Último commit:** `v2.324 - Fix: extraer ciudades/paises/duracion del tour, filtrar imagenes de categoria generica (EUROPA), actualizar saveScrapedData con metadatos`  
**Branch:** `main`  
**Repo:** `https://github.com/sergioaguilargranados-ai/operadora-dev.git`

---

## 📋 CONTEXTO DEL PROBLEMA

El usuario está trabajando en la página de detalle de tours (`/tours/[code]`) de AS Operadora. Los tours provienen de MegaTravel y se scrappean automáticamente. Hay 3 problemas principales:

### 1. 🏙️ Ciudades y Países vacíos
- **Problema:** Las columnas `cities TEXT[]`, `countries TEXT[]` y `main_country VARCHAR(100)` de la tabla `megatravel_packages` están vacías para todos los tours scrapeados automáticamente.
- **Causa raíz:** En `MegaTravelSyncService.ts` líneas ~697-699, cuando se crea el objeto `fullPkg` para tours descubiertos, se establece `cities: [], countries: [], main_country: ''`.
- **Fix implementado (v2.324):** Se creó la función `scrapeCitiesAndCountries()` en `MegaTravelScrapingService.ts` que extrae:
  - Ciudades desde `meta[property="og:description"]` → regex `Visitando:\s*(.+?)(?:\s+durante|\s*$)`
  - Países desde OG description → regex `Viaje\s+desde\s+México\s+a\s+(.+?)\.\s*Visitando`
  - Duración desde OG description → regex `(\d+)\s*días`
  - Fallbacks: texto "Visitando" en HTML, título OG, badges
- **Estado:** El fix se implementó y compila, pero **EL USUARIO DICE QUE NO FUNCIONÓ COMPLETAMENTE** al ejecutar el scraping. Necesita debugging.

### 2. 📸 Imagen genérica "EUROPA" apareciendo incorrectamente
- **Problema:** Una imagen de portada de categoría (ej: `europa-xxxxx.jpg`) se guardaba como `main_image` de tours que no son de Europa.
- **Fix implementado (v2.324):** `scrapeImages()` ahora:
  - Recibe `tourCode` como parámetro
  - Tiene lista de categorías: `['europa', 'asia', 'turquia', 'japon', ...]`
  - Si una imagen de `/covers/` contiene una categoría pero NO el `tourCode`, se excluye
- **Estado:** Necesita verificación post-scraping.

### 3. 🗺️ Mapa del tour
- **Fix implementado (v2.323):** Dual strategy en el frontend:
  - Prioridad: imagen de mapa de MegaTravel (`cdnmega.com/images/viajes/mapas/{code}.jpg`)
  - Fallback: componente `TourMap` con Google Maps API (si hay ciudades)
  - `onError` handler para ocultar imagen si URL falla
- **Estado:** Funciona, pero depende de que el scraping extraiga correctamente el `map_image` y que las ciudades estén populadas.

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### Flujo de datos:
```
MegaTravel.com.mx → Scraping (Puppeteer + Cheerio) → PostgreSQL (Neon) → API Next.js → Frontend React
```

### Archivos clave:

| Archivo | Propósito | Líneas clave |
|---------|-----------|--------------|
| `src/services/MegaTravelScrapingService.ts` | Scraping de tours individuales | L210-356: `scrapeTourComplete()`, L366-500: `scrapeFromCircuito()`, L858-975: `scrapeCitiesAndCountries()` (NUEVA), L976-1095: `scrapeImages()` (MODIFICADA), L1538-1820: `saveScrapedData()` |
| `src/services/MegaTravelSyncService.ts` | Sincronización masiva, CRUD BD | L660-734: `syncAllPackages()`, L810-872: `upsertPackage()`, L976-1075: `getPackageByCode()` |
| `src/app/api/admin/scrape-all/route.ts` | Endpoint para scraping batch | L120-175: loop de scraping |
| `src/app/api/groups/[code]/route.ts` | API detalle de tour | L45-158: formateo de datos para frontend |
| `src/app/tours/[code]/page.tsx` | Frontend detalle de tour | L382-410: mapa, L414-500: itinerario |
| `src/app/admin/megatravel-scraping/page.tsx` | Panel admin de scraping | Controla el proceso de scraping |

### Base de datos:
```sql
-- Tabla principal
megatravel_packages (
    cities TEXT[],           -- ← VACÍO, debe llenarse
    countries TEXT[],         -- ← VACÍO, debe llenarse
    main_country VARCHAR(100),-- ← VACÍO, debe llenarse
    days INTEGER,            -- ← A veces 0
    nights INTEGER,          -- ← A veces 0
    main_image VARCHAR(500), -- ← A veces imagen genérica incorrecta
    map_image VARCHAR(500),  -- ← URL predecible, puede ser 404
    ...
)

-- Tablas relacionadas
megatravel_itinerary (package_id, day_number, title, description, city, ...)
megatravel_departures (package_id, departure_date, price_usd, ...)
megatravel_policies (package_id, cancellation_policy, ...)
megatravel_additional_info (package_id, important_notes, ...)
```

### Migración: `migrations/016_create_megatravel_packages.sql`

---

## 🔍 QUÉ DEBUGGEAR PRIMERO

### 1. Verificar por qué `scrapeCitiesAndCountries()` no funcionó completamente

**Verificar en logs del scraping:**
- ¿Se ejecuta la función? Buscar: `🏙️ Ciudades desde OG:` o `📊 Tour meta:`
- ¿Hay errores? Buscar: `Error extrayendo ciudades/países`

**Posibles causas:**
1. La página scrapeada con Puppeteer puede NO tener el meta OG description (se carga dinámicamente)
2. El regex puede no coincidir con todos los formatos de OG description
3. El paso 7 de `saveScrapedData()` puede no ejecutarse si la data no se propaga correctamente

**Cómo verificar rápido en BD:**
```sql
-- Ver cuántos tours tienen ciudades vacías
SELECT COUNT(*) as total, 
       COUNT(*) FILTER (WHERE cities IS NOT NULL AND array_length(cities, 1) > 0) as con_ciudades
FROM megatravel_packages WHERE is_active = true;

-- Ver un tour específico
SELECT mt_code, name, cities, countries, main_country, days, nights, main_image, map_image
FROM megatravel_packages 
WHERE mt_code = 'MT-52172';
```

### 2. Tour de prueba: Brasil y Argentina (MT-52172)
- URL: `https://www.megatravel.com.mx/viaje/brasil-y-argentina-52172.html`
- Circuito: `https://www.megatravel.com.mx/tools/circuito.php?domi=&domiviaja=&viaje=52172&txtColor=000000&thBG=666666&thTxColor=FFFFFF&ff=1`
- OG Description esperado: `"Viaje desde México a Argentina, Brasil. Visitando: Río de Janeiro, Iguazú, Buenos Aires durante 11 días, desde tan solo $1999 USD"`
- Ciudades esperadas: `["Río de Janeiro", "Iguazú", "Buenos Aires"]`
- Países esperados: `["Argentina", "Brasil"]`

---

## 📁 CAMBIOS REALIZADOS EN v2.324

### `MegaTravelScrapingService.ts`:
1. **`scrapeTourComplete()` (L210-356):**
   - Return type ampliado con `cities`, `countries`, `main_country`, `days`, `nights`
   - Llama a `scrapeCitiesAndCountries($)` después de parsear con Cheerio
   - Pasa `tourCode` a `scrapeImages($, tourCode)`
   - Retorna los datos de ciudades/países/duración

2. **`scrapeCitiesAndCountries()` (L858-975) — NUEVA:**
   - Extrae ciudades desde OG description y HTML
   - Extrae países desde OG description y título
   - Extrae duración desde OG description y badges
   - Calcula `nights = days - 1` si falta

3. **`scrapeImages()` (L976-1095) — MODIFICADA:**
   - Acepta `tourCodeParam?: string | null` como segundo parámetro
   - Lista de `categoryCovers` para filtrar portadas genéricas
   - Solo acepta covers que contengan el `tourCode`

4. **`saveScrapedData()` (L1538-1820):**
   - Data type ampliado con `cities?`, `countries?`, `main_country?`, `days?`, `nights?`
   - Paso 7 (L1762-1806): UPDATE de `cities`, `countries`, `main_country`, `days`, `nights`

### `BrandFooter.tsx`:
- Versión actualizada a `v2.324 | 19 Feb 2026 14:15`

---

## ⚠️ POSIBLES ISSUES A INVESTIGAR

1. **Puppeteer no renderiza meta tags OG:** Si la página de MegaTravel carga los meta tags dinámicamente, Cheerio puede no verlos en el HTML scrapeado. Solución: extraer los meta tags ANTES de cerrar el navegador con `page.evaluate()`.

2. **Formato OG description varía entre tours:** El regex puede no cubrir todos los formatos. Algunos tours pueden tener "Visitando" sin dos puntos, o los países pueden estar en otro formato.

3. **`saveScrapedData` no recibe los datos:** Verificar que `scrapeTourComplete()` efectivamente pasa `cities`, `countries`, etc. al resultado y que `scrape-all/route.ts` los pasa a `saveScrapedData()`.

4. **Scraping batch (`scrape-all/route.ts` L124-133):** Este endpoint llama a `scrapeTourComplete()` y luego `saveScrapedData()` con el resultado. Los nuevos campos deberían propagarse automáticamente porque el return de `scrapeTourComplete()` ya los incluye.

---

## 🔧 AMBIENTE DE DESARROLLO

- **OS:** Windows
- **Node.js:** Verificar versión con `node -v`
- **Framework:** Next.js (App Router)
- **BD:** PostgreSQL en Neon (connection string en `.env.local` → `DATABASE_URL`)
- **Deployment:** Vercel (auto-deploy desde `main`)
- **Panel admin scraping:** `/admin/megatravel-scraping`
- **Endpoint scraping:** `POST /api/admin/scrape-all` con body `{ limit: 10, offset: 0 }`

---

## 📌 INSTRUCCIONES PARA EL SIGUIENTE AGENTE

1. **Leer este documento** primero para contexto completo
2. **Verificar la BD** para ver si las ciudades se popularon tras el scraping
3. **Si no se popularon:** Debuggear `scrapeCitiesAndCountries()` — probablemente el OG description no está disponible en el HTML scrapeado por Puppeteer
4. **Si se popularon parcialmente:** Ajustar los regex para cubrir más formatos de OG description
5. **Verificar imágenes:** Comprobar que la imagen de "EUROPA" ya no aparece en tours incorrectos
6. **Probar el mapa:** Navegar a un tour y verificar que el mapa (imagen o Google Maps) se muestre
7. **Re-ejecutar scraping** desde el panel si se hacen más cambios

### Comunicación:
- El usuario habla **español** y prefiere respuestas en español
- El proyecto usa convenciones de versionado: `v2.XXX`
- Los commits deben ser descriptivos en español o inglés
