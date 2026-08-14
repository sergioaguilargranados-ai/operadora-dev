# Reporte Consolidado de Cambios y Modificaciones PWA
**Período:** A partir del [Commit 7b1de65](https://github.com/sergioaguilargranados-ai/operadora-dev/commit/7b1de65) hasta la versión actual (`v2.445`).

---

### 1. Perfil de Usuario & Gestión de Documentos
- **Perfil (Documentos):** Se removió la inyección automática del documento 'INE' por defecto cuando la base de datos no tiene documentos guardados. Ahora la lista se muestra limpia y los documentos eliminados no vuelven a aparecer al recargar.
- **Opción de Cambiar Contraseña en Perfil:** Se integró directamente un bloque para *"Cambiar contraseña"* con icono de candado (`<Lock />`) en la vista de Perfil (`/mobile/perfil`), permitiendo el acceso rápido para actualizar la clave en `/mobile/perfil/password`.

---

### 2. Gastronomía & Contenido de Itinerarios
- **Gastronomía en Itinerarios:** Respecto a las fotos de platillos que no coinciden al 100%, la mejor alternativa es configurar la generación directa de imagen mediante IA (DALL-E / Gemini Image) o afinar los términos de búsqueda con el nombre del platillo en inglés + país de origen en el motor de Pexels.
- **Remoción del Banner de Clima:** Se eliminó la tarjeta fija *"Clima aún no disponible"* en `WeatherForecast.tsx`. Ahora el componente se oculta de forma limpia (`null`) si el pronóstico no está disponible o es a más de 14 días.

---

### 3. Pantalla de Sitios Sugeridos & Sección de Ayuda
- **Nueva Pantalla "Sitios Sugeridos":** Se construyó la página `/mobile/actividades-sugeridas` con buscador de actividades, filtro por categorías (*Tours culturales*, *Aventura*, *Gastronomía*), tarjetas ilustradas y banner *"Ideal para hoy"*. Se excluyó explícitamente la sección *"Cerca de ti"* por indicación en los bocetos del cliente.
- **Conexión en Pantalla "Necesitas Ayuda":** Se vinculó la opción *"¿No sé qué actividades hacer?"* en la vista `/mobile/ayuda` para que dirija directamente a la nueva pantalla de `/mobile/actividades-sugeridas`.

---

### 4. Lógica de Viajes e Itinerario Activo
- **Auto-Selección de Viaje Próximo:** Se corrigió el flujo en `/mobile/itinerario/[id]` cuando el parámetro es `active`. Ahora busca dinámicamente la reserva futura más cercana. Si el usuario no tiene viajes, muestra un estado limpio en lugar de cargar hoteles o fechas falsas de prueba (*Grand Plaza Hotel*).
- **Estatus de Viajes:** Se corrigió la regla `isPast` en `/mobile/itinerario/page.tsx` para evitar que reservas sin fecha explícita se clasifiquen como pasadas en base a la fecha de creación.

---

### 5. Geolocalización & Integración con Mapa
- **Búsqueda por Geolocalización en Mapa:** Se agregó soporte para el parámetro `?q=` en `/mobile/mapa/page.tsx`. Al presionar *"Ver mapa"* desde cualquier actividad sugerida o itinerario, el mapa centra dinámicamente la cámara e inyecta un pin en la coordenada exacta mediante Google Maps Geocoder.

---

### 6. Rediseño del Menú Hamburguesa (Drawer Lateral)
- **Cenefa Superior en Negro:** Se cambió el encabezado superior del menú lateral desplegable en `/mobile/page.tsx` de azul (`bg-brand-primary`) a **negro (`bg-black`)**, manteniendo la línea predeterminada de diseño oscuro de la PWA.
- **Reordenamiento de Opciones bajo `VIAJES`:** Se actualizó el menú exactamente en el siguiente orden:
  1. Mis viajes (`/mobile/itinerario`)
  2. Itinerario (`/mobile/itinerario/active`)
  3. Pagos (`/mobile/pagos`)
  4. Crea tu grupo (`/mobile/viajes-grupales`)
  5. Tienda (`/mobile/tienda`)
  6. Wishlist (`/mobile/wishlist`)
  7. Mapa (`/mobile/mapa`)
  8. AS Rewards (`/mobile/rewards`)
  9. ¿Necesitas ayuda? (`/mobile/ayuda`)
- **Depuración del Menú:** Se removió la sección `CUENTA` del menú lateral desplegable.

---

### 7. Navegación y Memoria de Pestañas
- **Navegación Dinámica:** Se reemplazaron rutas fijas `router.push()` por `router.back()` en las cabeceras de itinerarios y detalles de día para evitar bucles.
- **Memoria de Pestaña en Itinerario:** Se implementó la sincronización de URL (`?tab=itinerario`) en la vista de itinerario. Al entrar al *Día 2* y dar retroceso (`router.back()`), la PWA **mantiene seleccionada la pestaña de *Itinerario*** en lugar de reiniciarse en *Resumen*.
- **Memoria de Pestaña en Pagos:** Se configuró la URL `?tab=pendientes` en `/mobile/pagos` para preservar el estado entre la lista de pagos realizados y saldos por realizar.

---

### 8. Folio de Referidos ("Crea tu grupo")
- **Manejo e Incremento de Folios:** Se documentó la arquitectura del código de referidos (`AS-{USER_ID}-{4_ALPHANUMERIC_RANDOM}`), almacenado en `users.referral_code` y procesado mediante el servicio `ReferralService.processPurchaseReward`.
