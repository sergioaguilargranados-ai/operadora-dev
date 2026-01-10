# 📦 RESUMEN DE ADAPTADORES - AS OPERADORA

**Fecha:** 20 de Noviembre de 2025

---

## ✅ ADAPTADORES IMPLEMENTADOS (4)

### 1️⃣ **AmadeusAdapter** - Vuelos GDS
**Archivo:** `src/services/providers/AmadeusAdapter.ts`

**Cobertura:**
- ✅ 400+ aerolíneas mundiales
- ✅ Todas las aerolíneas mexicanas (Aeroméxico, Volaris, VivaAerobus)
- ✅ Todas las aerolíneas estadounidenses (United, American, Delta)
- ✅ Aerolíneas europeas (Iberia, Lufthansa, Air France, KLM)
- ✅ Aerolíneas latinoamericanas (LATAM, Avianca, Copa)

**Nuevas funcionalidades:**
- ✅ Filtro por aerolíneas específicas (`includedAirlineCodes`)
- ✅ Excluir aerolíneas (`excludedAirlineCodes`)
- ✅ Solo vuelos directos (`nonStop`)
- ✅ Precio máximo (`maxPrice`)

**Ejemplo:**
```typescript
const amadeus = new AmadeusAdapter(API_KEY, API_SECRET, true)

// Buscar solo en aerolíneas mexicanas
const flights = await amadeus.search({
  originLocationCode: 'MEX',
  destinationLocationCode: 'CUN',
  departureDate: '2024-12-15',
  adults: 2,
  includedAirlineCodes: 'AM,Y4,VB', // Solo Aeroméxico, Volaris, VivaAerobus
  nonStop: true // Solo vuelos directos
})
```

---

### 2️⃣ **KiwiAdapter** - Vuelos Low-Cost
**Archivo:** `src/services/providers/KiwiAdapter.ts`

**Cobertura:**
- ✅ Aerolíneas tradicionales
- ✅ Low-cost que NO están en GDS
- ✅ Combinaciones inteligentes multi-aerolínea

**Ejemplo:**
```typescript
const kiwi = new KiwiAdapter(API_KEY)

const flights = await kiwi.search({
  fly_from: 'MEX',
  fly_to: 'NYC',
  date_from: '15/12/2024',
  adults: 2
})
```

---

### 3️⃣ **BookingAdapter** - Hoteles
**Archivo:** `src/services/providers/BookingAdapter.ts`

**Cobertura:**
- ✅ 28+ millones de propiedades
- ✅ Hoteles, apartamentos, villas, hostales
- ✅ México y todo el mundo

**Ejemplo:**
```typescript
const booking = new BookingAdapter(API_KEY, AFFILIATE_ID)

const hotels = await booking.search({
  city: 'Cancún',
  checkin: '2024-12-01',
  checkout: '2024-12-08',
  guests: 2
})
```

---

### 4️⃣ **ExpediaAdapter** - Vuelos + Hoteles + Paquetes ⭐ NUEVO
**Archivo:** `src/services/providers/ExpediaAdapter.ts`

**Cobertura:**
- ✅ Vuelos de múltiples aerolíneas
- ✅ Hoteles worldwide
- ✅ **Paquetes** (Vuelo + Hotel con descuento)

**Ejemplo vuelos:**
```typescript
const expedia = new ExpediaAdapter(API_KEY, API_SECRET, true)

const flights = await expedia.searchFlights({
  originLocationCode: 'MEX',
  destinationLocationCode: 'CUN',
  departureDate: '2024-12-15',
  adults: 2
})
```

**Ejemplo hoteles:**
```typescript
const hotels = await expedia.searchHotels({
  city: 'Cancún',
  checkin: '2024-12-01',
  checkout: '2024-12-08',
  guests: 2
})
```

**Ejemplo paquetes:**
```typescript
const packages = await expedia.searchPackages({
  originLocationCode: 'MEX',
  city: 'Cancún',
  departureDate: '2024-12-01',
  returnDate: '2024-12-08',
  adults: 2
})
```

---

## 🎯 ESTRATEGIA DE USO RECOMENDADA

### **Para Vuelos:**

```typescript
// Opción 1: Máxima cobertura (Amadeus + Kiwi)
const results = await searchService({
  type: 'flight',
  origin: 'MEX',
  destination: 'NYC',
  providers: ['amadeus', 'kiwi', 'expedia']
})
```

```typescript
// Opción 2: Solo aerolíneas mexicanas
const results = await searchService({
  type: 'flight',
  origin: 'MEX',
  destination: 'CUN',
  providers: ['amadeus'],
  includedAirlineCodes: 'AM,Y4,VB'
})
```

```typescript
// Opción 3: Sin low-cost
const results = await searchService({
  type: 'flight',
  origin: 'MEX',
  destination: 'MAD',
  providers: ['amadeus'],
  excludedAirlineCodes: 'VB,Y4' // Excluir VivaAerobus y Volaris
})
```

### **Para Hoteles:**

```typescript
// Máxima cobertura (DB local + Booking + Expedia)
const results = await searchService({
  type: 'hotel',
  city: 'Cancún',
  checkin: '2024-12-01',
  checkout: '2024-12-08',
  guests: 2,
  providers: ['database', 'booking', 'expedia']
})
```

### **Para Paquetes:**

```typescript
// Solo Expedia ofrece paquetes
const results = await searchService({
  type: 'package',
  origin: 'MEX',
  destination: 'Cancún',
  departureDate: '2024-12-01',
  returnDate: '2024-12-08',
  adults: 2,
  providers: ['expedia']
})
```

---

## 📊 COMPARATIVA DE PROVEEDORES

| Característica | Amadeus | Kiwi | Booking | Expedia |
|----------------|---------|------|---------|---------|
| **Vuelos** | ✅ 400+ | ✅ 800+ | ❌ | ✅ 200+ |
| **Hoteles** | ❌ | ❌ | ✅ 28M | ✅ 500K+ |
| **Paquetes** | ❌ | ❌ | ❌ | ✅ |
| **Aerolíneas mexicanas** | ✅ Todas | ✅ Todas | ❌ | ✅ Principales |
| **Low-cost** | ⚠️ Parcial | ✅ Todas | ❌ | ⚠️ Parcial |
| **Reservas directas** | ✅ Sí | ✅ Sí | ❌ Redirect | ✅ Sí |
| **Sandbox gratis** | ✅ Sí | ❌ | ❌ | ✅ Sí |
| **Costo producción** | 💰 $0.35 | ✅ Gratis | ✅ Gratis | 💰 Variable |

---

## 🔑 CÓDIGOS DE AEROLÍNEAS

### **Mexicanas:**
- `AM` - Aeroméxico
- `Y4` - Volaris
- `VB` - VivaAerobus
- `VW` - Aeromar
- `YQ` - TAR Aerolíneas

### **Estadounidenses:**
- `UA` - United Airlines
- `AA` - American Airlines
- `DL` - Delta Air Lines
- `WN` - Southwest* (solo Kiwi)
- `B6` - JetBlue

### **Europeas:**
- `IB` - Iberia
- `LH` - Lufthansa
- `AF` - Air France
- `KL` - KLM
- `BA` - British Airways

### **Latinoamericanas:**
- `LA` - LATAM
- `AV` - Avianca
- `CM` - Copa Airlines
- `AR` - Aerolíneas Argentinas

---

## 📝 VARIABLES DE ENTORNO REQUERIDAS

```bash
# Amadeus (OBLIGATORIO para vuelos)
AMADEUS_API_KEY=tu_client_id
AMADEUS_API_SECRET=tu_client_secret
AMADEUS_SANDBOX=true

# Kiwi.com (Opcional - más cobertura low-cost)
KIWI_API_KEY=tu_api_key

# Booking.com (Opcional - hoteles)
BOOKING_API_KEY=tu_api_key
BOOKING_AFFILIATE_ID=tu_affiliate_id

# Expedia (Opcional - paquetes)
EXPEDIA_API_KEY=tu_api_key
EXPEDIA_API_SECRET=tu_api_secret
EXPEDIA_SANDBOX=true
```

---

## 🚀 PRÓXIMOS PASOS

### **Fase 1: Registrar APIs** ⭐ PRIORITARIO
1. ✅ Amadeus Sandbox - https://developers.amadeus.com
2. Kiwi.com - https://tequila.kiwi.com/portal/
3. Expedia Rapid API - https://developers.expediagroup.com/

### **Fase 2: Integrar en Frontend**
4. Selector de aerolíneas preferidas
5. Filtros avanzados en resultados
6. Comparador de proveedores

### **Fase 3: Optimización**
7. Cache inteligente por proveedor
8. Fallback automático si un proveedor falla
9. Métricas de performance

---

## ✅ LO QUE YA ESTÁ LISTO

1. ✅ **4 Adaptadores completos** (Amadeus, Kiwi, Booking, Expedia)
2. ✅ **API unificada** `/api/search`
3. ✅ **Filtros de aerolíneas** en Amadeus
4. ✅ **Búsqueda multi-proveedor** en paralelo
5. ✅ **Conversión de moneda** automática
6. ✅ **Deduplicación** de resultados
7. ✅ **Cache** de búsquedas
8. ✅ **Documentación** completa

---

## 🎉 RESUMEN

**Tienes acceso a:**
- ✈️ **1,000+ aerolíneas** (Amadeus + Kiwi + Expedia)
- 🏨 **28+ millones de hoteles** (Booking + Expedia)
- 📦 **Paquetes con descuento** (Expedia)

**Todo esto SIN necesitar APIs individuales de aerolíneas!**

---

**Última actualización:** 20 de Noviembre de 2025
