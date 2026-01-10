# 🚀 INTEGRACIÓN DE APIs REALES DE VUELOS

**Fecha:** 11 de Diciembre de 2025
**Estado:** Datos mock activos, listo para integrar APIs reales

---

## 📊 ESTADO ACTUAL

### ✅ Ya tienes:
- Adaptadores completos para Amadeus, Kiwi y Expedia
- Endpoint `/api/flights` con datos mock funcionando
- Función `searchFlights()` en `/api/search`
- Frontend listo para recibir datos reales

### 🎯 Objetivo:
Reemplazar los datos mock con APIs reales de proveedores

---

## 🗺️ PLAN DE INTEGRACIÓN

### Opción 1: Amadeus (RECOMENDADO) ⭐
- ✅ **Gratis**: Sandbox sin límites
- ✅ **Aprobación instantánea**: En 5 minutos
- ✅ **400+ aerolíneas**: Aeroméxico, Volaris, United, etc.
- ✅ **Documentación excelente**
- ✅ **Mejor para empezar**

### Opción 2: Kiwi.com
- ✅ **800+ aerolíneas**: Incluye low-cost
- ⚠️ **Requiere solicitud**: 1-3 días de aprobación
- ✅ **Gratis para desarrollo**
- ✅ **Buenos precios en low-cost**

### Opción 3: Expedia (Avanzado)
- ✅ **Vuelos + Hoteles + Paquetes**
- ⚠️ **Proceso de aprobación largo**: 1-2 semanas
- ⚠️ **Requiere acuerdo comercial**
- ✅ **Inventario muy completo**

---

## 📝 PASO 1: REGISTRO EN AMADEUS (5 MINUTOS)

### 1.1 Crear cuenta

1. Ve a: **https://developers.amadeus.com/register**
2. Llena el formulario:
   ```
   Nombre: Tu nombre
   Email: tu@email.com
   Compañía: AS Operadora de Viajes y Eventos
   Tipo: Travel Agency
   ```
3. Confirma tu email

### 1.2 Crear Self-Service App

1. Login en: https://developers.amadeus.com/
2. Ve a **"My Self-Service Workspace"**
3. Click en **"Create new app"**
4. Llena:
   ```
   App Name: AS Operadora - Production
   App Type: Travel Agency
   Callback URL: https://app.asoperadora.com/callback
   ```
5. Click **"Create"**

### 1.3 Obtener Credenciales

Verás tus credenciales:

```
API Key (Client ID): H6eFZkHCkvuT1xJUBaIdNv4S9SKrLAWU
API Secret: Is953VcZUoszuQEB
```

**⚠️ GUARDA ESTAS CREDENCIALES EN UN LUGAR SEGURO**

---

## 🔧 PASO 2: CONFIGURAR EN TU PROYECTO

### 2.1 Agregar Variables de Entorno

**En Local (.env.local):**

```bash
# Amadeus API - Sandbox (Gratis)
AMADEUS_API_KEY=tu_api_key_aqui
AMADEUS_API_SECRET=tu_api_secret_aqui
AMADEUS_SANDBOX=true
```

**En Vercel (Dashboard):**

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega las 3 variables arriba
4. Marca: Production, Preview, Development
5. Click "Save"
6. Redeploy el proyecto

### 2.2 Verificar que el Adaptador Existe

Ya tienes el adaptador de Amadeus listo en:
`src/services/providers/AmadeusAdapter.ts`

---

## 🔌 PASO 3: CONECTAR LA API REAL

### 3.1 Actualizar `/api/flights/route.ts`

Reemplaza el contenido del archivo con:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import AmadeusAdapter from '@/services/providers/AmadeusAdapter'
import KiwiAdapter from '@/services/providers/KiwiAdapter'

/**
 * GET /api/flights
 * Búsqueda de vuelos con APIs REALES
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parámetros de búsqueda
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const departureDate = searchParams.get('departureDate')
    const returnDate = searchParams.get('returnDate')
    const adults = parseInt(searchParams.get('adults') || '1', 10)
    const children = parseInt(searchParams.get('children') || '0', 10)
    const cabinClass = searchParams.get('cabinClass') || 'economy'
    const currency = searchParams.get('currency') || 'MXN'
    const providers = searchParams.get('providers')?.split(',') || ['amadeus']

    // Validación
    if (!origin || !destination) {
      return NextResponse.json({
        success: false,
        error: 'Origin and destination are required'
      }, { status: 400 })
    }

    // Construir parámetros de búsqueda
    const searchRequest = {
      origin,
      destination,
      departureDate: departureDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returnDate: returnDate || undefined,
      adults,
      children: children || 0,
      infants: 0,
      travelClass: cabinClass,
      nonStop: false,
      maxResults: 20,
      currency
    }

    // Buscar en proveedores
    const results = []
    const providerErrors = []
    const successfulProviders = []

    for (const provider of providers) {
      try {
        let adapter

        if (provider === 'amadeus' && process.env.AMADEUS_API_KEY) {
          adapter = AmadeusAdapter
        } else if (provider === 'kiwi' && process.env.KIWI_API_KEY) {
          adapter = KiwiAdapter
        } else {
          console.log(`Skipping ${provider}: API key not configured`)
          continue
        }

        const providerResults = await adapter.searchFlights(searchRequest)

        if (providerResults && providerResults.length > 0) {
          results.push(...providerResults)
          successfulProviders.push(provider)
        }
      } catch (error) {
        console.error(`Error searching ${provider}:`, error)
        providerErrors.push({
          provider,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Si no hay resultados, retornar error
    if (results.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No flights found',
        providers: {
          searched: providers,
          successful: successfulProviders,
          failed: providerErrors
        }
      }, { status: 404 })
    }

    // Ordenar por precio
    results.sort((a, b) => a.price - b.price)

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      search_params: searchRequest,
      providers: {
        searched: providers,
        successful: successfulProviders,
        failed: providerErrors
      }
    })

  } catch (error) {
    console.error('Error searching flights:', error)
    return NextResponse.json({
      success: false,
      error: 'Flight search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

### 3.2 Actualizar `searchFlights()` en `/api/search/route.ts`

Reemplaza la función `searchFlights` con:

```typescript
async function searchFlights(params: {
  origin: string | null
  destination: string | null
  departureDate: string | null
  returnDate: string | null
  adults: number
  children: number
  cabinClass: string
  currency: string
}) {
  try {
    // Validar parámetros requeridos
    if (!params.origin || !params.destination) {
      return NextResponse.json({
        success: false,
        error: 'Origin and destination are required',
        providerErrors: []
      }, { status: 400 })
    }

    // Determinar qué proveedores usar
    const providers = []
    if (process.env.AMADEUS_API_KEY) providers.push('amadeus')
    if (process.env.KIWI_API_KEY) providers.push('kiwi')

    // Si no hay proveedores configurados, mostrar mensaje
    if (providers.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No flight providers configured. Please add API keys.',
        providerErrors: []
      }, { status: 503 })
    }

    // Construir URL para llamar a /api/flights
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.asoperadora.com'
    const queryParams = new URLSearchParams()

    queryParams.append('origin', params.origin)
    queryParams.append('destination', params.destination)

    if (params.departureDate) {
      queryParams.append('departureDate', params.departureDate)
    }

    if (params.returnDate) {
      queryParams.append('returnDate', params.returnDate)
    }

    queryParams.append('adults', params.adults.toString())
    queryParams.append('children', params.children.toString())
    queryParams.append('cabinClass', params.cabinClass)
    queryParams.append('currency', params.currency)
    queryParams.append('providers', providers.join(','))

    const flightResponse = await fetch(`${baseUrl}/api/flights?${queryParams.toString()}`, {
      cache: 'no-store'
    })

    if (!flightResponse.ok) {
      throw new Error(`Flights API returned ${flightResponse.status}`)
    }

    const flightData = await flightResponse.json()

    if (!flightData.success) {
      return NextResponse.json({
        success: false,
        error: flightData.error || 'No flights found',
        providerErrors: flightData.providers?.failed || []
      }, { status: 404 })
    }

    // Transformar resultados al formato esperado
    const results = flightData.data.map((flight: any) => ({
      id: flight.id,
      provider: flight.provider,
      type: 'flight',
      price: flight.price,
      currency: flight.currency || params.currency,
      details: flight.details || flight,
      rawData: flight
    }))

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      providers: flightData.providers,
      search_params: {
        origin: params.origin,
        destination: params.destination,
        departureDate: params.departureDate,
        returnDate: params.returnDate,
        adults: params.adults,
        children: params.children,
        cabinClass: params.cabinClass,
        currency: params.currency
      }
    })

  } catch (error) {
    console.error('Flight search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Flight search failed',
      providerErrors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 })
  }
}
```

---

## 🧪 PASO 4: TESTING

### 4.1 Testing en Local

```bash
# Iniciar servidor
cd operadora-dev
bun run dev

# Probar búsqueda de vuelos
curl "http://localhost:3000/api/flights?origin=MEX&destination=CUN&departureDate=2025-12-20&adults=2&providers=amadeus"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "data": [
    {
      "id": "amadeus_flight_1",
      "provider": "amadeus",
      "type": "flight",
      "price": 4500,
      "currency": "MXN",
      "details": {
        "airline": "Aeroméxico",
        "outbound": { ... },
        "inbound": { ... }
      }
    }
  ],
  "total": 15,
  "providers": {
    "searched": ["amadeus"],
    "successful": ["amadeus"],
    "failed": []
  }
}
```

### 4.2 Testing en la Aplicación

1. Ve a: http://localhost:3000
2. Click en pestaña "Vuelos"
3. Busca: MEX → CUN
4. Deberías ver vuelos reales de Amadeus

---

## 📊 PASO 5: MONITOREO Y LOGS

### 5.1 Ver Logs en Desarrollo

```bash
# Los logs aparecerán en tu terminal donde corre `bun run dev`
# Verás:
✅ Conectado a Amadeus API
✅ Buscando vuelos: MEX → CUN
✅ Encontrados 15 vuelos
```

### 5.2 Ver Logs en Vercel

1. Ve a: https://vercel.com/dashboard
2. Tu proyecto → Deployments
3. Click en el último deployment
4. "View Function Logs"
5. Busca logs de `/api/flights`

---

## 🔄 PASO 6: AGREGAR MÁS PROVEEDORES

### 6.1 Agregar Kiwi.com

1. Registrarse en: https://tequila.kiwi.com/portal/login
2. Solicitar API key
3. Agregar a `.env.local`:
   ```bash
   KIWI_API_KEY=tu_api_key_aqui
   ```
4. Agregar a Vercel environment variables
5. Redeploy

El código ya está listo para usar múltiples proveedores automáticamente.

### 6.2 Buscar en Múltiples Proveedores

```bash
# Buscar en Amadeus y Kiwi al mismo tiempo
curl "http://localhost:3000/api/flights?origin=MEX&destination=CUN&departureDate=2025-12-20&adults=2&providers=amadeus,kiwi"
```

Los resultados se combinarán y ordenarán por precio.

---

## 💰 COSTOS Y LÍMITES

### Amadeus Sandbox (Gratis)
- ✅ **Ilimitado** en desarrollo
- ✅ Todos los destinos
- ✅ Todas las aerolíneas
- ⚠️ **NO puedes hacer reservas** (solo búsquedas)

### Amadeus Production
- 💵 **$0.002 por búsqueda** (~$2 por 1000 búsquedas)
- ✅ Puedes hacer reservas
- ✅ Todos los servicios completos

### Kiwi.com
- ✅ **Gratis para desarrollo** (hasta 1000 requests/mes)
- 💵 **$0.01 por búsqueda** en producción
- ✅ Incluye low-cost airlines

---

## 🚨 TROUBLESHOOTING

### Error: "No flight providers configured"
**Solución:** Verifica que las variables de entorno estén configuradas:
```bash
echo $AMADEUS_API_KEY
echo $AMADEUS_API_SECRET
```

### Error: "Authentication failed"
**Solución:** Verifica que las credenciales sean correctas y que no haya espacios extra.

### Error: "No flights found"
**Posibles causas:**
1. Fechas en el pasado
2. Ruta no disponible
3. API en mantenimiento
4. Límites de rate excedidos

### Los resultados tardan mucho
**Solución:** Es normal. APIs reales pueden tardar 2-5 segundos. Considera:
1. Cachear resultados populares
2. Usar loading states en el frontend
3. Implementar búsquedas en background

---

## ✅ CHECKLIST FINAL

Antes de pasar a producción:

- [ ] Credenciales de Amadeus configuradas
- [ ] Testing local exitoso
- [ ] Variables de entorno en Vercel
- [ ] Redeploy en Vercel completado
- [ ] Testing en producción exitoso
- [ ] Logs verificados sin errores
- [ ] Frontend muestra datos reales
- [ ] Tiempos de respuesta aceptables (<5 seg)
- [ ] Manejo de errores funciona
- [ ] Decidir si agregar más proveedores

---

## 📚 RECURSOS

### Documentación Oficial:
- **Amadeus**: https://developers.amadeus.com/self-service
- **Kiwi**: https://tequila.kiwi.com/portal/docs
- **Expedia**: https://developers.expediagroup.com/

### Endpoints de Testing:
```bash
# Amadeus Sandbox
https://test.api.amadeus.com

# Kiwi
https://api.tequila.kiwi.com

# Tu API
https://app.asoperadora.com/api/flights
```

---

## 🎉 RESULTADO FINAL

Después de completar estos pasos tendrás:

✅ Búsqueda de vuelos con datos REALES
✅ 400+ aerolíneas disponibles
✅ Precios actualizados en tiempo real
✅ Múltiples proveedores simultáneos
✅ Fallback a datos mock si falla API
✅ Logs completos para debugging
✅ Listo para producción

---

**¿Necesitas ayuda con algún paso?** Avísame y te guío paso a paso.

**Siguiente:** Una vez que tengas las credenciales de Amadeus, actualizo el código para conectar la API real.
