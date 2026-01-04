# 🚀 HANDOFF: IMPLEMENTACIÓN COMPLETA AMADEUS (3 FASES)

**Fecha:** 21 Diciembre 2025 - 03:00 CST
**Versión actual:** v2.146
**Para:** Próximo agente SAME
**Objetivo:** Implementación COMPLETA - Backend + APIs + Frontend

---

## 📚 PASO 0: LEER DOCUMENTACIÓN (PRIMERO)

**En orden obligatorio:**

1. `operadora-dev/.same/CONTEXTO-NUEVA-SESION.md` - Contexto general
2. `operadora-dev/.same/SISTEMA-DOCUMENTACION.md` - Reglas de comunicación
3. `operadora-dev/.same/AMADEUS-INTEGRATION-COMPLETE.md` - Documentación técnica Amadeus
4. Este archivo - Plan de 3 fases

---

## 🎯 RESUMEN: 3 FASES A IMPLEMENTAR

| Fase | Versión | Tarea | Tiempo Estimado |
|------|---------|-------|-----------------|
| **1** | v2.147 | Backend - SearchService integrado | 30-45 min |
| **2** | v2.148 | APIs REST - Nuevos endpoints | 20-30 min |
| **3** | v2.149 | Frontend - Tabs y resultados | 45-60 min |

**TOTAL:** ~2 horas

---

## 📦 ESTADO ACTUAL (v2.146)

### ✅ Ya creado (NO modificar):
- `AmadeusAdapter.ts` - Vuelos
- `AmadeusHotelAdapter.ts` - Hoteles (150K+ con fotos)
- `AmadeusTransferAdapter.ts` - Transfers
- `AmadeusActivitiesAdapter.ts` - Actividades (300K+)

### ⏳ Pendiente (TU TRABAJO):
- Integrar en SearchService
- Crear APIs REST
- Implementar frontend

---

# 🔵 FASE 1: BACKEND - SearchService

**Objetivo:** Amadeus como proveedor principal
**Versión:** v2.147
**Archivo:** `operadora-dev/src/services/SearchService.ts`

## Cambios necesarios:

### 1. Importar adapters
```typescript
import AmadeusHotelAdapter from './providers/AmadeusHotelAdapter'
import AmadeusTransferAdapter from './providers/AmadeusTransferAdapter'
import AmadeusActivitiesAdapter from './providers/AmadeusActivitiesAdapter'
```

### 2. Inicializar adapters
```typescript
const amadeusHotel = new AmadeusHotelAdapter(
  process.env.AMADEUS_API_KEY!,
  process.env.AMADEUS_API_SECRET!,
  process.env.AMADEUS_ENVIRONMENT === 'test'
)
// Repetir para Transfer y Activities
```

### 3. Modificar searchHotels()
**ESTRATEGIA:** Amadeus principal + Booking.com complementario

```typescript
async searchHotels(params) {
  // 1. Amadeus primero
  const amadeusResults = await amadeusHotel.search({...})

  // 2. Si < 10, complementar con Booking
  if (amadeusResults.length < 10) {
    const bookingResults = await bookingAdapter.search({...})
    return mergeAndDeduplicate(amadeusResults, bookingResults)
  }

  return amadeusResults.sort((a,b) => a.price - b.price)
}
```

### 4. Agregar nuevos métodos
```typescript
async searchTransfers(params) { ... }
async searchActivities(params) { ... }
private mergeAndDeduplicateHotels(arr1, arr2) { ... }
private getCityCode(cityName) { ... }
```

**Ver detalles completos en:** `AMADEUS-INTEGRATION-COMPLETE.md` sección "Próximos Pasos"

---

# 🟢 FASE 2: APIs REST

**Objetivo:** Nuevos endpoints funcionales
**Versión:** v2.148

## Crear 2 nuevos archivos:

### Archivo 1: Transfers API
**Path:** `operadora-dev/src/app/api/search/transfers/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { SearchService } from '@/services/SearchService'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const params = {
    startLocationCode: searchParams.get('startLocationCode')!,
    endLocationCode: searchParams.get('endLocationCode')!,
    transferDate: searchParams.get('transferDate')!,
    transferTime: searchParams.get('transferTime')!,
    passengers: parseInt(searchParams.get('passengers') || '1')
  }

  const searchService = new SearchService()
  const results = await searchService.searchTransfers(params)

  return NextResponse.json({
    success: true,
    data: results,
    count: results.length
  })
}
```

### Archivo 2: Activities API
**Path:** `operadora-dev/src/app/api/search/activities/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { SearchService } from '@/services/SearchService'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const latitude = parseFloat(searchParams.get('latitude')!)
  const longitude = parseFloat(searchParams.get('longitude')!)
  const radius = parseInt(searchParams.get('radius') || '20')

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
}
```

### Testing de APIs
```bash
# Transfers
curl "http://localhost:3000/api/search/transfers?startLocationCode=CDG&endLocationCode=FRPAR21&transferDate=2025-12-25&transferTime=10:00:00&passengers=2"

# Activities
curl "http://localhost:3000/api/search/activities?latitude=48.856614&longitude=2.352222&radius=20"
```

---

# 🟡 FASE 3: FRONTEND

**Objetivo:** UI completa para transfers y actividades
**Versión:** v2.149

## 3.1. Actualizar Tab "Autos" en Homepage

**Archivo:** `operadora-dev/src/app/page.tsx`

**Buscar:** `<TabsContent value="cars">`

**Reemplazar con:**
```typescript
<TabsContent value="cars" className="mt-6">
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {/* Origen */}
      <div className="md:col-span-1">
        <label className="block text-sm font-medium mb-2 text-gray-900">Desde</label>
        <Input
          placeholder="Aeropuerto/Dirección"
          value={transferOrigin}
          onChange={(e) => setTransferOrigin(e.target.value)}
          className="h-12 bg-white"
        />
      </div>

      {/* Destino */}
      <div className="md:col-span-1">
        <label className="block text-sm font-medium mb-2 text-gray-900">Hasta</label>
        <Input
          placeholder="Hotel/Dirección"
          value={transferDestination}
          onChange={(e) => setTransferDestination(e.target.value)}
          className="h-12 bg-white"
        />
      </div>

      {/* Fecha y Hora */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-2 text-gray-900">Fecha y Hora</label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={transferDate}
            onChange={(e) => setTransferDate(e.target.value)}
            className="h-12 bg-white"
          />
          <Input
            type="time"
            value={transferTime}
            onChange={(e) => setTransferTime(e.target.value)}
            className="h-12 bg-white"
          />
        </div>
      </div>

      {/* Botón Buscar */}
      <div className="md:col-span-1 flex items-end">
        <Button
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500"
          onClick={handleSearchTransfers}
          disabled={loading}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>
    </div>

    <div className="flex items-center gap-2 text-sm text-gray-900">
      <label>Pasajeros:</label>
      <input
        type="number"
        min="1"
        max="8"
        value={transferPassengers}
        onChange={(e) => setTransferPassengers(parseInt(e.target.value))}
        className="w-16 px-2 py-1 border rounded bg-white"
      />
    </div>
  </div>
</TabsContent>
```

**Agregar estados al inicio del componente:**
```typescript
const [transferOrigin, setTransferOrigin] = useState("")
const [transferDestination, setTransferDestination] = useState("")
const [transferDate, setTransferDate] = useState("")
const [transferTime, setTransferTime] = useState("10:00")
const [transferPassengers, setTransferPassengers] = useState(2)
```

**Agregar handler:**
```typescript
const handleSearchTransfers = async () => {
  if (!transferOrigin || !transferDestination || !transferDate) {
    alert('Completa todos los campos')
    return
  }

  router.push(`/resultados?type=transfer&from=${transferOrigin}&to=${transferDestination}&date=${transferDate}&time=${transferTime}&passengers=${transferPassengers}`)
}
```

## 3.2. Actualizar Tab "Cosas que hacer"

**Buscar:** `<TabsContent value="things">`

**Reemplazar con:**
```typescript
<TabsContent value="things" className="mt-6">
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {/* Ciudad */}
      <div className="md:col-span-2">
        <label className="block text-sm font-medium mb-2 text-gray-900">¿Dónde?</label>
        <Input
          placeholder="Ciudad o destino"
          value={activityCity}
          onChange={(e) => setActivityCity(e.target.value)}
          className="h-12 bg-white"
        />
      </div>

      {/* Radio de búsqueda */}
      <div className="md:col-span-1">
        <label className="block text-sm font-medium mb-2 text-gray-900">Radio (km)</label>
        <select
          value={activityRadius}
          onChange={(e) => setActivityRadius(parseInt(e.target.value))}
          className="w-full h-12 px-3 border rounded bg-white"
        >
          <option value="5">5 km</option>
          <option value="10">10 km</option>
          <option value="20">20 km</option>
          <option value="50">50 km</option>
        </select>
      </div>

      {/* Botón Buscar */}
      <div className="md:col-span-1 flex items-end">
        <Button
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-500"
          onClick={handleSearchActivities}
          disabled={loading}
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
      </div>
    </div>
  </div>
</TabsContent>
```

**Agregar estados:**
```typescript
const [activityCity, setActivityCity] = useState("")
const [activityRadius, setActivityRadius] = useState(20)
```

**Agregar handler:**
```typescript
const handleSearchActivities = async () => {
  if (!activityCity) {
    alert('Ingresa una ciudad')
    return
  }

  router.push(`/resultados?type=activity&city=${activityCity}&radius=${activityRadius}`)
}
```

## 3.3. Crear Página de Resultados - Transfers

**Archivo:** `operadora-dev/src/app/resultados/transfers/page.tsx`

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TransferResultsPage() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      const from = searchParams.get('from')
      const to = searchParams.get('to')
      const date = searchParams.get('date')
      const time = searchParams.get('time')
      const passengers = searchParams.get('passengers')

      const response = await fetch(
        `/api/search/transfers?startLocationCode=${from}&endLocationCode=${to}&transferDate=${date}&transferTime=${time}&passengers=${passengers}`
      )

      const data = await response.json()
      setResults(data.data || [])
      setLoading(false)
    }

    fetchResults()
  }, [searchParams])

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Resultados de Transfers</h1>

      <div className="grid gap-4">
        {results.map((transfer: any) => (
          <Card key={transfer.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{transfer.details.vehicle.description}</h3>
                <p className="text-sm text-gray-600">
                  {transfer.details.vehicle.seats} asientos • {transfer.details.vehicle.luggage} maletas
                </p>
                <p className="text-sm mt-2">{transfer.details.serviceProvider.name}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">
                  ${transfer.price.toLocaleString()} {transfer.currency}
                </p>
                <Button className="mt-4">Reservar</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

## 3.4. Crear Página de Resultados - Actividades

**Archivo:** `operadora-dev/src/app/resultados/activities/page.tsx`

```typescript
'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'

export default function ActivitiesResultsPage() {
  const searchParams = useSearchParams()
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchResults() {
      // Aquí necesitarías geocoding para convertir ciudad a lat/long
      // Por ahora usamos coordenadas de ejemplo
      const response = await fetch(
        `/api/search/activities?latitude=48.856614&longitude=2.352222&radius=${searchParams.get('radius') || 20}`
      )

      const data = await response.json()
      setResults(data.data || [])
      setLoading(false)
    }

    fetchResults()
  }, [searchParams])

  if (loading) return <div className="p-8">Cargando...</div>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Tours y Actividades</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {results.map((activity: any) => (
          <Card key={activity.id} className="overflow-hidden">
            {activity.details.pictures[0] && (
              <img
                src={activity.details.pictures[0]}
                alt={activity.details.name}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{activity.details.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {activity.details.shortDescription}
              </p>
              {activity.details.rating && (
                <div className="flex items-center gap-1 mb-4">
                  <span className="text-yellow-500">★</span>
                  <span>{activity.details.rating}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-blue-600">
                  ${activity.price} {activity.currency}
                </p>
                <Button
                  onClick={() => window.open(activity.details.bookingLink, '_blank')}
                  className="flex items-center gap-2"
                >
                  Reservar <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

# ✅ CHECKLIST COMPLETO

## Fase 1 - Backend
- [ ] SearchService.ts modificado
- [ ] Métodos searchTransfers() y searchActivities() agregados
- [ ] Hoteles usando Amadeus como principal
- [ ] Merge y deduplicación implementado
- [ ] Testing manual exitoso
- [ ] Versión v2.147 creada

## Fase 2 - APIs
- [ ] API /api/search/transfers creada
- [ ] API /api/search/activities creada
- [ ] Testing con curl exitoso
- [ ] Errores manejados correctamente
- [ ] Versión v2.148 creada

## Fase 3 - Frontend
- [ ] Tab "Autos" implementado
- [ ] Tab "Cosas que hacer" implementado
- [ ] Página /resultados/transfers creada
- [ ] Página /resultados/activities creada
- [ ] UI responsive
- [ ] Versión v2.149 creada

## Final
- [ ] Linter sin errores
- [ ] Todos.md actualizado
- [ ] 3 commits con mensajes descriptivos
- [ ] Push a GitHub exitoso
- [ ] Deploy en Vercel verificado

---

# 🚨 NOTAS IMPORTANTES

### Variables de Entorno Requeridas
```bash
AMADEUS_API_KEY=tu-api-key
AMADEUS_API_SECRET=tu-api-secret
AMADEUS_ENVIRONMENT=test
```

### Rate Limits
- Amadeus: 10 req/s por API
- Implementar throttling si necesario

### Manejo de Errores
```typescript
try {
  const results = await amadeusAdapter.search(params)
  return results
} catch (error) {
  console.error('Amadeus failed:', error)
  return await backupProvider.search(params) // Fallback
}
}
```

### Geocoding para Actividades
Las actividades requieren lat/long. Opciones:
1. Mapeo manual de ciudades principales
2. Usar Google Geocoding API (requiere API key)
3. Usar servicio gratuito como Nominatim

---

# 📦 ENTREGABLES FINALES

Al completar las 3 fases tendrás:

1. ✅ Backend completamente integrado (v2.147)
2. ✅ 2 nuevas APIs REST funcionales (v2.148)
3. ✅ Frontend completo con tabs y resultados (v2.149)
4. ✅ Hoteles usando Amadeus como principal
5. ✅ Transfers funcionales
6. ✅ Actividades con deep links a Viator/GetYourGuide
7. ✅ Documentación actualizada
8. ✅ Todo en producción en app.asoperadora.com

---

**Creado:** 21 Dic 2025 - 03:00 CST
**Por:** AI Assistant
**Versión actual:** v2.146
**Versión final esperada:** v2.149

🚀 **¡Éxito con la implementación!**
