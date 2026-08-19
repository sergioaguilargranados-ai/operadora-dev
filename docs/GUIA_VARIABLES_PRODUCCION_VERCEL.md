# 🔐 Guía Oficial de Variables de Entorno para Vercel (Producción)
### *Proyecto: AS Operadora & Ecosistema Multi-Tenant*

Esta guía contiene la lista completa, estructurada y clasificada de todas las variables de entorno necesarias para desplegar la plataforma en **Vercel Production**.

---

## 📌 ¿Cómo cargar estas variables en Vercel?
1. Ingresa a [Vercel Dashboard](https://vercel.com/dashboard).
2. Selecciona el proyecto **AS Operadora**.
3. Ve a **Settings** ➔ **Environment Variables**.
4. Añade cada variable asegurándote de marcar el entorno **Production** (y opcionalmente *Preview* si cuentas con ambientes de staging).

---

## 🗂️ 1. Infraestructura Base y Base de Datos (OBLIGATORIAS)

| Variable | Descripción / Ejemplo | Entorno |
| :--- | :--- | :--- |
| `DATABASE_URL` | String de conexión a Neon PostgreSQL de producción con SSL activado.<br>`postgresql://user:pass@ep-cool-pooler.us-east-2.aws.neon.tech/as_operadora_prod?sslmode=require` | Production |
| `NODE_ENV` | Modo de ejecución de Node.js.<br>`production` | Production |
| `NEXT_PUBLIC_APP_URL` | Dominio canónico HTTPS de la aplicación web.<br>`https://as-ope-viajes.company` (o tu dominio asignado) | Production |
| `NEXT_PUBLIC_SITE_URL` | URL base del portal.<br>`https://as-ope-viajes.company` | Production |
| `NEXT_PUBLIC_AGENCY_BASE_URL` | Dominio base para links de afiliados y QR.<br>`https://as-ope-viajes.company` | Production |
| `ADMIN_EMAIL` | Correo del superadministrador para recibir alertas del sistema.<br>`admin@asoperadora.com` | Production |
| `TZ` | Zona horaria para el formateo de itinerarios y cotizaciones.<br>`America/Mexico_City` | Production |

---

## 🛡️ 2. Seguridad, JWT y Encriptación (CRÍTICAS)

> [!CAUTION]
> **NUNCA cambies `ENCRYPTION_SECRET_KEY` una vez en producción**, o los datos previamente encriptados (pasaportes, números de lealtad, etc.) serán irrecuperables.

| Variable | Descripción / Cómo Generarla |
| :--- | :--- |
| `JWT_SECRET` | Llave secreta para firmar tokens JWT de sesión.<br>*Generar en terminal:* `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ENCRYPTION_SECRET_KEY` | Clave simétrica de 32 bytes para encriptar información confidencial.<br>*Generar en terminal:* `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` |
| `CRON_SECRET` | Token Bearer para autorizar los cron jobs automatizados (`/api/cron/*`).<br>*Generar:* `node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"` |

---

## 💳 3. Pasarelas de Pago en Vivo (Transacciones Reales)

### A. Stripe
| Variable | Descripción | Dónde Obtenerla |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Llave pública de Stripe (`pk_live_...`) | [Stripe Dashboard API Keys](https://dashboard.stripe.com/apikeys) |
| `STRIPE_SECRET_KEY` | Llave secreta de Stripe (`sk_live_...`) | Stripe Dashboard API Keys |
| `STRIPE_WEBHOOK_SECRET` | Secreto del Webhook de Stripe (`whsec_...`) | [Stripe Webhooks](https://dashboard.stripe.com/webhooks) |

### B. PayPal
| Variable | Descripción | Valor |
| :--- | :--- | :--- |
| `PAYPAL_CLIENT_ID` | Client ID de la App Live de PayPal | [PayPal Developer Portal](https://developer.paypal.com/dashboard/applications/live) |
| `PAYPAL_CLIENT_SECRET` | Secret de la App Live de PayPal | PayPal Developer Portal |
| `PAYPAL_MODE` | Modo de operación | `live` |
| `PAYPAL_WEBHOOK_ID` | ID del Webhook de pagos capturados | PayPal Developer Portal |

### C. MercadoPago (Si está activo)
| Variable | Descripción |
| :--- | :--- |
| `MP_ACCESS_TOKEN` | Access Token de Producción (`APP_USR-...`) |
| `MP_PUBLIC_KEY` | Public Key de Producción (`APP_USR-...`) |

---

## 📄 4. Facturación Fiscal SAT CFDI 4.0 (Facturama)

| Variable | Descripción | Valor en Producción |
| :--- | :--- | :--- |
| `FACTURAMA_USER` | Usuario de la cuenta Facturama Multiemisor | Usuario oficial del emisor |
| `FACTURAMA_PASSWORD` | Contraseña API de Facturama | Contraseña del emisor |
| `FACTURAMA_SANDBOX` | Bandera de entorno de timbrado | `false` |

---

## ✈️ 5. Motores de Búsqueda y Proveedores Turísticos

### A. Amadeus (Vuelos, Hoteles y Actividades)
| Variable | Descripción | Valor |
| :--- | :--- | :--- |
| `AMADEUS_API_KEY` | API Key de Amadeus Self-Service | [Amadeus Developer Portal](https://developers.amadeus.com/my-apps) |
| `AMADEUS_API_SECRET` | API Secret de Amadeus | Amadeus Developer Portal |
| `AMADEUS_ENVIRONMENT` | Entorno de conexión | `production` |
| `AMADEUS_SANDBOX` | Bandera de Sandbox | `false` |

### B. Civitatis
| Variable | Descripción |
| :--- | :--- |
| `CIVITATIS_API_KEY` | Llave de integración / Afiliación Civitatis |

---

## 📧 6. Sistema de Comunicaciones Omnicanal

### A. Correos Electrónicos (Resend / SendGrid / SMTP)
| Variable | Descripción | Ejemplo / Valor |
| :--- | :--- | :--- |
| `RESEND_API_KEY` | Clave API de Resend | `re_123456789...` ([Resend Dashboard](https://resend.com/api-keys)) |
| `RESEND_FROM_EMAIL` | Remitente con dominio verificado SPF/DKIM | `reservas@asoperadora.com` |
| `SENDGRID_API_KEY` | *(Opcional si usas SendGrid)* | `SG.xxxxxxxx...` |
| `SENDGRID_FROM_EMAIL` | *(Opcional)* | `reservas@asoperadora.com` |
| `SMTP_HOST` / `SMTP_PORT`<br>`SMTP_USER` / `SMTP_PASS` | Parámetros SMTP alternativos | `smtp.resend.com` / `587` |

### B. Twilio (WhatsApp & SMS)
| Variable | Descripción |
| :--- | :--- |
| `TWILIO_ACCOUNT_SID` | SID de cuenta en Twilio Live |
| `TWILIO_AUTH_TOKEN` | Token de autenticación Live |
| `TWILIO_PHONE_NUMBER` | Número asignado para SMS (`+52...`) |
| `TWILIO_WHATSAPP_NUMBER` | Número de WhatsApp Business (`whatsapp:+52...`) |

### C. Notificaciones Push Web / PWA (VAPID)
| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Llave pública VAPID |
| `VAPID_PRIVATE_KEY` | Llave privada VAPID |
| `VAPID_SUBJECT` | Correo de contacto VAPID (`mailto:soporte@asoperadora.com`) |

---

## 🗄️ 7. Almacenamiento de Archivos (Vercel Blob Storage)

| Variable | Descripción | Dónde Obtenerla |
| :--- | :--- | :--- |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob para PDFs de cotizaciones, vouchers y documentos. | [Vercel Dashboard ➔ Storage ➔ Create Blob Database](https://vercel.com/dashboard/stores) |

---

## 🔑 8. Autenticación Social (OAuth 2.0)

### Google Login & One-Tap
- Configurar en [Google Cloud Console](https://console.cloud.google.com/apis/credentials):
  - **Authorized JavaScript origins**: `https://as-ope-viajes.company`
  - **Authorized redirect URIs**: `https://as-ope-viajes.company/api/auth/google/callback`

| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Client ID de Google OAuth 2.0 |
| `GOOGLE_CLIENT_ID` | Mismo Client ID de Google |
| `GOOGLE_CLIENT_SECRET` | Client Secret de Google OAuth 2.0 |

### Facebook Login
- Configurar en [Meta for Developers](https://developers.facebook.com/apps):
  - **Valid OAuth Redirect URIs**: `https://as-ope-viajes.company/api/auth/facebook/callback`

| Variable | Descripción |
| :--- | :--- |
| `NEXT_PUBLIC_FACEBOOK_APP_ID` | App ID de Facebook |
| `FACEBOOK_APP_SECRET` | App Secret de Facebook |

---

## 🤖 9. Inteligencia Artificial (IA & Asistentes)

| Variable | Descripción |
| :--- | :--- |
| `OPENAI_API_KEY` | API Key de OpenAI para el Chatbot de atención al cliente (`sk-proj-...`). |
| `GEMINI_API_KEY` | API Key de Google Gemini para el Diseñador Inteligente de Itinerarios y Guías Turísticas (`AIzaSy...`). |

---

## ✅ Checklist Rápido de Validación antes del Deploy

1. [ ] ¿`DATABASE_URL` apunta al cluster PostgreSQL productivo?
2. [ ] ¿Las pasarelas de pago (`Stripe`, `PayPal`, `MercadoPago`) están en modo `live` con claves reales?
3. [ ] ¿`FACTURAMA_SANDBOX` está en `false` con las credenciales fiscales reales del emisor?
4. [ ] ¿Los dominios OAuth en Google y Facebook coinciden exactamente con la URL de producción?
5. [ ] ¿El Storage `BLOB_READ_WRITE_TOKEN` está aprovisionado en Vercel?
6. [ ] ¿Se ejecutó el script [`scripts/migrate-production.js`](file:///g:/Otros%20ordenadores/Mi%20PC/operadora-dev/scripts/migrate-production.js) sobre la base de datos de producción?
