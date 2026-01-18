const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Ejecutando migración 013: Tablas de Homepage');

  const connectionString = process.env.DATABASE_URL ||
    'postgresql://neondb_owner:npg_uJNn3dj9OAse@ep-autumn-bread-a4j4g4t6-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require';

  const pool = new Pool({ connectionString });

  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', '013_homepage_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Leyendo migración desde:', migrationPath);
    console.log('🔧 Ejecutando SQL...');

    await pool.query(sql);

    console.log('✅ Migración 013 ejecutada exitosamente');
    console.log('📊 Tablas creadas:');
    console.log('  - flight_destinations');
    console.log('  - accommodation_favorites');
    console.log('  - featured_hero');
    console.log('  - weekend_deals');

    // Verificar que las tablas existen
    const checkTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('flight_destinations', 'accommodation_favorites', 'featured_hero', 'weekend_deals')
    `);

    console.log('\n📋 Tablas verificadas:', checkTables.rows.map(r => r.table_name).join(', '));

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

runMigration().catch(console.error);
