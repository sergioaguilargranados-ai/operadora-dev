# 🚀 AG-Plan-Pase-A-Produccion-Y-Tiempos

**Cliente:** Sergio Aguilar Granados  
**Proyecto:** AS Operadora de Viajes y Eventos  
**Fecha de Emisión:** 01 de Agosto de 2026  
**Documento Excel Generado:** `c:\operadora-dev\docs\AG-Reporte-APIs-Y-Plan-Produccion-2026.xlsx`  

---

## 📌 HOJA DE RUTA Y PLAN DE PASE A PRODUCCIÓN (TOTAL: 56 HH)

Este documento establece la metodología estructurada paso a paso para realizar la transición segura y ordenada desde el entorno de desarrollo y pruebas (`operadora-dev`) hacia la versión productiva en vivo (`main` / `as-operadora`), calculando el tiempo de ejecución en Horas Hombre (HH).

---

### ⏱️ RESUMEN DE TIEMPOS POR FASE

| Fase # | Nombre de la Fase | Esfuerzo (HH) | Responsable | Hito / Entregable |
|--------|-------------------|---------------|-------------|-------------------|
| **Fase 1** | Auditoría & Migración de BD PostgreSQL | **8 HH** | Tech Lead / DB Admin | Base de Datos producida y sembrada |
| **Fase 2** | Intercambio de Credenciales API (Sandbox → Prod) | **12 HH** | Backend Developer | Variables de entorno 100% reales |
| **Fase 3** | Configuración DNS, SSL & Dominios | **6 HH** | DevOps / SysAdmin | SSL y dominios autorizados activos |
| **Fase 4** | Sincronización Catálogos & Cache PWA | **10 HH** | Frontend / Mobile Dev | PWA y catálogo MegaTravel sincronizado |
| **Fase 5** | Pruebas de Humo (Smoke Tests) & UAT | **14 HH** | QA / Tester / Cliente | Certificación transaccional limpia |
| **Fase 6** | Merge a Main & Go-Live Final | **6 HH** | DevOps / Equipo | **SISTEMA 100% PRODUCTIVO EN VIVO** |
| **TOTAL** | **PASO A PRODUCCIÓN COMPLETO** | **56 HH** | **Equipo de Desarrollo** | **Lanzamiento Oficial** |

---

### 🛠️ DETALLE PASO A PASO DE CADA FASE

#### FASE 1: AUDITORÍA Y MIGRACIÓN DE BASE DE DATOS (8 HH)
1. Respaldo snapshot completo de la base de datos Neon PostgreSQL de desarrollo.
2. Ejecución de migraciones DDL de esquemas SQL en la instancia PostgreSQL de producción.
3. Carga e inicialización de tablas semilla (`seed`): Roles, Permisos, Tenants, Catálogo de Servicios, Términos Legales.
4. Verificación de integridad referencial e índices de rendimiento.

#### FASE 2: INTERCAMBIO DE CREDENCIALES API (SANDBOX → PRODUCCIÓN REAL) (12 HH)
1. Actualización de las 24 variables de entorno en Vercel Production Environment.
2. Reemplazo de API Keys de Sandbox por claves reales de producción (Amadeus, Hotelbeds, Duffel, Kiwi).
3. Configuración de claves secretas de pasarelas de pago reales:
   - Stripe (`sk_live_...` y `pk_live_...`)
   - MercadoPago (`APP_USR-...`)
   - PayPal (`PAYPAL_MODE=live`)
4. Configuración del usuario y contraseña fiscal de timbrado CFDI 4.0 en Facturama (`FACTURAMA_SANDBOX=false`).
5. Configuración de Webhooks de confirmación de pago en producción.

#### FASE 3: CONFIGURACIÓN DNS, SSL Y DOMINIOS (6 HH)
1. Configuración y propagación de registros DNS (A, CNAME, TXT, MX) para `as-ope-viajes.company`.
2. Emisión y validación de certificados SSL/TLS wildcard (`*.as-ope-viajes.company`).
3. Restricción de dominios y autorizaciones OAuth en:
   - Google Cloud Console (Google Login & Maps JavaScript API)
   - Facebook Developers Console
   - Stripe Dashboard & MercadoPago Portal

#### FASE 4: SINCRONIZACIÓN DE CATÁLOGOS Y CACHÉ SERVICE WORKER (10 HH)
1. Sincronización completa inicial de tours en vivo desde MegaTravel (`MegaTravelSyncService.ts`).
2. Generación y prueba del Service Worker PWA de producción (`/sw.js`) con estrategias de caché offline.
3. Verificación de `manifest.json` e iconos para instalación en dispositivos móviles Android y iOS.
4. Purga total y calentamiento de caché CDN en Vercel Edge Network.

#### FASE 5: PRUEBAS DE HUMO (SMOKE TESTS) Y UAT (14 HH)
1. **Prueba Transaccional de Cobro Real:** Ejecución de 1 transacción real por $10.00 MXN en Stripe, MercadoPago y PayPal, verificando acreditación e inmediatez de reembolso.
2. **Prueba de Timbrado Fiscal:** Emisión de 1 factura de prueba CFDI 4.0 en Facturama y verificación de archivo XML / PDF generado.
3. **Prueba de Reserva de Vuelos y Hoteles:** Búsqueda y bloqueo de disponibilidad en tiempo real con Amadeus / Hotelbeds.
4. **Prueba de Notificaciones:** Validación de entrega de correos transaccionales SendGrid/Resend y mensajes WhatsApp Twilio en teléfonos reales.

#### FASE 6: MERGE A MAIN Y GO-LIVE FINAL (6 HH)
1. Pull Request y comprobación de build limpio en GitHub.
2. Merge de la rama `dev` hacia la rama `main` del repositorio oficial.
3. Despliegue en caliente sin tiempo de caída (Zero-Downtime Deployment).
4. Monitoreo constante de logs de servidor y analítica por un periodo inicial de 24 horas.
