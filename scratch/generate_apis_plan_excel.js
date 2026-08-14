const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

// DATOS HOJA 1: APIS E INTEGRACIONES DE PROVEEDORES
const dataApis = [
  ["REPORTE DE INTEGRACIONES Y APIS DE PROVEEDORES - AS OPERADORA"],
  ["Documento técnico para preparación de credenciales de Producción"],
  [""],
  ["#", "Categoría / Servicio", "Proveedor / API", "Estado Actual", "Variables de Entorno (.env)", "Acción Requerida para Producción Real"],
  [1, "Vuelos / GDS", "Amadeus Self-Service", "Sandbox (Test)", "AMADEUS_API_KEY, AMADEUS_API_SECRET, AMADEUS_ENVIRONMENT", "Cambiar AMADEUS_ENVIRONMENT=production y actualizar API Key/Secret a cuenta de producción."],
  [2, "Vuelos NDC", "Duffel Flights API", "Sandbox (Test)", "DUFFEL_API_KEY", "Reemplazar duffel_test_... por token productivo duffel_live_..."],
  [3, "Vuelos Low-Cost", "Kiwi Tequila API", "Sandbox (Test)", "KIWI_API_KEY", "Reemplazar API Key de pruebas Tequila por credencial productiva comisionable."],
  [4, "Hoteles Global", "Hotelbeds API", "Sandbox (Test)", "HOTELBEDS_API_KEY, HOTELBEDS_SECRET, HOTELBEDS_ENV", "Cambiar HOTELBEDS_ENV=live y registrar API Key/Secret productivas en Vercel."],
  [5, "Hoteles Afiliados", "Booking.com API", "Sandbox / Mock", "BOOKING_API_KEY", "Ingresar API Key productiva del programa de afiliados de Booking.com."],
  [6, "Pagos Tarjeta", "Stripe Payments", "Sandbox (Test)", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_SECRET_KEY", "Cambiar pk_test_... y sk_test_... por credenciales productivas pk_live_... y sk_live_..."],
  [7, "Pagos Latam", "MercadoPago SDK", "Sandbox (Test)", "MERCADOPAGO_ACCESS_TOKEN, MERCADOPAGO_PUBLIC_KEY", "Cambiar token TEST-... por credencial productiva APP_USR-..."],
  [8, "Pagos Globales", "PayPal SDK", "Sandbox (Test)", "PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_MODE", "Cambiar PAYPAL_MODE=live e ingresar Client ID/Secret productivos de PayPal Developer."],
  [9, "Facturación SAT", "Facturama CFDI 4.0", "Sandbox (Test)", "FACTURAMA_USER, FACTURAMA_PASSWORD, FACTURAMA_SANDBOX", "Cambiar FACTURAMA_SANDBOX=false e ingresar usuario/password de la cuenta fiscal CSD real."],
  [10, "Actividades v2", "Civitatis API", "Producción Real (Id 67114)", "CIVITATIS_API_KEY, CIVITATIS_AGENCY_ID", "Confirmar ID de agencia 67114 e ingresar API Key de afiliado v2."],
  [11, "Actividades Global", "Viator / TripAdvisor", "Sandbox / Fallback", "VIATOR_API_KEY, VIATOR_PUBLISHER_ID", "Registrar API Key productiva del programa de socios Viator."],
  [12, "Tours y Experiencias", "GetYourGuide API", "Sandbox / Fallback", "GYG_API_KEY, GYG_PARTNER_ID", "Ingresar Partner ID y API Key productivos de GetYourGuide."],
  [13, "Autobús Turístico", "BigBus Hop-On Hop-Off", "Producción (Afiliado)", "BIGBUS_PARTNER_ID", "Verificar Partner ID de comisión directa en enlaces de reserva."],
  [14, "Tours Grupales", "MegaTravel Scraping", "Producción Real (Id 94553)", "MEGATRAVEL_AGENCY_ID", "Activo y sincronizado en MegaTravelSyncService.ts con id 94553."],
  [15, "Tours Grupales", "TourMundial API", "Pendiente Credenciales", "TOURMUNDIAL_API_KEY", "Solicitar credenciales de desarrollador / API Key a soporte TourMundial."],
  [16, "Imágenes Stock", "Pexels API", "Producción Real", "PEXELS_API_KEY", "API Key productiva activa en DestinationContentService.ts."],
  [17, "Imágenes Stock", "Pixabay API", "Producción Real", "PIXABAY_API_KEY", "API Key productiva activa en DestinationContentService.ts."],
  [18, "Imágenes Stock", "Unsplash API", "Producción Real", "UNSPLASH_ACCESS_KEY", "Access Key productiva activa en DestinationContentService.ts."],
  [19, "Correos Notificación", "SendGrid SMTP Relay", "Producción Real", "SENDGRID_API_KEY, SENDGRID_FROM_EMAIL", "API Key productiva activa para plantillas institucionales."],
  [20, "Correos Transaccionales", "Resend API", "Producción Real", "RESEND_API_KEY, RESEND_FROM_EMAIL", "API Key productiva activa como fallback transaccional."],
  [21, "WhatsApp / SMS", "Twilio API", "Sandbox (Test)", "TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER", "Cambiar credenciales a cuenta productiva Twilio con saldo y sender verificado."],
  [22, "Notificaciones PWA", "Web Push VAPID", "Configurado (Pruebas)", "NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY", "Verificar llaves VAPID vinculadas al dominio final as-ope-viajes.company."],
  [23, "Mapas & Ubicación", "Google Maps & Places", "Producción Real", "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY", "Restringir API Key en Google Cloud Console al dominio productivo as-ope-viajes.company."],
  [24, "Asistente IA", "OpenAI GPT-4o API", "Producción Real", "OPENAI_API_KEY", "API Key productiva activa para el chatbot de la plataforma."]
];

// DATOS HOJA 2: PLAN DE PASE A PRODUCCIÓN Y TIEMPOS (HH)
const dataPlanProd = [
  ["PLAN DE PASE A PRODUCCIÓN Y ESTIMACIÓN DE TIEMPOS (HORAS HOMBRE - HH)"],
  ["Hoja de ruta paso a paso para migración de ambiente dev a producción en vivo"],
  [""],
  ["Fase #", "Nombre de la Fase", "Descripción de Actividades a Realizar", "Esfuerzo (HH)", "Responsable", "Hito / Entregable"],
  [1, "Auditoría & Migración BD", "Respaldo completo de BD Neon PostgreSQL dev, migración de esquemas SQL en producción, ejecución de scripts de inicialización (seed) de roles, permisos, agencias y políticas.", 8, "Tech Lead / DB Admin", "BD PostgreSQL lista y sembrada en producción."],
  [2, "Intercambio de Credenciales API", "Actualización masiva de 24 variables de entorno en Vercel Production Environment (reemplazo de API Keys de Sandbox a Producción Real para Amadeus, Hotelbeds, Stripe, MercadoPago, PayPal, Facturama, etc.).", 12, "Backend Developer", "Variables de entorno 100% productivas en Vercel."],
  [3, "Configuración DNS, SSL & Dominios", "Configuración de registros DNS (A, CNAME, TXT, MX) para as-ope-viajes.company, validación de certificados SSL HTTPS, y restricción de dominios para Google OAuth, Facebook Login y Google Maps API.", 6, "DevOps / SysAdmin", "Dominio as-ope-viajes.company con SSL y OAuth activo."],
  [4, "Sincronización Catálogos & PWA", "Ejecución del sync inicial del catálogo de tours MegaTravel (MegaTravelSyncService.ts), verificación de manifest.json PWA, Service Worker offline (/sw.js) y purga de caché CDN.", 10, "Frontend / Mobile Dev", "App PWA y catálogo de tours sincronizado."],
  [5, "Pruebas de Humo (Smoke Tests) & UAT", "Pruebas reales en caliente con cobros mínimos en producción para Stripe, MercadoPago y PayPal (con reembolso), simulación de reserva real de vuelo/hotel, timbrado CFDI de prueba en Facturama y envío de notificaciones WhatsApp/Email.", 14, "QA / Tester / Cliente", "Certificación transaccional limpia sin errores."],
  [6, "Merge a Main & Go-Live Final", "Pull Request y Merge de la rama dev a main (repositorio as-operadora), despliegue en caliente sin tiempo de caída (zero-downtime) y monitoreo en tiempo real por 24h tras el lanzamiento.", 6, "DevOps / All Team", "SISTEMA 100% PRODUCTIVO EN VIVO."],
  ["", "TOTAL ESTIMADO PASE A PRODUCCIÓN", "", 56, "", "Lanzamiento a Producción"]
];

const ws1 = XLSX.utils.aoa_to_sheet(dataApis);
const ws2 = XLSX.utils.aoa_to_sheet(dataPlanProd);

XLSX.utils.book_append_sheet(wb, ws1, "APIs y Credenciales");
XLSX.utils.book_append_sheet(wb, ws2, "Plan Pase a Produccion");

const outputPath = path.join('c:', 'operadora-dev', 'docs', 'AG-Reporte-APIs-Y-Plan-Produccion-2026.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Archivo Excel de APIs y Plan de Producción generado correctamente en: ${outputPath}`);
