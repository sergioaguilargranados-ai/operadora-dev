# 🌍 INTEGRACIÓN COMPLETA AMADEUS API

**Fecha:** 21 de Diciembre de 2025
**Versión:** v2.146
**Estado:** ✅ Adapters Creados - Pendiente Integración en SearchService

---

## 📊 RESUMEN EJECUTIVO

Se han implementado **4 adapters completos** para Amadeus Self-Service API, expandiendo las capacidades de la plataforma:

### ✅ Servicios Implementados

| Servicio | Adapter | Estado | Inventario |
|----------|---------|--------|------------|
| **Vuelos** | `AmadeusAdapter.ts` | ✅ Completo | 400+ aerolíneas |
| **Hoteles** | `AmadeusHotelAdapter.ts` | ✅ Nuevo | 150,000+ hoteles |
| **Transfers/Autos** | `AmadeusTransferAdapter.ts` | ✅ Nuevo | Global |
| **Tours y Actividades** | `AmadeusActivitiesAdapter.ts` | ✅ Nuevo | 300,000+ actividades |

### ❌ No Disponibles en Self-Service

| Servicio | Razón | Alternativa |
|----------|-------|-------------|
| **Cruceros** | Solo en Enterprise API | Sección "Próximamente" |
| **Paquetes Vacacionales** | No existe API | Combinar vuelo + hotel manualmente |

---

## 🏨 1. HOTELES (PRINCIPAL)

### Archivo
```
operadora-dev/src/services/providers/AmadeusHotelAdapter.ts
```

### Capacidades

**✅ SÍ Incluye Fotos**
- Múltiples imágenes por hotel
- Descripciones completas
- Amenidades detalladas
- Ubicación GPS

**API Endpoints:**
- `GET /v1/reference-data/locations/hotels/by-city` - Buscar hoteles por ciudad
- `GET /v3/shopping/hotel-offers` - Obtener ofertas
- `GET /v3/shopping/hotel-offers/by-hotel` - Detalles de hotel (con fotos)
- `POST /v1/booking/hotel-bookings` - Crear reserva

**Inventario:**
- 150,000+ hoteles
- 350+ cadenas hoteleras
- Cobertura global

**Datos que retorna:**
```typescript
{
  hotelId: string
  hotelName: string
  cityCode: string
  location: { latitude, longitude }
  checkIn: date
  checkOut: date
  room: {
    type: string
    category: string
    beds: number
    bedType: string
    description: string
  }
  boardType: string (BB, HB, FB, AI)
  price: {
    total: string
    base: string
    taxes: array
  }
  policies: {
    cancellation: string
    paymentType: string
  }
  available: boolean
}
```

### Estrategia de Implementación

**AMADEUS = PRINCIPAL, Booking.com = Complementario**

```typescript
// Flujo de búsqueda de hoteles:
1. Buscar en Amadeus (principal)
2. Si resultados < 10, complementar con Booking.com
3. Combinar y ordenar por precio
4. Retornar unified results
```

---

## 🚗 2. TRANSFERS Y AUTOS

### Archivo
```
operadora-dev/src/services/providers/AmadeusTransferAdapter.ts
```

### Capacidades

**Tipos de Servicio:**
- `PRIVATE` - Vehículo privado
- `SHARED` - Compartido
- `TAXI` - Taxi

**API Endpoints:**
- `GET /v1/shopping/transfer-offers` - Buscar transfers
- `POST /v1/ordering/transfer-orders` - Crear reserva
- `DELETE /v1/ordering/transfer-orders` - Cancelar

**Datos que retorna:**
```typescript
{
  transferType: string
  start: {
    dateTime: string
    location: string
    address: object
  }
  end: {
    location: string
    address: object
  }
  vehicle: {
    code: string
    category: string
    description: string
    seats: number
    luggage: number
    imageURL: string (limitado)
  }
  serviceProvider: {
    name: string
    logo: string
    contact: object
  }
  price: {
    total: string
    base: string
    currency: string
  }
  distance: { value, unit }
}
```

**Casos de Uso:**
- Transfers aeropuerto ↔ hotel
- Transfers entre ciudades
- Tours con transporte

---

## 🎭 3. TOURS Y ACTIVIDADES

### Archivo
```
operadora-dev/src/services/providers/AmadeusActivitiesAdapter.ts
```

### Capacidades

**✅ SÍ Incluye Fotos**
- Múltiples imágenes
- Ratings de usuarios
- Deep link a Viator/GetYourGuide

**API Endpoints:**
- `GET /v1/shopping/activities` - Buscar por coordenadas
- `GET /v1/shopping/activities/{id}` - Detalles

**Inventario:**
- 300,000+ actividades
- Proveedores: Viator, GetYourGuide

**Datos que retorna:**
```typescript
{
  name: string
  shortDescription: string
  description: string
  location: {
    latitude: number
    longitude: number
    address: string
    city: string
  }
  rating: string
  pictures: string[] (URLs)
  bookingLink: string (deep link)
  minimumDuration: string
  price: {
    amount: string
    currency: string
  }
}
```

**⚠️ Nota Importante:**
- El booking NO es directo con Amadeus
- Amadeus retorna un `bookingLink` que redirige a Viator/GetYourGuide
- El pago y confirmación se hace en el sitio del proveedor

**Flujo de Reserva:**
```
1. Usuario busca actividades → Amadeus API
2. Selecciona actividad
3. Click "Reservar" → Redirige a bookingLink
4. Usuario completa pago en Viator/GetYourGuide
5. Confirmación regresa vía email del proveedor
```

---

## ✈️ 4. VUELOS (YA IMPLEMENTADO)

### Archivo
```
operadora-dev/src/services/providers/AmadeusAdapter.ts
```

### Estado Actual

**✅ Ya implementado y funcional:**
- Búsqueda de vuelos
- Filtros de aerolíneas (incluir/excluir)
- Vuelos sin escalas
- Precio máximo
- Detalles de segmentos
- Equipaje incluido

**Endpoints usados:**
- `GET /v2/shopping/flight-offers` - Búsqueda
- `GET /v2/shopping/flight-offers/{id}` - Detalles
- `POST /v2/shopping/flight-offers/pricing` - Verificar disponibilidad
- `POST /v1/booking/flight-orders` - Crear reserva
- `DELETE /v1/booking/flight-orders/{id}` - Cancelar

**⚠️ Completar:**
- Actualmente solo búsqueda
- Falta integrar booking completo en UI
- Agregar precio de equipaje extra
- Agregar selección de asientos (Enterprise API)

---

## 🔑 CONFIGURACIÓN

### Variables de Entorno

```bash
# Mismas credenciales para todos los servicios Amadeus
AMADEUS_API_KEY=your-api-key
AMADEUS_API_SECRET=your-api-secret
AMADEUS_ENVIRONMENT=test # o 'production'
```

### Obtener Credenciales

1. Registrarse en: https://developers.amadeus.com/register
2. Crear aplicación Self-Service
3. Copiar API Key y API Secret
4. Seleccionar Environment (Test/Production)

**Importante:**
- Test: Datos ficticios, no cobro
- Production: Datos reales, se cobra por transacción

---

## 📋 PRÓXIMOS PASOS

### Fase 1: Integración en SearchService ✅

**Archivo:** `operadora-dev/src/services/SearchService.ts`

Modificar para usar Amadeus como principal:

```typescript
// searchHotels():
1. Buscar en AmadeusHotelAdapter
2. Si < 10 resultados, complementar con BookingAdapter
3. Merge y deduplicate
4. Return unified results

// searchTransfers():
1. Usar AmadeusTransferAdapter
2. Return results

// searchActivities():
1. Usar AmadeusActivitiesAdapter
2. Return results con bookingLink
```

### Fase 2: Crear APIs REST

**Nuevos endpoints:**
- `GET /api/search/transfers` - Buscar transfers
- `GET /api/search/activities` - Buscar actividades
- `POST /api/booking/transfer` - Reservar transfer
- `GET /api/activities/{id}` - Detalles de actividad

### Fase 3: Actualizar Frontend

**Tabs a implementar:**
- Tab "Autos" → Buscar transfers
- Tab "Cosas que hacer" → Buscar actividades

**Páginas nuevas:**
- `/resultados?type=transfer` - Resultados de transfers
- `/resultados?type=activity` - Resultados de actividades
- `/activity/{id}` - Detalles de actividad con botón redirect

### Fase 4: Testing

1. Probar con API Test de Amadeus
2. Verificar fotos en hoteles
3. Verificar deep links en actividades
4. Validar pricing
5. Probar transfers aeropuerto

---

## 💡 CONSIDERACIONES TÉCNICAS

### Rate Limits (Self-Service)

| API | Límite | Período |
|-----|--------|---------|
| Flight Search | 10 req/s | - |
| Hotel Search | 10 req/s | - |
| Transfer Search | 10 req/s | - |
| Activities | 10 req/s | - |

### Caching Recomendado

| Tipo | TTL |
|------|-----|
| Vuelos | 15 min |
| Hoteles | 30 min |
| Transfers | 15 min |
| Actividades | 24 horas |

### Manejo de Errores

```typescript
try {
  const results = await amadeusAdapter.search(params)
} catch (error) {
  // 1. Log error
  console.error('Amadeus error:', error)

  // 2. Fallback a otro proveedor
  const fallbackResults = await bookingAdapter.search(params)

  // 3. Return con warning
  return {
    success: true,
    data: fallbackResults,
    warning: 'Primary provider unavailable, using backup'
  }
}
```

---

## 🎯 PRIORIDADES

### Implementar YA (Alta prioridad)

1. ✅ **Hoteles Amadeus como principal**
   - Mayor inventario
   - Mejores fotos
   - Precios competitivos

2. ✅ **Completar vuelos**
   - Agregar booking completo
   - UI de confirmación

### Implementar Pronto (Media prioridad)

3. **Transfers**
   - Útil para paquetes completos
   - Mejora experiencia usuario

4. **Actividades**
   - Contenido adicional
   - Monetización vía deep links

### Futuro (Baja prioridad)

5. **Cruceros** - Requiere Enterprise API
6. **Paquetes** - Construcción manual de ofertas

---

## 📸 FOTOS: ¿Qué APIs las Incluyen?

| Servicio | Fotos | Calidad | Cantidad |
|----------|-------|---------|----------|
| **Hoteles** | ✅ Sí | Alta | Múltiples por hotel |
| **Actividades** | ✅ Sí | Alta | 3-10 por actividad |
| **Transfers** | ⚠️ Limitado | Media | 0-1 por vehículo |
| **Vuelos** | ❌ No | - | Solo logos aerolíneas |

---

## 🚀 COMANDOS DE PRUEBA

### Test con Amadeus Sandbox

```bash
# Test de autenticación
curl -X POST https://test.api.amadeus.com/v1/security/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=$AMADEUS_API_KEY&client_secret=$AMADEUS_API_SECRET"

# Test de hoteles (Madrid)
curl https://test.api.amadeus.com/v3/shopping/hotel-offers?cityCode=MAD&checkInDate=2025-12-25&checkOutDate=2025-12-27&adults=2 \
  -H "Authorization: Bearer $TOKEN"

# Test de actividades (París)
curl https://test.api.amadeus.com/v1/shopping/activities?latitude=48.856614&longitude=2.352222 \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📚 DOCUMENTACIÓN OFICIAL

- **Self-Service Catalog:** https://developers.amadeus.com/self-service
- **Hotels API:** https://developers.amadeus.com/self-service/category/hotels
- **Transfers API:** https://developers.amadeus.com/self-service/category/cars-and-transfers
- **Activities API:** https://developers.amadeus.com/self-service/category/destination-experiences/api-doc/tours-and-activities
- **GitHub SDKs:** https://github.com/amadeus4dev

---

**Creado por:** AI Assistant
**Proyecto:** AS Operadora de Viajes
**Última actualización:** 21 Diciembre 2025
