# 📅 Plan de Trabajo Acelerado, Cronograma Gantt y Estimación de Esfuerzo (HH) - AS Operadora

**Cliente:** Sergio Aguilar Granados  
**Fecha de Emisión:** 14 de Agosto de 2026  
**Versión del Proyecto:** v2.480  
**Modalidad de Trabajo:** Sprint Acelerado (Tiempos reducidos a 1/4 + Fase 3 App Nativa en Paralelo)  
**Archivo Excel Generado:** [`docs/AG-Plan-De-Trabajo-Gantt-Entregas-2026.xlsx`](file:///g:/Otros%20ordenadores/Mi%20PC/operadora-dev/docs/AG-Plan-De-Trabajo-Gantt-Entregas-2026.xlsx)

---

## 🎯 **Resumen Ejecutivo del Plan Acelerado**

A petición del cliente, este plan re-calcula las **9 Macro-Actividades de Entrega** ajustando los tiempos de desarrollo a **1/4 de la duración estándar (25%)**, manteniendo la **Fase 3 (Conversión a App Nativa)** en sus **8 días completos** y ejecutándola en **PARALELO** desde el Día 1 (14 de Agosto de 2026). La Fase 5 (Despliegue a Producción) se re-calcula también a 1/4 de tiempo (5 días).

* **Fecha de Inicio:** Viernes, 14 de Agosto de 2026
* **Duración Total Estimada:** 17 Días Laborables (menos de 3 semanas calendario)
* **Esfuerzo Total Calculado:** 171 Horas-Hombre (HH)
* **Fecha de Finalización Total (Producción Viva 100%):** Viernes, 4 de Septiembre de 2026

---

## 📊 **Resumen por Macro-Actividades (Modalidad Acelerada)**

| # | Macro-Actividad | Descripción del Alcance | Esfuerzo (HH) | Duración (Días) | Fecha Inicio | Fecha Entrega | Fase de Entrega | Estado |
|---|---|---|:---:|:---:|:---:|:---:|---|---|
| **1** | **1. Flujo Básico Cliente App Móvil (PWA)** | Registro/Login (Google & Email), itinerario activo, perfil del viajero, tienda y pasarela de pago PWA. | **5 HH** | **0.5 días** | 14/08/2026 | **14/08/2026** | **Fase 1: MVP PWA** | 🟡 En Proceso (90%) |
| **2** | **2. Modificaciones Portal & Inconsistencias** | Alineación 100% entre PWA y Portal (`/perfil`, `/mis-reservas`, `/reserva/[id]`), vouchers PDF y facturación CFDI 4.0. | **8 HH** | **1 día** | 15/08/2026 | **15/08/2026** | **Fase 1: MVP Portal** | ⚪ Pendiente |
| **3** | **3. Modificación Panel de Agencias** | Ajustes visuales y funcionales a `/dashboard/agency` según prototipos (Overview, Clientes, CRM Kanban, Ventas, White-Label). | **10 HH** | **1.5 días** | 17/08/2026 | **18/08/2026** | **Fase 2: Agencias** | ⚪ Pendiente |
| **4** | **4. Modificación Panel de Empresas** | Ajustes a `/dashboard/corporate` según prototipos (Directorio Empleados, Control Gastos, CO2, Aprobaciones, Políticas corporativas). | **9 HH** | **1.5 días** | 18/08/2026 | **19/08/2026** | **Fase 2: Empresas** | ⚪ Pendiente |
| **5** | **5. Reestructuración Menú & Depuración** | Rediseño final de `PortalSidebar.tsx`, depuración de opciones obsoletas e integración total de vistas CRM/RRHH/Tienda. | **6 HH** | **1 día** | 20/08/2026 | **20/08/2026** | **Fase 2: Intranet** | ⚪ Pendiente |
| **6** | **6. Conversión PWA a App Nativa (iOS/Android)** | Migración a Expo / React Native / Capacitor, empaquetado APK/IPA, Push Notifications nativas (FCM/APNs) y Stores **[EN PARALELO DESDE EL DÍA 1]**. | **64 HH** | **8 días** | 14/08/2026 | **25/08/2026** | **Fase 3: App Nativa (Paralelo)** | ⚪ Pendiente |
| **7** | **7. Productos Complementarios No Desarrollados** | Desarrollo modular acelerado de 8 motores: Traslados, Autos, Seguros, eSIM, Paquetes, Cruceros, TourMundial y Parques. | **49 HH** | **6.5 días** | 21/08/2026 | **28/08/2026** | **Fase 4: Productos** | ⚪ Pendiente |
| **8** | **8. Gestión de Claves & Cuentas Proveedores** | Migración a Producción (Amadeus, Duffel, Hotelbeds, Stripe, SendGrid, Apple Developer, Google Play). | **8 HH** | **1.5 días** | 31/08/2026 | **01/09/2026** | **Transversal** | ⚪ Pendiente |
| **9** | **9. Migración a Producción Fase a Fase** | Pase a producción por bloques con rollback plan, pruebas de carga y liberación final en vivo. | **12 HH** | **3.5 días** | 01/09/2026 | **04/09/2026** | **Producción Final** | ⚪ Pendiente |
| | **TOTALES PROYECTO ACELERADO** | **9 Macro-Actividades Integrales** | **171 HH** | **17 Días** | **14/08/2026** | **04/09/2026** | **4 Fases Aceleradas** | |

---

## 🗓️ **Cronograma Gantt Visual Acelerado**

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│ DIAS Y SEMANAS │ AGO 14 (Vie) │ AGO 15 (Sáb) │ AGO 17-18    │ AGO 19-21    │ AGO 24-28    │ SEP 31-04    │
│ ACTIVIDAD      │ DÍA 1        │ DÍA 2        │ SEMANA 3     │ SEMANA 3     │ SEMANA 4     │ SEMANA 5     │
├────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ 1. PWA         │ █            │              │              │              │              │              │
│ 2. Portal      │              │ █            │              │              │              │              │
│ 6. Nativa (PAR)│ █            │ █            │ █            │ █            │ █            │              │
│ 3. Agency      │              │              │ █            │              │              │              │
│ 4. Corporate   │              │              │ █            │ █            │              │              │
│ 5. Sidebar     │              │              │              │ █            │              │              │
│ 7. Productos   │              │              │              │ █            │ █            │              │
│ 8. Claves      │              │              │              │              │              │ █            │
│ 9. Producción  │              │              │              │              │              │ █            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏁 **Matriz de Liberaciones Aceleradas por Fases**

1. **FASE 1: MVP PWA & Portal Cliente (14/Ago – 15/Ago | 1.5 días):**
   * *Entregable:* Cliente final funcional en PWA y portal escritorio (Registro/Login, itinerario, perfil, reservas y facturación CFDI).
2. **FASE 3: App Nativa iOS / Android [PARALELO] (14/Ago – 25/Ago | 8 días):**
   * *Entregable:* Binarios nativos APK/IPA empaquetados en Expo/Capacitor con Notificaciones Push (FCM/APNs) listos para tiendas.
3. **FASE 2: Intranet Agencias & Empresas B2B/B2E (17/Ago – 20/Ago | 4 días):**
   * *Entregable:* Panel de Agencias + Panel de Empresas + Sidebar final.
4. **FASE 4: Catálogo Turístico Completo (21/Ago – 28/Ago | 6.5 días):**
   * *Entregable:* Integración acelerada de los 8 motores (Traslados, Autos, Seguros, eSIM, Paquetes, Cruceros, TourMundial, Parques).
5. **FASE 5: Despliegue Producción Live (31/Ago – 04/Sep | 5 días):**
   * *Entregable:* Cuentas y llaves de infraestructura en Live, pruebas de carga y switch final de DNS a producción real.
