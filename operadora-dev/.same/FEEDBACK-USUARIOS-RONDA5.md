# 📋 FEEDBACK USUARIOS - RONDA 5

**Fecha inicio:** 10 de Enero de 2026
**Versión base:** v2.213 → v2.214
**Estado:** ✅ COMPLETADO
**Total puntos:** 3/3

---

## 📊 RESUMEN DE PUNTOS

| # | Módulo | Descripción | Estado | Prioridad |
|---|--------|-------------|--------|-----------|
| 1 | Hoteles (Página Principal) | Campo "A dónde" - dropdown se pone atrás (z-index) | ✅ Completado | Alta |
| 2 | Hoteles (Página Principal) | Calendario - no muestra rango en azul ni fechas pasadas en gris | ✅ Completado | Alta |
| 3 | Checkout | Botón regresar - se pierde contexto "no hay datos de reserva" | ✅ Completado | Alta |

---

## 📝 DETALLE DE CADA PUNTO

### **1. HOTELES - Campo "A dónde" z-index**

**Estado:** ✅ Completado

**Problema reportado:**
- El dropdown/datalist del campo "A dónde" se pone detrás de otros elementos
- No se ve bien la lista de sugerencias

**Solución aplicada:**
- Agregado `z-30` al contenedor del campo destino
- Agregado `z-20` al input con `relative`
- Reducido z-index de campos Fechas (`z-20`) y Viajeros (`z-10`)
- Jerarquía de z-index: Destino > Fechas > Viajeros

**Archivos modificados:**
- `src/app/page.tsx` - Líneas 776-828

---

### **2. HOTELES - Calendario sin colores**

**Estado:** ✅ Completado

**Problema reportado:**
- No se ve la barra azul en el rango de fechas seleccionado
- Las fechas pasadas no aparecen en gris/deshabilitadas

**Causa raíz:**
- react-day-picker v9 cambió los nombres de las clases CSS
- Los estilos usaban selectores de v8 que ya no aplican

**Solución aplicada:**
- Actualizado `calendar.tsx` con selectores de data-attributes de v9:
  - `data-[selected]`, `data-[range-start]`, `data-[range-end]`
  - `data-[range-middle]`, `data-[disabled]`, `data-[today]`
- Actualizado `globals.css` con selectores para v9:
  - Barra azul continua en rango con `:has()` selector
  - Fechas pasadas en gris con line-through

**Archivos modificados:**
- `src/components/ui/calendar.tsx` - Reescrito para v9
- `src/app/globals.css` - Estilos actualizados líneas 71-133

---

### **3. CHECKOUT - Botón regresar pierde contexto**

**Estado:** ✅ Completado

**Problema reportado:**
- Al usar router.back() desde Checkout, se muestra "no hay datos de reserva"
- Se pierde el contexto de la reserva

**Causa raíz:**
- El localStorage se limpiaba en `/confirmar-reserva` después de crear el booking
- Si el usuario regresaba de checkout, los datos ya no existían

**Solución aplicada:**
- Removida limpieza de localStorage en `confirmar-reserva/page.tsx`
- Movida limpieza a `/payment/success/page.tsx` (solo cuando pago exitoso)
- Ahora el usuario puede regresar y ver sus datos si cancela el pago

**Archivos modificados:**
- `src/app/confirmar-reserva/page.tsx` - Líneas 220-223
- `src/app/payment/success/page.tsx` - Líneas 30-34

---

## 📅 PROGRESO

| Fecha | Versión | Puntos completados | Notas |
|-------|---------|-------------------|-------|
| 10 Ene 2026 | v2.213 | 0/3 | Documento creado con 3 puntos |
| 10 Ene 2026 | v2.214 | 3/3 | Todos los puntos completados |

---

**Documento actualizado:** 10 Ene 2026 - 14:45 CST
**Por:** AI Assistant
**Estado:** ✅ Ronda 5 completada
