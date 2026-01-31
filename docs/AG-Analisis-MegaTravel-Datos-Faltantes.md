# 📋 Análisis MegaTravel - Datos Faltantes y Plan de Implementación

**Fecha:** 31 de Enero de 2026 - 15:55 CST  
**Versión actual:** v2.253  
**Estado:** Análisis completado

---

## 🔍 DATOS ACTUALMENTE CAPTURADOS

Según `MegaTravelSyncService.ts`, actualmente se captura:

### ✅ Datos Básicos
- `mt_code`, `mt_url`, `name`, `description`
- `destination_region`, `cities`, `countries`, `main_country`
- `days`, `nights`

### ✅ Precios
- `price_usd`, `taxes_usd`, `currency`
- `price_per_person_type`
- `price_variants` (Doble, Triple, Sencilla, etc.)

### ✅ Vuelo
- `includes_flight`, `flight_airline`, `flight_origin`

### ✅ Incluye/No Incluye
- `includes[]`, `not_includes[]`

### ✅ Hotel
- `hotel_category`, `meal_plan`
- `hotels[]` (básico: city, name, stars)

### ✅ Itinerario
- `itinerary[]` (day, title, description, meals)
- `itinerary_summary`

### ✅ Tours Opcionales
- `optional_tours[]` (name, description, price_usd)

### ✅ Salidas
- `departures[]` (date, price_usd, status)

### ✅ Imágenes
- `main_image`, `gallery_images[]`, `map_image`

### ✅ Otros
- `important_notes`, `tips_amount`
- `category`, `subcategory`, `tags[]`
- `is_featured`, `is_offer`

---

## ❌ DATOS FALTANTES (Según imágenes de MegaTravel)

### 1. 📍 **Mapa del Tour** (IMAGEN 1)
**Lo que se ve:**
- Mapa interactivo con ruta del tour
- Puntos marcados con ciudades
- Líneas conectando las ciudades
- Nombres de ciudades en el mapa

**Estado actual:**
- ✅ Ya existe `map_image` en el modelo
- ❌ Falta capturar la URL del mapa desde MegaTravel
- ❌ No se muestra en la UI actual

**Acción requerida:**
- Extraer URL del mapa desde MegaTravel
- Mostrar en página de detalle del tour

---

### 2. 🏨 **Hoteles Detallados** (IMAGEN 2)
**Lo que se ve:**
```
HOTELES PREVISTOS O SIMILARES

HOTEL                                    | CIUDAD      | TIPO     | PAÍS
Grand Harilton / Clarion Mahmutbey...   | Estambul    | Primera  | Turquía
Signature Spa / Signature Garden...     | Capadocia   | Primera  | Turquía
Ramada By Wyndham Thermal...            | Pamukkale   | Primera  | Turquía
...
```

**Estado actual:**
- ⚠️ Existe `hotels[]` pero solo captura: `city`, `name`, `stars`
- ❌ Falta: `tipo` (Primera, Turista, etc.)
- ❌ Falta: `país`
- ❌ Falta: múltiples opciones de hotel por ciudad

**Acción requerida:**
- Ampliar modelo `hotels[]` para incluir:
  ```typescript
  {
    city: string;
    hotel_names: string[];  // Múltiples opciones
    category: string;       // Primera, Turista, etc.
    country: string;
    stars?: number;
  }
  ```

---

### 3. 💰 **Tarifas y Salidas Detalladas** (IMAGEN 2)
**Lo que se ve:**
```
TARIFAS 2026
Doble    $699
Triple   $699
Sencilla $999
Menor    $699
Infante  $399

IMPUESTOS AÉREOS 2026
$999

SUPLEMENTOS 2026
Abril: 13, 29                    $199
Agosto: 19, 22, 26, 27, 28, 29   $199
Marzo: 11, 15                    $299
Mayo: 6, 7, 14, 15, 16, 21, 23   $299
...
```

**Estado actual:**
- ✅ Existe `price_variants` (Doble, Triple, etc.)
- ✅ Existe `taxes_usd`
- ⚠️ Existe `departures[]` pero solo: `date`, `price_usd`, `status`
- ❌ Falta: suplementos por fecha específica
- ❌ Falta: rangos de fechas con mismo suplemento

**Acción requerida:**
- Ampliar `departures[]` o crear nuevo campo `supplements`:
  ```typescript
  supplements: Array<{
    dates: string[];        // ["2026-04-13", "2026-04-29"]
    price_usd: number;      // 199
    description?: string;   // "Temporada alta"
  }>
  ```

---

### 4. 🛂 **Visas** (IMAGEN 3)
**Lo que se ve:**
```
TURQUÍA:
Tiempo antes de la salida para tramitar la visa: 20 días.
Duración del trámite: NA
Costo por pasajero: Sin costo.
Se genera vía internet en el siguiente link: clic aquí

Nota: Le informamos que el trámite de visa corresponde ÚNICAMENTE al pasajero...
```

**Estado actual:**
- ❌ **NO EXISTE** en el modelo actual
- ❌ No se captura información de visas

**Acción requerida:**
- Agregar nuevo campo `visa_requirements`:
  ```typescript
  visa_requirements?: Array<{
    country: string;              // "Turquía"
    days_before_departure: number; // 20
    processing_time: string;      // "NA" o "5 días"
    cost: string;                 // "Sin costo" o "$150 USD"
    application_url?: string;     // URL para tramitar
    notes?: string;               // Notas adicionales
  }>
  ```

---

### 5. ⚠️ **Notas Importantes** (IMAGEN 3 y 4)
**Lo que se ve:**
```
NOTAS:
- ESTE ITINERARIO PUEDE SUFRIR MODIFICACIONES POR CONDICIONES DE CARRETERAS, CLIMA...
- EL ORDEN DE LOS SERVICIOS PUEDE CAMBIAR
- ...
```

**Estado actual:**
- ✅ Existe `important_notes` (string)
- ⚠️ Se captura como texto plano
- ❌ No se estructura en puntos

**Acción requerida:**
- Cambiar `important_notes` de `string` a `string[]`:
  ```typescript
  important_notes?: string[];  // Array de notas
  ```

---

### 6. 🎯 **Tours Opcionales Detallados** (IMAGEN 4)
**Lo que se ve:**
```
PAQUETE 2 - A                    USD 555
ESTE PRECIO APLICA PARA SALIDAS
CON LLEGADA A TURQUÍA DEL 1 ABR AL 31 MAY...
Joyas de Constantinopla
Crucero por el Bósforo y bazar egipcio
Safari en 4x4
```

**Estado actual:**
- ✅ Existe `optional_tours[]` con: `name`, `description`, `price_usd`
- ❌ Falta: fechas de aplicación
- ❌ Falta: múltiples actividades por paquete
- ❌ Falta: condiciones especiales

**Acción requerida:**
- Ampliar `optional_tours[]`:
  ```typescript
  optional_tours?: Array<{
    code?: string;                // "PAQUETE 2 - A"
    name: string;
    description: string;
    price_usd: number;
    valid_dates?: {               // Fechas de aplicación
      from: string;
      to: string;
    };
    activities?: string[];        // Lista de actividades incluidas
    conditions?: string;          // Condiciones especiales
  }>
  ```

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Fase 1: Actualizar Modelo de Datos (PRIORITARIO)
1. ✅ Modificar interfaz `MegaTravelPackageRaw` en `MegaTravelSyncService.ts`
2. ✅ Crear migración SQL para agregar campos nuevos
3. ✅ Actualizar función `upsertPackage()` para guardar nuevos campos

### Fase 2: Actualizar Extracción (CUANDO TENGAMOS API)
1. ⏳ Modificar scraper/API para capturar datos faltantes
2. ⏳ Agregar parsers para:
   - Hoteles detallados
   - Tarifas y suplementos
   - Visas
   - Tours opcionales completos

### Fase 3: Actualizar UI
1. ✅ Mostrar mapa del tour
2. ✅ Tabla de hoteles detallada
3. ✅ Tabla de tarifas y suplementos
4. ✅ Sección de visas
5. ✅ Tours opcionales mejorados

### Fase 4: Panel de Admin
1. ✅ Crear página `/admin/megatravel`
2. ✅ Botón para ejecutar sincronización
3. ✅ Dashboard con estadísticas
4. ✅ Historial de sincronizaciones
5. ✅ Gestión de paquetes

---

## 🚀 SIGUIENTE PASO INMEDIATO

**Crear página de admin** `/admin/megatravel` con:
- ✅ Botón "Sincronizar MegaTravel" (llama a `/api/admin/megatravel` POST)
- ✅ Estadísticas de paquetes
- ✅ Historial de sincronizaciones
- ✅ Lista de paquetes sincronizados
- ✅ Solo accesible para SUPER_ADMIN

---

## 📋 CAMPOS A AGREGAR EN MIGRACIÓN

```sql
-- Agregar a tabla megatravel_packages:
ALTER TABLE megatravel_packages 
ADD COLUMN visa_requirements JSONB,
ADD COLUMN supplements JSONB,
ADD COLUMN detailed_hotels JSONB;

-- Modificar campo important_notes de TEXT a JSONB (array)
ALTER TABLE megatravel_packages 
ALTER COLUMN important_notes TYPE JSONB USING 
  CASE 
    WHEN important_notes IS NULL THEN NULL
    ELSE to_jsonb(ARRAY[important_notes])
  END;
```

---

**Conclusión:** Tenemos la base, pero faltan detalles importantes que se ven en MegaTravel. 
Necesitamos actualizar el modelo y crear el panel de admin.
