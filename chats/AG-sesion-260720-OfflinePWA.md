# Resumen de Sesión: 20 de Julio de 2026 - Soporte Offline PWA

## ¿Qué se hizo?
1. **Service Worker (`src/app/sw.ts`)**:
   - Agregada estrategia `StaleWhileRevalidate` para caches de metadatos de viajes: `/api/bookings`, `/api/groups`, `/api/mobile/profile` y `/api/wishlist`.
   - Agregada estrategia `CacheFirst` para almacenamiento local de imágenes de Unsplash y archivos PDF/imágenes de Vercel Blob.
2. **Precarga Activa (`src/app/mobile/page.tsx`)**:
   - Implementado hook `useEffect` que detecta las reservas del usuario al cargar la Home de la PWA y realiza peticiones silenciosas de los itinerarios, grupos y el perfil de usuario. Esto asegura que la caché se descargue y almacene proactivamente mientras haya red.
3. **Compilación de versión**: Ejecutado `update-version.js` exitosamente.

## Archivos Modificados
- `src/app/sw.ts`
- `src/app/mobile/page.tsx`
