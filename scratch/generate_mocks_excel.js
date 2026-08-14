const XLSX = require('xlsx');
const path = require('path');

const wb = XLSX.utils.book_new();

const dataMocks = [
  ["REPORTE DE AUDITORÍA DE DATOS MOCKS, FALLBACKS Y SIMULACIONES EN EL SISTEMA - AS OPERADORA"],
  ["Documento maestro para identificación de componentes con datos de muestra y su plan de reemplazo por BD/API real"],
  [""],
  ["#", "Módulo / Sección", "Ubicación del Archivo (Ruta)", "Descripción de los Datos Mock / Fallback", "Causa / Por Qué Están Ahí", "Acción Requerida para Conectar BD / API Real"],
  
  // INTRANET & DASHBOARDS
  [1, "Panel de Agencias Overview", "src/app/dashboard/agency/page.tsx", "KPIs de venta ($1.2M), comisiones ($185k), gráfica de rendimiento y viajes próximos.", "Presentación visual de analítica para agencias nuevas sin historial transaccional.", "Conectar consultas agregadas SQL a la tabla 'bookings' y 'agency_commissions'."],
  [2, "CRM & Pipeline Comercial", "src/app/dashboard/agency/crm/page.tsx", "Contactos de muestra, prospectos en columnas Kanban (Prospecto, Contactado, Cotizado, Ganado, Perdido).", "Estructura demostrativa visual del flujo de ventas antes de importar clientes reales.", "Conectar endpoints REST a las tablas 'crm_leads', 'crm_contacts' y 'crm_activities'."],
  [3, "Ventas & Reportes Agencia", "src/app/dashboard/agency/ventas/page.tsx", "Gráfica LineChart diaria de ventas y Donut chart por producto (Hoteles 45%, Vuelos 30%, etc.).", "Demostración gráfica de reportes comerciales en agencias sin facturación histórica.", "Sustituir con consultas de agregación de la tabla 'invoices' y 'bookings'."],
  [4, "Panel de Empresas (Corporativo)", "src/app/dashboard/corporate/page.tsx", "KPIs de gasto ($2.8M), donut de tipo de reserva, métricas CO2 DEFRA 2024 y ranking de destinos.", "Analítica demostrativa para cuentas corporativas/empresas recién registradas.", "Conectar con endpoints /api/corporate/stats, /api/corporate/employees y tablas corporativas."],
  [5, "Recursos Humanos RRHH", "src/app/dashboard/rrhh/page.tsx", "Lista de empleados (42), registros de asistencia, licencias, nómina y vacantes.", "Plantilla UI para gestión de personal antes de la carga masiva vía CSV/Excel.", "Conectar con la tabla 'employees', 'attendance_logs' y 'payroll_records'."],
  [6, "Cotizaciones", "src/app/dashboard/quotes/page.tsx", "Lista de cotizaciones de ejemplo (AS-COT-001 a 003) en distintos estados.", "Ejemplos visuales para agentes de viajes que aún no generan cotizaciones propias.", "Vincular a la tabla 'quotes' y 'quote_items' de la base de datos."],
  [7, "Productos de la Tienda", "src/app/dashboard/store/page.tsx", "Catálogo de muestra de artículos de recompensa (Laptops, Vouchers, Mochilas).", "Inventario demostrativo del programa de lealtad antes de ser configurado por la agencia.", "Vincular a la tabla 'store_products' e importar inventario real."],
  [8, "Cuentas por Cobrar y Pagar", "src/app/api/accounts-receivable/route.ts, src/app/api/accounts-payable/route.ts", "Registros mock de facturas por cobrar a clientes y cuentas por pagar a proveedores.", "Respuesta fallback cuando la base de datos no contiene registros contables aún.", "Conectar consultas SQL directas a las tablas 'accounts_receivable' y 'accounts_payable'."],

  // MOTORES DE BÚSQUEDA Y ADAPTERS
  [9, "Motor de Vuelos (Amadeus / Duffel)", "src/services/providers/amadeus/AmadeusFlightProvider.ts", "Lista de vuelos de muestra con tarifas e itinerarios ficticios.", "Fallback automático cuando las claves de API Amadeus/Duffel fallan o están en Sandbox.", "Reemplazar credenciales Sandbox por credenciales Productivas de Amadeus y Duffel."],
  [10, "Motor de Hoteles (Hotelbeds / Amadeus)", "src/services/aggregators/HotelAggregator.ts", "Inventario de hoteles con fotos, precios y calificaciones de muestra.", "Respaldo de contingencia (fallback graceful) si la red o API Hotelbeds no responde.", "Configurar HOTELBEDS_ENV=live con llaves productivas comisionables."],
  [11, "Tours y Actividades (Civitatis / Viator / GYG)", "src/services/providers/civitatis/CivitatisAdapter.ts", "Tours de muestra en ciudades principales (Cancún, Madrid, París, Roma) con precios.", "Asegura catálogo visual de actividades incluso sin API Key o en caída de servicio.", "Ingresar API Keys productivas de Civitatis, Viator y GetYourGuide en Vercel."],
  [12, "Tours Grupales (MegaTravel)", "src/services/providers/MegaTravelAdapter.ts", "Paquetes grupales estáticos de respaldo con itinerarios y precios aproximados.", "Fallback preventivo si el servicio de scraping HTML de MegaTravel tarda en responder.", "Mantener sincronizador automático MegaTravelSyncService.ts con id de agencia 94553."],

  // CLIENTE Y PWA MÓVIL
  [13, "Mis Reservas Clientes", "src/app/mis-reservas/page.tsx", "Tarjetas de reserva de muestra (AS-1024 Vuelo a Cancún, AS-1025 Hotel Madrid).", "Proporciona guía visual de acciones (Pagar, Facturar, Contactar) a usuarios nuevos.", "Vincular a la consulta SQL filtrada por el ID del usuario en la tabla 'bookings'."],
  [14, "Perfil de Usuario & Dispositivos", "src/app/perfil/page.tsx", "Mocks de sesiones activas (Chrome en Windows, iPhone 14) y usuarios vinculados.", "Presenta la interfaz de seguridad cuando la tabla 'user_sessions' no tiene logs.", "Conectar con el historial real de sesiones JWT de la tabla 'user_sessions'."],
  [15, "Resultados de Renta de Autos", "src/app/resultados/autos/page.tsx", "Catálogo demostrativo de autos de renta (Compacto, SUV, Premium) con tarifas.", "Motor en fase de prototipado UI previo a la conexión con API de renta de autos.", "Integrar API comercial de renta de autos (Hertz / RentalCars / Amadeus Cars)."],
  [16, "Resultados AS Home (Departamentos)", "src/app/resultados/ashome/page.tsx", "Propiedades de muestra estilo Airbnb/VRBO con amenidades y fotos.", "Prototipo visual del servicio de departamentos vacacionales privados.", "Vincular a la tabla 'properties' de la base de datos para propietarios registrados."],
  [17, "Notificaciones PWA Móvil", "src/app/api/mobile/notifications/route.ts", "Alertas de prueba (Promoción de temporada, Confirmación de viaje).", "Muestra el panel de notificaciones móvil en cuentas de usuario recién creadas.", "Vincular a la tabla 'user_notifications' y servicio Web Push VAPID real."]
];

const ws = XLSX.utils.aoa_to_sheet(dataMocks);
XLSX.utils.book_append_sheet(wb, ws, "Auditoria Mocks y Fallbacks");

const outputPath = path.join('c:', 'operadora-dev', 'docs', 'AG-Auditoria-Datos-Mock-Y-Fallbacks.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`✅ Archivo Excel de Auditoría de Mocks generado correctamente en: ${outputPath}`);
