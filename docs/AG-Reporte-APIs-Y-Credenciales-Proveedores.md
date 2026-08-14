# 🔌 AG-Reporte-APIs-Y-Credenciales-Proveedores

**Cliente:** Sergio Aguilar Granados  
**Proyecto:** AS Operadora de Viajes y Eventos  
**Fecha de Emisión:** 01 de Agosto de 2026  
**Documento Excel Generado:** `c:\operadora-dev\docs\AG-Reporte-APIs-Y-Plan-Produccion-2026.xlsx`  

---

## 📌 REPORTE TÉCNICO DE INTEGRACIONES Y ESTADO DE CREDENCIALES

Este documento lista todas las APIs de proveedores externos integradas en la plataforma, distinguiendo las que se encuentran actualmente en entorno de pruebas (Sandbox) versus las que cuentan con datos o credenciales de producción real, identificando exactamente qué cuentas y llaves deben actualizarse en el servidor para el despliegue 100% productivo.

---

### 1. MOTORES DE VUELOS Y GDS

| # | Proveedor / API | Estado Actual | Variables de Entorno | Acción Requerida para Producción Real |
|---|-----------------|---------------|----------------------|---------------------------------------|
| 1 | **Amadeus Self-Service** | Sandbox (Test) | `AMADEUS_API_KEY`<br>`AMADEUS_API_SECRET`<br>`AMADEUS_ENVIRONMENT` | Cambiar `AMADEUS_ENVIRONMENT=production` y sustituir API Key/Secret con la cuenta de producción de Amadeus Developer. |
| 2 | **Duffel Flights NDC** | Sandbox (Test) | `DUFFEL_API_KEY` | Reemplazar token de prueba (`duffel_test_...`) por token productivo (`duffel_live_...`) en Vercel. |
| 3 | **Kiwi Tequila API** | Sandbox (Test) | `KIWI_API_KEY` | Reemplazar la API Key de desarrollo Tequila por la credencial de producción comisionable. |

---

### 2. INVENTARIO HOTELERO GLOBAL

| # | Proveedor / API | Estado Actual | Variables de Entorno | Acción Requerida para Producción Real |
|---|-----------------|---------------|----------------------|---------------------------------------|
| 4 | **Hotelbeds API** | Sandbox (Test) | `HOTELBEDS_API_KEY`<br>`HOTELBEDS_SECRET`<br>`HOTELBEDS_ENV` | Cambiar `HOTELBEDS_ENV=live` y registrar API Key/Secret productivos de la cuenta comisionable. |
| 5 | **Booking.com API** | Sandbox / Mock | `BOOKING_API_KEY` | Ingresar la API Key productiva asignada por el programa de afiliados de Booking.com. |

---

### 3. PASARELAS DE PAGO Y FACTURACIÓN FISCAL

| # | Proveedor / API | Estado Actual | Variables de Entorno | Acción Requerida para Producción Real |
|---|-----------------|---------------|----------------------|---------------------------------------|
| 6 | **Stripe Payments** | Sandbox (Test) | `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`<br>`STRIPE_SECRET_KEY`<br>`STRIPE_WEBHOOK_SECRET` | Cambiar `pk_test_...` y `sk_test_...` por credenciales productivas `pk_live_...` y `sk_live_...`. Registrar el Webhook URL en Stripe Dashboard. |
| 7 | **MercadoPago SDK** | Sandbox (Test) | `MERCADOPAGO_ACCESS_TOKEN`<br>`MERCADOPAGO_PUBLIC_KEY` | Cambiar Access Token de prueba (`TEST-...`) por token de producción (`APP_USR-...`). |
| 8 | **PayPal SDK** | Sandbox (Test) | `PAYPAL_CLIENT_ID`<br>`PAYPAL_CLIENT_SECRET`<br>`PAYPAL_MODE` | Cambiar `PAYPAL_MODE=live` e ingresar el Client ID / Client Secret productivo de PayPal Developer. |
| 9 | **Facturama CFDI 4.0** | Sandbox (Test) | `FACTURAMA_USER`<br>`FACTURAMA_PASSWORD`<br>`FACTURAMA_SANDBOX` | Cambiar `FACTURAMA_SANDBOX=false` e ingresar usuario/password de la cuenta fiscal de timbrado CSD real. |

---

### 4. TOURS, EXCURSIONES Y ACTIVIDADES

| # | Proveedor / API | Estado Actual | Variables de Entorno | Acción Requerida para Producción Real |
|---|-----------------|---------------|----------------------|---------------------------------------|
| 10 | **Civitatis API v2** | Producción Real | `CIVITATIS_API_KEY`<br>`CIVITATIS_AGENCY_ID` | ID de Agencia `67114` activo. Confirmar API Key v2 de afiliado en Vercel. |
| 11 | **Viator / TripAdvisor** | Sandbox / Fallback | `VIATOR_API_KEY`<br>`VIATOR_PUBLISHER_ID` | Registrar la API Key productiva del programa de socios Viator. |
| 12 | **GetYourGuide API** | Sandbox / Fallback | `GYG_API_KEY`<br>`GYG_PARTNER_ID` | Ingresar el Partner ID y API Key productivos de GetYourGuide. |
| 13 | **BigBus Hop-On Hop-Off** | Producción Real | `BIGBUS_PARTNER_ID` | Verificar el ID de afiliación directa en enlaces de reserva. |
| 14 | **MegaTravel Scraping** | Producción Real | `MEGATRAVEL_AGENCY_ID` | Activo y sincronizado en `MegaTravelSyncService.ts` con ID `94553`. |
| 15 | **TourMundial API** | Pendiente Credenciales | `TOURMUNDIAL_API_KEY` | Solicitar credenciales de desarrollador / API Key a soporte técnico de TourMundial. |

---

### 5. BANCOS DE IMÁGENES STOCK

| # | Proveedor / API | Estado Actual | Variables de Entorno | Acción Requerida para Producción Real |
|---|-----------------|---------------|----------------------|---------------------------------------|
| 16 | **Pexels API** | Producción Real | `PEXELS_API_KEY` | API Key productiva activa en `DestinationContentService.ts`. |
| 17 | **Pixabay API** | Producción Real | `PIXABAY_API_KEY` | API Key productiva activa en `DestinationContentService.ts`. |
| 18 | **Unsplash API** | Producción Real | `UNSPLASH_ACCESS_KEY` | Access Key productiva activa en `DestinationContentService.ts`. |

---

### 6. NOTIFICACIONES, EMAIL, CHAT E IA

| # | Proveedor / API | Estado Actual | Variables de Entorno | Acción Requerida para Producción Real |
|---|-----------------|---------------|----------------------|---------------------------------------|
| 19 | **SendGrid SMTP Relay** | Producción Real | `SENDGRID_API_KEY`<br>`SENDGRID_FROM_EMAIL` | API Key productiva activa para plantillas institucionales de correo. |
| 20 | **Resend Email API** | Producción Real | `RESEND_API_KEY`<br>`RESEND_FROM_EMAIL` | API Key productiva activa como fallback transaccional. |
| 21 | **Twilio WhatsApp / SMS** | Sandbox (Test) | `TWILIO_ACCOUNT_SID`<br>`TWILIO_AUTH_TOKEN`<br>`TWILIO_PHONE_NUMBER` | Cambiar credenciales a cuenta productiva Twilio con saldo y sender verificado. |
| 22 | **Web Push VAPID PWA** | Configurado (Pruebas) | `NEXT_PUBLIC_VAPID_PUBLIC_KEY`<br>`VAPID_PRIVATE_KEY` | Confirmar llaves VAPID enlazadas al dominio definitivo `as-ope-viajes.company`. |
| 23 | **Google Maps & Places** | Producción Real | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Restringir API Key en Google Cloud Console al dominio productivo. |
| 24 | **OpenAI GPT-4o API** | Producción Real | `OPENAI_API_KEY` | API Key productiva activa para el asistente IA AS AI. |
