/**
 * ═══════════════════════════════════════════════════════════════
 * ✈️ PREFLIGHT CHECK - AS OPERADORA (PRODUCCIÓN)
 * ═══════════════════════════════════════════════════════════════
 * Ejecuta una batería de validaciones antes del despliegue en Vercel:
 * 1. Comprobación de variables de entorno críticas
 * 2. Prueba de conectividad con la Base de Datos PostgreSQL
 * 3. Verificación de permisos y tenant base
 * 4. Resumen de estado para Go-Live
 *
 * Uso:
 *   node scripts/preflight-check.js
 * ═══════════════════════════════════════════════════════════════
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { Client } = require('pg');

const REQUIRED_VARS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ENCRYPTION_SECRET_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const RECOMMENDED_VARS = [
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'PAYPAL_CLIENT_ID',
  'PAYPAL_CLIENT_SECRET',
  'FACTURAMA_USER',
  'FACTURAMA_PASSWORD',
  'AMADEUS_API_KEY',
  'AMADEUS_API_SECRET',
  'RESEND_API_KEY',
  'BLOB_READ_WRITE_TOKEN',
];

async function runPreflight() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 INICIANDO PREFLIGHT CHECK PRE-DESPLIEGUE A PRODUCCIÓN');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let hasErrors = false;

  // 1. Validar Variables Obligatorias
  console.log('📋 [1/3] Validando Variables de Entorno Obligatorias:');
  for (const v of REQUIRED_VARS) {
    if (process.env[v]) {
      console.log(`   ✅ ${v.padEnd(25)} : PRESENTE`);
    } else {
      console.error(`   ❌ ${v.padEnd(25)} : FALTA CONFIGURAR`);
      hasErrors = true;
    }
  }

  // 2. Validar Variables de Pasarelas y Proveedores
  console.log('\n💳 [2/3] Validando Proveedores de Pago y Servicios Externos:');
  for (const v of RECOMMENDED_VARS) {
    if (process.env[v]) {
      console.log(`   ✅ ${v.padEnd(35)} : CONFIGURADA`);
    } else {
      console.warn(`   ⚠️ ${v.padEnd(35)} : NO DETECTADA (Revisar si este módulo está activo)`);
    }
  }

  // 3. Probar Conexión a Base de Datos
  console.log('\n🗄️ [3/3] Probando Conectividad con la Base de Datos PostgreSQL...');
  if (!process.env.DATABASE_URL) {
    console.error('   ❌ Imposible probar base de datos sin DATABASE_URL.');
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    console.log('   ✅ Conexión con PostgreSQL: EXITOSA');

    // Consultar tablas críticas
    const tablesRes = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    const tables = tablesRes.rows.map(r => r.table_name);
    console.log(`   📊 Tablas encontradas en BD: ${tables.length}`);

    const criticalTables = ['users', 'roles', 'permissions', 'tenants', 'bookings', 'currencies'];
    for (const t of criticalTables) {
      if (tables.includes(t)) {
        console.log(`      ✓ Tabla '${t}' encontrada.`);
      } else {
        console.warn(`      ⚠️ Tabla crítica '${t}' NO encontrada (¿Ya ejecutaste migrate-production.js?).`);
      }
    }

  } catch (dbErr) {
    console.error('   ❌ Error al conectar con PostgreSQL:', dbErr.message);
    hasErrors = true;
  } finally {
    await client.end();
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  if (hasErrors) {
    console.error('⛔ ESTADO: Se detectaron inconsistencias. Corregir antes de desplegar.');
  } else {
    console.log('🎉 ESTADO: Preflight check superado. Listo para pase a producción.');
  }
  console.log('═══════════════════════════════════════════════════════════════');
}

runPreflight();
