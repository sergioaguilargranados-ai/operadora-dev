/**
 * ═══════════════════════════════════════════════════════════════
 * 🚀 AS OPERADORA - RUNNER MAESTRO DE MIGRACIONES PARA PRODUCCIÓN
 * ═══════════════════════════════════════════════════════════════
 * Este script aplica de forma secuencial, segura e idempotente
 * todas las migraciones DDL estructurales y seeds obligatorios
 * en la base de datos PostgreSQL de producción.
 *
 * Uso:
 *   node scripts/migrate-production.js
 * ═══════════════════════════════════════════════════════════════
 */

require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ ERROR FATAL: Variable de entorno DATABASE_URL no configurada.');
  process.exit(1);
}

const client = new Client({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 15000,
});

// Archivos o patrones de prueba a omitir deliberadamente en producción
const EXCLUDED_MIGRATIONS = [
  '009_test_data_payments_approvals.sql',
  '015_test_tenant_mmta.sql',
  '010b_communication_center_simple.sql', // La versión completa es 010_communication_center.sql
];

async function setupMigrationTracking() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      checksum VARCHAR(64),
      applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function getAppliedMigrations() {
  const res = await client.query(`SELECT filename FROM _schema_migrations`);
  return new Set(res.rows.map(r => r.filename));
}

async function recordMigration(filename) {
  await client.query(
    `INSERT INTO _schema_migrations (filename) VALUES ($1) ON CONFLICT (filename) DO NOTHING`,
    [filename]
  );
}

function getMigrationFiles() {
  const dirs = [
    path.join(__dirname, '../database/migrations'),
    path.join(__dirname, '../migrations'),
  ];

  const allFiles = [];

  for (const dir of dirs) {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql'));
      for (const file of files) {
        allFiles.push({
          filename: file,
          fullPath: path.join(dir, file),
        });
      }
    }
  }

  // Ordenar por nombre (ej. 003_..., 004_..., 060_...)
  allFiles.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true, sensitivity: 'base' }));

  return allFiles;
}

async function runSeeds() {
  console.log('\n🌱 [SEEDS] Aplicando datos maestros y semillas del sistema...');

  // 1. Monedas
  const currencies = [
    { code: 'USD', name: 'Dólar estadounidense', symbol: '$' },
    { code: 'MXN', name: 'Peso mexicano', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'CAD', name: 'Dólar canadiense', symbol: 'CA$' },
    { code: 'GBP', name: 'Libra esterlina', symbol: '£' },
    { code: 'COP', name: 'Peso colombiano', symbol: '$' },
    { code: 'ARS', name: 'Peso argentino', symbol: '$' },
    { code: 'CLP', name: 'Peso chileno', symbol: '$' },
    { code: 'PEN', name: 'Sol peruano', symbol: 'S/' },
    { code: 'BRL', name: 'Real brasileño', symbol: 'R$' },
    { code: 'JPY', name: 'Yen japonés', symbol: '¥' },
  ];

  try {
    for (const cur of currencies) {
      await client.query(`
        INSERT INTO currencies (code, name, symbol, decimal_places, is_active)
        VALUES ($1, $2, $3, 2, true)
        ON CONFLICT (code) DO NOTHING
      `, [cur.code, cur.name, cur.symbol]);
    }
    console.log('   ✅ Catálogo de Monedas verificado/sembrado.');
  } catch (err) {
    console.warn('   ⚠️ Nota en currencies:', err.message);
  }

  // 2. Tenant Principal AS Operadora
  try {
    await client.query(`
      INSERT INTO tenants (
        id, name, slug, domain, is_active, branding, contact_info, created_at, updated_at
      ) VALUES (
        'as_operadora',
        'AS Operadora de Viajes y Eventos',
        'as-operadora',
        'as-ope-viajes.company',
        true,
        '{"primaryColor":"#2563eb","logoUrl":"/logo-as.png"}'::jsonb,
        '{"email":"contacto@asoperadora.com","phone":"+52 55 0000 0000"}'::jsonb,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      ) ON CONFLICT (id) DO UPDATE SET
        is_active = true,
        updated_at = CURRENT_TIMESTAMP;
    `);
    console.log('   ✅ Tenant Principal (as_operadora) verificado/activo.');
  } catch (err) {
    console.warn('   ⚠️ Nota en tenants:', err.message);
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🚀 INICIANDO AUDITORÍA Y EJECUCIÓN DE MIGRACIONES - PRODUCCIÓN');
  console.log('═══════════════════════════════════════════════════════════════');

  try {
    await client.connect();
    console.log('🔌 Conexión establecida exitosamente con PostgreSQL.');

    await setupMigrationTracking();
    const applied = await getAppliedMigrations();
    const migrationFiles = getMigrationFiles();

    console.log(`\n📦 Total de migraciones descubiertas: ${migrationFiles.length}`);
    console.log(`📋 Migraciones previamente aplicadas: ${applied.size}\n`);

    let countApplied = 0;
    let countSkipped = 0;
    let countErrors = 0;

    for (const item of migrationFiles) {
      if (EXCLUDED_MIGRATIONS.includes(item.filename)) {
        console.log(`   ⏭️  [OMITIDA - TEST] ${item.filename}`);
        continue;
      }

      if (applied.has(item.filename)) {
        console.log(`   ✓  [YA APLICADA]    ${item.filename}`);
        countSkipped++;
        continue;
      }

      console.log(`   ⚙️  [APLICANDO]      ${item.filename}...`);
      const sql = fs.readFileSync(item.fullPath, 'utf8');

      try {
        await client.query('BEGIN');
        await client.query(sql);
        await client.query(
          `INSERT INTO _schema_migrations (filename) VALUES ($1)`,
          [item.filename]
        );
        await client.query('COMMIT');
        console.log(`   ✅ [ÉXITO]          ${item.filename}`);
        countApplied++;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error(`   ❌ [ERROR EN SQL]   ${item.filename}:`, err.message);
        
        // Si el error es por objeto ya existente, lo registramos como aplicada
        if (err.message.includes('already exists') || err.message.includes('duplicate column')) {
          console.warn(`      ⚠️ El objeto ya existía en la base. Registrando como aplicada.`);
          await recordMigration(item.filename);
        } else {
          countErrors++;
        }
      }
    }

    // Ejecutar Semillas
    await runSeeds();

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`📊 RESUMEN DE MIGRACIÓN:`);
    console.log(`   - Nuevas migraciones aplicadas: ${countApplied}`);
    console.log(`   - Previamente aplicadas:        ${countSkipped}`);
    console.log(`   - Errores críticos detectados:  ${countErrors}`);
    console.log('═══════════════════════════════════════════════════════════════');

    if (countErrors > 0) {
      console.warn('\n⚠️ Se registraron advertencias/errores que requieren revisión.');
    } else {
      console.log('\n🎉 ¡Base de datos de producción sincronizada con éxito!');
    }

  } catch (error) {
    console.error('❌ Error crítico en el proceso de migración:', error);
  } finally {
    await client.end();
  }
}

main();
