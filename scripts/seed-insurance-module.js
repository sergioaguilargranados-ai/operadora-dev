require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('🚀 Iniciando semillado del Módulo de Seguros de Viajero...');

    await client.query('BEGIN');

    // 1. Crear tabla de pólizas de seguro si no existe
    console.log('📦 1. Creando tabla travel_insurance_policies...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS travel_insurance_policies (
        id SERIAL PRIMARY KEY,
        policy_number VARCHAR(50) UNIQUE NOT NULL,
        tenant_id INTEGER DEFAULT 1,
        user_id INTEGER,
        booking_id INTEGER,
        plan_code VARCHAR(50) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        destination_region VARCHAR(100) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        total_days INTEGER NOT NULL,
        passengers_count INTEGER DEFAULT 1,
        total_price NUMERIC(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'USD',
        insured_travelers JSONB NOT NULL DEFAULT '[]',
        emergency_contact JSONB NOT NULL DEFAULT '{}',
        coverage_details JSONB NOT NULL DEFAULT '{}',
        status VARCHAR(30) DEFAULT 'active',
        payment_status VARCHAR(30) DEFAULT 'completed',
        voucher_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // 2. Registrar Feature Flag en features
    console.log('🚩 2. Registrando feature flag travel_insurance...');
    const featureCheck = await client.query(`SELECT id FROM features WHERE code = 'travel_insurance'`);
    if (featureCheck.rows.length === 0) {
      await client.query(`
        INSERT INTO features (code, name, description, category, is_global_enabled, web_enabled, mobile_enabled, icon, sort_order, created_at, updated_at)
        VALUES (
          'travel_insurance',
          'Seguros de Viajero',
          'Módulo integral de cotización, contratación y emisión de pólizas de seguro de asistencia al viajero',
          'bookings',
          true,
          true,
          true,
          'ShieldCheck',
          4,
          NOW(),
          NOW()
        );
      `);
      console.log('   ✅ Feature travel_insurance insertado.');
    } else {
      console.log('   ℹ️ Feature travel_insurance ya existe.');
    }

    // 3. Registrar Permisos Granulares
    console.log('🔑 3. Registrando permisos de seguros...');
    const permissionsToSeed = [
      { code: 'insurance:view', name: 'Ver Seguros y Pólizas', module: 'bookings', action: 'view', desc: 'Permite consultar cotizaciones y pólizas contratadas' },
      { code: 'insurance:create', name: 'Cotizar y Contratar Seguro', module: 'bookings', action: 'create', desc: 'Permite emitir y comprar pólizas de seguro de viajero' },
      { code: 'insurance:manage', name: 'Administrar Seguros de Clientes', module: 'bookings', action: 'manage', desc: 'Permite a agentes y administradores gestionar pólizas de todos los clientes' }
    ];

    for (const p of permissionsToSeed) {
      const pCheck = await client.query(`SELECT id FROM permissions WHERE code = $1`, [p.code]);
      if (pCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO permissions (code, name, module, action, description, created_at)
          VALUES ($1, $2, $3, $4, $5, NOW())
        `, [p.code, p.name, p.module, p.action, p.desc]);
        console.log(`   ✅ Permiso ${p.code} creado.`);
      }
    }

    // 4. Asignar Permisos a Roles
    console.log('👥 4. Asignando permisos a roles...');
    const rolePermissions = [
      // Clientes y Usuarios normales: view y create
      { roles: ['CLIENT', 'USER'], permissions: ['insurance:view', 'insurance:create'] },
      // Staff y Agentes: view, create y manage
      { roles: ['AGENT', 'AGENCY_ADMIN', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'], permissions: ['insurance:view', 'insurance:create', 'insurance:manage'] }
    ];

    for (const rp of rolePermissions) {
      for (const roleName of rp.roles) {
        const roleRes = await client.query(`SELECT id FROM roles WHERE name = $1`, [roleName]);
        if (roleRes.rows.length > 0) {
          const roleId = roleRes.rows[0].id;
          for (const permCode of rp.permissions) {
            const permRes = await client.query(`SELECT id FROM permissions WHERE code = $1`, [permCode]);
            if (permRes.rows.length > 0) {
              const permId = permRes.rows[0].id;
              await client.query(`
                INSERT INTO role_permissions (role_id, permission_id)
                VALUES ($1, $2)
                ON CONFLICT (role_id, permission_id) DO NOTHING
              `, [roleId, permId]);
            }
          }
        }
      }
    }
    console.log('   ✅ Permisos asignados a roles con éxito.');

    // 5. Registrar en navigation_menu_items (Sección: GESTIÓN DE RESERVAS)
    console.log('🗺️ 5. Registrando ítem en navigation_menu_items...');
    const menuTableCheck = await client.query(`
      SELECT to_regclass('public.navigation_menu_items') as exists;
    `);

    if (menuTableCheck.rows[0]?.exists) {
      const itemCheck = await client.query(`SELECT id FROM navigation_menu_items WHERE item_key = 'travel_insurance'`);
      if (itemCheck.rows.length === 0) {
        await client.query(`
          INSERT INTO navigation_menu_items (
            section_key, section_title, section_order,
            item_key, label, icon_name, route, badge,
            permission_code, is_active, sort_order, created_at, updated_at
          ) VALUES (
            'bookings', 'GESTIÓN DE RESERVAS', 2,
            'travel_insurance', 'Seguros de Viajero', 'ShieldCheck', '/seguros', '24/7',
            'insurance:view', true, 2, NOW(), NOW()
          );
        `);
        console.log('   ✅ Menú Seguros de Viajero insertado en GESTIÓN DE RESERVAS.');
      } else {
        console.log('   ℹ️ Menú travel_insurance ya registrado.');
      }
    }

    await client.query('COMMIT');
    console.log('🎉 Semillado de Seguros de Viajero completado con éxito.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en el semillado de seguros:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
