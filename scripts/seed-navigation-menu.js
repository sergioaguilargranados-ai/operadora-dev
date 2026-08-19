require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DEFAULT_MENU_STRUCTURE = [
  {
    section_key: 'operation',
    section_title: 'INTRANET & OPERACIÓN',
    section_order: 1,
    items: [
      {
        item_key: 'crm_catalog',
        label: 'Catálogo Clientes & CRM',
        icon_name: 'Users',
        route: '/operacion',
        badge: 'CRM',
        permission_code: 'crm:view',
        sort_order: 1,
        subItems: [
          { item_key: 'crm_clients_catalog', label: 'Catálogo Clientes', route: '/operacion', sort_order: 1 },
          { item_key: 'crm_dashboard', label: 'CRM Dashboard', route: '/dashboard/crm', sort_order: 2 },
          { item_key: 'crm_clients', label: 'Clientes CRM', route: '/dashboard/crm/clientes', sort_order: 3 },
          { item_key: 'crm_contacts', label: 'Contactos CRM', route: '/dashboard/crm/contacts', sort_order: 4 },
          { item_key: 'crm_pipeline', label: 'Pipeline Kanban', route: '/dashboard/crm/pipeline', sort_order: 5 },
          { item_key: 'crm_tasks', label: 'Tareas CRM', route: '/dashboard/crm/tasks', sort_order: 6 },
          { item_key: 'crm_calendar', label: 'Calendario', route: '/dashboard/crm/calendar', sort_order: 7 },
          { item_key: 'crm_whatsapp', label: 'WhatsApp CRM', route: '/dashboard/crm/whatsapp', sort_order: 8 },
          { item_key: 'crm_campaigns', label: 'Campañas Email', route: '/dashboard/crm/campaigns', sort_order: 9 },
          { item_key: 'crm_automation', label: 'Reglas & Workflows', route: '/dashboard/crm/automation', sort_order: 10 },
          { item_key: 'crm_analytics', label: 'Analytics CRM', route: '/dashboard/crm/analytics', sort_order: 11 },
          { item_key: 'crm_client_docs', label: 'Docs Clientes', route: '/dashboard/crm/client-documents', sort_order: 12 },
          { item_key: 'crm_import_csv', label: 'Importar CSV', route: '/dashboard/crm/import', sort_order: 13 }
        ]
      },
      {
        item_key: 'sales_dashboard',
        label: 'Dashboard Ventas',
        icon_name: 'LayoutDashboard',
        route: '/dashboard',
        badge: null,
        permission_code: 'crm:view',
        sort_order: 2
      },
      {
        item_key: 'quotes',
        label: 'Cotizaciones',
        icon_name: 'FileText',
        route: '/dashboard/quotes',
        badge: null,
        permission_code: 'quotes:view',
        sort_order: 3
      },
      {
        item_key: 'rrhh',
        label: 'RRHH / Personal',
        icon_name: 'Briefcase',
        route: '/dashboard/rrhh',
        badge: null,
        permission_code: 'rrhh:view',
        sort_order: 4,
        subItems: [
          { item_key: 'rrhh_panel', label: 'Panel RRHH General', route: '/dashboard/rrhh', sort_order: 1 },
          { item_key: 'rrhh_employees', label: 'Directorio & Empleados', route: '/dashboard/rrhh/employees', sort_order: 2 },
          { item_key: 'rrhh_agents', label: 'Agentes RRHH', route: '/dashboard/rrhh/agents', sort_order: 3 },
          { item_key: 'rrhh_attendance', label: 'Control de Asistencia', route: '/dashboard/rrhh/attendance', sort_order: 4 },
          { item_key: 'rrhh_leaves', label: 'Permisos & Licencias', route: '/dashboard/rrhh/leaves', sort_order: 5 },
          { item_key: 'rrhh_payroll', label: 'Gestión de Nómina', route: '/dashboard/rrhh/payroll', sort_order: 6 },
          { item_key: 'rrhh_recruitment', label: 'Reclutamiento & Vacantes', route: '/dashboard/rrhh/recruitment', sort_order: 7 },
          { item_key: 'rrhh_contracts', label: 'Contratos & Expedientes', route: '/dashboard/rrhh/contracts', sort_order: 8 },
          { item_key: 'rrhh_docs', label: 'Documentos RRHH', route: '/dashboard/rrhh/documents', sort_order: 9 },
          { item_key: 'rrhh_audit', label: 'Auditoría & Logs RRHH', route: '/dashboard/rrhh/audit', sort_order: 10 }
        ]
      },
      {
        item_key: 'store_products',
        label: 'Productos de la tienda',
        icon_name: 'ShoppingBag',
        route: '/dashboard/store',
        badge: null,
        permission_code: 'store:view',
        sort_order: 5
      },
      {
        item_key: 'corporate_panel',
        label: 'Panel de Empresas',
        icon_name: 'Building',
        route: '/dashboard/corporate',
        badge: null,
        permission_code: 'crm:view',
        sort_order: 6,
        subItems: [
          { item_key: 'corp_overview', label: 'Resumen General', route: '/dashboard/corporate', sort_order: 1 },
          { item_key: 'corp_employees', label: 'Empleados Corporativos', route: '/dashboard/corporate?tab=empleados', sort_order: 2 },
          { item_key: 'corp_expenses', label: 'Gastos & Presupuestos', route: '/dashboard/corporate?tab=gastos', sort_order: 3 },
          { item_key: 'corp_metrics', label: 'Métricas & CO2', route: '/dashboard/corporate?tab=metricas', sort_order: 4 },
          { item_key: 'corp_approvals', label: 'Aprobaciones de Viaje', route: '/dashboard/corporate?tab=aprobaciones', sort_order: 5 },
          { item_key: 'corp_policies', label: 'Políticas de Viaje', route: '/dashboard/corporate?tab=politicas', sort_order: 6 },
          { item_key: 'corp_payments', label: 'Métodos de Pago', route: '/dashboard/corporate?tab=pagos', sort_order: 7 }
        ]
      },
      {
        item_key: 'agency_panel',
        label: 'Panel Agencias',
        icon_name: 'Building2',
        route: '/dashboard/agency',
        badge: null,
        permission_code: 'crm:view',
        sort_order: 7,
        subItems: [
          { item_key: 'agency_overview', label: 'Resumen General', route: '/dashboard/agency', sort_order: 1 },
          { item_key: 'agency_agents', label: 'Gestión Agentes', route: '/dashboard/agency?tab=agentes', sort_order: 2 },
          { item_key: 'agency_clients', label: 'Clientes Agencia', route: '/dashboard/agency?tab=clientes', sort_order: 3 },
          { item_key: 'agency_commissions', label: 'Comisiones', route: '/dashboard/agency?tab=comisiones', sort_order: 4 }
        ]
      }
    ]
  },
  {
    section_key: 'bookings',
    section_title: 'GESTIÓN DE RESERVAS',
    section_order: 2,
    items: [
      {
        item_key: 'all_bookings',
        label: 'Todas las Reservas',
        icon_name: 'Package',
        route: '/mis-reservas',
        badge: null,
        permission_code: 'bookings:view',
        sort_order: 1
      },
      {
        item_key: 'travel_insurance',
        label: 'Seguros de Viajero',
        icon_name: 'ShieldCheck',
        route: '/seguros',
        badge: '24/7',
        permission_code: 'insurance:view',
        sort_order: 2
      },
      {
        item_key: 'payments_accounts',
        label: 'Pagos & Cuentas',
        icon_name: 'CreditCard',
        route: '/dashboard/payments',
        badge: null,
        permission_code: 'bookings:payments',
        sort_order: 3
      },
      {
        item_key: 'sat_invoices',
        label: 'Facturación SAT CFDI',
        icon_name: 'Receipt',
        route: '/facturacion',
        badge: 'SAT',
        permission_code: 'invoices:view',
        sort_order: 4
      }
    ]
  },
  {
    section_key: 'admin',
    section_title: 'ADMINISTRACIÓN Y AJUSTES',
    section_order: 3,
    items: [
      {
        item_key: 'content_mgmt',
        label: 'Gestión de Contenido',
        icon_name: 'Globe',
        route: '/admin/content',
        badge: null,
        permission_code: 'content:view',
        sort_order: 1,
        subItems: [
          { item_key: 'content_banner', label: 'Banner Principal', route: '/admin/content', sort_order: 1 },
          { item_key: 'content_promotions', label: 'Promociones', route: '/admin/content?tab=promotions', sort_order: 2 },
          { item_key: 'content_flights', label: 'Vuelos Destacados', route: '/admin/content?tab=flights', sort_order: 3 },
          { item_key: 'content_packages', label: 'Paquetes Turísticos', route: '/admin/content?tab=packages', sort_order: 4 },
          { item_key: 'content_hotels', label: 'Catálogo Hoteles', route: '/admin/content?tab=hotels-catalog', sort_order: 5 },
          { item_key: 'content_airlines', label: 'Catálogo Aerolíneas', route: '/admin/content?tab=airlines', sort_order: 6 },
          { item_key: 'content_videos', label: 'Videos & URLs', route: '/admin/content?tab=videos', sort_order: 7 },
          { item_key: 'content_tour_images', label: 'Imágenes Tours', route: '/admin/content?tab=tour-images', sort_order: 8 },
          { item_key: 'content_processes', label: 'Ejecución de Procesos', route: '/admin/content?tab=processes', sort_order: 9 },
          { item_key: 'content_expo', label: 'Landing Principal', route: '/admin/content?tab=expo', sort_order: 10 },
          { item_key: 'content_mobile_app', label: 'App Móvil PWA', route: '/admin/content?tab=mobile-app', sort_order: 11 },
          { item_key: 'content_store_products', label: 'Tienda (Productos)', route: '/admin/content?tab=store-products', sort_order: 12 },
          { item_key: 'content_destinations', label: 'Destinos (IA)', route: '/admin/content?tab=destinations', sort_order: 13 }
        ]
      },
      {
        item_key: 'admin_system',
        label: 'Administración & Sistema',
        icon_name: 'ShieldCheck',
        route: '/admin/features',
        badge: null,
        permission_code: 'admin:users:view',
        sort_order: 2,
        subItems: [
          { item_key: 'admin_features', label: 'Administración de Funciones', route: '/admin/features', sort_order: 1 },
          { item_key: 'admin_tenants', label: 'Tenants & Marca Blanca', route: '/admin/tenants', sort_order: 2 },
          { item_key: 'admin_megatravel', label: 'Panel MegaTravel', route: '/admin/megatravel', sort_order: 3 },
          { item_key: 'admin_tour_images_mgt', label: 'Imágenes de Tours', route: '/admin/tour-images', sort_order: 4 },
          { item_key: 'admin_scraping', label: 'MegaTravel Scraping', route: '/admin/megatravel-scraping', sort_order: 5 },
          { item_key: 'admin_users_roles', label: 'Usuarios & Asignaciones', route: '/dashboard/admin/users', sort_order: 6 },
          { item_key: 'admin_roles_permissions', label: 'Roles & Permisos', route: '/admin/roles', sort_order: 7 }
        ]
      },
      {
        item_key: 'superadmin_panel',
        label: 'Panel Super Admin',
        icon_name: 'ShieldCheck',
        route: '/dashboard/admin/agencies',
        badge: null,
        permission_code: 'admin:agencies:view',
        sort_order: 3
      },
      {
        item_key: 'moderation_panel',
        label: 'Moderación',
        icon_name: 'Eye',
        route: '/dashboard/moderacion',
        badge: null,
        permission_code: 'admin:users:view',
        sort_order: 4
      },
      {
        item_key: 'whatsapp_comm',
        label: 'WhatsApp & Mensajes',
        icon_name: 'MessageCircle',
        route: '/comunicacion',
        badge: null,
        permission_code: 'crm:whatsapp:use',
        sort_order: 5
      }
    ]
  },
  {
    section_key: 'account',
    section_title: 'CUENTA PERSONAL',
    section_order: 4,
    items: [
      {
        item_key: 'user_profile',
        label: 'Mi Perfil',
        icon_name: 'UserIcon',
        route: '/perfil',
        badge: null,
        permission_code: 'profile:view',
        sort_order: 1
      }
    ]
  }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('--- 1. CREANDO TABLA navigation_menu_items ---');
    await client.query(`
      CREATE TABLE IF NOT EXISTS navigation_menu_items (
        id SERIAL PRIMARY KEY,
        section_key VARCHAR(50) NOT NULL,
        section_title VARCHAR(100) NOT NULL,
        section_order INTEGER DEFAULT 0,
        item_key VARCHAR(100) NOT NULL,
        label VARCHAR(100) NOT NULL,
        icon_name VARCHAR(50),
        route VARCHAR(255) NOT NULL,
        badge VARCHAR(20),
        permission_code VARCHAR(100),
        parent_item_key VARCHAR(100),
        sort_order INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        CONSTRAINT uq_nav_item UNIQUE (item_key, tenant_id)
      );
    `);
    console.log('✅ Tabla navigation_menu_items lista.');

    console.log('\n--- 2. INSERTANDO / ACTUALIZANDO ESTRUCTURA DE MENÚ BASE ---');
    let totalItems = 0;
    for (const sec of DEFAULT_MENU_STRUCTURE) {
      for (const item of sec.items) {
        // Insertar item principal (global, tenant_id = NULL)
        await client.query(`
          INSERT INTO navigation_menu_items (
            section_key, section_title, section_order,
            item_key, label, icon_name, route, badge,
            permission_code, parent_item_key, sort_order, is_active, tenant_id, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NULL, $10, true, NULL, NOW())
          ON CONFLICT (item_key, tenant_id) DO UPDATE SET
            section_key = EXCLUDED.section_key,
            section_title = EXCLUDED.section_title,
            section_order = EXCLUDED.section_order,
            label = EXCLUDED.label,
            icon_name = EXCLUDED.icon_name,
            route = EXCLUDED.route,
            badge = EXCLUDED.badge,
            permission_code = EXCLUDED.permission_code,
            parent_item_key = NULL,
            sort_order = EXCLUDED.sort_order,
            updated_at = NOW();
        `, [
          sec.section_key,
          sec.section_title,
          sec.section_order,
          item.item_key,
          item.label,
          item.icon_name,
          item.route,
          item.badge,
          item.permission_code,
          item.sort_order
        ]);
        totalItems++;

        // Insertar sub-ítems si tiene
        if (Array.isArray(item.subItems)) {
          for (const sub of item.subItems) {
            await client.query(`
              INSERT INTO navigation_menu_items (
                section_key, section_title, section_order,
                item_key, label, icon_name, route, badge,
                permission_code, parent_item_key, sort_order, is_active, tenant_id, updated_at
              ) VALUES ($1, $2, $3, $4, $5, NULL, $6, NULL, $7, $8, $9, true, NULL, NOW())
              ON CONFLICT (item_key, tenant_id) DO UPDATE SET
                section_key = EXCLUDED.section_key,
                section_title = EXCLUDED.section_title,
                section_order = EXCLUDED.section_order,
                label = EXCLUDED.label,
                route = EXCLUDED.route,
                permission_code = EXCLUDED.permission_code,
                parent_item_key = EXCLUDED.parent_item_key,
                sort_order = EXCLUDED.sort_order,
                updated_at = NOW();
            `, [
              sec.section_key,
              sec.section_title,
              sec.section_order,
              sub.item_key,
              sub.label,
              sub.route,
              item.permission_code,
              item.item_key,
              sub.sort_order
            ]);
            totalItems++;
          }
        }
      }
    }

    console.log(`✅ Estructura base guardada: ${totalItems} elementos registrados.`);

  } catch (error) {
    console.error('❌ Error en seed-navigation-menu:', error);
  } finally {
    client.release();
    pool.end();
  }
}

run();
