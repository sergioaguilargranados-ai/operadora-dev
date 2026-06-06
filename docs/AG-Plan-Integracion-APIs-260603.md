# 🎯 AG-Plan-Integracion-APIs - AS Operadora

**Última actualización:** 03 de Junio de 2026 - 11:23 CST
**Versión actual:** v2.342
**Actualizado por:** AntiGravity AI Assistant
**Propósito:** Plan de Arquitectura e Integración de Proveedores (Vuelos y Hoteles)

Este documento detalla la arquitectura de integración y el plan de trabajo para los proveedores **Duffel (Vuelos)**, **Hotelbeds (Hoteles)** y **RateHawk (Hoteles)** en la plataforma **AS Operadora**.

El objetivo principal es establecer una estructura base **robusta y escalable** que permita agregar futuros proveedores fácilmente, aprovechando lo mejor de su tecnología (velocidad, contenido rico) y de la nuestra (Next.js, Neon DB, Vercel), unificando la experiencia para el usuario final.

## ⚠️ Aprobación Requerida del Usuario

> [!IMPORTANT]
> **Aprobación de la Arquitectura Adaptable**
> La arquitectura propuesta (Patrón Adaptador + Agregador) requiere una mayor inversión de tiempo inicial (crear interfaces genéricas y modelos unificados) en lugar de una integración directa rápida. Esto garantiza que a futuro agregar un cuarto o quinto proveedor sea muy rápido y ordenado. ¿Estás de acuerdo con el alcance y los tiempos estimados propuestos para este nivel de calidad?

## ❓ Preguntas Abiertas

1. **Visibilidad del Proveedor:** Al presentar resultados combinados de Hotelbeds y RateHawk, ¿Deseas que el cliente final vea qué proveedor está dando el precio, o debe ser 100% marca blanca (solo dice "Tarifa Disponible")?
2. **Caché Temporal (Búsquedas):** Las búsquedas de vuelos y hoteles suelen requerir caché para ser rápidas. ¿Podemos evaluar la inclusión de **Redis** (ej. Vercel KV o Upstash) para almacenar resultados de búsqueda de manera ultra rápida, o prefieres que usemos PostgreSQL (Neon) para guardar resultados temporales?
3. **Contenido Estático de Hoteles:** Tanto RateHawk (API de Contenido) como Hotelbeds ofrecen descargar todo su catálogo de hoteles (fotos, descripciones, amenidades). Para "aprovechar su tecnología", ¿descargamos su catálogo completo a nuestra base de datos para que la aplicación sea súper rápida al mostrar fotos, o consultamos su API en vivo cada vez que el usuario hace clic en un hotel? (Se recomienda descargar el catálogo estático e integrarlo).

## 🏗️ Arquitectura Propuesta (Agregador Multi-Proveedor)

Utilizaremos patrones de diseño estándar de la industria (Adaptador y Estrategia) para orquestar a los proveedores.

1. **Modelos Unificados (Modelos Core):** 
   Crearemos representaciones estandarizadas internas en AS Operadora para Vuelos (`Flight`), Hoteles (`Hotel`), Habitaciones (`Room`), Ofertas (`Offer`), y Reservas (`Booking`). El Frontend solo conocerá estos modelos genéricos.
2. **Adaptadores (Patrón Adaptador):**
   Cada proveedor (`AdaptadorDuffel`, `AdaptadorHotelbeds`, `AdaptadorRatehawk`) implementará una interfaz común (ej. `IProveedorHotel` o `IProveedorVuelo`). Su responsabilidad es traducir los datos del proveedor hacia nuestros Modelos Unificados.
3. **Servicios Agregadores:**
   Un servicio `AgregadorBusquedaHoteles` tomará los parámetros del usuario (ej: Cancún, 2 noches, 2 adultos) y disparará la búsqueda a todos los `IProveedorHotel` activos **en paralelo**. Luego, fusionará y ordenará los resultados (ej: eliminando duplicados si el mismo hotel lo venden Hotelbeds y RateHawk, y mostrando el precio más barato).

## 🛠️ Cambios Propuestos (Estructura de Código)

### 1. Interfaces y Tipos Unificados
#### [NUEVO] `src/core/interfaces/providers.ts`
- Definición de `IProveedorHotel` e `IProveedorVuelo`.

#### [NUEVO] `src/core/models/unified-travel.ts`
- Tipos de TypeScript: `HotelUnificado`, `VueloUnificado`, `OfertaUnificada`.

### 2. Capa de Adaptadores (Integración Específica)
#### [NUEVO] `src/services/providers/duffel/DuffelAdapter.ts`
- Implementa `IProveedorVuelo`. Utiliza el SDK de Node.js de Duffel y las credenciales proporcionadas.
#### [NUEVO] `src/services/providers/hotelbeds/HotelbedsAdapter.ts`
- Implementa `IProveedorHotel`. Lógica SHA256 de autenticación nativa y peticiones a la API de Reservas y Contenido.
#### [NUEVO] `src/services/providers/ratehawk/RatehawkAdapter.ts`
- Implementa `IProveedorHotel`. Integración con la API B2B de Ratehawk.

### 3. Capa de Agregación y Lógica de Negocio
#### [NUEVO] `src/services/aggregators/HotelAggregator.ts`
- Ejecuta Promesas en paralelo hacia Hotelbeds y Ratehawk, unifica y elimina hoteles duplicados (Deduplicación).
#### [NUEVO] `src/services/aggregators/FlightAggregator.ts`
- Coordina la búsqueda de vuelos, inicialmente solo apuntando a Duffel, pero preparado para más.

### 4. Base de Datos (Neon DB)
#### [NUEVO] `migrations/XXXX_create_unified_bookings.sql`
- Extendemos o creamos tablas para mapear una reserva (`booking`) en AS Operadora con múltiples referencias de proveedor (ej. si un viaje tiene vuelo de Duffel y hotel de RateHawk, unificarlos bajo un solo folio).
#### [NUEVO] `migrations/XXXX_create_hotel_content_cache.sql`
- (Opcional según respuesta) Tabla para almacenar la caché de información estática de los hoteles (Fotos, Descripciones) proveniente de la API de contenido.

---

## ⏱️ Cronograma y Estimación de Tiempos (Horas Hombre)

A continuación, se desglosa la estimación para presentar al cliente final. Se consideran tiempos para diseño arquitectónico, desarrollo, pruebas, y manejo de errores.

| Fase | Tarea / Entregable | Tiempo Estimado (HH) |
| :--- | :--- | :--- |
| **Fase 1** | **Arquitectura Core y Modelos Unificados**<br>- Diseño de interfaces y Base de Datos.<br>- Configuración de credenciales y entornos. | **15 - 20 hrs** |
| **Fase 2** | **Integración: Duffel (Vuelos)**<br>- Autenticación y Adaptador base.<br>- Flujo: Buscar, Cotizar, Reservar, Cancelar.<br>- Mapeo al formato AS Operadora. | **25 - 30 hrs** |
| **Fase 3** | **Integración: Hotelbeds (Hoteles)**<br>- Seguridad SHA256 / Certificados.<br>- Búsqueda en vivo (Disponibilidad en tiempo real).<br>- Flujo de reserva (API de Reservas). | **35 - 40 hrs** |
| **Fase 4** | **Integración: RateHawk (Hoteles)**<br>- Conexión API B2B.<br>- Integración de la API de Contenido (datos del hotel). | **30 - 35 hrs** |
| **Fase 5** | **Servicios Agregadores**<br>- Ejecución en paralelo Hotelbeds + Ratehawk.<br>- Lógica para eliminar hoteles duplicados.<br>- Caché de resultados (Redis/Postgres). | **20 - 25 hrs** |
| **Fase 6** | **Frontend y Flujo de Usuario**<br>- Interfaz dinámica de búsqueda (Vuelos y Hoteles).<br>- Integración con Módulo de Pagos existente.<br>- PDFs de confirmación actualizados. | **35 - 40 hrs** |
| **Fase 7** | **Control de Calidad (QA) y Pruebas**<br>- Pruebas unitarias de los adaptadores.<br>- Testeo de reservas simuladas (Entorno de Pruebas / Sandbox).<br>- Correcciones y afinación de tiempos de respuesta. | **20 - 25 hrs** |
| | | |
| **TOTAL** | **Estimación General del Proyecto** | **~180 a 215 Horas Hombre** |

## ✅ Plan de Verificación

### Pruebas Automatizadas
- Pruebas unitarias para verificar que cada Adaptador traduce correctamente el formato JSON de los proveedores a nuestro Modelo Unificado.
- Pruebas del Agregador de Hoteles para asegurar que las respuestas en paralelo no superen un tiempo límite de espera (ej: 8 segundos).

### Verificación Manual
1. Iniciar sesión usando los accesos provistos para validar la conexión a las consolas de desarrollo.
2. Realizar una búsqueda de hotel en la interfaz de AS Operadora → Verificar que los registros muestren consultas a Hotelbeds y Ratehawk.
3. Completar una reserva usando una tarjeta de prueba de Stripe → Verificar que se generen las Claves de Reserva reales en los paneles de entorno de pruebas (Sandbox) de Duffel/Hotelbeds/Ratehawk.
