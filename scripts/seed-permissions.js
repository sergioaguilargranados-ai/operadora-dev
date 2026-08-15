require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const PERMISSIONS = [
  // MÓDULO: CRM
  { code: 'crm:view', module: 'crm', action: 'view', description: 'Ver dashboard y módulos de CRM' },
  { code: 'crm:contacts:view', module: 'crm', action: 'view', description: 'Ver catálogo de contactos y clientes' },
  { code: 'crm:contacts:create', module: 'crm', action: 'create', description: 'Crear nuevos contactos en CRM' },
  { code: 'crm:contacts:edit', module: 'crm', action: 'edit', description: 'Editar contactos existentes en CRM' },
  { code: 'crm:contacts:delete', module: 'crm', action: 'delete', description: 'Eliminar contactos en CRM' },
  { code: 'crm:contacts:export', module: 'crm', action: 'export', description: 'Exportar contactos de CRM a Excel/CSV' },
  { code: 'crm:pipeline:manage', module: 'crm', action: 'manage', description: 'Mover y gestionar embudo de ventas' },
  { code: 'crm:tasks:manage', module: 'crm', action: 'manage', description: 'Gestionar tareas y recordatorios' },
  { code: 'crm:whatsapp:use', module: 'crm', action: 'use', description: 'Enviar mensajes de WhatsApp y plantillas' },

  // MÓDULO: COTIZACIONES
  { code: 'quotes:view', module: 'quotes', action: 'view', description: 'Ver listado de cotizaciones' },
  { code: 'quotes:create', module: 'quotes', action: 'create', description: 'Crear nueva cotización' },
  { code: 'quotes:edit', module: 'quotes', action: 'edit', description: 'Modificar cotizaciones existentes' },
  { code: 'quotes:delete', module: 'quotes', action: 'delete', description: 'Eliminar cotizaciones' },
  { code: 'quotes:export', module: 'quotes', action: 'export', description: 'Exportar cotizaciones a PDF y Excel' },
  { code: 'quotes:discount', module: 'quotes', action: 'discount', description: 'Aplicar descuentos o markups manuales' },

  // MÓDULO: RESERVAS
  { code: 'bookings:view', module: 'bookings', action: 'view', description: 'Ver reservaciones' },
  { code: 'bookings:create', module: 'bookings', action: 'create', description: 'Crear nuevas reservaciones' },
  { code: 'bookings:edit', module: 'bookings', action: 'edit', description: 'Modificar reservaciones existentes' },
  { code: 'bookings:cancel', module: 'bookings', action: 'cancel', description: 'Cancelar reservaciones' },
  { code: 'bookings:payments', module: 'bookings', action: 'payments', description: 'Gestionar y registrar pagos de reservas' },

  // MÓDULO: RRHH & AGENTES
  { code: 'rrhh:view', module: 'rrhh', action: 'view', description: 'Ver módulo de RRHH y agentes' },
  { code: 'rrhh:agents:manage', module: 'rrhh', action: 'manage', description: 'Gestionar agentes y comisiones' },
  { code: 'rrhh:employees:manage', module: 'rrhh', action: 'manage', description: 'Administrar empleados y contratos' },
  { code: 'rrhh:payroll:view', module: 'rrhh', action: 'view', description: 'Ver nómina y dispersiones' },
  { code: 'rrhh:commissions:approve', module: 'rrhh', action: 'approve', description: 'Aprobar pago de comisiones' },

  // MÓDULO: GESTIÓN DE CONTENIDO
  { code: 'content:view', module: 'content', action: 'view', description: 'Ver catálogo de contenido dinámico' },
  { code: 'content:manage', module: 'content', action: 'manage', description: 'Modificar banners, promociones y catálogos' },

  // MÓDULO: TIENDA ONLINE
  { code: 'store:view', module: 'store', action: 'view', description: 'Ver productos y tienda online' },
  { code: 'store:manage', module: 'store', action: 'manage', description: 'Crear y editar productos de tienda' },

  // MÓDULO: FACTURACIÓN
  { code: 'invoices:view', module: 'invoices', action: 'view', description: 'Ver facturas y comprobantes fiscales SAT' },
  { code: 'invoices:create', module: 'invoices', action: 'create', description: 'Emitir o solicitar facturas CFDI' },

  // MÓDULO: ADMINISTRACIÓN Y TENANTS
  { code: 'admin:users:view', module: 'admin', action: 'view', description: 'Ver listado de usuarios' },
  { code: 'admin:users:manage', module: 'admin', action: 'manage', description: 'Crear, activar y cambiar roles de usuarios' },
  { code: 'admin:roles:manage', module: 'admin', action: 'manage', description: 'Administrar catálogo de roles y permisos' },
  { code: 'admin:features:manage', module: 'admin', action: 'manage', description: 'Gestionar feature flags del sistema' },
  { code: 'admin:tenants:manage', module: 'admin', action: 'manage', description: 'Administrar marcas blancas y tenants' },
  { code: 'admin:agencies:view', module: 'admin', action: 'view', description: 'Acceso a Panel Super Admin de agencias' },

  // MÓDULO: VIAJERO / CLIENTE (PWA & WEB)
  { code: 'profile:view', module: 'profile', action: 'view', description: 'Ver y editar mi perfil personal' },
  { code: 'my_bookings:view', module: 'my_bookings', action: 'view', description: 'Ver mis propias reservas de viaje' },
  { code: 'my_invoices:view', module: 'my_invoices', action: 'view', description: 'Ver mis comprobantes de facturación' },
  { code: 'help:view', module: 'help', action: 'view', description: 'Acceder a centro de ayuda y soporte' },

  // MÓDULO: PÚBLICO / GUEST (LANDING)
  { code: 'public:tours:view', module: 'public', action: 'view', description: 'Ver tours y catálogo comercial público' },
  { code: 'public:search:use', module: 'public', action: 'use', description: 'Usar motores de búsqueda de vuelos, hoteles' },
  { code: 'public:quote:request', module: 'public', action: 'request', description: 'Solicitar cotización desde la landing' }
];

const ROLES_SEED = [
  { name: 'SUPER_ADMIN', display_name: 'Super Administrador', description: 'Control total e irrestricto de toda la plataforma', is_system: true },
  { name: 'ADMIN', display_name: 'Administrador General', description: 'Administración de operación, contenidos y usuarios', is_system: true },
  { name: 'MANAGER', display_name: 'Gerente de Operaciones', description: 'Supervisión operativa, CRM, cotizaciones y RRHH', is_system: true },
  { name: 'AGENCY_ADMIN', display_name: 'Administrador de Agencia', description: 'Control de la marca blanca, sus agentes y clientes', is_system: true },
  { name: 'AGENT', display_name: 'Agente de Viajes', description: 'Gestión de clientes propios, cotizaciones y reservas', is_system: true },
  { name: 'HR_MANAGER', display_name: 'Gerente de Recursos Humanos', description: 'Administración de personal, nómina y contratos', is_system: true },
  { name: 'CLIENT', display_name: 'Cliente / Viajero', description: 'Consulta de reservas propias, facturas y perfil', is_system: true },
  { name: 'USER', display_name: 'Usuario Registrado', description: 'Usuario estándar con acceso a cuenta personal', is_system: true },
  { name: 'GUEST', display_name: 'Visitante Público', description: 'Acceso de solo lectura a catálogo y cotizaciones', is_system: true }
];

async function run() {
  const client = await pool.connect();
  try {
    console.log('--- 1. ASEGURANDO COLUMNAS EN TABLAS ---');
    await client.query(`
      ALTER TABLE roles ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);
      ALTER TABLE roles ADD COLUMN IF NOT EXISTS tenant_id INTEGER REFERENCES tenants(id) ON DELETE CASCADE;
      ALTER TABLE roles ADD COLUMN IF NOT EXISTS is_system BOOLEAN DEFAULT false;
      ALTER TABLE permissions ADD COLUMN IF NOT EXISTS code VARCHAR(100);
    `);
    console.log('✅ Columnas en roles y permissions aseguradas.');

    await client.query(`
      CREATE TABLE IF NOT EXISTS role_permissions (
        role_id INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
        permission_id INTEGER NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        PRIMARY KEY (role_id, permission_id)
      );
    `);
    console.log('✅ Tabla role_permissions asegurada.');

    console.log('\n--- 2. INSERTANDO O ACTUALIZANDO ROLES BASE ---');
    for (const r of ROLES_SEED) {
      await client.query(`
        INSERT INTO roles (name, display_name, description, is_system, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        ON CONFLICT (name) DO UPDATE 
        SET display_name = EXCLUDED.display_name,
            description = EXCLUDED.description,
            is_system = EXCLUDED.is_system,
            updated_at = NOW();
      `, [r.name, r.display_name, r.description, r.is_system]);
    }
    console.log('✅ Roles base actualizados.');

    console.log('\n--- 3. INSERTANDO O ACTUALIZANDO PERMISOS ---');
    for (const p of PERMISSIONS) {
      const existing = await client.query('SELECT id FROM permissions WHERE code = $1 OR name = $1', [p.code]);
      if (existing.rows.length > 0) {
        await client.query(`
          UPDATE permissions 
          SET code = $1, name = $1, module = $2, action = $3, description = $4
          WHERE id = $5
        `, [p.code, p.module, p.action, p.description, existing.rows[0].id]);
      } else {
        await client.query(`
          INSERT INTO permissions (name, code, module, action, description, created_at)
          VALUES ($1, $1, $2, $3, $4, NOW())
        `, [p.code, p.module, p.action, p.description]);
      }
    }
    console.log(`✅ ${PERMISSIONS.length} permisos registrados.`);

    console.log('\n--- 4. ASIGNANDO MATRIZ DE PERMISOS INICIAL ---');
    // Obtener todos los roles y permisos con IDs
    const allRoles = (await client.query('SELECT id, name FROM roles')).rows;
    const allPerms = (await client.query('SELECT id, code, module FROM permissions')).rows;

    const roleMap = Object.fromEntries(allRoles.map(r => [r.name, r.id]));
    const permMap = Object.fromEntries(allPerms.map(p => [p.code, p.id]));

    // Definir matriz inicial
    const matrix = {
      SUPER_ADMIN: allPerms.map(p => p.code), // Todos
      ADMIN: allPerms.filter(p => !p.code.startsWith('admin:agencies')).map(p => p.code),
      MANAGER: allPerms.filter(p => ['crm', 'quotes', 'bookings', 'rrhh', 'content', 'store', 'invoices', 'profile', 'public'].includes(p.module)).map(p => p.code),
      AGENCY_ADMIN: [
        'crm:view', 'crm:contacts:view', 'crm:contacts:create', 'crm:contacts:edit', 'crm:contacts:export', 'crm:pipeline:manage', 'crm:tasks:manage', 'crm:whatsapp:use',
        'quotes:view', 'quotes:create', 'quotes:edit', 'quotes:export', 'quotes:discount',
        'bookings:view', 'bookings:create', 'bookings:edit', 'bookings:payments',
        'rrhh:view', 'rrhh:agents:manage', 'rrhh:commissions:approve',
        'invoices:view', 'invoices:create',
        'profile:view', 'public:tours:view', 'public:search:use', 'public:quote:request'
      ],
      AGENT: [
        'crm:view', 'crm:contacts:view', 'crm:contacts:create', 'crm:contacts:edit', 'crm:pipeline:manage', 'crm:tasks:manage', 'crm:whatsapp:use',
        'quotes:view', 'quotes:create', 'quotes:edit', 'quotes:export',
        'bookings:view', 'bookings:create',
        'profile:view', 'public:tours:view', 'public:search:use', 'public:quote:request'
      ],
      HR_MANAGER: [
        'rrhh:view', 'rrhh:agents:manage', 'rrhh:employees:manage', 'rrhh:payroll:view', 'rrhh:commissions:approve',
        'profile:view'
      ],
      CLIENT: [
        'profile:view', 'my_bookings:view', 'my_invoices:view', 'help:view',
        'public:tours:view', 'public:search:use', 'public:quote:request'
      ],
      USER: [
        'profile:view', 'my_bookings:view', 'my_invoices:view', 'help:view',
        'public:tours:view', 'public:search:use', 'public:quote:request'
      ],
      GUEST: [
        'public:tours:view', 'public:search:use', 'public:quote:request', 'help:view'
      ]
    };

    for (const [roleName, permCodes] of Object.entries(matrix)) {
      const roleId = roleMap[roleName];
      if (!roleId) continue;

      for (const pCode of permCodes) {
        const permId = permMap[pCode];
        if (!permId) continue;

        await client.query(`
          INSERT INTO role_permissions (role_id, permission_id, created_at)
          VALUES ($1, $2, NOW())
          ON CONFLICT (role_id, permission_id) DO NOTHING;
        `, [roleId, permId]);
      }
    }
    console.log('✅ Matriz de permisos inicial asignada exitosamente.');

    const countCheck = await client.query('SELECT COUNT(*) FROM role_permissions');
    console.log(`\n🎉 Total de asignaciones en role_permissions: ${countCheck.rows[0].count}`);

  } catch (err) {
    console.error('❌ Error en seed-permissions:', err);
  } finally {
    client.release();
    pool.end();
  }
}

run();
