# 🔄 HANDOFF: IMPLEMENTACIÓN FASE 1 AMADEUS

**Fecha:** 21 de Diciembre de 2025 - 02:45 CST
**Versión actual:** v2.146
**Para:** Próximo agente de SAME
**Tarea:** Integrar adapters Amadeus en SearchService

---

## 📋 CHECKLIST ANTES DE EMPEZAR

### 1️⃣ **LEER PRIMERO (En orden):**

```
1. operadora-dev/.same/CONTEXTO-NUEVA-SESION.md
   └─ Contexto general del proyecto, estado actual

2. operadora-dev/.same/SISTEMA-DOCUMENTACION.md
   └─ Reglas de documentación, estilo de comunicación

3. operadora-dev/.same/AMADEUS-INTEGRATION-COMPLETE.md
   └─ Documentación completa de adapters Amadeus

4. Este archivo (HANDOFF-FASE-1-AMADEUS.md)
   └─ Plan de implementación específico
```

### 2️⃣ **ARCHIVOS CLAVE A REVISAR:**

**Adapters Amadeus (YA CREADOS - NO MODIFICAR):**
```
✅ operadora-dev/src/services/providers/AmadeusAdapter.ts
   └─ Vuelos (ya funcional)

✅ operadora-dev/src/services/providers/AmadeusHotelAdapter.ts
   └─ Hoteles (150K+, fotos incluidas)

✅ operadora-dev/src/services/providers/AmadeusTransferAdapter.ts
   └─ Transfers/Autos (privados, compartidos, taxi)

✅ operadora-dev/src/services/providers/AmadeusActivitiesAdapter.ts
   └─ Tours y Actividades (300K+, deep links)
```

**Archivos a MODIFICAR:**
```
📝 operadora-dev/src/services/SearchService.ts
   └─ Integrar los nuevos adapters

📝 operadora-dev/src/app/api/search/route.ts
   └─ Agregar endpoints para transfers y activities

📝 operadora-dev/.env.example
   └─ Ya actualizado, verificar que esté correcto
```

### 3️⃣ **ESTADO ACTUAL:**

✅ **Completado en v2.146:**
- Adapters Amadeus creados (4 archivos)
- Documentación completa
- Variables de entorno documentadas
- Push a GitHub exitoso
- Deploy en Vercel

⏳ **Pendiente (TU TAREA):**
- Integrar adapters en SearchService
- Crear nuevas APIs REST
- Actualizar frontend (siguiente fase)

---

## 🎯 OBJETIVO DE ESTA SESIÓN

**Implementar Fase 1:** Integración Backend Completa

### Entregables:
1. `SearchService.ts` modificado con Amadeus integrado
2. Nuevas APIs REST para transfers y actividades
3. Testing de integración
4. Documentación actualizada
5. Commit y push a GitHub

---

## 📝 PLAN DE IMPLEMENTACIÓN DETALLADO

### **PASO 1: Modificar SearchService.ts**

**Archivo:** `operadora-dev/src/services/SearchService.ts`

**Cambios necesarios:**

#### A. Importar nuevos adapters

```typescript
// Agregar al inicio del archivo
import AmadeusHotelAdapter from './providers/AmadeusHotelAdapter'
import AmadeusTransferAdapter from './providers/AmadeusTransferAdapter'
import AmadeusActivitiesAdapter from './providers/AmadeusActivitiesAdapter'
```

#### B. Inicializar adapters en constructor o función

```typescript
// Crear instancias de adapters
const amadeusHotel = new AmadeusHotelAdapter(
  process.env.AMADEUS_API_KEY!,
  process.env.AMADEUS_API_SECRET!,
  process.env.AMADEUS_ENVIRONMENT === 'test'
)

const amadeusTransfer = new AmadeusTransferAdapter(
  process.env.AMADEUS_API_KEY!,
  process.env.AMADEUS_API_SECRET!,
  process.env.AMADEUS_ENVIRONMENT === 'test'
)

const amadeusActivities = new AmadeusActivitiesAdapter(
  process.env.AMADEUS_API_KEY!,
  process.env.AMADEUS_API_SECRET!,
  process.env.AMADEUS_ENVIRONMENT === 'test'
)
```

#### C. Modificar método searchHotels()

**ESTRATEGIA: Amadeus PRINCIPAL, Booking.com complementario**

```typescript
async searchHotels(params: {
  city: string
  cityCode?: string
  checkIn: string
  checkOut: string
  adults: number
  children?: number
  rooms?: number
  currency?: string
}): Promise<SearchResult[]> {
  try {
    console.log('🔍 Searching hotels - Amadeus PRIMARY')

    // 1. Buscar primero en Amadeus
    const amadeusResults = await amadeusHotel.search({
      cityCode: params.cityCode || await this.getCityCode(params.city),
      checkInDate: params.checkIn,
      checkOutDate: params.checkOut,
      adults: params.adults,
      children: params.children,
      rooms: params.rooms,
      currency: params.currency || 'MXN'
    })

    console.log(`✅ Amadeus returned ${amadeusResults.length} hotels`)

    // 2. Si menos de 10 resultados, complementar con Booking.com
    let finalResults = amadeusResults

    if (amadeusResults.length < 10) {
      console.log('⚠️ Less than 10 results, complementing with Booking.com')

      const bookingResults = await bookingAdapter.search({
        city: params.city,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        adults: params.adults,
        children: params.children,
        rooms: params.rooms
      })

      // Combinar y deduplicate
      finalResults = this.mergeAndDeduplicateHotels(
        amadeusResults,
        bookingResults
      )
    }

    // 3. Ordenar por precio
    finalResults.sort((a, b) => a.price - b.price)

    return finalResults

  } catch (error) {
    console.error('Error searching hotels:', error)

    // Fallback a Booking.com si Amadeus falla
    console.log('⚠️ Amadeus failed, using Booking.com fallback')
    return await bookingAdapter.search(params)
  }
}
```

#### D. Agregar método mergeAndDeduplicateHotels()

```typescript
private mergeAndDeduplicateHotels(
  amadeusResults: SearchResult[],
  bookingResults: SearchResult[]
): SearchResult[] {
  const merged = [...amadeusResults]
  const amadeusHotelIds = new Set(
    amadeusResults.map(r => r.details.hotelName.toLowerCase())
  )

  for (const bookingHotel of bookingResults) {
    const hotelName = bookingHotel.details.hotelName.toLowerCase()
    if (!amadeusHotelIds.has(hotelName)) {
      merged.push(bookingHotel)
    }
  }

  return merged
}
```

#### E. Agregar método getCityCode()

```typescript
private async getCityCode(cityName: string): Promise<string> {
  // Mapeo básico de ciudades a códigos IATA
  const cityMapping: Record<string, string> = {
    'cancun': 'CUN',
    'ciudad de mexico': 'MEX',
    'guadalajara': 'GDL',
    'monterrey': 'MTY',
    'playa del carmen': 'PCM',
    'los cabos': 'SJD',
    'puerto vallarta': 'PVR',
    'miami': 'MIA',
    'nueva york': 'NYC',
    'madrid': 'MAD',
    'barcelona': 'BCN',
    'paris': 'PAR',
    'londres': 'LON'
  }

  const normalized = cityName.toLowerCase().trim()
  return cityMapping[normalized] || 'MEX' // Default a México
}
```

#### F. Agregar método searchTransfers()

```typescript
async searchTransfers(params: {
  startLocationCode: string
  endLocationCode: string
  transferDate: string
  transferTime: string
  passengers: number
  transferType?: string
}): Promise<SearchResult[]> {
  try {
    console.log('🔍 Searching transfers with Amadeus')

    const results = await amadeusTransfer.search(params)

    console.log(`✅ Found ${results.length} transfer options`)

    return results

  } catch (error) {
    console.error('Error searching transfers:', error)
    throw error
  }
}
```

#### G. Agregar método searchActivities()

```typescript
async searchActivities(params: {
  latitude: number
  longitude: number
  radius?: number
}): Promise<SearchResult[]> {
  try {
    console.log('🔍 Searching activities with Amadeus')

    const results = await amadeusActivities.search(params)

    console.log(`✅ Found ${results.length} activities`)

    return results

  } catch (error) {
    console.error('Error searching activities:', error)
    throw error
  }
}
```

---

### **PASO 2: Crear API de Transfers**

**Archivo:** `operadora-dev/src/app/api/search/transfers/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { SearchService } from '@/services/SearchService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params = {
      startLocationCode: searchParams.get('startLocationCode')!,
      endLocationCode: searchParams.get('endLocationCode')!,
      transferDate: searchParams.get('transferDate')!,
      transferTime: searchParams.get('transferTime')!,
      passengers: parseInt(searchParams.get('passengers') || '1'),
      transferType: searchParams.get('transferType') || undefined
    }

    // Validar parámetros requeridos
    if (!params.startLocationCode || !params.endLocationCode ||
        !params.transferDate || !params.transferTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const searchService = new SearchService()
    const results = await searchService.searchTransfers(params)

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    })

  } catch (error: any) {
    console.error('[TRANSFERS SEARCH] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
```

---

### **PASO 3: Crear API de Activities**

**Archivo:** `operadora-dev/src/app/api/search/activities/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { SearchService } from '@/services/SearchService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const latitude = parseFloat(searchParams.get('latitude')!)
    const longitude = parseFloat(searchParams.get('longitude')!)
    const radius = searchParams.get('radius')
      ? parseInt(searchParams.get('radius')!)
      : 20

    // Validar parámetros
    if (isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { success: false, error: 'Invalid coordinates' },
        { status: 400 }
      )
    }

    const searchService = new SearchService()
    const results = await searchService.searchActivities({
      latitude,
      longitude,
      radius
    })

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length
    })

  } catch (error: any) {
    console.error('[ACTIVITIES SEARCH] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
```

---

### **PASO 4: Testing**

#### A. Verificar variables de entorno

```bash
# Verificar que existan en .env.local
echo $AMADEUS_API_KEY
echo $AMADEUS_API_SECRET
echo $AMADEUS_ENVIRONMENT
```

#### B. Test de hoteles

```bash
# Endpoint local
curl "http://localhost:3000/api/search?type=hotel&city=cancun&checkin=2025-12-25&checkout=2025-12-27&adults=2"
```

#### C. Test de transfers

```bash
curl "http://localhost:3000/api/search/transfers?startLocationCode=CDG&endLocationCode=FRPAR21&transferDate=2025-12-25&transferTime=10:00:00&passengers=2"
```

#### D. Test de actividades

```bash
curl "http://localhost:3000/api/search/activities?latitude=48.856614&longitude=2.352222&radius=20"
```

---

### **PASO 5: Verificar Linter**

```bash
cd operadora-dev
npm run lint
```

Corregir errores si hay.

---

### **PASO 6: Crear Versión**

Usar el tool `versioning`:

```
Version: 147
Title: "Fase 1 Amadeus - Integración Backend Completa"
Changelog:
- SearchService integrado con Amadeus como principal
- Hoteles: Amadeus primary, Booking.com complementario
- Nueva API /api/search/transfers
- Nueva API /api/search/activities
- Testing completo de integración
```

---

### **PASO 7: Actualizar Documentación**

**Archivo:** `operadora-dev/.same/todos.md`

Agregar nueva versión v2.147 con resumen de cambios.

---

### **PASO 8: Commit y Push**

```bash
git add -A
git commit -m "v2.147 - Fase 1 Amadeus: Integración Backend Completa

✅ SEARCHSERVICE INTEGRADO:
- Amadeus como proveedor principal de hoteles
- Booking.com como complementario
- Métodos searchTransfers() y searchActivities()
- Merge y deduplicación de resultados

✅ NUEVAS APIS REST:
- POST /api/search/transfers
- POST /api/search/activities

✅ TESTING:
- Probado con datos de sandbox
- Linter pasado sin errores

🎯 Próxima fase: Frontend (tabs y páginas de resultados)

🤖 Generated with [Same](https://same.new)
Co-Authored-By: Same <noreply@same.new>"

git push
```

---

## 🚨 NOTAS IMPORTANTES

### Variables de Entorno

**SI NO ESTÁN EN .env.local, AGREGAR:**
```bash
AMADEUS_API_KEY=your-key-here
AMADEUS_API_SECRET=your-secret-here
AMADEUS_ENVIRONMENT=test
```

**Obtener credenciales:**
1. Ir a https://developers.amadeus.com/register
2. Crear cuenta
3. Crear aplicación Self-Service
4. Copiar API Key y API Secret

### Rate Limits

Amadeus Self-Service: **10 requests/segundo** por API

Si hay muchas búsquedas concurrentes, implementar throttling.

### Manejo de Errores

**SIEMPRE usar try-catch con fallback:**
```typescript
try {
  const amadeusResults = await amadeusAdapter.search(params)
  return amadeusResults
} catch (error) {
  console.error('Amadeus failed:', error)
  // Fallback a otro proveedor
  return await backupAdapter.search(params)
}
```

---

## 📊 VERIFICACIÓN FINAL

### Checklist antes de commit:

- [ ] SearchService.ts modificado correctamente
- [ ] API /api/search/transfers creada
- [ ] API /api/search/activities creada
- [ ] Testing manual exitoso (3 endpoints)
- [ ] Linter sin errores
- [ ] Versión creada (v2.147)
- [ ] todos.md actualizado
- [ ] Commit con mensaje descriptivo
- [ ] Push a GitHub exitoso

---

## 🎯 ENTREGABLE ESPERADO

Al final de esta sesión debes tener:

1. ✅ Backend completamente integrado con Amadeus
2. ✅ 2 nuevas APIs REST funcionando
3. ✅ Hoteles usando Amadeus como principal
4. ✅ Testing exitoso
5. ✅ Documentación actualizada
6. ✅ Código en GitHub (v2.147)
7. ✅ Deploy automático en Vercel

---

## 📞 SI TIENES PROBLEMAS

### Error: "Amadeus auth failed"
- Verificar AMADEUS_API_KEY y AMADEUS_API_SECRET
- Verificar que AMADEUS_ENVIRONMENT sea 'test' o 'production'

### Error: "Module not found"
- Verificar imports de adapters
- Verificar rutas de archivos

### Error: "cityCode undefined"
- Agregar más ciudades al mapeo en getCityCode()
- O pedir al usuario que envíe cityCode directamente

### Error de TypeScript
- Verificar interfaces en BaseProviderAdapter.ts
- Agregar tipos faltantes

---

## 🚀 DESPUÉS DE COMPLETAR

**Notificar al usuario:**
```
✅ Fase 1 completada:
- Backend integrado con Amadeus
- Hoteles: Amadeus principal
- APIs de transfers y actividades creadas
- Testing exitoso
- v2.147 deployed

🎯 Listo para Fase 2 (Frontend)
```

---

**Documento creado:** 21 Dic 2025 - 02:45 CST
**Por:** AI Assistant
**Para:** Próximo agente SAME
**Versión actual:** v2.146
**Próxima versión esperada:** v2.147

---

## 🎓 RECURSOS ADICIONALES

**Documentación Oficial:**
- https://developers.amadeus.com/self-service/apis-docs
- https://github.com/amadeus4dev/amadeus-node

**Testing Sandbox:**
- https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/testing-with-sandbox

**Support:**
- Discord: https://discord.gg/cVrFBqx
- Stack Overflow: tag `amadeus`
