# 🎯 AG-Integracion-Civitatis

**Fecha:** 03 de Febrero de 2026 - 23:40 CST  
**Versión:** v2.295  
**Actualizado por:** AntiGravity AI Assistant  
**Propósito:** Documentación de integración de Civitatis (modelo afiliado)

---

## 📌 RESUMEN

Integración de **Civitatis** como proveedor de tours y actividades usando el modelo de **afiliados** con enlaces personalizados.

**ID de Agencia:** `67114`

---

## 🎯 MODELO DE NEGOCIO

### Cómo Funciona

1. **Enlaces de Afiliado:** Todos los enlaces a Civitatis incluyen `?ag_aid=67114`
2. **Comisión:** Por todas las compras que haga el cliente durante **30 días**
3. **Sin API:** No se usa API oficial, solo enlaces directos
4. **Sin modificación de precios:** Los precios son los de Civitatis

### Mejores Prácticas (según Civitatis)

✅ Publicar enlaces en página web  
✅ Compartir en redes sociales  
✅ Hacer seguimiento a clientes por email  
✅ Enviar enlaces por WhatsApp cuando piden recomendaciones  
✅ Incluir enlaces en emails de confirmación de reservas

**Importante:** Comisionarás por **todas las compras** que haga el cliente durante 30 días, no solo la actividad específica.

---

## 🏗️ ARQUITECTURA DE LA SOLUCIÓN

### Opción Implementada: **Híbrido (Opción C)**

**Características:**
- Hero con buscador de destinos
- Grid de destinos principales (Roma, París, Madrid, etc.)
- Click en destino → abre Civitatis en nueva pestaña con `ag_aid`
- Botón "Ver todos los destinos" → abre página principal de Civitatis

**Ventajas:**
- ✅ Mantiene identidad visual de AS Operadora
- ✅ No hay problemas de iframe (CORS, cookies, etc.)
- ✅ Cliente ve precios y disponibilidad real de Civitatis
- ✅ Proceso de pago directo en Civitatis (más confianza)
- ✅ Fácil de mantener (no depende de cambios en HTML de Civitatis)

---

## 📂 ARCHIVOS CREADOS/MODIFICADOS

### Nuevos Archivos

| Archivo | Propósito |
|---------|-----------|
| `src/app/actividades/page.tsx` | Página principal de actividades |
| `migrations/024_add_civitatis_config.sql` | Migración para configuración |
| `scripts/run-migration-024.js` | Script para ejecutar migración |
| `docs/AG-Integracion-Civitatis.md` | Esta documentación |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `src/app/page.tsx` | Botón "Actividades" ahora redirige a `/actividades` |

---

## 🗄️ BASE DE DATOS

### Tabla: `app_settings`

**Nuevo registro:**
```sql
key: 'CIVITATIS_AGENCY_ID'
value: '67114'
description: 'ID de agencia de Civitatis para enlaces de afiliado'
category: 'integrations'
```

**Cómo obtener el valor:**
```typescript
const res = await fetch('/api/settings?keys=CIVITATIS_AGENCY_ID')
const data = await res.json()
const agencyId = data.settings?.CIVITATIS_AGENCY_ID // '67114'
```

---

## 🌐 ESTRUCTURA DE URLs

### URL Base
```
https://www.civitatis.com/es/?ag_aid=67114
```

### URLs de Destinos
```
https://www.civitatis.com/es/madrid/?ag_aid=67114
https://www.civitatis.com/es/roma/?ag_aid=67114
https://www.civitatis.com/es/paris/?ag_aid=67114
https://www.civitatis.com/es/nueva-york/?ag_aid=67114
```

### URL de Búsqueda
```
https://www.civitatis.com/es/buscar/?q=TERMINO&ag_aid=67114
```

### URL de Actividad Específica
```
https://www.civitatis.com/es/madrid/visita-guiada-madrid/?ag_aid=67114
```

---

## 🎨 DISEÑO DE LA PÁGINA

### Hero Section
- **Fondo:** Imagen de viajes/actividades
- **Overlay:** Gradiente oscuro para contraste
- **Título:** "Tours y Actividades"
- **Subtítulo:** "Descubre experiencias únicas..."
- **Buscador:** Input grande + botón "Buscar"

### Grid de Destinos (8 principales)
1. **Roma** - Italia (150+ actividades)
2. **París** - Francia (200+ actividades)
3. **Madrid** - España (120+ actividades)
4. **Barcelona** - España (180+ actividades)
5. **Nueva York** - USA (250+ actividades)
6. **Londres** - Reino Unido (220+ actividades)
7. **Cancún** - México (90+ actividades)
8. **Ciudad de México** - México (100+ actividades)

**Cada card incluye:**
- Imagen del destino
- Nombre + país
- Descripción breve
- Badge con número de actividades
- Rating (4.8 estrellas)
- Icono de link externo

### Sección de Beneficios
1. **Mejor Precio Garantizado** (verde)
2. **Cancelación Gratuita** (azul)
3. **Guías en Español** (morado)

---

## 🔧 FUNCIONES PRINCIPALES

### `getCivitatisUrl(destination?: string)`
Genera URL de Civitatis con ID de agencia.

```typescript
const getCivitatisUrl = (destination?: string) => {
  const baseUrl = "https://www.civitatis.com/es"
  const agencyParam = `?ag_aid=${civitatisAgencyId}`
  
  if (destination) {
    return `${baseUrl}/${destination}/${agencyParam}`
  }
  return `${baseUrl}/${agencyParam}`
}
```

### `handleSearch()`
Busca en Civitatis con término de búsqueda.

```typescript
const handleSearch = () => {
  if (searchQuery.trim()) {
    const searchUrl = `https://www.civitatis.com/es/buscar/?q=${encodeURIComponent(searchQuery)}&ag_aid=${civitatisAgencyId}`
    window.open(searchUrl, '_blank')
  }
}
```

### `handleOpenDestination(slug: string)`
Abre destino específico en nueva pestaña.

```typescript
const handleOpenDestination = (slug: string) => {
  const url = getCivitatisUrl(slug)
  window.open(url, '_blank')
}
```

---

## 🚀 DESPLIEGUE

### Checklist

- [x] Crear migración 024
- [x] Crear página `/actividades`
- [x] Actualizar botón en `page.tsx`
- [x] Actualizar versión a v2.295
- [ ] Ejecutar migración en Neon
- [ ] Commit a Git
- [ ] Push a GitHub
- [ ] Verificar en producción
- [ ] Actualizar `AG-Historico-Cambios.md`

### Comandos Git

```bash
cd "G:\Otros ordenadores\Mi PC\operadora-dev"
git add .
git commit -m "v2.295 - Integración Civitatis (Modelo Afiliado)"
git push origin main
```

---

## 📊 MÉTRICAS A MONITOREAR

1. **Clicks en destinos** - Google Analytics
2. **Conversiones** - Panel de Civitatis
3. **Comisiones generadas** - Panel de Civitatis
4. **Destinos más populares** - Analytics

---

## 🔮 PRÓXIMOS PASOS (Opcionales)

### Corto Plazo
- [ ] Agregar más destinos (50+)
- [ ] Categorías de actividades (museos, tours, gastronomía)
- [ ] Filtros por tipo de actividad

### Mediano Plazo
- [ ] Integración con API de Civitatis (si disponible)
- [ ] Mostrar actividades destacadas en homepage
- [ ] Newsletter con actividades recomendadas

### Largo Plazo
- [ ] Sistema de recomendaciones personalizadas
- [ ] Integración con itinerarios de AS Operadora
- [ ] Paquetes combinados (vuelo + hotel + actividades)

---

## 📝 NOTAS IMPORTANTES

### Ventajas del Modelo de Afiliado

✅ **Sin inventario:** No necesitas gestionar disponibilidad  
✅ **Sin riesgo:** Solo comisionas por ventas reales  
✅ **Sin soporte:** Civitatis maneja atención al cliente  
✅ **Actualización automática:** Precios y disponibilidad siempre actuales  
✅ **Confianza:** Civitatis es líder en el mercado hispanohablante

### Desventajas

❌ **Sin control de precios:** No puedes modificar tarifas  
❌ **Sin branding completo:** Cliente ve marca Civitatis  
❌ **Comisión variable:** Depende del tipo de actividad  
❌ **Sin datos de cliente:** No capturas email/teléfono directamente

---

## 🆘 TROUBLESHOOTING

### Problema: Enlaces no incluyen `ag_aid`
**Solución:** Verificar que `civitatisAgencyId` se carga correctamente desde `app_settings`.

### Problema: Destinos no abren
**Solución:** Verificar que `window.open()` no está bloqueado por popup blocker.

### Problema: No se registran comisiones
**Solución:** Verificar en panel de Civitatis que el `ag_aid` es correcto.

---

**Documento creado:** 03 de Febrero de 2026 - 23:40 CST  
**Versión:** v2.295  
**Propósito:** Documentación completa de integración Civitatis  
**Actualizar:** Al agregar nuevas funcionalidades o cambiar configuración
