# 📚 Explicación: Cómo Obtenemos Datos de MegaTravel

**Fecha:** 31 Ene 2026 - 21:18 CST

---

## 🔍 CÓMO FUNCIONA ACTUALMENTE

### Sistema Híbrido: Datos Locales + Sincronización Manual

```
┌─────────────────┐
│   MegaTravel    │  ← Sitio web externo (megatravel.com.mx)
│   (Externo)     │
└────────┬────────┘
         │
         │ 1. SINCRONIZACIÓN MANUAL
         │    (Desde panel admin)
         ↓
┌─────────────────┐
│  Sync Service   │  ← MegaTravelSyncService.ts
│  (Scraping)     │     Extrae datos del sitio
└────────┬────────┘
         │
         │ 2. ALMACENAMIENTO LOCAL
         ↓
┌─────────────────┐
│   PostgreSQL    │  ← Base de datos Neon
│   (Nuestro)     │     Tabla: megatravel_packages
└────────┬────────┘
         │
         │ 3. CONSULTA
         ↓
┌─────────────────┐
│   API Routes    │  ← /api/groups
│   (Next.js)     │     Sirve datos a la app
└────────┬────────┘
         │
         │ 4. PRESENTACIÓN
         ↓
┌─────────────────┐
│   Frontend      │  ← /tours, /tours/[code]
│   (React)       │     Muestra tours al usuario
└─────────────────┘
```

---

## 📝 DATOS QUE TENEMOS ACTUALMENTE

### Campos en `megatravel_packages`:

✅ **Básicos:**
- Código (mt_code)
- Nombre
- Descripción
- URL original

✅ **Destinos:**
- Región (Europa, Asia, etc.)
- Países
- Ciudades
- País principal

✅ **Duración:**
- Días
- Noches

✅ **Precios:**
- Precio base USD
- Impuestos
- Nuestro margen (%)
- Precio de venta calculado

✅ **Vuelo:**
- Incluido (sí/no)
- Aerolínea
- Origen

✅ **Hotel:**
- Categoría
- Plan de comidas
- Hoteles detallados por ciudad

✅ **Incluye/No Incluye:**
- Lista de servicios incluidos
- Lista de servicios no incluidos

✅ **Tours Opcionales:**
- Nombre
- Descripción
- Precio
- Fechas válidas

✅ **Imágenes:**
- Imagen principal
- Galería
- Mapa

✅ **Tags:**
- Featured (destacado)
- Offer (oferta)
- Tags personalizados

---

## ❌ DATOS QUE **NO** TENEMOS

### Falta agregar:

❌ **Itinerario Completo:**
- Día por día
- Actividades detalladas
- Comidas incluidas por día
- Hoteles por noche

❌ **Salidas/Fechas:**
- Calendario de salidas
- Disponibilidad
- Precios por fecha

❌ **Requisitos:**
- Documentos necesarios
- Visas
- Vacunas

❌ **Políticas:**
- Cancelación
- Cambios
- Pagos

---

## 🚀 ¿QUÉ IMPLICARÍA AGREGAR TODA LA INFORMACIÓN?

### Opción 1: **Scraping Mejorado** (Actual + Más Datos)

**Ventajas:**
- ✅ Mismo sistema actual
- ✅ No requiere API de MegaTravel
- ✅ Datos actualizados cuando sincronizamos

**Desventajas:**
- ❌ Requiere analizar HTML de cada página
- ❌ Si MegaTravel cambia su sitio, se rompe
- ❌ Lento (hay que visitar cada página)
- ❌ No tenemos datos en tiempo real

**Pasos:**
1. Modificar `MegaTravelSyncService.ts`
2. Agregar scraping de itinerario, fechas, políticas
3. Crear nuevas tablas en PostgreSQL
4. Actualizar migraciones
5. Modificar frontend para mostrar nuevos datos

**Tiempo estimado:** 2-3 días

---

### Opción 2: **API de MegaTravel** (Ideal)

**Ventajas:**
- ✅ Datos en tiempo real
- ✅ Más confiable
- ✅ Más rápido
- ✅ Incluye disponibilidad real

**Desventajas:**
- ❌ Requiere acceso a API de MegaTravel
- ❌ Probablemente de pago
- ❌ Dependemos de su API

**Pasos:**
1. Contactar a MegaTravel para acceso a API
2. Obtener credenciales
3. Crear servicio de integración
4. Modificar base de datos
5. Actualizar frontend

**Tiempo estimado:** 1 semana (si nos dan acceso)

---

### Opción 3: **Entrada Manual** (Temporal)

**Ventajas:**
- ✅ Control total
- ✅ Datos exactos
- ✅ No dependemos de scraping

**Desventajas:**
- ❌ Muy lento
- ❌ Requiere mucho trabajo manual
- ❌ Difícil de mantener actualizado

**Pasos:**
1. Crear panel admin para agregar itinerarios
2. Crear formularios para fechas, políticas
3. Agregar tours manualmente

**Tiempo estimado:** Variable (depende de cuántos tours)

---

## 💡 RECOMENDACIÓN

### **Enfoque Híbrido:**

1. **Corto plazo (Esta semana):**
   - ✅ Usar datos de ejemplo para itinerario (como hicimos)
   - ✅ Agregar scraping básico de itinerario si está en HTML
   - ✅ Permitir entrada manual de itinerarios importantes

2. **Mediano plazo (Próximas semanas):**
   - 🔄 Contactar a MegaTravel para API
   - 🔄 Mejorar scraping para más datos
   - 🔄 Crear panel admin para editar tours

3. **Largo plazo (Meses):**
   - 🎯 Integración completa con API de MegaTravel
   - 🎯 Sistema de reservas en tiempo real
   - 🎯 Sincronización automática diaria

---

## 📊 RESUMEN

| Dato | Estado Actual | Esfuerzo para Agregar |
|------|---------------|----------------------|
| Itinerario básico | ❌ No | 🟡 Medio (2-3 días) |
| Fechas de salida | ❌ No | 🟡 Medio (2-3 días) |
| Políticas | ❌ No | 🟢 Bajo (1 día) |
| Disponibilidad real | ❌ No | 🔴 Alto (requiere API) |
| Precios por fecha | ❌ No | 🔴 Alto (requiere API) |
| Reservas online | ❌ No | 🔴 Alto (requiere API) |

---

## 🎯 PRÓXIMOS PASOS SUGERIDOS

1. **Decidir prioridad:**
   - ¿Qué datos son más importantes para tus clientes?
   - ¿Itinerario? ¿Fechas? ¿Disponibilidad?

2. **Contactar a MegaTravel:**
   - Preguntar si tienen API
   - Preguntar costos
   - Preguntar qué datos proveen

3. **Mientras tanto:**
   - Usar datos de ejemplo para itinerario
   - Agregar entrada manual para tours importantes
   - Mejorar scraping gradualmente

---

**¿Qué datos son más importantes para ti?** Puedo empezar por los que necesites primero. 😊
