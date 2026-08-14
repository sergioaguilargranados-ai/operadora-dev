const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

const dataProducts = [
  ["REPORTE INTEGRAL DE PRODUCTOS Y SERVICIOS DEL SISTEMA - AS OPERADORA"],
  ["Auditoría profunda de flujos End-to-End: Búsqueda, Pago, Emisión, Notificaciones y Preparación para Producción"],
  [""],
  ["#", "Producto / Servicio", "Proveedores Conectados", "Pantalla de Pedido / Búsqueda (UI)", "Flujo de Pago & Cobro", "Emisión / Confirmación / SAT", "Correos / Notificaciones", "Estado Flujo E2E", "Acción Requerida para Producción Real"],
  
  [1, "Reservación de Vuelos", "Amadeus GDS, Duffel NDC, Kiwi Tequila", "/vuelos, /resultados, /reserva/[id] (Filtros, mapa asientos, datos pasajeros)", "Stripe, MercadoPago, PayPal, Línea de Crédito", "PNR de reserva real en GDS + Timbrado SAT CFDI 4.0", "Email institucional HTML + PDF boleto + WhatsApp + Push", "100% COMPLETO", "Reemplazar API Keys Sandbox por Producción Real en Amadeus y Duffel."],
  [2, "Reservación de Hoteles", "Hotelbeds, Amadeus Hotels, Booking.com, RateHawk", "/portal (stays), /hospedaje/[id], /resultados (Galería, Google Maps, tipos habitación)", "Stripe, MercadoPago, PayPal, Crédito Corporativo", "Voucher de hospedaje con código proveedor + CFDI 4.0", "Voucher HTML institucional + PDF + WhatsApp", "100% COMPLETO", "Cambiar HOTELBEDS_ENV=live e ingresar llaves de cuenta comisionable."],
  [3, "Tours Grupales (MegaTravel)", "MegaTravel Scraper & Sync API (ID 94553)", "/tours, /tours/[code], /cotizar-tour (Itinerario día a día, mapa, salidas confirmadas)", "Apartado online con pasarelas o solicitud asistida con agente", "Recibo de apartado / circuito MegaTravel + CFDI 4.0", "Ficha técnica + Contrato PDF + Email + WhatsApp", "100% COMPLETO", "Ninguna en código. Sincronización activa en producción con ID 94553."],
  [4, "Tours y Actividades / Experiencias", "Civitatis v2 (ID 67114), Viator, GetYourGuide, Amadeus Activities", "/actividades, /actividades/tour/[id], /resultados/activities (Filtros, punto encuentro)", "Checkout central con tarjeta o pasarelas", "Voucher con código QR / localizador + CFDI 4.0", "Voucher con QR + Pick-up info por Email y WhatsApp", "100% COMPLETO", "Cargar API Keys productivas de Viator y GetYourGuide en Vercel."],
  [5, "Autobús Turístico Hop-On Hop-Off", "BigBus Partners Direct Affiliate", "Integrado en /actividades y /resultados/activities en ciudades principales", "Enlace de afiliado directo o checkout propio", "Pase de abordaje con código de confirmación", "Confirmación de pase de autobús por Email institucional", "100% COMPLETO", "Verificar Partner ID de comisión en enlaces de producción."],
  [6, "Renta de Autos", "Amadeus Transfer & Cars Adapter", "/resultados/autos, /confirmar-reserva (Categoría auto, coberturas seguros)", "Formulario UI conectado a pasarelas con precobro/apartado", "Voucher de renta con localizador de la arrendadora", "Confirmación por Email + PDF adjunto", "PARCIAL (UI y Pago Listos)", "Activar Amadeus Cars / Hertz / RentalCars en producción real."],
  [7, "Traslados Aeropuerto-Hotel", "Amadeus Transfers API", "/resultados/transfers (Origen/Destino, equipaje, tipo vehículo privado/compartido)", "Checkout central integrado", "Voucher de traslado con datos de chófer y punto de cita", "Email institucional + WhatsApp con datos de la unidad", "100% COMPLETO (Sandbox)", "Solicitar activación de Amadeus Transfers en Producción."],
  [8, "Seguros de Viaje / Asistencia Médica", "Módulo interno de asistencia médica y coberturas", "/disenar-viaje y Add-on checkbox durante reserva de Vuelos/Hoteles", "Cobro como add-on dentro de la tarifa total del viaje", "Emisión de póliza digital con número de certificado", "Póliza PDF adjunta en correo de confirmación de reserva", "PARCIAL (Add-on Manual)", "Integrar API REST de aseguradora (Assist Card / Universal Assistance)."],
  [9, "Paquetes e-SIM Internacional", "Prototipo UI / Módulo de catálogo comercial", "/mobile (Sección de servicios PWA)", "Integrado a la tienda PWA y carrito de compras", "Generación de código QR e-SIM", "Envío de código QR por Email y Push PWA", "PROTOTIPO (UI Lista)", "Contratar cuenta distribuidor en Airalo o eSIM Go API."],
  [10, "Paquetes Dinámicos (Vuelo + Hotel)", "SearchService.ts (Amadeus + Hotelbeds + Expedia)", "/resultados/paquetes, /paquete/[id] (Búsqueda combinada con descuento)", "Stripe, MercadoPago, PayPal con cálculo de ahorro", "Emisión dual PNR Vuelo + Voucher Hotel + CFDI 4.0", "Email consolidado con resumen completo del paquete", "100% COMPLETO", "Conectar credenciales de producción de Vuelos y Hoteles en simultáneo."],
  [11, "Alojamientos Vacacionales (AS Home)", "Base de Datos propia PostgreSQL (properties)", "/resultados/ashome, /hospedaje/[id] (Departamentos privados, fotos, amenidades)", "Checkout central con apartado o pago total", "Voucher con instrucciones de acceso / lockbox y anfitrión", "Email + WhatsApp con instrucciones de Check-in", "100% COMPLETO (Propio)", "Cargar inventario real en BD o conectar API de RentalsUnited / Guesty."],
  [12, "Reservas de Restaurantes", "OpenTable Adapter + Módulo reservación interna", "/resultados/restaurantes, /confirmar-reserva/restaurante (Comensales, hora, cocina)", "Reservación gratuita con depósito de garantía opcional", "Código de confirmación de mesa reservada", "Email de confirmación de mesa + WhatsApp", "100% COMPLETO (Sandbox)", "Registrar API Key de producción de OpenTable / Resy."],
  [13, "Cruceros", "Prototipo UI / Catálogo asistido", "Mencionado en Panel de Empresas y Cotizaciones", "Formulario de cotización personalizada asistida por agente", "Emisión manual asistida por agente de viajes", "Cotización PDF enviada por Email y WhatsApp", "PROTOTIPO (Asistido)", "Evaluar integración futura con agregador Traveltek / Widgety API."],
  [14, "Parques Temáticos (Disney, Xcaret)", "ActivityAggregator.ts (via Civitatis / Viator)", "/actividades (Búsqueda Disney, Universal, Xcaret)", "Checkout central integrado", "E-ticket oficial o voucher de canje en taquilla", "Email institucional + PDF con e-ticket", "100% COMPLETO", "Ninguna (opera mediante los adaptadores de actividades activos)."],
  [15, "Productos Tienda Recompensas PWA", "StoreOrderService.ts + Base de Datos PostgreSQL", "/dashboard/store, /mobile/tienda (Catálogo de artículos, canje por puntos)", "Canje por Puntos AS Rewards o Pago online pasarelas", "Generación de Orden de Compra #ORD-XXXX con estado entrega", "Confirmación de pedido por Email + Push PWA", "100% COMPLETO", "Cargar el catálogo de productos físicos/digitales reales en BD."],
  [16, "Cotizaciones y Viajes a Medida", "CustomItineraryService.ts, PDFService.ts, EmailService", "/dashboard/quotes, /disenar-viaje (Creador multiconcepto, márgenes, vigencia)", "Enlace de pago online único (/payment/[quoteId]) en 1 clic", "Conversión a Reserva Confirmada + Timbrado CFDI 4.0", "Cotización interactiva por WhatsApp + Email con PDF corporativo", "100% COMPLETO", "Ninguna (módulo operativo al 100%)."]
];

const dataSummary = [
  ["RESUMEN EJECUTIVO POR ESTADO DE MADUREZ DE PRODUCTOS/SERVICIOS"],
  [""],
  ["Estado del Flujo End-to-End", "Cantidad de Productos", "Porcentaje (%)", "Descripción Breve"],
  ["100% COMPLETO (Listo para Producción)", 11, "68.8%", "Flujo completo de pedido, pago, voucher, correo y factura listo. Solo requiere credencial live."],
  ["PARCIAL (UI y Pago Listos)", 2, "12.5%", "Interfaz y cobro terminados; requiere conectar API de proveedor directo (Autos, Seguros)."],
  ["PROTOTIPO / UI DEMO (Pantalla Lista)", 3, "18.8%", "Vistas demostrativas creadas; pendiente integración de API de proveedor (e-SIM, Cruceros, OpenTable live)."],
  ["TOTAL LINEAS DE PRODUCTO", 16, "100.0%", "Catálogo de Oferta Comercial AS Operadora"]
];

const ws1 = XLSX.utils.aoa_to_sheet(dataProducts);
const ws2 = XLSX.utils.aoa_to_sheet(dataSummary);

XLSX.utils.book_append_sheet(wb, ws1, "Productos y Servicios");
XLSX.utils.book_append_sheet(wb, ws2, "Resumen por Estado");

const outputPath = path.join('c:', 'operadora-dev', 'docs', 'AG-Auditoria-Productos-Y-Servicios-2026.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Archivo Excel de Productos y Servicios generado correctamente en: ${outputPath}`);
