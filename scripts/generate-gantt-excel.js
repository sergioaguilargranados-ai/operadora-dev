const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Crear libro de trabajo
const wb = XLSX.utils.book_new();

// ==========================================
// HOJA 1: RESUMEN EJECUTIVO Y MACRO-ACTIVIDADES
// ==========================================
const dataResumen = [
  ["AS OPERADORA DE VIAJES Y EVENTOS - PLAN MAESTRO DE TRABAJO Y ENTREGAS 2026"],
  ["Cliente: Sergio Aguilar Granados | Fecha de Emisión: 14 de Agosto de 2026 | Versión: v2.468"],
  [""],
  ["#", "Macro Actividad", "Descripción del Alcance", "Esfuerzo (HH)", "Duración (Días)", "Fecha Inicio", "Fecha Entrega", "Fase de Entrega", "Estado Actual"],
  [1, "1. Flujo Básico Cliente App Móvil (PWA)", "Registro/Login (Google & Email), itinerario activo, perfil del viajero, tienda y pasarela de pago PWA.", 20, 2, "14/08/2026", "15/08/2026", "Fase 1 - MVP PWA", "En Proceso (90%)"],
  [2, "2. Modificaciones Portal & Inconsistencias", "Alineación 100% entre PWA y Portal (/perfil, /mis-reservas, /reserva/[id]), vouchers PDF y facturación CFDI.", 32, 4, "17/08/2026", "20/08/2026", "Fase 1 - MVP Portal", "Pendiente"],
  [3, "3. Modificación Panel de Agencias", "Ajustes visuales y funcionales a /dashboard/agency según prototipos (Overview, Clientes, CRM, Ventas, White-Label).", 40, 5, "21/08/2026", "27/08/2026", "Fase 2 - Agencias", "Pendiente"],
  [4, "4. Modificación Panel de Empresas", "Ajustes a /dashboard/corporate según prototipos (Directorio Empleados, Control Gastos, CO2, Aprobaciones, Políticas).", 35, 5, "28/08/2026", "03/09/2026", "Fase 2 - Empresas", "Pendiente"],
  [5, "5. Reestructuración de Menú & Funcionalidades", "Rediseño final de PortalSidebar.tsx, depuración de opciones obsoletas e integración total de vistas CRM/RRHH/Tienda.", 24, 3, "04/09/2026", "08/09/2026", "Fase 2 - Intranet", "Pendiente"],
  [6, "6. Conversión PWA a App Nativa (iOS/Android)", "Migración a Expo / React Native / Capacitor, empaquetado APK/IPA, Push Notifications nativas (FCM/APNs) y Stores.", 64, 8, "09/09/2026", "18/09/2026", "Fase 3 - App Nativa", "Pendiente"],
  [7, "7. Productos Complementarios No Desarrollados", "Desarrollo modular de 8 motores: Traslados, Autos, Seguros, eSIM, Paquetes, Cruceros, TourMundial y Parques.", 195, 25, "21/09/2026", "26/10/2026", "Fase 4 - Productos", "Pendiente"],
  [8, "8. Gestión de Claves & Cuentas Proveedores", "Migración de credenciales Sandbox a Producción (Amadeus, Duffel, Hotelbeds, Stripe, SendGrid, Apple, Google).", 30, 5, "27/10/2026", "02/11/2026", "Transversal", "Pendiente"],
  [9, "9. Migración a Producción Fase a Fase", "Pase a producción por bloques con rollback plan, pruebas de carga y liberación final en vivo.", 45, 15, "03/11/2026", "24/11/2026", "Producción Final", "Pendiente"],
  ["", "TOTAL PROYECTO", "9 Macro Actividades Integrales de Entrega", 485, 67, "14/08/2026", "24/11/2026", "4 Fases Principales", "Plan de Entrega"]
];

// ==========================================
// HOJA 2: CRONOGRAMA GANTT DETALLADO (WBS)
// ==========================================
const dataGantt = [
  ["CRONOGRAMA DETALLADO DE TAREAS Y DIAGRAMA GANTT (SEMANAS DE AGOSTO A NOVIEMBRE 2026)"],
  [""],
  [
    "WBS", "Macro Actividad", "Subtarea / Entregable Específico", "HH Est.", "Días", "Inicio", "Fin", "Responsable",
    "Ago S2", "Ago S3", "Ago S4", "Sep S1", "Sep S2", "Sep S3", "Sep S4", "Oct S1", "Oct S2", "Oct S3", "Oct S4", "Nov S1", "Nov S2", "Nov S3"
  ],
  // 1. PWA Cliente
  ["1.1", "1. Flujo PWA Cliente", "Registro/Login con Google OAuth y Email en PWA", 4, 0.5, "14/08/2026", "14/08/2026", "Desarrollador Lead", "███", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["1.2", "1. Flujo PWA Cliente", "Perfil de viajero y gestión de itinerario activo", 6, 0.5, "14/08/2026", "14/08/2026", "Desarrollador UI", "███", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["1.3", "1. Flujo PWA Cliente", "Pasarela de pago Tienda / Viajes con sesión inyectada", 6, 0.5, "15/08/2026", "15/08/2026", "Desarrollador Backend", "███", "", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["1.4", "1. Flujo PWA Cliente", "Pruebas end-to-end de reserva y soporte offline PWA", 4, 0.5, "15/08/2026", "15/08/2026", "QA / Tester", "███", "", "", "", "", "", "", "", "", "", "", "", "", ""],

  // 2. Modificaciones Portal & Inconsistencias
  ["2.1", "2. Portal & Inconsistencias", "Alineación de datos /perfil y /mis-reservas con PWA", 8, 1, "17/08/2026", "17/08/2026", "Desarrollador Lead", "", "███", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["2.2", "2. Portal & Inconsistencias", "Corrección de flujo de estados de reserva (Pendiente/Pagado)", 8, 1, "18/08/2026", "18/08/2026", "Desarrollador Backend", "", "███", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["2.3", "2. Portal & Inconsistencias", "Generación de vouchers PDF de itinerario y recibos", 8, 1, "19/08/2026", "19/08/2026", "Desarrollador UI", "", "███", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["2.4", "2. Portal & Inconsistencias", "Validación final de timbrado y facturación CFDI 4.0", 8, 1, "20/08/2026", "20/08/2026", "Desarrollador Backend", "", "███", "", "", "", "", "", "", "", "", "", "", "", ""],

  // 3. Panel de Agencias
  ["3.1", "3. Panel de Agencias", "Ajustes a Overview /dashboard/agency (KPIs y Recharts)", 8, 1, "21/08/2026", "21/08/2026", "Desarrollador UI", "", "███", "", "", "", "", "", "", "", "", "", "", "", ""],
  ["3.2", "3. Panel de Agencias", "Directorio de Clientes y Agentes con acciones rápidas", 8, 1, "24/08/2026", "24/08/2026", "Desarrollador Frontend", "", "", "███", "", "", "", "", "", "", "", "", "", "", ""],
  ["3.3", "3. Panel de Agencias", "CRM Pipeline Kanban (/dashboard/agency/crm)", 10, 1.5, "25/08/2026", "26/08/2026", "Desarrollador Lead", "", "", "███", "", "", "", "", "", "", "", "", "", "", ""],
  ["3.4", "3. Panel de Agencias", "Configuración White-Label y Pasarela Stripe por tenant", 14, 1.5, "26/08/2026", "27/08/2026", "Desarrollador Backend", "", "", "███", "", "", "", "", "", "", "", "", "", "", ""],

  // 4. Panel de Empresas
  ["4.1", "4. Panel de Empresas", "Directorio Empleados y Control de Gastos por departamento", 10, 1.5, "28/08/2026", "31/08/2026", "Desarrollador Frontend", "", "", "███", "", "", "", "", "", "", "", "", "", "", ""],
  ["4.2", "4. Panel de Empresas", "Métricas de CO2 DEFRA y Aprobaciones de viajes corporativos", 10, 1.5, "01/09/2026", "02/09/2026", "Desarrollador Backend", "", "", "", "███", "", "", "", "", "", "", "", "", "", ""],
  ["4.3", "4. Panel de Empresas", "Políticas de viaje y métodos de pago corporativos", 15, 2, "02/09/2026", "03/09/2026", "Desarrollador Lead", "", "", "", "███", "", "", "", "", "", "", "", "", "", ""],

  // 5. Menú & Depuración
  ["5.1", "5. Menú Sidebar", "Rediseño completo de PortalSidebar.tsx en Intranet Layout", 10, 1.5, "04/09/2026", "07/09/2026", "Desarrollador UI", "", "", "", "███", "", "", "", "", "", "", "", "", "", ""],
  ["5.2", "5. Menú Sidebar", "Incrustación de opciones solicitadas y depuración obsoleta", 14, 1.5, "07/09/2026", "08/09/2026", "Desarrollador Frontend", "", "", "", "███", "", "", "", "", "", "", "", "", "", ""],

  // 6. Conversión PWA a App Nativa
  ["6.1", "6. App Nativa", "Setup de proyecto Expo / React Native / Capacitor", 12, 1.5, "09/09/2026", "10/09/2026", "Arquitecto Móvil", "", "", "", "", "███", "", "", "", "", "", "", "", "", ""],
  ["6.2", "6. App Nativa", "Adaptación de vistas PWA a componentes nativos", 20, 2.5, "11/09/2026", "14/09/2026", "Desarrollador Móvil", "", "", "", "", "███", "", "", "", "", "", "", "", "", ""],
  ["6.3", "6. App Nativa", "Notificaciones Push Nativas (FCM / APNs) y Geolocalización", 16, 2, "15/09/2026", "16/09/2026", "Desarrollador Backend", "", "", "", "", "", "███", "", "", "", "", "", "", "", ""],
  ["6.4", "6. App Nativa", "Empaquetado APK/IPA y pruebas en emuladores/dispositivos reales", 16, 2, "17/09/2026", "18/09/2026", "DevOps / Móvil", "", "", "", "", "", "███", "", "", "", "", "", "", "", ""],

  // 7. Productos Complementarios
  ["7.1", "7. Productos", "7.1 Motor de Traslados (Transfers Aeropuerto-Hotel)", 20, 2.5, "21/09/2026", "23/09/2026", "Desarrollador Integraciones", "", "", "", "", "", "", "███", "", "", "", "", "", "", ""],
  ["7.2", "7. Productos", "7.2 Motor de Renta de Autos (Hertz/Avis)", 22, 3, "24/09/2026", "28/09/2026", "Desarrollador Integraciones", "", "", "", "", "", "", "███", "", "", "", "", "", "", ""],
  ["7.3", "7. Productos", "7.3 Cotizador de Seguros de Viaje / Asistencia Médica", 18, 2, "29/09/2026", "30/09/2026", "Desarrollador Backend", "", "", "", "", "", "", "", "███", "", "", "", "", "", ""],
  ["7.4", "7. Productos", "7.4 Proveedor eSIM Internacional (Planes de datos QR)", 20, 2.5, "01/10/2026", "05/10/2026", "Desarrollador Integraciones", "", "", "", "", "", "", "", "███", "", "", "", "", "", ""],
  ["7.5", "7. Productos", "7.5 Motor de Paquetes Dinámicos (Vuelo+Hotel)", 30, 4, "06/10/2026", "09/10/2026", "Desarrollador Lead", "", "", "", "", "", "", "", "", "███", "", "", "", "", ""],
  ["7.6", "7. Productos", "7.6 Motor de Cruceros (Royal Caribbean/MSC)", 32, 4, "12/10/2026", "15/10/2026", "Desarrollador Integraciones", "", "", "", "", "", "", "", "", "", "███", "", "", "", ""],
  ["7.7", "7. Productos", "7.7 Integración Catálogo TourMundial", 25, 3, "16/10/2026", "20/10/2026", "Desarrollador Scraping", "", "", "", "", "", "", "", "", "", "███", "", "", "", ""],
  ["7.8", "7. Productos", "7.8 Boletaje Entradas Parques (Disney/Universal/Xcaret)", 28, 3.5, "21/10/2026", "26/10/2026", "Desarrollador Fullstack", "", "", "", "", "", "", "", "", "", "", "███", "", "", ""],

  // 8. Gestión de Claves & Cuentas Proveedores
  ["8.1", "8. Gestión Claves", "Configuración de credenciales de producción Amadeus & Duffel", 6, 1, "27/10/2026", "27/10/2026", "Lead DevOps", "", "", "", "", "", "", "", "", "", "", "███", "", "", ""],
  ["8.2", "8. Gestión Claves", "Activación de cuentas B2B Live Hotelbeds / RateHawk", 6, 1, "28/10/2026", "28/10/2026", "Director Operaciones", "", "", "", "", "", "", "", "", "", "", "███", "", "", ""],
  ["8.3", "8. Gestión Claves", "Switch a claves Live Stripe, PayPal, MercadoPago & Facturama", 6, 1, "29/10/2026", "29/10/2026", "Desarrollador Backend", "", "", "", "", "", "", "", "", "", "", "███", "", "", ""],
  ["8.4", "8. Gestión Claves", "Verificación DNS de correo SendGrid (SPF, DKIM, DMARC)", 6, 1, "30/10/2026", "30/10/2026", "DevOps / SysAdmin", "", "", "", "", "", "", "", "", "", "", "███", "", "", ""],
  ["8.5", "8. Gestión Claves", "Cuentas Desarrollador Apple Developer & Google Play Console", 6, 1, "02/11/2026", "02/11/2026", "Project Manager", "", "", "", "", "", "", "", "", "", "", "", "███", "", ""],

  // 9. Migración a Producción Fase a Fase
  ["9.1", "9. Producción", "Fase 1: Despliegue PWA + Portal Cliente + Venta Vuelos/Hoteles/Tours", 10, 3, "03/11/2026", "06/11/2026", "Equipo DevOps / Fullstack", "", "", "", "", "", "", "", "", "", "", "", "███", "", ""],
  ["9.2", "9. Producción", "Fase 2: Despliegue Panel Agencias + Panel Empresas + CRM + Facturación", 10, 3, "09/11/2026", "12/11/2026", "Equipo DevOps / Fullstack", "", "", "", "", "", "", "", "", "", "", "", "███", "███", ""],
  ["9.3", "9. Producción", "Fase 3: Publicación de App Nativa en Apple App Store & Google Play Store", 15, 5, "13/11/2026", "18/11/2026", "Especialista Móvil / PM", "", "", "", "", "", "", "", "", "", "", "", "", "███", ""],
  ["9.4", "9. Producción", "Fase 4: Despliegue de Productos Complementarios y Cierre de Proyecto", 10, 4, "19/11/2026", "24/11/2026", "Equipo Completo", "", "", "", "", "", "", "", "", "", "", "", "", "", "███"]
];

// ==========================================
// HOJA 3: MATRIZ DE FASES DE LIBERACIÓN
// ==========================================
const dataFases = [
  ["MATRIZ DE LIBERACIÓN POR FASES A PRODUCCIÓN"],
  [""],
  ["Fase de Entrega", "Rango de Fechas", "Duración", "Hito / Entregable Clave", "Módulos Incluidos", "Criterios de Aceptación"],
  [
    "FASE 1: MVP PWA & Portal Cliente",
    "14/08/2026 - 20/08/2026",
    "6 Días",
    "Cliente Final Funcional en Web y PWA",
    "App Móvil PWA completa, Registro/Login Google & Email, Itinerarios activos, Perfil, Mis Reservas, Facturación CFDI.",
    "El cliente puede registrarse, navegar su itinerario, reservar y facturar sin fricción tanto en PWA como en escritorio."
  ],
  [
    "FASE 2: Intranet Agencias & Empresas",
    "21/08/2026 - 08/09/2026",
    "13 Días",
    "Portales Administrativos B2B & B2E",
    "Dashboard de Agencias (Overview, CRM Kanban, Ventas, White-Label), Panel de Empresas (Gastos, CO2, Aprobaciones), Menú Sidebar unificado.",
    "Agencias pueden gestionar sus clientes y comisiones; empresas pueden aprobar viajes y auditar gastos."
  ],
  [
    "FASE 3: App Nativa iOS / Android",
    "09/09/2026 - 18/09/2026",
    "8 Días",
    "Binarios APK/IPA para Tiendas",
    "App empaquetada en Expo/Capacitor, Push Notifications nativas FCM/APNs, integración con sensores del dispositivo.",
    "Instalación directa en teléfonos y envío de binarios a App Store Connect y Google Play Console."
  ],
  [
    "FASE 4: Productos Complementarios",
    "21/09/2026 - 26/10/2026",
    "25 Días",
    "Catálogo Turístico Completo",
    "Motores de Traslados, Autos, Seguros, eSIM, Paquetes Dinámicos, Cruceros, TourMundial y Parques Temáticos.",
    "Todos los 8 productos adicionales integrados y cotizando en tiempo real."
  ],
  [
    "DESPLIEGUE FINAL PRODUCCIÓN",
    "27/10/2026 - 24/11/2026",
    "20 Días",
    "Plataforma Live 100% Operativa",
    "Gestión de credenciales de producción, pruebas de carga, soporte post-liberación y switch final de DNS.",
    "Operación comercial 100% en vivo con proveedores reales y pasarelas productivas."
  ]
];

// Crear Hojas de Trabajo
const wsResumen = XLSX.utils.aoa_to_sheet(dataResumen);
const wsGantt = XLSX.utils.aoa_to_sheet(dataGantt);
const wsFases = XLSX.utils.aoa_to_sheet(dataFases);

// Agregar hojas al libro
XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Macro Actividades");
XLSX.utils.book_append_sheet(wb, wsGantt, "Diagrama Gantt Detallado");
XLSX.utils.book_append_sheet(wb, wsFases, "Plan de Liberación por Fases");

// Guardar archivo Excel
const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

const outputPath = path.join(docsDir, 'AG-Plan-De-Trabajo-Gantt-Entregas-2026.xlsx');
XLSX.writeFile(wb, outputPath);

console.log(`🎉 Plan de trabajo Gantt generado exitosamente en: ${outputPath}`);
