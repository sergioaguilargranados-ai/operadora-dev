# 📊 AG-Plan-Trabajo-Y-Reporte-Avances-2026

**Cliente:** Sergio Aguilar Granados  
**Proyecto:** AS Operadora de Viajes y Eventos (Portal Web & App Móvil PWA)  
**Fecha de Emisión:** 01 de Agosto de 2026  
**Documento Generado:** `c:\operadora-dev\docs\AG-Plan-Trabajo-Y-Reporte-Avances-2026.xlsx`  

---

## 📌 RESUMEN EJECUTIVO DE ESFUERZO (HORAS HOMBRE - HH)

| Concepto de Etapa | Rango de Fechas | Tareas | Horas Hombre (HH) | Porcentaje (%) | Estado en Cliente |
|-------------------|-----------------|--------|-------------------|----------------|-------------------|
| **1. Trabajo Completado Previo** | 09/Jul/2026 - 26/Jul/2026 | 8 | **280 HH** | **32.5%** | Completado y Liberado |
| **2. Reestructuración Portal & PWA (Fases 1-8)** | 27/Jul/2026 - 01/Ago/2026 | 18 | **311 HH** | **36.1%** | **En Pruebas (Entrega: 05/Ago \| Término: 11/Ago)** |
| **3. Módulos Pendientes / Roadmap Futuro** | Por definir | 10 | **270 HH** | **31.4%** | Pendiente sin fecha |
| **TOTAL GENERAL PROYECTO** | **09/Jul/2026 - Futuro** | **36** | **861 HH** | **100.0%** | **Plan General AS Operadora** |

---

## 🚀 ETAPA 2: TAREAS EN CONSTRUCCIÓN Y PRUEBAS (INICIADAS DEL 27 DE JULIO AL 01 DE AGOSTO DE 2026)

> 📅 **Hito 1 - Fecha de Entrega a Pruebas:** Miércoles, 05 de Agosto de 2026  
> 📅 **Hito 2 - Término de Pruebas y Ajustes:** Martes, 11 de Agosto de 2026  

| # | Módulo / Componente | Descripción de la Funcionalidad | Esfuerzo (HH) | Estado | Entrega Pruebas | Término Pruebas |
|---|---------------------|---------------------------------|---------------|--------|-----------------|-----------------|
| 1 | **Menú Sidebar Unificado** | Reestructuración de `PortalSidebar.tsx` en `PortalIntranetLayout` con 12+ submenús (CRM, Cotizaciones, RRHH, Tienda, Empresas, Pagos, Admin, Moderación) con alto contraste `text-white` activo. | 18 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 2 | **Rediseño Hero Landing** | Carrusel de imágenes rotativas de destinos (Cancún, Madrid, París, Tokio, Roma) con paginación `- - -`, título *"Viaja más allá de lo extraordinario"*, subtítulo y botón `Explorar destinos >`. | 14 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 3 | **Perfil de Usuario (`/perfil`)** | Vista `/perfil` con eye-toggle de contraseña, usuarios vinculados con roles (Admin/Invitado), y listado de dispositivos activos. | 16 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 4 | **Mis Reservas (`/mis-reservas`)** | Vista `/mis-reservas` con tarjetas de reserva (código AS-XXXX), estado con badge de color y botones dinámicos `[Pagar]`, `[Facturar]`, `[Contactar]`. | 16 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 5 | **Centro de Ayuda & Prepara tu Viaje** | Vista `/ayuda` y `/ayuda/prepara-tu-viaje` con tarjetas de soporte, recomendador de canal 24/7 (WhatsApp, Email, Teléfono) e imagen Hero. | 12 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 6 | **Facturación SAT CFDI (`/facturacion`)** | Vista `/facturacion` con wizard de 4 pasos (Concepto → Datos Fiscales → Previsualización → Descarga), dashboard KPI y selector de rango de fechas. | 18 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 7 | **Panel Agencias Overview (`/dashboard/agency`)** | Vista `/dashboard/agency` con KPIs (Venta total, comisiones, agencias activas), Viajes Próximos, Top Destinos, Rendimiento y directorio de clientes y agentes. | 22 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 8 | **CRM & Pipeline Kanban (`/dashboard/agency/crm`)** | Vista `/dashboard/agency/crm` con pipeline visual de 5 columnas (Prospecto, Contactado, Cotizado, Ganado, Perdido) y métricas comerciales. | 24 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 9 | **Ventas & Reportes (`/dashboard/agency/ventas`)** | Vista `/dashboard/agency/ventas` con LineChart diario de ventas y Donut chart por tipo de producto (Hoteles, Vuelos, Tours, etc.) + exportación Excel. | 16 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 10 | **Configuración Agencia & White-Label** | Vista `/dashboard/agency/configuracion` con 6 pestañas (Detalles, AS AI Assistant, Apariencia Marca Blanca, Suscripción, Stripe, Legal). | 18 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 11 | **Panel de Empresas (`/dashboard/corporate`)** | Vista `/dashboard/corporate` con 7 pestañas: Resumen (KPIs/Recharts), Empleados, Control Gastos, Métricas CO2 DEFRA 2024, Aprobaciones, Políticas y Métodos de pago. | 32 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 12 | **Plantillas de Correo Institucional** | Módulo `EmailTemplates.ts` con generador HTML de correos con membrete AS Operadora, resumen 2 columnas, CTA y footer corporativo. | 14 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 13 | **Control Inactividad & Timeout Sesión** | Módulo `AuthContext.tsx` con timer de 60 min de inactividad, aviso modal flotante a los 55 min y auto-logout a `/login?expired=1`. | 12 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 14 | **Banco de Imágenes (Pixabay API)** | Integración de Pixabay API en `DestinationContentService.ts` dentro de la cascada `Pexels → Pixabay → Unsplash → Wikipedia`. | 10 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 15 | **Integraciones Actividades & Tours** | Adapters `BigBusAdapter`, `ViatorAdapter`, `GetYourGuideAdapter` y `CivitatisAdapter v2` registrados en `ActivityAggregator.ts`. | 26 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 16 | **Productos de la Tienda (`/dashboard/store`)** | Vista `/dashboard/store` reestructurada dentro de `PortalIntranetLayout` con carga/edición de catálogo y modal de alta de productos. | 14 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 17 | **Cotizaciones (`/dashboard/quotes`)** | Vista `/dashboard/quotes` integrada dentro de `PortalIntranetLayout` con creador de cotizaciones, descarga PDF y envío por WhatsApp/Email. | 16 HH | En Pruebas | 05/08/2026 | 11/08/2026 |
| 18 | **Recursos Humanos RRHH (`/dashboard/rrhh`)** | Vista `/dashboard/rrhh` integrada con submenús en el sidebar (Empleados, Asistencia, Licencias, Nómina, Reclutamiento, Contratos, Docs). | 20 HH | En Pruebas | 05/08/2026 | 11/08/2026 |

---

## 🛠️ ETAPA 1: TRABAJO COMPLETADO Y LIBERADO PREVIAMENTE (09 DE JULIO AL 26 DE JULIO DE 2026)

| # | Módulo / Componente | Descripción de la Funcionalidad | Esfuerzo (HH) | Estado | Fecha Finalizado |
|---|---------------------|---------------------------------|---------------|--------|------------------|
| 19 | **Integración Amadeus GDS API** | Conexión con API Amadeus para reservas de vuelos y hoteles en tiempo real (`AmadeusAdapter.ts`). | 45 HH | Completado | 15/07/2026 |
| 20 | **Integración Hotelbeds API** | Conexión con motor de inventario hotelero global Hotelbeds (`HotelbedsAdapter.ts`). | 38 HH | Completado | 18/07/2026 |
| 21 | **Integración Duffel Flights API** | Motor de búsqueda y emisión de boletos aéreos NDC con Duffel (`DuffelAdapter.ts`). | 35 HH | Completado | 20/07/2026 |
| 22 | **Integración Stripe Checkout & Webhooks** | Procesamiento de pagos seguros con tarjeta de crédito/débito y webhooks de confirmación (`/api/webhooks/stripe`). | 30 HH | Completado | 22/07/2026 |
| 23 | **Pasarela MercadoPago & PayPal** | Integración de pagos secundarios MercadoPago y PayPal SDK (`/api/payments/mercadopago`). | 25 HH | Completado | 23/07/2026 |
| 24 | **Scraping & Sync MegaTravel** | Servicio automático de sincronización de catálogo de tours grupales MegaTravel (`MegaTravelSyncService.ts`). | 32 HH | Completado | 24/07/2026 |
| 25 | **PWA App Móvil Manifest & Service Worker** | Configuración de manifest PWA, Service Worker offline (`/sw.js`), notificaciones push y layout móvil (`/mobile`). | 40 HH | Completado | 25/07/2026 |
| 26 | **Sistema Multi-tenant Marca Blanca** | Arquitectura White-Label para agencias independientes y marcas blancas (`WhiteLabelContext.tsx`). | 35 HH | Completado | 26/07/2026 |

---

## 📋 ETAPA 3: MÓDULOS PENDIENTES / ROADMAP FUTURO (SIN FECHA ASIGNADA)

| # | Módulo / Componente | Descripción | Esfuerzo Est. (HH) | Estado | Fecha Asignada |
|---|---------------------|-------------|--------------------|--------|----------------|
| 27 | **Buscador de Hoteles Avanzado** | Motor con mapa interactivo Leaflet/Google Maps, filtros de amenidades, cancelación gratis y políticas corporativas. | 35 HH | Pendiente | Sin fecha |
| 28 | **Buscador de Vuelos Avanzado** | Filtros por escalas, aerolíneas, selección de asientos en mapa 3D y combinación de tarifas ida/vuelta. | 40 HH | Pendiente | Sin fecha |
| 29 | **Motor de Traslados Aeropuerto-Hotel** | Cotizador de transfers privados, compartidos y VIP con selección de tipo de vehículo. | 20 HH | Pendiente | Sin fecha |
| 30 | **Motor de Renta de Autos** | Integración con rental cars (Hertz, Avis, Budget) con seguros incluidos. | 22 HH | Pendiente | Sin fecha |
| 31 | **Cotizador de Seguros de Viaje** | Cotización instantánea de asistencia médica y cobertura de equipaje por días y cobertura geográfica. | 18 HH | Pendiente | Sin fecha |
| 32 | **Proveedor E-Sim Internacional** | Selección de planes de datos e-SIM internacionales por país/región con código QR instantáneo. | 20 HH | Pendiente | Sin fecha |
| 33 | **Motor de Paquetes Dinámicos (Vuelo + Hotel)** | Algoritmo de empaquetamiento dinámico con descuento automático por paquete. | 30 HH | Pendiente | Sin fecha |
| 34 | **Motor de Cruceros** | Catálogo de navieras (Royal Caribbean, MSC, Carnival) con itinerarios de puertos y cabinas. | 32 HH | Pendiente | Sin fecha |
| 35 | **Módulo de Conexión TourMundial** | Scraper / API adapter para catálogo de viajes grupales TourMundial (pendiente de credenciales). | 25 HH | Pendiente | Sin fecha |
| 36 | **Reservas Disney / Universal / Xcaret** | Integración de parques temáticos y experiencias oficiales con boletaje digital. | 28 HH | Pendiente | Sin fecha |
