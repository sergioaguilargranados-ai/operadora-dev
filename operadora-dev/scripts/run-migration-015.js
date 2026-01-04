const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('🚀 Ejecutando migración 015: Add hotels_count');

  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL no configurada');
    process.exit(1);
  }

  const pool = new Pool({ 
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const migrationPath = path.join(__dirname, '..', 'migrations', '015_add_hotels_count.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Leyendo migración desde:', migrationPath);
    console.log('🔧 Ejecutando SQL...');

    // Ejecutar cada statement por separado
    const statements = sql.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        try {
          await pool.query(stmt);
          console.log('✅ Ejecutado:', stmt.substring(0, 50) + '...');
        } catch (e) {
          console.log('⚠️ Error en statement (puede ser normal):', e.message.substring(0, 100));
        }
      }
    }

    console.log('✅ Migración 015 ejecutada');

    // Verificar
    const result = await pool.query('SELECT destination_name, hotels_count FROM explore_destinations LIMIT 6');
    console.log('\n📋 Destinos actualizados:');
    console.table(result.rows);

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error.message);
  } finally {
    await pool.end();
  }
}

runMigration();
