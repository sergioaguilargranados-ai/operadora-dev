# 🔍 ACLARACIÓN IMPORTANTE - v2.257

**Fecha:** 31 Ene 2026 - 19:35 CST  
**Commit:** `cbdca9f`

---

## ⚠️ IMPORTANTE: Confusión de Páginas

### Las imágenes que compartiste son de `/tours`, NO de `/` (página principal)

**Imagen 1:** Muestra la página `/tours` (Tours y Viajes Grupales)  
**Imagen 2:** Muestra el error del mapa en `/tours/[code]` (detalle de tour)

---

## 📍 UBICACIÓN DEL BUSCADOR

El **buscador que agregamos** está en la **PÁGINA PRINCIPAL** (`/`), NO en `/tours`.

### Para ver el buscador:
1. Ve a la **página principal**: `https://app.asoperadora.com/`
2. Scroll hacia abajo hasta la sección **"Ofertas en Tours y Viajes Grupales"**
3. Ahí verás el buscador debajo del título

---

## 🎬 PROBLEMA DEL VIDEO EN `/tours`

**Síntoma:** El video aparece negro en la página `/tours`

**Causa:** El código está correcto. El problema es que:
- `videoUrl` tiene un valor por defecto de una imagen de Unsplash
- La imagen debería mostrarse como fondo
- Si aparece negro, puede ser un problema de carga de la imagen o de la configuración en la base de datos

**Solución temporal:**
El video/imagen de fondo se carga desde la configuración `TOURS_PROMO_VIDEO_URL` en la base de datos. Si está vacío o incorrecto, usa el valor por defecto.

**Para verificar:**
```sql
SELECT * FROM settings WHERE key = 'TOURS_PROMO_VIDEO_URL';
```

---

## 🗺️ ERROR DEL MAPA

**Síntoma:** "Google Maps Platform rejected your request. This API is not activated on your API project."

**Causa:** La API "Maps Embed API" no está habilitada en Google Cloud Console

**Solución:** Habilitar "Maps Embed API" en Google Cloud Console:
1. https://console.cloud.google.com/
2. APIs & Services > Library
3. Buscar "Maps Embed API"
4. Click "Enable"

---

## ✅ CAMBIOS APLICADOS

### 1. Cenefa py-10 ✅
- **Archivo:** `src/app/tours/[code]/page.tsx`
- **Cambio:** `py-8` → `py-10` (40px de padding vertical)
- **Estado:** DESPLEGADO

### 2. Buscador SIEMPRE visible ✅
- **Ubicación:** Página principal `/` (NO en `/tours`)
- **Estado:** DESPLEGADO
- **Para verlo:** Ve a `/` y scroll hasta "Ofertas en Tours y Viajes Grupales"

### 3. Mapa interactivo ⚠️
- **Estado:** Requiere habilitar API en Google Cloud Console
- **API Key:** `AIzaSyDc8NB8nvcbY2OTv6Dcvzm7AwAbV7tPgF0`

---

## 🎯 PRÓXIMOS PASOS

### 1. Verificar buscador en página principal
- Ve a `https://app.asoperadora.com/` (página principal)
- Scroll hasta "Ofertas en Tours y Viajes Grupales"
- Verifica que el buscador esté visible

### 2. Arreglar video en `/tours`
- Verificar configuración `TOURS_PROMO_VIDEO_URL` en base de datos
- Si está vacío, agregar una URL de video de YouTube o imagen

### 3. Habilitar Google Maps API
- Seguir instrucciones arriba para habilitar "Maps Embed API"

---

## 📋 RESUMEN

| Problema | Estado | Ubicación |
|----------|--------|-----------|
| Buscador no aparece | ✅ SÍ APARECE | Página principal `/` |
| Video negro | ⚠️ Verificar config | Página `/tours` |
| Mapa con error | ⚠️ Habilitar API | Detalle tour `/tours/[code]` |
| Cenefa altura | ✅ py-10 | Detalle tour `/tours/[code]` |

---

**IMPORTANTE:** El buscador está en la **página principal** (`/`), NO en la página de tours (`/tours`). Las imágenes que compartiste son de `/tours`, por eso no se ve el buscador ahí.
