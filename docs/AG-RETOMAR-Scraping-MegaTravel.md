# 📋 PARA RETOMAR: Scraping Completo de MegaTravel

**Fecha de creación:** 31 Ene 2026 - 22:20 CST  
**Versión actual:** v2.261  
**Commit actual:** `5f340cc`  
**Estado:** Fase 1 completada, listo para Fase 2

---

## ✅ LO QUE YA ESTÁ HECHO (Fase 1)

### 1. Base de Datos Preparada

**4 nuevas tablas creadas y ejecutadas:**

✅ **`megatravel_itinerary`**
- Almacena itinerario día por día
- Campos: day_number, title, description, meals, hotel, city, activities, highlights
- Relación: 1 paquete → muchos días
- Archivo: `migrations/020_create_megatravel_itinerary.sql`

✅ **`megatravel_departures`**
- Almacena fechas de salida y disponibilidad
- Campos: departure_date, return_date, price_usd, availability, status, passengers
- Relación: 1 paquete → muchas fechas
- Archivo: `migrations/021_create_megatravel_departures.sql`

✅ **`megatravel_policies`**
- Almacena políticas y requisitos
- Campos: cancellation_policy, payment_policy, document_requirements, visa_requirements
- Relación: 1 paquete → 1 política
- Archivo: `migrations/022_create_megatravel_policies.sql`

✅ **`megatravel_additional_info`**
- Almacena información adicional
- Campos: important_notes, climate_info, local_currency, emergency_contacts
- Relación: 1 paquete → 1 info adicional
- Archivo: `migrations/023_create_megatravel_additional_info.sql`

### 2. Script de Migración
✅ Creado: `scripts/run-megatravel-migrations.js`
✅ Ejecutado exitosamente
✅ Verificado: 8 tablas MegaTravel en total

### 3. Documentación
✅ `docs/AG-Plan-Scraping-Completo-MegaTravel.md` - Plan detallado
✅ `docs/AG-Progreso-Scraping-MegaTravel.md` - Estado actual
✅ `docs/AG-Historico-Cambios.md` - Actualizado con v2.259, v2.260, v2.261
✅ `docs/AG-Contexto-Proyecto.md` - Actualizado a v2.261

---

## 🔄 LO QUE FALTA POR HACER (Fase 2 - Scraping)

### 1. Modificar `MegaTravelSyncService.ts`

**Ubicación:** `src/services/MegaTravelSyncService.ts`

**Funciones nuevas a agregar:**

#### A. `scrapeItinerary(tourUrl: string): Promise<ItineraryDay[]>`
**Qué hace:** Extrae el itinerario día por día de la página del tour

**Estrategia:**
1. Cargar la página con `cheerio`
2. Buscar sección de itinerario (posibles selectores):
   - `.itinerary`
   - `.day-by-day`
   - `#itinerario`
   - `.tour-itinerary`
3. Para cada día, extraer:
   - Número de día
   - Título (ej: "Día 1: Llegada a Estambul")
   - Descripción completa
   - Comidas incluidas (D/A/C)
   - Hotel de la noche
   - Ciudad
   - Actividades (lista)
4. Almacenar en `megatravel_itinerary`

**Ejemplo de datos esperados:**
```typescript
{
  day_number: 1,
  title: "Llegada a Estambul",
  description: "Llegada al aeropuerto de Estambul...",
  meals: "C", // Solo cena
  hotel: "Grand Harilton",
  city: "Estambul",
  activities: ["Traslado al hotel", "Cena de bienvenida"]
}
```

#### B. `scrapeDepartures(tourUrl: string): Promise<Departure[]>`
**Qué hace:** Extrae las fechas de salida disponibles

**Estrategia:**
1. Buscar sección de fechas (posibles selectores):
   - `.departures`
   - `.salidas`
   - `.fechas-disponibles`
   - `#calendario`
2. Para cada fecha, extraer:
   - Fecha de salida
   - Fecha de retorno
   - Precio (si varía del base)
   - Disponibilidad (disponible/limitado/agotado)
   - Estado (confirmada/por confirmar)
3. Almacenar en `megatravel_departures`

**Ejemplo de datos esperados:**
```typescript
{
  departure_date: "2026-03-15",
  return_date: "2026-03-27",
  price_usd: 1149.00,
  availability: "available",
  status: "confirmed"
}
```

#### C. `scrapePolicies(tourUrl: string): Promise<Policies>`
**Qué hace:** Extrae políticas y requisitos

**Estrategia:**
1. Buscar sección de políticas (posibles selectores):
   - `.policies`
   - `.politicas`
   - `.terminos`
   - `#condiciones`
2. Extraer:
   - Política de cancelación
   - Política de pagos
   - Requisitos de documentos
   - Requisitos de visa
3. Almacenar en `megatravel_policies`

**Ejemplo de datos esperados:**
```typescript
{
  cancellation_policy: "Cancelación gratuita hasta 30 días antes...",
  payment_policy: "30% al reservar, 70% 30 días antes...",
  document_requirements: ["Pasaporte vigente 6 meses", "Visa Schengen"],
  visa_requirements: ["Turquía: No requiere visa", "Dubái: Visa a la llegada"]
}
```

#### D. `scrapeAdditionalInfo(tourUrl: string): Promise<AdditionalInfo>`
**Qué hace:** Extrae información adicional útil

**Estrategia:**
1. Buscar secciones de información (posibles selectores):
   - `.important-notes`
   - `.recomendaciones`
   - `.que-llevar`
2. Extraer:
   - Notas importantes
   - Recomendaciones
   - Qué llevar
   - Información del clima
3. Almacenar en `megatravel_additional_info`

### 2. Modificar función principal `syncPackageComplete()`

**Actualizar para:**
1. Llamar a las 4 nuevas funciones de scraping
2. Almacenar datos en las nuevas tablas
3. Manejar errores (si una sección no existe, continuar)
4. Logging detallado

**Pseudocódigo:**
```typescript
async function syncPackageComplete(packageCode: string) {
  // 1. Scraping actual (ya existe)
  const packageData = await scrapePackageBasicInfo(url);
  
  // 2. NUEVO: Scraping de itinerario
  try {
    const itinerary = await scrapeItinerary(url);
    await saveItinerary(packageId, itinerary);
  } catch (error) {
    console.warn('No se pudo extraer itinerario:', error);
  }
  
  // 3. NUEVO: Scraping de fechas
  try {
    const departures = await scrapeDepartures(url);
    await saveDepartures(packageId, departures);
  } catch (error) {
    console.warn('No se pudo extraer fechas:', error);
  }
  
  // 4. NUEVO: Scraping de políticas
  try {
    const policies = await scrapePolicies(url);
    await savePolicies(packageId, policies);
  } catch (error) {
    console.warn('No se pudo extraer políticas:', error);
  }
  
  // 5. NUEVO: Scraping de info adicional
  try {
    const additionalInfo = await scrapeAdditionalInfo(url);
    await saveAdditionalInfo(packageId, additionalInfo);
  } catch (error) {
    console.warn('No se pudo extraer info adicional:', error);
  }
}
```

---

## 🔍 CÓMO IDENTIFICAR SELECTORES CSS

### Paso 1: Abrir un tour de ejemplo
URL: `https://www.megatravel.com.mx/viaje/mega-turquia-y-dubai-20043.html`

### Paso 2: Inspeccionar HTML
1. Click derecho → "Inspeccionar elemento"
2. Buscar la sección de itinerario
3. Identificar clases CSS o IDs
4. Anotar selectores

### Paso 3: Probar selectores en consola
```javascript
// En la consola del navegador
document.querySelectorAll('.itinerary .day')
```

### Paso 4: Implementar en código
```typescript
const $ = cheerio.load(html);
const days = $('.itinerary .day');
```

---

## 🧪 CÓMO PROBAR

### 1. Crear archivo de prueba
`scripts/test-scraping.ts`

```typescript
import { scrapeItinerary } from '../src/services/MegaTravelSyncService';

async function test() {
  const url = 'https://www.megatravel.com.mx/viaje/mega-turquia-y-dubai-20043.html';
  const itinerary = await scrapeItinerary(url);
  console.log('Itinerario extraído:', JSON.stringify(itinerary, null, 2));
}

test();
```

### 2. Ejecutar prueba
```bash
npx ts-node scripts/test-scraping.ts
```

### 3. Verificar resultados
- ¿Se extrajo el itinerario?
- ¿Los datos son correctos?
- ¿Falta algún campo?

---

## ⚠️ POSIBLES PROBLEMAS Y SOLUCIONES

### Problema 1: Selectores CSS no funcionan
**Solución:** Usar múltiples selectores alternativos
```typescript
const days = $('.itinerary .day') || $('.day-by-day .day') || $('[class*="day"]');
```

### Problema 2: Datos no están en HTML (JavaScript dinámico)
**Solución:** Usar `puppeteer` en lugar de `cheerio`
```typescript
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto(url);
const html = await page.content();
```

### Problema 3: MegaTravel cambia estructura
**Solución:** Tener datos de ejemplo como fallback
```typescript
if (!itinerary || itinerary.length === 0) {
  return SAMPLE_ITINERARY;
}
```

---

## 📅 CRONOGRAMA SUGERIDO

### Sesión 1 (2-3 horas)
- ✅ Analizar HTML de MegaTravel
- ✅ Implementar `scrapeItinerary()`
- ✅ Probar con 1 tour real
- ✅ Ajustar selectores

### Sesión 2 (2 horas)
- ✅ Implementar `scrapeDepartures()`
- ✅ Implementar `scrapePolicies()`
- ✅ Implementar `scrapeAdditionalInfo()`
- ✅ Probar con múltiples tours

### Sesión 3 (1-2 horas)
- ✅ Crear componentes de frontend
- ✅ Integrar con API
- ✅ Probar visualización

### Sesión 4 (1 hora)
- ✅ Sincronizar todos los tours
- ✅ Verificar datos
- ✅ Ajustes finales

---

## 📚 ARCHIVOS CLAVE PARA REVISAR

1. **`src/services/MegaTravelSyncService.ts`** (931 líneas)
   - Servicio actual de scraping
   - Aquí se agregarán las nuevas funciones

2. **`migrations/020-023_*.sql`**
   - Estructura de las nuevas tablas
   - Referencia para saber qué campos almacenar

3. **`docs/AG-Plan-Scraping-Completo-MegaTravel.md`**
   - Plan detallado completo
   - Estrategias y consideraciones

4. **`docs/AG-Explicacion-Datos-MegaTravel.md`**
   - Explicación de cómo funciona el sistema actual
   - Datos que tenemos vs datos que faltan

---

## 🚀 COMANDO PARA EMPEZAR

```bash
# 1. Abrir el servicio de scraping
code src/services/MegaTravelSyncService.ts

# 2. Abrir un tour de ejemplo en el navegador
# https://www.megatravel.com.mx/viaje/mega-turquia-y-dubai-20043.html

# 3. Inspeccionar HTML para identificar selectores

# 4. Empezar a implementar scrapeItinerary()
```

---

## 💡 TIPS IMPORTANTES

1. **Empezar con 1 tour:** No intentar todos a la vez
2. **Validar datos:** Verificar que los datos extraídos sean correctos
3. **Manejar errores:** Si una sección no existe, continuar
4. **Logging:** Agregar console.log para debugging
5. **Datos de ejemplo:** Tener fallback para la demo

---

**¡Listo para retomar! Todo está preparado para la Fase 2.** 🚀
