# ✈️ GUÍA DE AEROLÍNEAS - APIs y Acceso

## 📋 SITUACIÓN REAL DE LAS AEROLÍNEAS

### ⚠️ **IMPORTANTE: Aerolíneas NO tienen APIs públicas directas**

Las aerolíneas **NO ofrecen APIs públicas** para agencias de viajes. Se acceden a través de:

1. **GDS (Global Distribution Systems)**
   - Amadeus ✅ (ya implementado)
   - Sabre
   - Travelport

2. **NDC (New Distribution Capability)**
   - Protocolo IATA más moderno
   - Requiere contratos individuales con cada aerolínea
   - Costoso y complejo

3. **Agregadores**
   - Kiwi.com ✅ (ya implementado)
   - Skyscanner
   - Google Flights (no API pública)

---

## ✅ **LO QUE YA TIENES CON AMADEUS**

### **Aerolíneas Mexicanas:**
- ✅ **Aeroméxico** (AM) - Incluida en Amadeus
- ✅ **Volaris** (Y4) - Incluida en Amadeus
- ✅ **VivaAerobus** (VB) - Incluida en Amadeus
- ✅ **Aeromar** (VW)
- ✅ **TAR Aerolíneas** (YQ)

### **Aerolíneas Internacionales:**
- ✅ **United Airlines** (UA) - Incluida
- ✅ **American Airlines** (AA) - Incluida
- ✅ **Delta Air Lines** (DL) - Incluida
- ✅ **Iberia** (IB) - Incluida
- ✅ **LATAM** (LA) - Incluida
- ✅ **Avianca** (AV) - Incluida
- ✅ **Copa Airlines** (CM) - Incluida
- ✅ **Air Canada** (AC) - Incluida
- ✅ **Lufthansa** (LH) - Incluida
- ✅ **Air France** (AF) - Incluida
- ✅ **KLM** (KL) - Incluida

**Total:** 400+ aerolíneas disponibles

---

## 🔧 **CÓMO FILTRAR POR AEROLÍNEA ESPECÍFICA**

### **Usando Amadeus (Recomendado)**

```typescript
// Búsqueda filtrando solo Aeroméxico
const flights = await amadeus.search({
  originLocationCode: 'MEX',
  destinationLocationCode: 'CUN',
  departureDate: '2024-12-15',
  adults: 1,
  includedAirlineCodes: 'AM' // Solo Aeroméxico
})

// Múltiples aerolíneas mexicanas
const flights = await amadeus.search({
  originLocationCode: 'MEX',
  destinationLocationCode: 'NYC',
  departureDate: '2024-12-15',
  adults: 1,
  includedAirlineCodes: 'AM,VB,Y4' // Aeroméxico, VivaAerobus, Volaris
})

// Excluir aerolíneas low-cost
const flights = await amadeus.search({
  originLocationCode: 'MEX',
  destinationLocationCode: 'MAD',
  departureDate: '2024-12-15',
  adults: 1,
  excludedAirlineCodes: 'VB,Y4' // Sin VivaAerobus ni Volaris
})
```

---

## 📊 **CÓDIGOS IATA DE AEROLÍNEAS**

### **Mexicanas:**
| Aerolínea | Código | Tipo |
|-----------|--------|------|
| Aeroméxico | AM | Full-service |
| Volaris | Y4 | Low-cost |
| VivaAerobus | VB | Ultra low-cost |
| Aeromar | VW | Regional |
| TAR Aerolíneas | YQ | Regional |

### **Estadounidenses:**
| Aerolínea | Código | Alianza |
|-----------|--------|---------|
| United Airlines | UA | Star Alliance |
| American Airlines | AA | Oneworld |
| Delta Air Lines | DL | SkyTeam |
| Southwest | WN | Ninguna* |
| JetBlue | B6 | Ninguna |
| Spirit | NK | Ninguna* |

*Southwest y Spirit generalmente NO están en GDS

### **Europeas:**
| Aerolínea | Código | Alianza |
|-----------|--------|---------|
| Iberia | IB | Oneworld |
| Lufthansa | LH | Star Alliance |
| Air France | AF | SkyTeam |
| KLM | KL | SkyTeam |
| British Airways | BA | Oneworld |

### **Latinoamericanas:**
| Aerolínea | Código | País |
|-----------|--------|------|
| LATAM | LA | Chile/Brasil |
| Avianca | AV | Colombia |
| Copa Airlines | CM | Panamá |
| Aerolíneas Argentinas | AR | Argentina |
| GOL | G3 | Brasil |

---

## 🚫 **AEROLÍNEAS QUE NO ESTÁN EN GDS**

Algunas aerolíneas low-cost **NO participan en GDS**:
- ❌ Southwest Airlines (USA)
- ❌ Spirit Airlines (USA) - Parcial
- ❌ Ryanair (Europa)
- ❌ EasyJet (Europa)
- ❌ Interjet (México - suspendida)

**Alternativa:** Usar Kiwi.com que SÍ incluye algunas de estas

---

## 💡 **ESTRATEGIA RECOMENDADA**

### **Opción 1: Usar Amadeus + Filtros (Recomendado)**
```typescript
// Tu sistema actual
const results = await search({
  type: 'flight',
  origin: 'MEX',
  destination: 'CUN',
  providers: ['amadeus'],
  includedAirlines: ['AM', 'VB', 'Y4'] // Filtro personalizado
})
```

**Ventajas:**
- ✅ Una sola integración
- ✅ 400+ aerolíneas
- ✅ Datos actualizados
- ✅ Posibilidad de reservar

### **Opción 2: Multi-proveedor**
```typescript
// Combinar Amadeus + Kiwi
const results = await search({
  type: 'flight',
  origin: 'MEX',
  destination: 'NYC',
  providers: ['amadeus', 'kiwi'] // Máxima cobertura
})
```

**Ventajas:**
- ✅ Incluye low-cost adicionales
- ✅ Más opciones de precio
- ✅ Redundancia

---

## 🔑 **NDC (New Distribution Capability)**

### **¿Qué es NDC?**
Protocolo IATA moderno para comunicación directa con aerolíneas.

### **Aerolíneas con NDC:**
- ✅ Lufthansa (NDC obligatorio desde 2023)
- ✅ American Airlines
- ✅ British Airways
- ✅ Iberia
- ✅ Aeroméxico

### **¿Cómo acceder?**
1. **A través de Amadeus** - Ya soporta NDC ✅
2. **Directamente con aerolínea** - Requiere:
   - Contrato individual
   - Certificación IATA
   - Integración compleja
   - Costos elevados

**Recomendación:** Usar Amadeus que ya incluye NDC

---

## 🛠️ **IMPLEMENTACIÓN EN TU SISTEMA**

### **1. Actualizar AmadeusAdapter**
Ya implementado con soporte para filtros de aerolíneas.

### **2. Actualizar SearchParams**
```typescript
interface SearchParams {
  // ... existentes
  includedAirlineCodes?: string // 'AM,UA,DL'
  excludedAirlineCodes?: string // 'VB,Y4'
  preferredAlliance?: 'star' | 'oneworld' | 'skyteam'
}
```

### **3. Frontend - Selector de Aerolíneas**
```tsx
<Select>
  <SelectTrigger>Aerolíneas preferidas</SelectTrigger>
  <SelectContent>
    <SelectItem value="AM">Aeroméxico</SelectItem>
    <SelectItem value="VB">VivaAerobus</SelectItem>
    <SelectItem value="Y4">Volaris</SelectItem>
    <SelectItem value="UA">United</SelectItem>
    <SelectItem value="AA">American</SelectItem>
  </SelectContent>
</Select>
```

---

## 📝 **COSTOS Y REGISTROS**

### **GDS (Amadeus)**
- ✅ **Ya tienes:** Sandbox gratis
- 💰 **Producción:** ~$0.35/búsqueda
- 📄 **Registro:** https://developers.amadeus.com

### **NDC Directo (NO recomendado)**
- 💰 **Setup:** $5,000 - $20,000 USD
- 💰 **Mensual:** $500 - $2,000 USD
- ⏰ **Implementación:** 3-6 meses
- 📄 **Requiere:** Certificación IATA

### **Kiwi.com**
- ✅ **Ya tienes:** Implementado
- 💰 **Gratis búsquedas**
- 💰 **Comisión:** 3-5% por reserva

---

## 🎯 **RECOMENDACIÓN FINAL**

### **Para tu caso (AS Operadora):**

**Fase 1 (Actual):**
- ✅ Amadeus (todas las aerolíneas principales)
- ✅ Kiwi.com (low-cost adicionales)
- ✅ Filtros por aerolínea específica

**Fase 2 (Futuro - si el volumen lo justifica):**
- Sabre (redundancia)
- Travelport (más opciones)
- Contratos NDC directos (solo si >10,000 reservas/mes)

**NO necesitas:**
- ❌ APIs individuales de aerolíneas
- ❌ NDC directo (por ahora)
- ❌ Más GDS (con Amadeus es suficiente)

---

## 🔗 **RECURSOS ÚTILES**

- **Amadeus Docs:** https://developers.amadeus.com
- **IATA Codes:** https://www.iata.org/en/publications/directories/code-search/
- **NDC Program:** https://www.iata.org/en/programs/passenger/ndc/
- **Airline Codes:** https://www.airlinecodes.co.uk

---

## ✅ **PRÓXIMOS PASOS**

1. **Implementar filtros de aerolínea** en AmadeusAdapter ✅
2. **Agregar ExpediaAdapter** para más cobertura ✅
3. **Crear selector de aerolíneas** en frontend (próximo)
4. **Probar con aerolíneas específicas** cuando tengas tokens

---

**¿Necesitas APIs de aerolíneas individuales?**
**NO.** Amadeus + Kiwi.com ya te dan acceso a todas las que necesitas.

**Última actualización:** 20 de Noviembre de 2025
