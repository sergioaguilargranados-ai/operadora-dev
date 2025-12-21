# 🏨 Sistema de Auto-Guardado de Hoteles

## 📋 Descripción General

El sistema de auto-guardado de hoteles permite que cuando se realicen búsquedas en APIs externas (Booking.com, Expedia, etc.), los hoteles devueltos se guarden automáticamente en la base de datos local.

Esto tiene múltiples beneficios:
- ✅ **Catálogo creciente**: La base de datos crece automáticamente con cada búsqueda
- ✅ **Datos actualizados**: Si se encuentra información más completa, se actualiza automáticamente
- ✅ **Velocidad**: Búsquedas futuras pueden usar datos locales en vez de llamar APIs
- ✅ **Ahorro de costos**: Menos llamadas a APIs de pago
- ✅ **Control de calidad**: Sistema para revisar y completar datos faltantes

---

## 🏗️ Arquitectura

### 1. **HotelAutoSaveService** (`/services/HotelAutoSaveService.ts`)

Servicio principal que maneja el guardado automático de hoteles.

#### Funciones principales:

##### `calculateDataCompleteness(hotel)`
Calcula qué tan completos están los datos de un hotel (0-100%).

Ponderación de campos:
- `name`: 15%
- `city`: 15%
- `location`: 10%
- `price`: 10%
- `rating`: 10%
- `starRating`: 10%
- `description`: 15%
- `facilities`: 10%
- `imageUrl`: 5%

**Total: 100%**

##### `saveHotel(hotel)`
Guarda o actualiza un hotel en la base de datos.

Lógica:
1. Busca si el hotel ya existe por `external_id` + `provider`
2. Si existe:
   - Calcula completitud de datos nuevos
   - Si los nuevos datos son más completos, actualiza
   - Si no, mantiene los datos existentes
3. Si no existe:
   - Crea nuevo registro
   - Marca para revisión si completitud < 70%

##### `saveHotelsFromSearch(hotels[])`
Guarda múltiples hoteles de una búsqueda.

Retorna un resumen:
```typescript
{
  total: number,
  saved: number,      // Nuevos registros
  updated: number,    // Registros actualizados
  skipped: number,    // No actualizados (datos existentes mejores)
  errors: number      // Errores al guardar
}
```

##### `getHotelsNeedingReview(limit)`
Obtiene hoteles que necesitan revisión manual, ordenados por:
1. Completitud de datos (menor a mayor)
2. Fecha de creación (más recientes primero)

##### `markAsReviewed(hotelId)`
Marca un hotel como revisado (`needs_review = false`).

---

## 🗄️ Cambios en Base de Datos

### Nuevos campos en tabla `hotels`:

```sql
provider VARCHAR(50)           -- Proveedor: 'amadeus', 'booking', 'expedia', 'manual'
external_id VARCHAR(255)       -- ID del hotel en el sistema externo
data_completeness INTEGER      -- Porcentaje de completitud (0-100)
needs_review BOOLEAN           -- Indica si necesita revisión manual
star_rating INTEGER            -- Categoría en estrellas (1-5)
review_count INTEGER           -- Número de reseñas
currency VARCHAR(3)            -- Moneda del precio (ISO 4217)
```

### Índices:

```sql
-- Índice único para evitar duplicados
CREATE UNIQUE INDEX idx_hotels_external_provider
ON hotels(external_id, provider)
WHERE external_id IS NOT NULL;

-- Índice para búsqueda de hoteles que necesitan revisión
CREATE INDEX idx_hotels_needs_review
ON hotels(needs_review, data_completeness)
WHERE needs_review = true;
```

---

## 🔌 Integración en Adaptadores

### BookingAdapter

```typescript
// En el método search()
const normalizedResults = this.normalizeHotelResults(response.hotels || [], {})

// Auto-guardar hoteles (sin bloquear la respuesta)
this.autoSaveHotels(normalizedResults).catch(error => {
  console.error('Error auto-saving hotels from Booking.com:', error)
})

return normalizedResults
```

### ExpediaAdapter

```typescript
// En el método searchHotels()
const normalizedResults = this.normalizeHotelResults(response.data || [])

// Auto-guardar hoteles (sin bloquear la respuesta)
this.autoSaveHotels(normalizedResults).catch(error => {
  console.error('Error auto-saving hotels from Expedia:', error)
})

return normalizedResults
```

---

## 📡 Endpoint de Revisión

### `GET /api/hotels/review`

Obtiene hoteles que necesitan revisión manual.

**Query params:**
- `limit`: Número máximo de hoteles (default: 50)

**Respuesta:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Hotel Example",
      "city": "Cancún",
      "provider": "booking",
      "data_completeness": 45,
      "created_at": "2025-12-12T10:30:00Z"
    }
  ],
  "total": 10
}
```

### `PATCH /api/hotels/review`

Actualiza un hotel y marca como revisado.

**Body:**
```json
{
  "hotelId": 1,
  "updates": {
    "description": "Nueva descripción completa",
    "image_url": "https://...",
    "amenities": ["WiFi", "Pool", "Restaurant"]
  }
}
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Hotel marked as reviewed"
}
```

---

## 🎯 Flujo de Trabajo

### 1. **Búsqueda de Hoteles**
```
Usuario busca → API externa → Resultados → Auto-guardado en BD
                                         ↓
                                   (Sin bloquear respuesta)
```

### 2. **Guardado Inteligente**
```
¿Hotel existe?
├─ NO → Crear nuevo registro
│       ├─ Completitud ≥ 70% → needs_review = false
│       └─ Completitud < 70% → needs_review = true
│
└─ SÍ → ¿Nuevos datos más completos?
        ├─ SÍ → Actualizar registro
        └─ NO → Mantener datos existentes
```

### 3. **Revisión Manual** (Próxima funcionalidad)
```
Admin accede → /api/hotels/review → Lista de hoteles
                                    ↓
                              Completa datos faltantes
                                    ↓
                              PATCH /api/hotels/review
                                    ↓
                              needs_review = false
```

---

## 📊 Métricas y Logs

El sistema genera logs informativos:

```
📊 Hotel auto-save summary:
   Total: 20
   ✅ Saved: 15
   🔄 Updated: 3
   ⏭️  Skipped: 2
   ❌ Errors: 0

📊 Booking.com auto-save: 15 nuevos, 3 actualizados
📊 Expedia auto-save: 8 nuevos, 5 actualizados
```

---

## 🚀 Próximas Mejoras

### Panel de Administración
- [ ] Interfaz visual para revisar hoteles
- [ ] Búsqueda de imágenes automática (Unsplash, Pexels)
- [ ] IA para generar descripciones atractivas
- [ ] Sugerencias de amenidades basadas en categoría
- [ ] Bulk editing para múltiples hoteles

### Inteligencia Artificial
- [ ] Traducción automática de descripciones
- [ ] Clasificación automática de amenidades
- [ ] Detección de duplicados (fuzzy matching)
- [ ] Sugerencias de precios competitivos

### Optimizaciones
- [ ] Queue system para procesamiento asíncrono
- [ ] Webhooks para actualizaciones en tiempo real
- [ ] Caché de resultados frecuentes
- [ ] Compresión de imágenes automática

---

## 🔐 Consideraciones de Seguridad

1. **Rate Limiting**: Los adaptadores ya implementan control de tasa
2. **Validación**: Todos los datos se validan antes de guardar
3. **SQL Injection**: Uso de queries parametrizadas
4. **Datos Sensibles**: No se guardan datos de pago o personales

---

## 💡 Casos de Uso

### Caso 1: Hotel Nuevo
```typescript
// Primera búsqueda en Cancún
Booking.com devuelve 20 hoteles
→ 20 hoteles nuevos guardados en BD
→ Completitud promedio: 65%
→ 12 marcados para revisión (< 70%)
```

### Caso 2: Actualización
```typescript
// Segunda búsqueda del mismo destino
Expedia devuelve 15 hoteles
→ 10 ya existen en BD
→ 5 tienen datos más completos
→ 5 actualizados
→ 5 nuevos guardados
```

### Caso 3: Mantenimiento de Calidad
```typescript
// Admin revisa hoteles
GET /api/hotels/review?limit=20
→ Lista de 12 hoteles con completitud < 70%
→ Admin completa descripciones e imágenes
→ PATCH /api/hotels/review
→ needs_review = false
→ data_completeness aumenta a 95%
```

---

## ✅ Estado Actual

- ✅ Servicio HotelAutoSaveService implementado
- ✅ Migración de BD creada
- ✅ Integración en BookingAdapter
- ✅ Integración en ExpediaAdapter
- ✅ Endpoint de revisión creado
- ⏳ Panel de administración (pendiente)
- ⏳ Proceso automatizado de completado (pendiente)

---

**Autor:** AS Operadora Dev Team
**Fecha:** 12 de Diciembre de 2025
**Versión:** 1.0
