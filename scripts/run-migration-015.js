const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Ejecutando migración 015: Refresh Tokens');

  // Load .env.local if available (simple parsing)
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envConfig = fs.readFileSync(envPath, 'utf8');
      envConfig.split('\n').forEach(line => {
        const [key, ...values] = line.split('=');
        if (key && values.length > 0) {
          process.env[key.trim()] = values.join('=').trim();
        }
      });
    }
  } catch (e) {
    console.warn('⚠️ No se pudo cargar .env.local localmente');
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL no está definida');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });

  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', '015_refresh_tokens.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Leyendo migración desde:', migrationPath);
    console.log('🔧 Ejecutando SQL...');

    await pool.query(sql);

    console.log('✅ Migración 015 ejecutada exitosamente');
    console.log('📊 Tablas creadas:');
    console.log('  - refresh_tokens');

    // Verificar que las tablas existen
    const checkTables = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('refresh_tokens')
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
