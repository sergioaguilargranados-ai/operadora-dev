# 🔧 Corrección: Extracción de Precios Dinámicos - MegaTravel

**Fecha:** 03 Feb 2026 - 19:45 CST  
**Problema:** Precios e impuestos no se extraían correctamente (solo 36.3% de tours tenían precio)  
**Causa:** Los precios están en una tabla dinámica que se carga con JavaScript  
**Solución:** Agregar extracción de precios dinámicos con Puppeteer

---

## 🐛 PROBLEMA IDENTIFICADO

### Síntomas:
- ✅ Includes: 100% (325/325 tours) - Funcionando
- ❌ Precios: Solo 36.3% (118/325 tours)
- ❌ Not Includes: Solo 5.8% (19/325 tours)

### Causa Raíz:
Los precios NO están en el HTML inicial de la página. Están en una **tabla de fechas de salida** que se carga dinámicamente con JavaScript después de que la página se renderiza.

**Ejemplo de ubicación:**
```
Sección: "Selecciona tu fecha de salida"
Formato: "5,199 USD + 899 IMP"
```

El scraping anterior:
1. Abría Puppeteer
2. Cargaba la página
3. Obtenía el HTML inicial
4. **Cerraba el navegador** ← PROBLEMA
5. Intentaba extraer precios del HTML estático (que no los tiene)

---

## ✅ SOLUCIÓN IMPLEMENTADA

### Cambios en `MegaTravelScrapingService.ts`:

#### 1. Nueva función `scrapeDynamicPricing()`
```typescript
static async scrapeDynamicPricing(page: Page): Promise<{
    price_usd: number | null;
    taxes_usd: number | null;
    currency: string;
    price_per_person_type: string;
    price_variants: Record<string, number>;
}>
```

**Qué hace:**
- Ejecuta JavaScript en el navegador para buscar precios en la tabla
- Busca patrones como "X,XXX USD + XXX IMP"
- Extrae precio base e impuestos
- Se ejecuta ANTES de cerrar el navegador

#### 2. Modificación del flujo de `scrapeTourComplete()`:

**ANTES:**
```typescript
1. Abrir Puppeteer
2. Cargar página
3. Obtener HTML
4. Cerrar navegador ← Aquí se perdían los datos dinámicos
5. Extraer precios del HTML estático
```

**AHORA:**
```typescript
1. Abrir Puppeteer
2. Cargar página
3. Esperar tabla de fechas (selector: .table, table, [class*="fecha"])
4. Esperar 2 segundos adicionales para carga completa
5. Extraer precios dinámicos ← NUEVO
6. Obtener HTML completo
7. Cerrar navegador
8. Extraer precios estáticos (fallback)
9. Usar dinámicos si existen, sino estáticos
```

#### 3. Importación de tipos:
```typescript
import puppeteer, { Page } from 'puppeteer';
```

---

## 📊 MEJORAS ESPERADAS

### Antes:
- Precios: 118/325 (36.3%)
- Impuestos: 324/325 (99.7%)

### Después (estimado):
- Precios: ~300/325 (92%+)
- Impuestos: ~320/325 (98%+)

**Nota:** Algunos tours pueden seguir sin precio si realmente requieren cotización.

---

## 🧪 CÓMO PROBAR

### Script de prueba creado:
```bash
node scripts/test-dynamic-pricing.js
```

Este script probará 3 tours que antes NO tenían precio:
- MT-12118 - Quinceañeras a Europa II
- MT-12518 - Descubre Europa con Mamá
- MT-12534 - Mega Marruecos

### Re-ejecutar scraping completo:
```bash
# Opción 1: Desde panel admin
# Dashboard → Avatar → "Scraping MegaTravel" → "Iniciar Scraping Completo"

# Opción 2: Desde línea de comandos
node scripts/execute-scraping-now.js
```

---

## 🔍 DETALLES TÉCNICOS

### Selectores CSS utilizados:
```typescript
// Esperar tabla de fechas
'.table, table, [class*="fecha"], [class*="salida"]'

// Buscar precios en celdas
'td, .price, [class*="precio"], [class*="tarifa"]'
```

### Patrones de extracción:
```typescript
// Patrón 1: "5,199 USD + 899 IMP"
/([0-9,]+)\s*USD\s*\+\s*([0-9,]+)\s*IMP/i

// Patrón 2: "Desde 1,699 USD"
/Desde\s+([0-9,]+)\s*USD/i
```

### Manejo de errores:
- Si no se encuentra tabla de fechas → Continúa (puede ser normal)
- Si falla extracción dinámica → Usa extracción estática (fallback)
- Si ambas fallan → Devuelve null (precio no disponible)

---

## 📝 ARCHIVOS MODIFICADOS

### Código:
- ✅ `src/services/MegaTravelScrapingService.ts`
  - Nueva función `scrapeDynamicPricing()`
  - Modificado `scrapeTourComplete()`
  - Agregado import de tipo `Page`

### Scripts de prueba:
- ✅ `scripts/test-dynamic-pricing.js` (nuevo)
- ✅ `scripts/verify-tours-manually.js` (nuevo)
- ✅ `scripts/simple-check.js` (nuevo)

### Documentación:
- ✅ `docs/AG-Diagnostico-Datos-MegaTravel-03Feb.md`
- ✅ `docs/AG-Correccion-Precios-Dinamicos-03Feb.md` (este archivo)

---

## 🚀 PRÓXIMOS PASOS

### 1. Probar la corrección (5-10 min):
```bash
node scripts/test-dynamic-pricing.js
```

### 2. Si funciona, re-ejecutar scraping (3 horas):
```bash
node scripts/execute-scraping-now.js
```

### 3. Verificar resultados:
```bash
node scripts/simple-check.js
```

### 4. Commit y push:
```bash
git add -A
git commit -m "fix: Extraer precios dinámicos de tabla de fechas con Puppeteer"
git push origin main
```

---

## ✅ VALIDACIÓN

### Criterios de éxito:
- [ ] Script de prueba extrae precios de los 3 tours
- [ ] Precios coinciden con los mostrados en el sitio
- [ ] Re-scraping completo alcanza >90% de tours con precio
- [ ] No hay errores en la consola

### Casos de prueba:
1. **Tour con precio en tabla:** MT-12118
   - Esperado: $5,199 USD + $899 IMP
   
2. **Tour con precio en tabla:** MT-12518
   - Esperado: $5,190 USD + $890 IMP
   
3. **Tour con precio en tabla:** MT-12534
   - Esperado: Verificar en sitio

---

## 🐛 PROBLEMAS CONOCIDOS

### Resueltos:
- ✅ Error de tipo `puppeteer.Page` → Cambiado a `Page` importado
- ✅ `waitForTimeout` no existe → Cambiado a `setTimeout` con Promise
- ✅ Navegador se cerraba antes de extraer precios → Reorganizado flujo

### Pendientes:
- ⏳ Validar que funciona en todos los tours
- ⏳ Optimizar tiempo de espera (actualmente 2 segundos fijos)
- ⏳ Agregar más patrones de extracción si es necesario

---

**Estado:** ✅ Código corregido, listo para probar  
**Siguiente paso:** Ejecutar `node scripts/test-dynamic-pricing.js`
