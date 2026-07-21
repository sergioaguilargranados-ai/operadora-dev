# 📋 Documento de Traspaso Master: v2.426
**Fecha:** 21 de Julio de 2026 - 15:10 CST  
**Versión de Compilación:** v2.426  
**Autor:** AntiGravity AI Assistant  

Este documento tiene como propósito transferir el contexto completo del trabajo realizado durante los últimos 3 días al siguiente agente AntiGravity. Se detalla la consolidación del release **`v2.426`** de la PWA de AS Operadora.

---

## 🎯 Resumen Ejecutivo del Release (`v2.426`)
En este bloque se consolidaron mejoras en los flujos principales de la aplicación móvil (PWA) e integraciones de marca blanca en el portal web, enfocadas en la experiencia del viajero, consistencia estética y robustez sin conexión.

---

## 🛠️ Cambios y Características Desarrolladas (Últimos 3 Días)

### 1. Menú Hamburguesa y Ajustes de Perfil
- **Menú Lateral (`/mobile`)**: Se rediseñó el panel lateral agrupando las opciones en categorías claras (`VIAJES`, `CUENTA`, `INFORMACIÓN LEGAL`, `CONFIGURACIÓN`), con un encabezado de fondo negro para el avatar de usuario y un botón de cierre de sesión negro.
- **Ajustes de Perfil (`/mobile/perfil`)**:
  - Se corrigió el color del ícono de la campana a blanco (`text-white`) para hacerlo visible.
  - Se corrigió el desbordamiento de pantalla en la lista de documentación aplicando truncado de URLs y extrayendo el nombre limpio del archivo para que los botones de eliminar/descargar no se salgan de la pantalla.
- **Filtro de Retos (`/mobile/rewards`)**: Se excluyó el paso de "Regístrate en la APP" de la pestaña de AS Retos para usuarios logueados.

### 2. Pestañas de Detalle de Itinerario (`/mobile/itinerario/[id]`)
Se transformó el componente de visualización vertical de días en una estructura moderna con tres pestañas segmentadas:
- **Resumen**: 
  - Cabecera con imagen hero, badge flotante de tiempo restante (ej. `⏳ En 45 días` o `✅ Completado`).
  - Tarjeta de resumen con grid de 4 datos clave: Duración, Alojamientos, Pasajeros y Código de Reserva.
  - Línea de tiempo "Próximos pasos" (Pago, Documentos, Check-in, Viaje) interactiva y reactiva.
  - Lista de Hoteles del viaje con fotos e intervalos de hospedaje.
- **Itinerario**: Mapea la ruta de viaje con flechas de avance de ciudades y el colapsable día a día.
- **Documentos**:
  - *Personales*: Conectados con los documentos cargados en el perfil del usuario (Pasaporte, INE, Visa). Muestra badge verde **Vigente** para verlos en línea, o naranja **Pendiente** con redirección directa al perfil para subirlos.
  - *De Viaje*: Botón con simulación de descarga directa de tiquetes de vuelos, reservas de hotel, seguros de viaje y PDF del itinerario.

### 3. Compartir Invitaciones y Modales (`/mobile/viajes-grupales` y `/mobile/wishlist`)
- **Wishlist Modal (`/mobile/wishlist`)**: Formulario para agregar souvenirs preferidos, conectándose con `/api/wishlist` y con subida asíncrona de fotos a Vercel Blob.
- **Compartir Invitaciones**: Rediseño de la pantalla "Crea tu grupo" sustituyendo el botón simple por el flujo de invitación de AS Rewards. Muestra el código de referido del usuario (`referralData?.referral_code`) y botones circulares de redes sociales (WhatsApp, Facebook, Instagram y Copiar Enlace) apuntando a la URL `/registro?ref=[CODE]`.

### 4. Soporte de Marca Blanca e Identidad (`/registro` y `/login`)
- Se reemplazaron todas las referencias fijas de "AS Club" a **"AS Rewards"**.
- Se consumió el contexto de marca blanca (`useWhiteLabel`), personalizando títulos y textos informativos con el nombre dinámico del Tenant (`companyName`).
- Los botones de envío en el portal se pintan reactivamente usando la variable de color CSS `--brand-primary` inyectada en `:root` por el componente `BrandStyles`.

### 5. Soporte Offline y Precarga
- **Service Worker (`src/app/sw.ts`)**: Se configuraron estrategias `StaleWhileRevalidate` para caches críticas de JSON (`/api/bookings`, `/api/groups`, `/api/mobile/profile`, `/api/wishlist`) y `CacheFirst` para archivos estáticos y assets multimedia externos (`images.unsplash.com` y `vercel-storage.com`).
- **Prefetch Silencioso (`src/app/mobile/page.tsx`)**: Al ingresar al inicio con internet, la app descarga en segundo plano los itinerarios y perfil del usuario, garantizando acceso offline instantáneo.

---

## 📂 Directorio de Archivos Modificados
- `src/app/sw.ts` - Configuración de caché del Service Worker.
- `src/app/mobile/page.tsx` - Menú hamburguesa lateral y prefetch silencioso.
- `src/app/mobile/perfil/page.tsx` - Visualización de campana y truncado de URLs de documentos.
- `src/app/mobile/rewards/page.tsx` - Retos filtrados.
- `src/app/mobile/wishlist/page.tsx` - Modal para añadir souvenirs con subida de fotos.
- `src/app/mobile/viajes-grupales/page.tsx` - Rediseño con tarjeta de invitaciones y compartir en redes.
- `src/app/mobile/itinerario/[id]/page.tsx` - Nueva vista segmentada por pestañas (Resumen, Itinerario, Documentos).
- `src/app/registro/page.tsx` y `src/app/login/page.tsx` - Marca blanca e inyección de estilos de color y nombre del Tenant.
- `docs/AG-Historico-Cambios.md` - Actualización de control de versiones.

---

## 💡 Instrucciones para el Próximo Agente
1. **Comprobar la versión**: El script actualizador de versiones aplicó globalmente la versión `v2.426`. Si realizas cualquier cambio posterior menor, incrementa con sub-versiones (ej. `v2.426b`) o a `v2.427` para releases mayores usando: `node scripts/update-version.js v2.42X`.
2. **Caché en el navegador**: Durante pruebas locales en la PWA, si no ves algún cambio inmediatamente, ve a DevTools -> Application -> Service Workers y activa **Update on reload** o limpia el storage. El Service Worker cachea de manera agresiva por diseño offline.
3. **Persistencia de base de datos**: Los registros del usuario (incluyendo wishlist, invitaciones y firmas de perfil) se comunican directamente a PostgreSQL (Neon Cloud) a través de los endpoints de la API de Next.js.
