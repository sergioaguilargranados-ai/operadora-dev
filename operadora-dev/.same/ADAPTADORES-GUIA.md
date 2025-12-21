# 🔌 GUÍA DE ADAPTADORES DE PROVEEDORES - AS OPERADORA

## 📋 ÍNDICE

1. [Introducción](#introducción)
2. [Arquitectura de Adaptadores](#arquitectura)
3. [Amadeus Adapter](#amadeus)
4. [Kiwi Adapter](#kiwi)
5. [Booking Adapter](#booking)
6. [Cómo Usar](#uso)
7. [Variables de Entorno](#env)

---

## 🎯 INTRODUCCIÓN

Los adaptadores implementan el **Adapter Pattern** para normalizar las respuestas de diferentes proveedores de APIs a un formato estándar que nuestra aplicación puede consumir consistentemente.

### **Beneficios:**
- ✅ Fácil agregar nuevos proveedores
- ✅ Respuestas normalizadas
- ✅ Manejo de errores centralizado
- ✅ Retry automático
- ✅ Rate limiting

---

## 🏗️ ARQUITECTURA

```
Frontend Request
      ↓
API Route (/api/search)
      ↓
┌─────────────────────┐
│   SearchService     │
│   (cache + logic)   │
└─────────┬───────────┘
          │
    ┌─────┴─────┬─────────┐
    ↓           ↓         ↓
┌───────┐  ┌───────┐  ┌────────┐
│Amadeus│  │ Kiwi  │  │Booking │
│Adapter│  │Adapter│  │Adapter │
└───┬───┘  └───┬───┘  └────┬───┘
    ↓          ↓           ↓
  Amadeus   Kiwi.com   Booking.com
    API        API         API
```

### **BaseProviderAdapter**

Todos los adaptadores extienden de esta clase base que provee:

```typescript
interface ProviderAdapter {
  search(params: SearchParams): Promise<SearchResult[]>
  getDetails(id: string): Promise<any>
  createBooking(data: BookingData): Promise<BookingConfirmation>
  cancelBooking(bookingId: string, reason?: string): Promise<CancellationResult>
  checkAvailability?(id: string): Promise<boolean>
}
```

**Features incluidas:**
- 🔁 Retry logic (3 intentos)
- ⏱️ Timeout (30 segundos)
- 📝 Logging de errores
- ✅ Validación de parámetros
- 💰 Normalización de precios
- 📅 Normalización de fechas

---

## ✈️ AMADEUS ADAPTER

### **¿Qué es Amadeus?**
El GDS (Global Distribution System) más grande del mundo con acceso a 400+ aerolíneas.

### **Configuración:**

```typescript
import AmadeusAdapter from '@/services/providers/AmadeusAdapter'

const amadeus = new AmadeusAdapter(
  process.env.AMADEUS_API_KEY!,
  process.env.AMADEUS_API_SECRET!,
  process.env.AMADEUS_SANDBOX === 'true' // true para sandbox
)
```

### **Autenticación:**
- OAuth2 client credentials
- Token se cachea automáticamente
- Renovación automática antes de expirar

### **Búsqueda de Vuelos:**

```typescript
const flights = await amadeus.search({
  originLocationCode: 'MEX',
  destinationLocationCode: 'CUN',
  departureDate: '2024-12-01',
  returnDate: '2024-12-08',
  adults: 2,
  children: 1,
  travelClass: 'ECONOMY' // ECONOMY, BUSINESS, FIRST
})

// Resultado normalizado
flights.forEach(flight => {
  console.log(flight.id)
  console.log(flight.price) // número
  console.log(flight.currency) // 'MXN'
  console.log(flight.details.outbound.departureTime)
  console.log(flight.details.outbound.stops) // número de escalas
})
```

### **Verificar Disponibilidad:**

```typescript
const available = await amadeus.checkAvailability(offerId)
if (available) {
  // Proceder a reservar
}
```

### **Crear Reserva:**

```typescript
const booking = await amadeus.createBooking({
  offerId: 'FLIGHT_OFFER_ID',
  travelerInfo: [
    {
      id: '1',
      dateOfBirth: '1990-01-01',
      name: {
        firstName: 'JUAN',
        lastName: 'PEREZ'
      },
      gender: 'MALE',
      contact: {
        emailAddress: 'juan@example.com',
        phones: [{
          deviceType: 'MOBILE',
          countryCallingCode: '52',
          number: '5512345678'
        }]
      },
      documents: [{
        documentType: 'PASSPORT',
        number: 'ABC123456',
        expiryDate: '2030-12-31',
        issuanceCountry: 'MX',
        nationality: 'MX',
        holder: true
      }]
    }
  ],
  contactInfo: {
    emailAddress: 'juan@example.com',
    phones: [{
      deviceType: 'MOBILE',
      countryCallingCode: '52',
      number: '5512345678'
    }]
  }
})

console.log(booking.bookingReference) // ID de la reserva
console.log(booking.details.pnr) // Passenger Name Record
```

### **Cancelar Reserva:**

```typescript
const result = await amadeus.cancelBooking('BOOKING_ID')
if (result.success) {
  console.log('Reserva cancelada')
}
```

### **Buscar Tarifas Bajas:**

```typescript
const destinations = await amadeus.searchLowFares('MEX', '2024-12-01')
// Retorna destinos con vuelos económicos desde MEX
```

### **Endpoints Amadeus:**
- `POST /v1/security/oauth2/token` - Autenticación
- `GET /v2/shopping/flight-offers` - Búsqueda de vuelos
- `POST /v2/shopping/flight-offers/pricing` - Verificar disponibilidad
- `POST /v1/booking/flight-orders` - Crear reserva
- `DELETE /v1/booking/flight-orders/{id}` - Cancelar
- `GET /v1/shopping/flight-destinations` - Inspiración

### **Limitaciones Sandbox:**
- ✅ Búsqueda: Ilimitada (con rate limiting)
- ✅ Booking: Simulado (no tickets reales)
- ❌ Cancelaciones: Solo simuladas

### **Producción:**
- ✅ Tickets reales
- ✅ PNR reales
- ✅ Integración con aerolíneas
- 💰 Costo: ~$0.35/búsqueda, $2/reserva

---

## 🌍 KIWI ADAPTER

### **¿Qué es Kiwi.com?**
Agregador de vuelos con algoritmos de combinación de aerolíneas.

### **Configuración:**

```typescript
import KiwiAdapter from '@/services/providers/KiwiAdapter'

const kiwi = new KiwiAdapter(
  process.env.KIWI_API_KEY!
)
```

### **Autenticación:**
- API Key en header `apikey`
- Sin OAuth

### **Búsqueda de Vuelos:**

```typescript
const flights = await kiwi.search({
  fly_from: 'MEX',
  fly_to: 'NYC',
  date_from: '01/12/2024',
  adults: 2,
  children: 1,
  cabin_class: 'economy',
  currency: 'MXN'
})
```

### **Verificar Disponibilidad:**

```typescript
const available = await kiwi.checkAvailability(bookingToken)
```

### **Crear Reserva:**

```typescript
const booking = await kiwi.createBooking({
  bookingToken: 'TOKEN_FROM_SEARCH',
  passengers: [
    {
      firstName: 'Juan',
      lastName: 'Perez',
      email: 'juan@example.com',
      phone: '+525512345678',
      dateOfBirth: '1990-01-01',
      nationality: 'MX',
      passportNumber: 'ABC123456',
      passportExpiry: '2030-12-31'
    }
  ],
  currency: 'MXN'
})
```

### **Búsqueda por País:**

```typescript
const flights = await kiwi.searchByCountry('MX', '2024-12-01')
```

### **Multi-City:**

```typescript
const flights = await kiwi.searchMultiCity([
  { from: 'MEX', to: 'NYC', date: '2024-12-01' },
  { from: 'NYC', to: 'LON', date: '2024-12-05' },
  { from: 'LON', to: 'MEX', date: '2024-12-10' }
])
```

### **Endpoints Kiwi:**
- `GET /v2/search` - Búsqueda de vuelos
- `POST /v2/booking/check_flights` - Verificar disponibilidad
- `POST /v2/booking/save_booking` - Crear reserva

### **Costos:**
- ✅ Búsqueda: Gratis
- ✅ Reserva: Comisión 3-5% incluida en precio

---

## 🏨 BOOKING ADAPTER

### **¿Qué es Booking.com?**
Plataforma de +28 millones de propiedades (hoteles, departamentos, etc).

### **Configuración:**

```typescript
import BookingAdapter from '@/services/providers/BookingAdapter'

const booking = new BookingAdapter(
  process.env.BOOKING_API_KEY!,
  process.env.BOOKING_AFFILIATE_ID!
)
```

### **Búsqueda de Hoteles:**

```typescript
const hotels = await booking.search({
  city: 'Cancún',
  checkin: '2024-12-01',
  checkout: '2024-12-08',
  guests: 2,
  rooms: 1,
  currency: 'MXN',
  min_price: 1000,
  max_price: 5000,
  star_rating: 4
})
```

### **Búsqueda por Coordenadas:**

```typescript
const hotels = await booking.searchByCoordinates(
  21.1619, // latitud
  -86.8515, // longitud
  '2024-12-01',
  '2024-12-08',
  5 // radio en km
)
```

### **Por Nombre:**

```typescript
const hotels = await booking.searchByName('Hyatt Cancún')
```

### **Detalles de Hotel:**

```typescript
const hotel = await booking.getDetails('HOTEL_ID')
console.log(hotel.name)
console.log(hotel.facilities)
console.log(hotel.photos)
```

### **Booking.com Affiliate API - IMPORTANTE:**

⚠️ **El Affiliate API NO permite reservas directas**

**Flujo:**
1. Búsqueda en API ✅
2. Mostrar resultados en tu web ✅
3. **Redireccionar a Booking.com** para completar reserva ✅
4. Recibes comisión (4-6%) después ✅

```typescript
// "Crear reserva" retorna URL de redirección
const result = await booking.createBooking({
  hotelId: 'HOTEL_ID',
  checkin: '2024-12-01',
  checkout: '2024-12-08',
  guests: 2
})

console.log(result.details.redirectUrl)
// Redirigir al usuario a esta URL
```

### **Endpoints Booking:**
- `GET /2.7/hotels` - Búsqueda de hoteles
- `GET /2.7/hotels/{id}` - Detalles de hotel

### **Costos:**
- ✅ Búsqueda: Gratis
- ✅ Reserva: Redirige a Booking.com
- 💰 Comisión: 4-6% (te pagan después de la estancia)

---

## 🚀 CÓMO USAR

### **1. API de Búsqueda Unificada**

La forma más fácil es usar `/api/search` que busca en múltiples proveedores:

```typescript
// Frontend
const response = await fetch('/api/search?type=flight&origin=MEX&destination=CUN&departureDate=2024-12-01&adults=2&providers=amadeus,kiwi')

const data = await response.json()

data.data.forEach(flight => {
  console.log(`${flight.provider}: $${flight.price} ${flight.currency}`)
})
```

### **2. Usar Adaptadores Directamente**

```typescript
import AmadeusAdapter from '@/services/providers/AmadeusAdapter'
import KiwiAdapter from '@/services/providers/KiwiAdapter'

const amadeus = new AmadeusAdapter(API_KEY, API_SECRET, true)
const kiwi = new KiwiAdapter(API_KEY)

const [amadeusFlights, kiwiFlights] = await Promise.all([
  amadeus.search(params),
  kiwi.search(params)
])

// Combinar resultados
const allFlights = [...amadeusFlights, ...kiwiFlights]
  .sort((a, b) => a.price - b.price)
```

### **3. Con SearchService (Incluye Cache)**

```typescript
import SearchService from '@/services/SearchService'

const results = await SearchService.getCachedSearch(userId, params)

if (!results) {
  // Buscar en proveedores
  // SearchService maneja el cache automáticamente
}
```

---

## 🔐 VARIABLES DE ENTORNO

Crear archivo `.env.local`:

```bash
# Amadeus
AMADEUS_API_KEY=your_client_id
AMADEUS_API_SECRET=your_client_secret
AMADEUS_SANDBOX=true

# Kiwi.com
KIWI_API_KEY=your_api_key

# Booking.com
BOOKING_API_KEY=your_api_key
BOOKING_AFFILIATE_ID=your_affiliate_id

# JWT
JWT_SECRET=your_secret_key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db
```

---

## 📝 REGISTRO DE APIS

### **Amadeus:**
1. Ir a https://developers.amadeus.com/
2. Crear cuenta
3. Crear app (Self-Service)
4. Copiar API Key y API Secret
5. Modo Sandbox: Gratis, Testing → Producción: Requiere aprobación

### **Kiwi.com:**
1. Ir a https://tequila.kiwi.com/portal/
2. Crear cuenta
3. Solicitar API key
4. Gratis para desarrollo

### **Booking.com:**
1. Ir a https://developers.booking.com/
2. Crear cuenta de Affiliate
3. Solicitar API access
4. Aprobación manual (1-2 semanas)

---

## ✅ TESTING

```bash
# Test Amadeus
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=CUN&departureDate=2024-12-01&adults=2&providers=amadeus"

# Test Kiwi
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=NYC&departureDate=2024-12-01&adults=2&providers=kiwi"

# Test Booking
curl "http://localhost:3000/api/search?type=hotel&city=Cancún&checkin=2024-12-01&checkout=2024-12-08&guests=2&providers=booking"

# Test Todos
curl "http://localhost:3000/api/search?type=flight&origin=MEX&destination=CUN&departureDate=2024-12-01&adults=2&providers=amadeus,kiwi"
```

---

## 🎯 PRÓXIMOS PASOS

1. ✅ GetYourGuide Adapter (atracciones)
2. ✅ Hotelbeds Adapter (hoteles con mejor margen)
3. ✅ Integración con SearchService
4. ✅ Rate limiting en BD
5. ✅ Webhooks de proveedores

---

**Última actualización:** 18 de Noviembre de 2024
