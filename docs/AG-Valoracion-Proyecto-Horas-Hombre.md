# 📊 VALORACIÓN DE DESARROLLO Y HORAS HOMBRE — AS OPERADORA
**Fecha:** 7 de Julio de 2026  
**Cliente:** AS Operadora  
**Tarifa Base:** $300.00 MXN / Hora  

---

## 📋 RESUMEN GENERAL DE VALORACIÓN

Esta valoración detalla las horas invertidas y estimadas por módulo de acuerdo con el análisis métrico del código actual, páginas construidas, integraciones y servicios de backend implementados.

| Módulo / Componente | Estado de Avance | Páginas/Vistas | Líneas de Código (Aprox.) | Horas Hombre (HH) | Costo en Pesos (MXN) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Landing Principal** | 90% | ~10 | ~38,000 | 180 hrs | $54,000.00 |
| **2. Portal (Intranet) + CRM/RRHH** | 95% | ~35 | ~87,000 | 450 hrs | $135,000.00 |
| **3. PWA (Lo nuevo - Offline/Web-móvil)**| 95% | ~4 | ~6,100 | 90 hrs | $27,000.00 |
| **4. App Móvil (Estructura inicial)** | 40% | ~6 | ~5,800 | 70 hrs | $21,000.00 |
| **TOTAL** | **88% Promedio** | **~55** | **~136,900** | **790 hrs** | **$237,000.00 MXN** |

---

## 🔍 DESGLOSE DETALLADO POR MÓDULO

### 1. Landing Principal (Sitio Público y Catálogo)
* **Descripción:** Portal de cara al cliente final. Incluye búsquedas públicas de vuelos, hoteles, listado y detalle dinámico de tours con mapas.
* **Componentes clave:**
  * Buscador y filtros dinámicos (país, ciudad, duración, precio).
  * Detalle de itinerarios interactivos y cotizador público (Generación de folios `AS-XXXXX`).
  * Páginas complementarias: Inicio, Actividades (Civitatis), Contacto, Ayuda, Soporte Legal.
* **Métricas técnicas:** ~38,000 líneas de código (incluye componentes UI y maquetación responsiva).

### 2. Portal (Intranet, CRM, RRHH y Backend APIs)
* **Descripción:** Panel administrativo y corporativo multi-tenant (marca blanca para agencias) que gestiona la lógica empresarial profunda.
* **Componentes clave:**
  * **CRM:** Pipeline Kanban, Lead Scoring predictivo por IA, campañas de correo y workflows automatizados.
  * **RRHH:** Gestión de nóminas (cálculos ISR/IMSS), contratos, asistencia, ausencias y pipeline de contratación.
  * **Finanzas/Pagos:** Reconciliación con Stripe, PayPal y Mercado Pago, además de generación de PDFs automáticos.
  * **Backend & DB:** 62 tablas en Neon DB, 168 índices y 48 de 50 endpoints de API funcionales.
* **Métricas técnicas:** ~87,000 líneas de código (código de servidor, servicios, contexts y componentes administrativos).

### 3. PWA (Progressive Web App - Lo nuevo)
* **Descripción:** Adaptación de la web para comportarse como app nativa en dispositivos móviles, permitiendo su instalación directa y funcionamiento básico offline.
* **Componentes clave:**
  * Service Worker personalizado (`sw.ts`) para caché y políticas de red offline.
  * Vistas optimizadas para móviles en la web y página dedicada offline.
  * Manifiesto de PWA para instalación en Android/iOS.
* **Métricas técnicas:** ~6,100 líneas de código.

### 4. App Móvil (Comienzo del desarrollo nativo)
* **Descripción:** Aplicación nativa híbrida en React Native y Expo enfocada en la experiencia del viajero.
* **Componentes clave:**
  * Estructura base configurada y dependencias principales preparadas.
  * Login biométrico (Face ID / Touch ID) y almacenamiento seguro local.
  * Tarjeta de embarque digital (Wallet) y soporte offline preliminar.
  * *Nota de estado:* Se encuentra al 40% de avance global, con código escrito pero pendiente de primera ejecución y pruebas físicas.
* **Métricas técnicas:** ~5,800 líneas de código (38 archivos TypeScript).

---

## 💡 VALOR AGREGADO A INCLUIR PARA EL CLIENTE

Para dar una visión completa al cliente sobre el proyecto, recomendamos adjuntar la siguiente información:

### A. Costos de Infraestructura y Operación Mensual (Estimados)
El cliente debe estar consciente de que el sistema interactúa con servicios externos que escalarán según el volumen de ventas:
1. **Infraestructura Base:** Alojamiento en Vercel Pro ($20 USD/mes) y Base de datos Neon Scale ($50 USD/mes).
2. **Pasarelas de Pago:** Stripe / MercadoPago cobran una comisión transaccional de ~2.9% a 3.9% + cargo fijo por reserva pagada (no tiene costo fijo mensual).
3. **APIs y Proveedores:**
   * **Amadeus (Vuelos):** API de producción en vivo con cargo por reserva/búsqueda.
   * **Google Places:** Autocompletado de direcciones en mapa (~$140 USD/mes según volumen).
   * **Twilio (WhatsApp/SMS):** Costo por mensaje para notificaciones instantáneas de viaje.

### B. Próximos Pasos Recomendados (Roadmap)
Para continuar y liberar el proyecto con éxito:
1. **Estabilización de Integraciones:** Obtención de credenciales de producción de Amadeus y Twilio (cuenta empresarial).
2. **Pruebas en Dispositivos:** Compilación de la App Móvil con su respectiva depuración y resolución de dependencias npm.
3. **Prueba de Producción de Correos:** Configurar DNS (SPF, DKIM, DMARC) de asoperadora.com para iniciar envíos reales con SendGrid/SMTP.
