# 🎯 VIAJES GRUPALES - INTEGRACIÓN AMADEUS

**Fecha:** 10 de Enero de 2026 - 11:00 CST
**Versión:** v2.206
**Estado:** 📋 Documentado

---

## 📌 LIMITACIÓN DE AMADEUS SELF-SERVICE

### **Hallazgo Clave**
Según la documentación oficial de Amadeus:
> "Our Self-Service APIs allow you to book up to **9 passengers** on the same PNR number. For more passengers you will need to create a **new booking**."

**Fuente:** https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/faq/

### **Opciones para Viajes Grupales (10+ pasajeros)**

| Opción | Descripción | Complejidad |
|--------|-------------|-------------|
| **A. Múltiples PNRs** | Dividir grupo en reservas de ≤9 pasajeros | Baja |
| **B. Enterprise APIs** | APIs avanzadas de Amadeus (requiere contrato) | Alta |
| **C. Cotización Manual** | Agente procesa manualmente la solicitud | N/A |

---

## ✅ ESTRATEGIA RECOMENDADA

### **Para AS Operadora:**

**Implementar flujo híbrido:**

1. **Formulario de Cotización** (Ya existe en `/viajes-grupales`)
   - Usuario ingresa: destino, fechas, número de personas, requisitos
   - Sistema genera cotización automática para grupos pequeños (≤9)
   - Para grupos grandes (10+): envía solicitud a agente

2. **Proceso Automático (≤9 personas)**
   - Usar Flight Offers Search API
   - Calcular precio total del grupo
   - Reservar con Flight Create Orders API
   - Un solo PNR para todo el grupo

3. **Proceso Semi-automático (10-27 personas)**
   - Dividir grupo en sub-grupos de 9 máximo
   - Generar múltiples PNRs vinculados
   - Mostrar precio consolidado al usuario
   - Marcar reservas como parte del mismo grupo

4. **Proceso Manual (28+ personas o requisitos especiales)**
   - Notificar a agente por email/dashboard
   - Agente contacta aerolínea directamente
   - Obtiene tarifas de grupo especiales (SSR)
   - Responde al cliente con cotización

---

## 🔧 IMPLEMENTACIÓN TÉCNICA

### **1. Formulario de Cotización Grupal** ✅
Ubicación: `/viajes-grupales`

```typescript
interface GroupTravelRequest {
  // Datos básicos
  groupName: string
  contactName: string
  contactEmail: string
  contactPhone: string

  // Viaje
  origin: string
  destination: string
  departureDate: string
  returnDate?: string

  // Grupo
  totalPassengers: number
  adults: number
  children: number
  infants: number

  // Requisitos
  flexibleDates: boolean
  cabinClass: 'economy' | 'business' | 'first'
  specialRequests?: string
}
```

### **2. API para Cotización**
Ubicación: `/api/groups/quote`

```typescript
// POST /api/groups/quote
// Recibe GroupTravelRequest
// Retorna:
// - Si ≤9: precios en tiempo real de Amadeus
// - Si 10-27: precios estimados (mejor tarifa × pasajeros)
// - Si 28+: mensaje de "Cotización manual en 24h"
```

### **3. Lógica de División de Grupos**

```typescript
function splitGroup(totalPassengers: number): number[] {
  const MAX_PER_PNR = 9
  const groups: number[] = []

  let remaining = totalPassengers
  while (remaining > 0) {
    const groupSize = Math.min(remaining, MAX_PER_PNR)
    groups.push(groupSize)
    remaining -= groupSize
  }

  return groups
}

// Ejemplo:
// splitGroup(25) → [9, 9, 7]
// splitGroup(10) → [9, 1]
// splitGroup(18) → [9, 9]
```

### **4. Base de Datos - Tabla `group_bookings`**

```sql
CREATE TABLE group_bookings (
  id SERIAL PRIMARY KEY,
  tenant_id INTEGER REFERENCES tenants(id),
  user_id INTEGER REFERENCES users(id),

  -- Datos del grupo
  group_name VARCHAR(255),
  contact_name VARCHAR(255) NOT NULL,
  contact_email VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50),

  -- Viaje
  origin VARCHAR(10) NOT NULL,
  destination VARCHAR(10) NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE,

  -- Pasajeros
  total_passengers INTEGER NOT NULL,
  adults INTEGER NOT NULL DEFAULT 1,
  children INTEGER DEFAULT 0,
  infants INTEGER DEFAULT 0,

  -- Configuración
  cabin_class VARCHAR(20) DEFAULT 'economy',
  flexible_dates BOOLEAN DEFAULT false,
  special_requests TEXT,

  -- Estado
  status VARCHAR(50) DEFAULT 'pending_quote',
  -- pending_quote, quoted, confirmed, cancelled

  -- Cotización
  quoted_price DECIMAL(12,2),
  quote_valid_until TIMESTAMP,
  quote_details JSONB,

  -- PNRs (para grupos reservados)
  pnr_references JSONB, -- Array de PNRs

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📋 FLUJO DE USUARIO

### **Pantalla 1: Formulario de Solicitud**
```
┌─────────────────────────────────────────┐
│  VIAJES GRUPALES                        │
│                                         │
│  Datos del Grupo:                       │
│  [Nombre del grupo]                     │
│  [Nombre contacto]                      │
│  [Email] [Teléfono]                     │
│                                         │
│  Viaje:                                 │
│  [Origen] → [Destino]                   │
│  [Fecha salida] - [Fecha regreso]       │
│  [_] Fechas flexibles (±3 días)         │
│                                         │
│  Pasajeros:                             │
│  Adultos: [+] 15 [-]                    │
│  Niños:   [+] 3  [-]                    │
│  Bebés:   [+] 1  [-]                    │
│                                         │
│  Clase: [Economy ▼]                     │
│                                         │
│  Requisitos especiales:                 │
│  [_____________________________]        │
│                                         │
│  [Solicitar Cotización]                 │
└─────────────────────────────────────────┘
```

### **Pantalla 2: Resultado de Cotización**

**Caso A: Grupo pequeño (≤9)**
```
✅ Cotización disponible

Vuelo: MEX → CUN
Fecha: 15 Ene 2026
Pasajeros: 8 adultos, 1 niño

Precio por persona: $3,450 MXN
TOTAL: $31,050 MXN

[Reservar Ahora]
```

**Caso B: Grupo mediano (10-27)**
```
✅ Cotización estimada

Se crearán 3 reservas vinculadas:
- Reserva 1: 9 pasajeros
- Reserva 2: 9 pasajeros
- Reserva 3: 4 pasajeros

Precio estimado: $75,900 MXN
(sujeto a disponibilidad)

[Solicitar Reserva]
```

**Caso C: Grupo grande (28+)**
```
📋 Cotización en proceso

Tu solicitud para 35 pasajeros ha sido
recibida. Un agente te contactará en
las próximas 24 horas con una cotización
personalizada.

Referencia: GRP-2026-001234

[Ver estado de solicitud]
```

---

## 🔜 PRÓXIMOS PASOS

1. ⏳ Crear migración para tabla `group_bookings`
2. ⏳ Crear API `/api/groups/quote`
3. ⏳ Actualizar página `/viajes-grupales` con formulario completo
4. ⏳ Implementar lógica de división de grupos
5. ⏳ Agregar notificaciones por email al agente

---

## 📚 REFERENCIAS

- [Amadeus Flight APIs](https://developers.amadeus.com/self-service/category/flights)
- [Amadeus FAQ - Group Booking](https://developers.amadeus.com/self-service/apis-docs/guides/developer-guides/faq/)
- [Flight Offers Search API](https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search)
- [Flight Create Orders API](https://developers.amadeus.com/self-service/category/flights/api-doc/flight-create-orders)

---

**Documento creado:** 10 Ene 2026 - 11:00 CST
**Por:** AI Assistant
**Estado:** 📋 Documentación completa, implementación pendiente
