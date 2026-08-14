# 📅 Plan de Trabajo, Cronograma Gantt y Estimación de Esfuerzo (HH) - AS Operadora

**Cliente:** Sergio Aguilar Granados  
**Fecha de Emisión:** 14 de Agosto de 2026  
**Versión del Proyecto:** v2.468  
**Archivo Excel Generado:** [`docs/AG-Plan-De-Trabajo-Gantt-Entregas-2026.xlsx`](file:///g:/Otros%20ordenadores/Mi%20PC/operadora-dev/docs/AG-Plan-De-Trabajo-Gantt-Entregas-2026.xlsx)

---

## 🎯 **Resumen Ejecutivo del Plan de Trabajo**

El presente plan organiza en **cascada secuencial** las **9 Macro-Actividades de Entrega** solicitadas, estimando el esfuerzo en **Horas-Hombre (HH)**, la duración en días laborales y las fechas precisas de inicio y término para cada hito.

* **Fecha de Inicio:** 14 de Agosto de 2026
* **Duración Total Estimada:** 67 Días Laborables (aprox. 3.5 meses)
* **Esfuerzo Total Calculado:** 485 Horas-Hombre (HH)
* **Fecha de Finalización Total (Producción Viva):** 24 de Noviembre de 2026

---

## 📊 **Resumen por Macro-Actividades**

| # | Macro-Actividad | Descripción del Alcance | Esfuerzo (HH) | Duración (Días) | Fecha Inicio | Fecha Entrega | Fase de Entrega | Estado |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| **1** | **1. Flujo Básico Cliente App Móvil (PWA)** | Registro/Login (Google & Email), itinerario activo, perfil del viajero, tienda y pasarela de pago PWA. | **20 HH** | **2 días** | 14/08/2026 | **15/08/2026** | **Fase 1: MVP PWA** | 🟡 En Proceso (90%) |
| **2** | **2. Modificaciones Portal & Inconsistencias** | Alineación 100% entre PWA y Portal (`/perfil`, `/mis-reservas`, `/reserva/[id]`), vouchers PDF y facturación CFDI 4.0. | **32 HH** | **4 días** | 17/08/2026 | **20/08/2026** | **Fase 1: MVP Portal** | ⚪ Pendiente |
| **3** | **3. Modificación Panel de Agencias** | Ajustes visuales y funcionales a `/dashboard/agency` (Overview, Clientes, CRM Kanban, Ventas, White-Label). | **40 HH** | **5 días** | 21/08/2026 | **27/08/2026** | **Fase 2: Agencias** | ⚪ Pendiente |
| **4** | **4. Modificación Panel de Empresas** | Ajustes a `/dashboard/corporate` (Directorio Empleados, Control Gastos, CO2, Aprobaciones, Políticas corporativas). | **35 HH** | **5 días** | 28/08/2026 | **03/09/2026** | **Fase 2: Empresas** | ⚪ Pendiente |
| **5** | **5. Reestructuración de Menú & Depuración** | Rediseño final de `PortalSidebar.tsx`, depuración de opciones obsoletas e integración total de vistas CRM/RRHH/Tienda. | **24 HH** | **3 días** | 04/09/2026 | **08/09/2026** | **Fase 2: Intranet** | ⚪ Pendiente |
| **6** | **6. Conversión PWA a App Nativa (iOS/Android)** | Migración a Expo / React Native / Capacitor, empaquetado APK/IPA, Push Notifications nativas (FCM/APNs) y Stores. | **64 HH** | **8 días** | 09/09/2026 | **18/09/2026** | **Fase 3: App Nativa** | ⚪ Pendiente |
| **7** | **7. Productos Complementarios No Desarrollados** | Desarrollo modular de 8 motores: Traslados, Autos, Seguros, eSIM, Paquetes, Cruceros, TourMundial y Parques. | **195 HH** | **25 días** | 21/09/2026 | **26/10/2026** | **Fase 4: Productos** | ⚪ Pendiente |
| **8** | **8. Gestión de Claves & Cuentas Proveedores** | Migración de credenciales Sandbox a Producción (Amadeus, Duffel, Hotelbeds, Stripe, SendGrid, Apple, Google). | **30 HH** | **5 días** | 27/10/2026 | **02/11/2026** | **Transversal** | ⚪ Pendiente |
| **9** | **9. Migración a Producción Fase a Fase** | Pase a producción por bloques con rollback plan, pruebas de carga y liberación final en vivo. | **45 HH** | **15 días** | 03/11/2026 | **24/11/2026** | **Producción Final** | ⚪ Pendiente |
| | **TOTAL PROYECTO** | **9 Macro Actividades Integrales** | **485 HH** | **67 Días** | **14/08/2026** | **24/11/2026** | **4 Fases Principales** | |

---

## 🗓️ **Cronograma Gantt Detallado por Tareas (WBS)**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ SEMANAS   │ AGOSTO              │ SEPTIEMBRE          │ OCTUBRE             │ NOVIEMBRE           │
│ ACTIVIDAD │ S2  S3  S4          │ S1  S2  S3  S4      │ S1  S2  S3  S4      │ S1  S2  S3  S4      │
├───────────┼─────────────────────┼─────────────────────┼─────────────────────┼─────────────────────┤
│ 1. PWA    │ █                   │                     │                     │                     │
│ 2. Portal │     █               │                     │                     │                     │
│ 3. Agency │         █           │                     │                     │                     │
│ 4. Corp   │             █       │ █                   │                     │                     │
│ 5. Sidebar│                     │ █                   │                     │                     │
│ 6. Nativa │                     │     █   █           │                     │                     │
│ 7. Prods  │                     │             █       │ █   █   █   █       │                     │
│ 8. Claves │                     │                     │                 █   │                     │
│ 9. Deploy │                     │                     │                     │ █   █   █   █       │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### **Desglose de Subtareas:**

#### **1. Completar flujo básico de cliente que se registra y opera en la app móvil (PWA)**
* **1.1** Registro/Login con Google OAuth y Email en PWA `(4 HH | 14/Ago - 14/Ago)`
* **1.2** Perfil de viajero y gestión de itinerario activo `(6 HH | 14/Ago - 14/Ago)`
* **1.3** Pasarela de pago Tienda / Viajes con sesión inyectada `(6 HH | 15/Ago - 15/Ago)`
* **1.4** Pruebas end-to-end de reserva y soporte offline PWA `(4 HH | 15/Ago - 15/Ago)`

#### **2. Modificar en el Portal y corregir inconsistencias del flujo del cliente final**
* **2.1** Alineación de datos `/perfil` y `/mis-reservas` con PWA `(8 HH | 17/Ago - 17/Ago)`
* **2.2** Corrección de flujo de estados de reserva (Pendiente/Pagado) `(8 HH | 18/Ago - 18/Ago)`
* **2.3** Generación de vouchers PDF de itinerario y recibos `(8 HH | 19/Ago - 19/Ago)`
* **2.4** Validación final de timbrado y facturación CFDI 4.0 `(8 HH | 20/Ago - 20/Ago)`

#### **3. Modificar el Panel de Agencias conforme a prototipos**
* **3.1** Ajustes a Overview `/dashboard/agency` (KPIs y Recharts) `(8 HH | 21/Ago - 21/Ago)`
* **3.2** Directorio de Clientes y Agentes con acciones rápidas `(8 HH | 24/Ago - 24/Ago)`
* **3.3** CRM Pipeline Kanban (`/dashboard/agency/crm`) `(10 HH | 25/Ago - 26/Ago)`
* **3.4** Configuración White-Label y Pasarela Stripe por tenant `(14 HH | 26/Ago - 27/Ago)`

#### **4. Modificar el Panel de Empresas conforme a prototipos**
* **4.1** Directorio Empleados y Control de Gastos por departamento `(10 HH | 28/Ago - 31/Ago)`
* **4.2** Métricas de CO2 DEFRA y Aprobaciones de viajes corporativos `(10 HH | 01/Sep - 02/Sep)`
* **4.3** Políticas de viaje y métodos de pago corporativos `(15 HH | 02/Sep - 03/Sep)`

#### **5. Modificar el Menú Sidebar para incrustar opciones solicitadas y depurar anteriores**
* **5.1** Rediseño completo de `PortalSidebar.tsx` en Intranet Layout `(10 HH | 04/Sep - 07/Sep)`
* **5.2** Incrustación de opciones solicitadas y depuración obsoleta `(14 HH | 07/Sep - 08/Sep)`

#### **6. Todo el PWA pasarlo a una app nativa (iOS / Android)**
* **6.1** Setup de proyecto Expo / React Native / Capacitor `(12 HH | 09/Sep - 10/Sep)`
* **6.2** Adaptación de vistas PWA a componentes nativos `(20 HH | 11/Sep - 14/Sep)`
* **6.3** Notificaciones Push Nativas (FCM / APNs) y Geolocalización `(16 HH | 15/Sep - 16/Sep)`
* **6.4** Empaquetado APK/IPA y pruebas en emuladores/dispositivos reales `(16 HH | 17/Sep - 18/Sep)`

#### **7. Agregar uno a uno los demás productos no desarrollados**
* **7.1** Motor de Traslados (Transfers Aeropuerto-Hotel) `(20 HH | 21/Sep - 23/Sep)`
* **7.2** Motor de Renta de Autos (Hertz/Avis) `(22 HH | 24/Sep - 28/Sep)`
* **7.3** Cotizador de Seguros de Viaje / Asistencia Médica `(18 HH | 29/Sep - 30/Sep)`
* **7.4** Proveedor eSIM Internacional (Planes de datos QR) `(20 HH | 01/Oct - 05/Oct)`
* **7.5** Motor de Paquetes Dinámicos (Vuelo+Hotel) `(30 HH | 06/Oct - 09/Oct)`
* **7.6** Motor de Cruceros (Royal Caribbean/MSC) `(32 HH | 12/Oct - 15/Oct)`
* **7.7** Integración Catálogo TourMundial `(25 HH | 16/Oct - 20/Oct)`
* **7.8** Boletaje Entradas Parques (Disney/Universal/Xcaret) `(28 HH | 21/Oct - 26/Oct)`

#### **8. Comenzar la gestión de claves de operadora para todos los proveedores**
* **8.1** Configuración de credenciales de producción Amadeus & Duffel `(6 HH | 27/Oct - 27/Oct)`
* **8.2** Activación de cuentas B2B Live Hotelbeds / RateHawk `(6 HH | 28/Oct - 28/Oct)`
* **8.3** Switch a claves Live Stripe, PayPal, MercadoPago & Facturama `(6 HH | 29/Oct - 29/Oct)`
* **8.4** Verificación DNS de correo SendGrid (SPF, DKIM, DMARC) `(6 HH | 30/Oct - 30/Oct)`
* **8.5** Cuentas Desarrollador Apple Developer & Google Play Console `(6 HH | 02/Nov - 02/Nov)`

#### **9. Migración a Producción Fase a Fase**
* **9.1** **Fase 1:** Despliegue PWA + Portal Cliente + Venta Vuelos/Hoteles/Tours `(10 HH | 03/Nov - 06/Nov)`
* **9.2** **Fase 2:** Despliegue Panel Agencias + Panel Empresas + CRM + Facturación `(10 HH | 09/Nov - 12/Nov)`
* **9.3** **Fase 3:** Publicación de App Nativa en Apple App Store & Google Play Store `(15 HH | 13/Nov - 18/Nov)`
* **9.4** **Fase 4:** Despliegue de Productos Complementarios y Cierre de Proyecto `(10 HH | 19/Nov - 24/Nov)`

---

## 🏁 **Matriz de Liberaciones por Fases**

| Fase de Entrega | Rango de Fechas | Duración | Hito / Entregable Clave | Criterios de Aceptación |
|---|---|:---:|---|---|
| **FASE 1: MVP PWA & Portal Cliente** | 14/08/2026 - 20/08/2026 | 6 Días | **Cliente Final Funcional** | El cliente se registra, explora itinerario, reserva, paga y factura sin fricción. |
| **FASE 2: Intranet Agencias & Empresas** | 21/08/2026 - 08/09/2026 | 13 Días | **Portales B2B & B2E Completos** | Agencias operan su CRM y comisiones; empresas aprueban viajes y controlan gastos. |
| **FASE 3: App Nativa iOS / Android** | 09/09/2026 - 18/09/2026 | 8 Días | **Binarios APK/IPA para Tiendas** | Instalación directa en teléfonos y subida a Apple App Store y Google Play. |
| **FASE 4: Productos Complementarios** | 21/09/2026 - 26/10/2026 | 25 Días | **Catálogo Turístico Completo** | 8 nuevos productos cotizando (Traslados, Autos, Seguros, eSIM, Cruceros, etc.). |
| **DESPLIEGUE FINAL PRODUCCIÓN** | 27/10/2026 - 24/11/2026 | 20 Días | **Plataforma Live 100% Operativa** | Producción real con pasarelas de pago productivas y proveedores live. |
