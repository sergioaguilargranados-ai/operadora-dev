# 🔌 INTEGRACIONES CON APIS DE PROVEEDORES - AS OPERADORA

## 🎯 OBJETIVO

Sistema robusto de integración con múltiples proveedores de servicios turísticos:
- **Vuelos:** Aerolíneas + GDS (Amadeus, Sabre)
- **Hoteles:** Cadenas hoteleras + Agregadores (Booking, Expedia)
- **Transportación:** Taxis, transfers, rentadoras
- **Atracciones:** Disney, Universal, tours
- **Actividades:** Tours, experiencias

---

# 1️⃣ APIS DE VUELOS

## 🛫 Opciones de Integración

### **OPCIÓN A: GDS (Global Distribution Systems)**

**Los "grandes" del mercado:**

#### **1. Amadeus**
**Qué es:** El GDS más grande del mundo (40% del mercado)
**Ventajas:**
- ✅ Acceso a 400+ aerolíneas
- ✅ Inventario en tiempo real
- ✅ Precios negociados
- ✅ APIs REST modernas
- ✅ Sandbox gratuito para desarrollo
- ✅ Documentación excelente

**Desventajas:**
- ❌ Costoso (transacciones + mensualidad)
- ❌ Proceso de certificación largo (2-3 meses)
- ❌ Requiere contrato comercial

**Costos aproximados:**
- Setup: $2,000-5,000 USD
- Mensualidad: $500-1,000 USD
- Por transacción: $2-5 USD por booking
- Búsquedas: $0.01-0.05 USD por búsqueda

**APIs principales:**
- `Flight Low-Fare Search` - Búsqueda de vuelos
- `Flight Offers Search` - Búsqueda avanzada
- `Flight Create Orders` - Crear reserva
- `Flight Order Management` - Gestionar reserva

**Ejemplo de uso:**
```javascript
// Búsqueda de vuelos
POST https://api.amadeus.com/v2/shopping/flight-offers
{
  "originLocationCode": "MEX",
  "destinationLocationCode": "CUN",
  "departureDate": "2024-12-01",
  "adults": 2,
  "currencyCode": "MXN"
}

// Respuesta
{
  "data": [
    {
      "id": "1",
      "price": {
        "total": "4500.00",
        "currency": "MXN"
      },
      "itineraries": [...],
      "validatingAirlineCodes": ["AM"]
    }
  ]
}
```

#### **2. Sabre**
**Qué es:** Segundo GDS más grande (35% del mercado)
**Similar a Amadeus en features y costos**

#### **3. Travelport (Galileo/Apollo/Worldspan)**
**Qué es:** Tercer GDS más grande (25% del mercado)

---

### **OPCIÓN B: Agregadores de Vuelos**

Más accesibles para empezar:

#### **1. Skyscanner API**
**Ventajas:**
- ✅ Gratis para desarrollo
- ✅ Fácil integración
- ✅ Datos de múltiples aerolíneas
- ✅ Precios comparativos

**Desventajas:**
- ❌ Solo búsqueda, NO reserva
- ❌ Redirige a aerolínea para comprar
- ❌ Comisión limitada

**Costo:** Gratis (modelo afiliados)

#### **2. Kiwi.com API**
**Ventajas:**
- ✅ Búsqueda + Reserva
- ✅ Algoritmos de vuelos combinados
- ✅ Precios competitivos

**Desventajas:**
- ❌ Menor inventario que GDS
- ❌ Comisiones fijas

**Costo:**
- Por transacción: 3-5% comisión
- API calls: Incluidas

#### **3. Aviasales / Travelpayouts**
**Similar a Skyscanner, modelo afiliados**

---

### **OPCIÓN C: APIs Directas de Aerolíneas**

**Aerolíneas mexicanas principales:**

#### **1. Aeroméxico**
- API: NDC (New Distribution Capability)
- Acceso: Requiere contrato como agencia
- Comisión: 5-8%

#### **2. Volaris**
- API: Limitada (mayormente B2C)
- Acceso: Complejo

#### **3. VivaAerobus**
- API: Limitada

**Problema:** Integrar aerolínea por aerolínea es inviable (necesitarías 100+ integraciones)

---

## 🏗️ RECOMENDACIÓN PARA AS OPERADORA

### **ESTRATEGIA HÍBRIDA:**

**FASE 1 (Inicio - Primeros 6 meses):**
- ✅ **Agregador:** Kiwi.com o Skyscanner (rápido, sin costo inicial)
- ✅ Permite validar el negocio
- ✅ Sin inversión inicial

**FASE 2 (Después de validar):**
- ✅ **GDS:** Amadeus o Sabre
- ✅ Mayor margen de ganancia
- ✅ Control total de reservas
- ✅ Acceso a tarifas corporativas

**FASE 3 (Escalamiento):**
- ✅ **GDS + Agregadores + Aerolíneas directas**
- ✅ Sistema de comparación multi-fuente
- ✅ Mejor precio automático

---

## 📊 Base de Datos - Vuelos

```sql
-- Proveedores de vuelos
CREATE TABLE flight_providers (
    id SERIAL PRIMARY KEY,
    provider_type VARCHAR(50), -- 'gds', 'aggregator', 'airline'
    provider_name VARCHAR(100), -- 'amadeus', 'sabre', 'kiwi'
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    priority INTEGER, -- Orden de búsqueda
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Aerolíneas
CREATE TABLE airlines (
    id SERIAL PRIMARY KEY,
    iata_code VARCHAR(2) UNIQUE, -- AM, Y4, VB
    icao_code VARCHAR(3) UNIQUE,
    airline_name VARCHAR(255),
    country VARCHAR(100),
    logo_url TEXT,
    is_active BOOLEAN DEFAULT true
);

-- Aeropuertos
CREATE TABLE airports (
    id SERIAL PRIMARY KEY,
    iata_code VARCHAR(3) UNIQUE, -- MEX, CUN
    icao_code VARCHAR(4) UNIQUE,
    airport_name VARCHAR(255),
    city VARCHAR(100),
    country VARCHAR(100),
    latitude DECIMAL(10, 7),
    longitude DECIMAL(11, 7),
    timezone VARCHAR(50)
);

-- Cache de búsquedas de vuelos
CREATE TABLE flight_search_cache (
    id SERIAL PRIMARY KEY,
    search_hash VARCHAR(64) UNIQUE, -- MD5 de parámetros de búsqueda
    origin_code VARCHAR(3),
    destination_code VARCHAR(3),
    departure_date DATE,
    return_date DATE,
    adults INTEGER,
    children INTEGER,
    cabin_class VARCHAR(20), -- economy, business, first
    results JSONB, -- Resultados completos de la API
    provider VARCHAR(50),
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP, -- Cachear por 15-30 minutos
    INDEX idx_search_hash (search_hash),
    INDEX idx_expires_at (expires_at)
);

-- Vuelos encontrados (normalizados)
CREATE TABLE flight_offers (
    id SERIAL PRIMARY KEY,
    offer_id VARCHAR(100) UNIQUE, -- ID del proveedor
    provider VARCHAR(50),
    origin_code VARCHAR(3),
    destination_code VARCHAR(3),
    departure_datetime TIMESTAMP,
    arrival_datetime TIMESTAMP,
    airline_code VARCHAR(2),
    flight_number VARCHAR(10),
    cabin_class VARCHAR(20),
    price DECIMAL(10,2),
    currency VARCHAR(3),
    available_seats INTEGER,
    expires_at TIMESTAMP, -- Oferta válida hasta
    raw_data JSONB, -- Datos completos del proveedor
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expires_at (expires_at)
);

-- Reservas de vuelos
CREATE TABLE flight_bookings (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    offer_id VARCHAR(100), -- ID original del proveedor
    provider VARCHAR(50),
    pnr VARCHAR(10), -- Record locator
    airline_code VARCHAR(2),
    flight_number VARCHAR(10),
    origin_code VARCHAR(3),
    destination_code VARCHAR(3),
    departure_datetime TIMESTAMP,
    arrival_datetime TIMESTAMP,
    passenger_name VARCHAR(255),
    seat_number VARCHAR(10),
    ticket_number VARCHAR(20),
    booking_status VARCHAR(20), -- 'confirmed', 'ticketed', 'cancelled'
    booking_reference TEXT, -- Confirmación de aerolínea
    eticket_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sincronización con proveedores
CREATE TABLE provider_sync_log (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50),
    sync_type VARCHAR(50), -- 'search', 'booking', 'status_check'
    request_data JSONB,
    response_data JSONB,
    status VARCHAR(20), -- 'success', 'error'
    error_message TEXT,
    duration_ms INTEGER, -- Tiempo de respuesta
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_provider (provider),
    INDEX idx_created_at (created_at)
);
```

---

# 2️⃣ APIS DE HOTELES

## 🏨 Opciones de Integración

### **OPCIÓN A: Agregadores Principales**

#### **1. Booking.com Affiliate Partner API**
**Ventajas:**
- ✅ +28 millones de propiedades
- ✅ Precios competitivos
- ✅ API gratuita (modelo comisión)
- ✅ Buena documentación

**Modelo de negocio:**
- Comisión: 25-40% del precio
- AS Operadora gana: 4-6% de comisión sobre la venta
- Pago: Mensual

**API endpoints:**
```
GET /hotels - Búsqueda de hoteles
GET /hotels/{hotel_id} - Detalles
GET /availability - Disponibilidad y precios
POST /booking - Crear reserva
```

#### **2. Expedia Affiliate Network (EAN)**
**Similar a Booking.com:**
- +700,000 propiedades
- Comisión: 4-8%
- API gratuita

#### **3. Hotelbeds**
**Qué es:** Mayorista de hoteles (B2B)
**Ventajas:**
- ✅ Tarifas netas (sin comisión pre-aplicada)
- ✅ Markup configurable
- ✅ +180,000 hoteles
- ✅ Contratos directos con hoteles

**Desventajas:**
- ❌ Requiere contrato (depósito inicial)
- ❌ Proceso de onboarding más complejo

**Modelo:**
- Compras a tarifa neta
- Aplicas tu propio markup (10-30%)
- Pagas al mayorista después de la estancia

#### **4. Hoteldo**
Similar a Hotelbeds, alternativa mexicana

---

### **OPCIÓN B: APIs de Cadenas Hoteleras**

**Integración directa:**
- Marriott
- Hilton
- IHG
- Accor

**Problema:** Requiere negociación individual con cada cadena

---

## 🏗️ RECOMENDACIÓN PARA AS OPERADORA

### **ESTRATEGIA:**

**FASE 1:**
- ✅ **Booking.com API** (fácil, rápido, sin inversión)
- ✅ **Expedia API** (redundancia)

**FASE 2:**
- ✅ **Hotelbeds** (mejores márgenes)
- ✅ Negociar contratos directos con hoteles top en destinos clave

**FASE 3:**
- ✅ **Cadenas hoteleras** para clientes corporativos
- ✅ **Sistema de comparación** multi-fuente

---

## 📊 Base de Datos - Hoteles

```sql
-- Proveedores de hoteles
CREATE TABLE hotel_providers (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(100), -- 'booking', 'expedia', 'hotelbeds'
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    commission_model VARCHAR(20), -- 'percentage', 'net_rate'
    default_commission DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    priority INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hoteles (tabla existente - actualizar)
ALTER TABLE hotels ADD COLUMN provider_id INTEGER REFERENCES hotel_providers(id);
ALTER TABLE hotels ADD COLUMN provider_hotel_id VARCHAR(100); -- ID en el sistema del proveedor
ALTER TABLE hotels ADD COLUMN provider_url TEXT;
ALTER TABLE hotels ADD COLUMN last_sync TIMESTAMP;

-- Mapping de hoteles multi-proveedor
CREATE TABLE hotel_provider_mapping (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id),
    provider_id INTEGER REFERENCES hotel_providers(id),
    provider_hotel_id VARCHAR(100), -- ID del hotel en el proveedor
    provider_hotel_name VARCHAR(255),
    last_price_sync TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    UNIQUE(hotel_id, provider_id)
);

-- Disponibilidad y precios (cache)
CREATE TABLE hotel_availability_cache (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id),
    provider_id INTEGER REFERENCES hotel_providers(id),
    check_in DATE,
    check_out DATE,
    room_type VARCHAR(100),
    available_rooms INTEGER,
    price_per_night DECIMAL(10,2),
    total_price DECIMAL(10,2),
    currency VARCHAR(3),
    meal_plan VARCHAR(50), -- 'room_only', 'breakfast', 'half_board', 'all_inclusive'
    cancellation_policy JSONB,
    raw_data JSONB,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    INDEX idx_hotel_dates (hotel_id, check_in, check_out),
    INDEX idx_expires_at (expires_at)
);

-- Tipos de habitación
CREATE TABLE room_types (
    id SERIAL PRIMARY KEY,
    hotel_id INTEGER REFERENCES hotels(id),
    provider_id INTEGER REFERENCES hotel_providers(id),
    room_type_code VARCHAR(50),
    room_name VARCHAR(255),
    description TEXT,
    max_occupancy INTEGER,
    bed_type VARCHAR(50),
    size_sqm DECIMAL(5,2),
    amenities JSONB,
    images JSONB
);
```

---

# 3️⃣ TRANSPORTACIÓN

## 🚗 Opciones de Integración

### **1. Uber API**
**Para transfers aeropuerto-hotel:**
- Uber for Business API
- Estimaciones de precio
- Reserva programada

**Modelo:** Pago con tarjeta corporativa o cliente

### **2. Transfer Services**

#### **Mozio API**
**Qué es:** Agregador de transfers
**Cubre:**
- Taxis
- Shuttles compartidos
- Transfers privados
- Rentadoras de autos

**Modelo:**
- Comisión: 10-15%
- API gratuita

### **3. Rentadoras de Autos**

#### **CarTrawler API**
**Qué es:** Agregador de rentadoras
**Cubre:**
- Enterprise
- Hertz
- Avis
- Budget
- Europcar
- +1,000 proveedores

**Modelo:**
- Comisión: 5-8%

#### **APIs Directas:**
- Enterprise API
- Hertz API
- (Requieren contrato)

---

## 📊 Base de Datos - Transportación

```sql
-- Proveedores de transporte
CREATE TABLE transport_providers (
    id SERIAL PRIMARY KEY,
    provider_type VARCHAR(50), -- 'taxi', 'transfer', 'car_rental'
    provider_name VARCHAR(100),
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Servicios de transporte
CREATE TABLE transport_services (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES transport_providers(id),
    service_type VARCHAR(50), -- 'airport_transfer', 'car_rental'
    origin VARCHAR(255),
    destination VARCHAR(255),
    vehicle_type VARCHAR(100), -- 'sedan', 'suv', 'van'
    max_passengers INTEGER,
    max_luggage INTEGER,
    price DECIMAL(10,2),
    currency VARCHAR(3),
    duration_minutes INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reservas de transporte
CREATE TABLE transport_bookings (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    service_id INTEGER REFERENCES transport_services(id),
    provider_reference VARCHAR(100),
    pickup_location VARCHAR(255),
    dropoff_location VARCHAR(255),
    pickup_datetime TIMESTAMP,
    vehicle_type VARCHAR(100),
    driver_name VARCHAR(255),
    driver_phone VARCHAR(50),
    vehicle_plate VARCHAR(20),
    status VARCHAR(20), -- 'confirmed', 'in_progress', 'completed', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 4️⃣ ATRACCIONES (DISNEY, UNIVERSAL, TOURS)

## 🎢 Opciones de Integración

### **1. Disney Parks**

**APIs Disponibles:**
- ⚠️ **Problema:** Disney NO tiene API pública oficial
- ⚠️ Solo para socios directos (requiere contrato multimillonario)

**Alternativas:**

#### **Opción A: Scraping (No Recomendado)**
- Técnicamente posible pero:
  - ❌ Viola términos de servicio
  - ❌ Inestable (cambios constantes)
  - ❌ Riesgo legal

#### **Opción B: Mayorista de Tickets**

**Proveedores recomendados:**

**1. GetYourGuide API**
**Qué es:** Marketplace de tours y actividades
**Cubre:**
- Disney (tickets de revendedores autorizados)
- Universal Studios
- Tours
- Actividades
- Entradas a atracciones

**Modelo:**
- Comisión: 20-25%
- API gratuita

**2. Viator API (TripAdvisor)**
**Similar a GetYourGuide:**
- +300,000 actividades
- Disney, Universal (revendedores)
- Comisión: 20-25%

**3. Tiqets API**
**Especializado en tickets de atracciones:**
- Museos
- Parques temáticos
- Tours

**4. Rezdy**
**Para tours operados por agencias locales**

---

### **DISNEY - Estrategia Específica**

#### **Opción Recomendada: Alianza con Revendedor Autorizado**

**¿Qué es un revendedor autorizado?**
- Empresas con contrato directo con Disney
- Venden tickets con comisión
- Ejemplos: Undercover Tourist, Park Savers

**Flujo:**
1. Cliente busca tickets Disney en tu plataforma
2. Rediriges a revendedor autorizado (con tu ID de afiliado)
3. Cliente compra
4. Recibes comisión (5-10%)

**Proveedores:**
- Undercover Tourist (programa de afiliados)
- Park Savers
- Tickets At Work

#### **Opción Avanzada (Futuro): Contrato Directo**

**Requisitos:**
- Volumen mínimo: ~$500,000 USD/año en ventas
- Depósito: $50,000-100,000 USD
- Proceso: 6-12 meses

**Beneficios:**
- Comisión mayor (10-15%)
- Tarifas netas
- Soporte directo

---

## 📊 Base de Datos - Atracciones y Tours

```sql
-- Proveedores de atracciones
CREATE TABLE attraction_providers (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(100), -- 'getyourguide', 'viator', 'disney_authorized'
    api_endpoint TEXT,
    api_key_encrypted TEXT,
    commission_rate DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categorías de atracciones
CREATE TABLE attraction_categories (
    id SERIAL PRIMARY KEY,
    category_name VARCHAR(100), -- 'theme_park', 'museum', 'tour', 'activity'
    parent_category_id INTEGER REFERENCES attraction_categories(id)
);

-- Atracciones
CREATE TABLE attractions (
    id SERIAL PRIMARY KEY,
    provider_id INTEGER REFERENCES attraction_providers(id),
    provider_attraction_id VARCHAR(100),
    attraction_name VARCHAR(255),
    category_id INTEGER REFERENCES attraction_categories(id),
    destination VARCHAR(100),
    description TEXT,
    duration_minutes INTEGER,
    min_age INTEGER,
    max_group_size INTEGER,
    includes JSONB, -- Lo que incluye
    excludes JSONB, -- Lo que NO incluye
    images JSONB,
    rating DECIMAL(3,2),
    total_reviews INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Precios de atracciones
CREATE TABLE attraction_pricing (
    id SERIAL PRIMARY KEY,
    attraction_id INTEGER REFERENCES attractions(id),
    ticket_type VARCHAR(50), -- 'adult', 'child', 'senior', 'family'
    price DECIMAL(10,2),
    currency VARCHAR(3),
    valid_from DATE,
    valid_until DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disponibilidad de atracciones
CREATE TABLE attraction_availability (
    id SERIAL PRIMARY KEY,
    attraction_id INTEGER REFERENCES attractions(id),
    date DATE,
    time_slot TIME,
    available_spots INTEGER,
    booked_spots INTEGER DEFAULT 0,
    status VARCHAR(20), -- 'available', 'limited', 'sold_out'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_attraction_date (attraction_id, date)
);

-- Reservas de atracciones
CREATE TABLE attraction_bookings (
    id SERIAL PRIMARY KEY,
    booking_id INTEGER REFERENCES bookings(id),
    attraction_id INTEGER REFERENCES attractions(id),
    provider_reference VARCHAR(100),
    booking_date DATE,
    time_slot TIME,
    ticket_type VARCHAR(50),
    quantity INTEGER,
    lead_traveler_name VARCHAR(255),
    voucher_url TEXT,
    qr_code TEXT,
    status VARCHAR(20), -- 'confirmed', 'used', 'cancelled'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 5️⃣ ARQUITECTURA DE INTEGRACIÓN

## 🏗️ Sistema de Adaptadores

### **Patrón de Diseño: Adapter Pattern**

```
┌─────────────────────────────────────────────┐
│        FRONTEND (Búsqueda unificada)        │
└───────────────────┬─────────────────────────┘
                    │
┌───────────────────▼─────────────────────────┐
│     CAPA DE ABSTRACCIÓN (Search Service)    │
│   - Normaliza requests                      │
│   - Agrega resultados de múltiples fuentes  │
│   - Ordena por precio/relevancia            │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
┌───────▼──────┐ ┌──▼──────┐ ┌─▼─────────┐
│   ADAPTER    │ │ ADAPTER │ │  ADAPTER  │
│   Amadeus    │ │  Kiwi   │ │  Booking  │
└───────┬──────┘ └──┬──────┘ └─┬─────────┘
        │           │           │
┌───────▼──────┐ ┌──▼──────┐ ┌─▼─────────┐
│   API        │ │  API    │ │   API     │
│   Amadeus    │ │  Kiwi   │ │  Booking  │
└──────────────┘ └─────────┘ └───────────┘
```

---

## 📂 Estructura de Código

```typescript
// src/services/providers/BaseProviderAdapter.ts
export interface ProviderAdapter {
  search(params: SearchParams): Promise<SearchResult[]>
  getDetails(id: string): Promise<ProductDetails>
  createBooking(data: BookingData): Promise<BookingConfirmation>
  cancelBooking(id: string): Promise<CancellationResult>
}

// src/services/providers/flights/AmadeusAdapter.ts
export class AmadeusFlightAdapter implements ProviderAdapter {
  async search(params: SearchParams): Promise<SearchResult[]> {
    // Llamada a Amadeus API
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: params.origin,
      destinationLocationCode: params.destination,
      departureDate: params.departureDate,
      adults: params.adults
    })

    // Normalizar respuesta a formato interno
    return this.normalizeResults(response.data)
  }

  private normalizeResults(data: any[]): SearchResult[] {
    return data.map(offer => ({
      id: offer.id,
      provider: 'amadeus',
      type: 'flight',
      price: parseFloat(offer.price.total),
      currency: offer.price.currency,
      details: {
        origin: offer.itineraries[0].segments[0].departure.iataCode,
        destination: offer.itineraries[0].segments[0].arrival.iataCode,
        departureTime: offer.itineraries[0].segments[0].departure.at,
        arrivalTime: offer.itineraries[0].segments[0].arrival.at,
        airline: offer.validatingAirlineCodes[0]
      },
      rawData: offer // Guardar original por si acaso
    }))
  }
}

// src/services/providers/hotels/BookingAdapter.ts
export class BookingHotelAdapter implements ProviderAdapter {
  async search(params: SearchParams): Promise<SearchResult[]> {
    // Similar pero para Booking.com
  }
}

// src/services/SearchAggregator.ts
export class SearchAggregatorService {
  private adapters: ProviderAdapter[]

  async searchFlights(params: SearchParams): Promise<SearchResult[]> {
    // Buscar en paralelo en todos los proveedores
    const results = await Promise.allSettled(
      this.adapters.map(adapter => adapter.search(params))
    )

    // Combinar y ordenar resultados
    const allResults = results
      .filter(r => r.status === 'fulfilled')
      .flatMap(r => r.value)

    // Deduplicar (mismo vuelo de múltiples fuentes)
    const unique = this.deduplicateResults(allResults)

    // Ordenar por precio
    return unique.sort((a, b) => a.price - b.price)
  }

  private deduplicateResults(results: SearchResult[]): SearchResult[] {
    // Lógica para detectar duplicados
    // Ej: mismo vuelo, mismo horario = duplicado
  }
}
```

---

## 📊 Cache Inteligente

### **Estrategia de Cache Multi-Nivel**

```typescript
// src/services/CacheService.ts
export class CacheService {
  // Nivel 1: Redis (en memoria) - 15 minutos
  // Nivel 2: PostgreSQL - 1 hora
  // Nivel 3: CDN (Cloudflare) - Para imágenes y datos estáticos

  async getOrFetch(
    cacheKey: string,
    fetchFunction: () => Promise<any>,
    ttl: number
  ): Promise<any> {
    // 1. Buscar en Redis
    const cached = await redis.get(cacheKey)
    if (cached) return JSON.parse(cached)

    // 2. Buscar en PostgreSQL
    const dbCached = await db.query(
      'SELECT * FROM search_cache WHERE key = $1 AND expires_at > NOW()',
      [cacheKey]
    )
    if (dbCached.rows.length > 0) {
      const data = dbCached.rows[0].data
      // Restaurar en Redis
      await redis.setex(cacheKey, 900, JSON.stringify(data))
      return data
    }

    // 3. Fetch de API
    const data = await fetchFunction()

    // Guardar en ambos niveles
    await redis.setex(cacheKey, ttl, JSON.stringify(data))
    await db.query(
      'INSERT INTO search_cache (key, data, expires_at) VALUES ($1, $2, NOW() + $3)',
      [cacheKey, JSON.stringify(data), `${ttl} seconds`]
    )

    return data
  }
}
```

### **Tiempos de Cache Recomendados:**

| Tipo de Dato | Cache Duration | Razón |
|--------------|----------------|-------|
| Búsqueda de vuelos | 15-30 min | Precios cambian frecuentemente |
| Disponibilidad hoteles | 30 min - 1 hora | Menos volátil |
| Detalles de hotel | 24 horas | Datos estáticos |
| Listas de aeropuertos | 7 días | Raramente cambian |
| Imágenes | 30 días | CDN |
| Políticas de cancelación | 24 horas | Cambios ocasionales |

---

## 🔄 Sistema de Webhooks

### **Para Actualizaciones en Tiempo Real**

```sql
CREATE TABLE webhook_subscriptions (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50),
    event_type VARCHAR(50), -- 'booking_confirmed', 'flight_cancelled', 'price_change'
    webhook_url TEXT,
    secret_key_encrypted TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE webhook_events (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES webhook_subscriptions(id),
    event_type VARCHAR(50),
    payload JSONB,
    processed BOOLEAN DEFAULT false,
    received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);
```

**Ejemplos de webhooks:**
- **Amadeus:** Notificación de cambio de horario de vuelo
- **Booking.com:** Confirmación de reserva
- **Disney:** Cancelación de evento

---

## 🚦 Rate Limiting

### **Control de Llamadas a APIs**

```sql
CREATE TABLE api_rate_limits (
    id SERIAL PRIMARY KEY,
    provider VARCHAR(50),
    limit_type VARCHAR(20), -- 'per_second', 'per_minute', 'per_day'
    max_requests INTEGER,
    current_requests INTEGER DEFAULT 0,
    window_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    window_end TIMESTAMP
);
```

```typescript
// src/services/RateLimiter.ts
export class RateLimiter {
  async checkLimit(provider: string): Promise<boolean> {
    const limit = await db.query(
      'SELECT * FROM api_rate_limits WHERE provider = $1',
      [provider]
    )

    if (limit.rows[0].current_requests >= limit.rows[0].max_requests) {
      // Esperar o usar proveedor alternativo
      return false
    }

    // Incrementar contador
    await db.query(
      'UPDATE api_rate_limits SET current_requests = current_requests + 1 WHERE provider = $1',
      [provider]
    )

    return true
  }
}
```

---

## 💰 COSTOS ESTIMADOS DE INTEGRACIONES

### **Escenario: AS Operadora con 1,000 reservas/mes**

| Servicio | Costo Setup | Costo Mensual | Costo por Transacción | Total Mes 1 | Total Mes 12 |
|----------|-------------|---------------|------------------------|-------------|--------------|
| **Amadeus (vuelos)** | $3,000 | $800 | $3/booking | $6,800 | $12,600 |
| **Booking.com (hoteles)** | $0 | $0 | 4% comisión* | $0 | $0 |
| **GetYourGuide (tours)** | $0 | $0 | 20% comisión* | $0 | $0 |
| **Mozio (transfers)** | $0 | $0 | 10% comisión* | $0 | $0 |
| **Facturama (CFDI)** | $0 | $400 | $1.50/factura | $1,900 | $6,200 |
| **SendGrid (emails)** | $0 | $20 | - | $20 | $240 |
| **Twilio (SMS)** | $0 | $0 | $0.05/SMS | $50 | $600 |
| **Redis (cache)** | $0 | $30 | - | $30 | $360 |
| **Cloudflare R2 (storage)** | $0 | $15 | - | $15 | $180 |
| **Vercel (hosting)** | $0 | $20 | - | $20 | $240 |
| **Neon PostgreSQL** | $0 | $0 | - | $0 | $0 |
| **TOTAL** | **$3,000** | **$1,285** | **~$4.55/booking** | **$8,835** | **$20,420** |

*Comisión se descuenta del precio, no es costo adicional para AS Operadora

---

## 🎯 RECOMENDACIÓN FINAL DE INTEGRACIONES

### **FASE 1 (Lanzamiento - Primeros 3 meses):**

**Vuelos:**
- ✅ Kiwi.com API (gratis, búsqueda + reserva)

**Hoteles:**
- ✅ Booking.com API (gratis, comisión 4-6%)

**Atracciones:**
- ✅ GetYourGuide API (gratis, comisión 20-25%)

**Transporte:**
- ✅ Mozio API (gratis, comisión 10-15%)

**Total inversión inicial: $0**
**Costo mensual fijo: ~$500**

---

### **FASE 2 (Después de 100 reservas/mes):**

**Añadir:**
- ✅ Amadeus (vuelos con mejores márgenes)
- ✅ Viator (más variedad en tours)
- ✅ Hotelbeds (hoteles con tarifa neta)

**Inversión adicional: $3,000-5,000**
**Costo mensual: ~$1,500-2,000**

---

### **FASE 3 (Escalamiento - 500+ reservas/mes):**

**Añadir:**
- ✅ Contratos directos con cadenas hoteleras
- ✅ Revendedor autorizado Disney
- ✅ APIs directas de aerolíneas mexicanas

**Inversión adicional: $10,000-20,000**
**Costo mensual: ~$3,000-5,000**

---

¿Procedemos con el análisis de hosting ahora que tenemos clara la arquitectura de integraciones?
