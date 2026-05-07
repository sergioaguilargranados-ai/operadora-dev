/**
 * Script para ejecutar la migración 042: AI Trip Designer
 * Crea las tablas: ai_trip_proposals, ai_trip_days, ai_trip_services
 * 
 * Uso: node scripts/run-migration-042.js
 */
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  console.log('🤖 Ejecutando migración 042: AI Trip Designer...\n');

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const sqlPath = path.join(__dirname, '..', 'migrations', '042_ai_trip_designer.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    console.log('📄 Archivo SQL leído correctamente');
    console.log('🔗 Conectando a la base de datos...\n');

    await pool.query(sql);

    console.log('✅ Migración 042 completada exitosamente!\n');

    // Verificar tablas creadas
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('ai_trip_proposals', 'ai_trip_days', 'ai_trip_services')
      ORDER BY table_name
    `);

    console.log('📊 Tablas creadas:');
    tables.rows.forEach(row => {
      console.log(`   ✅ ${row.table_name}`);
    });

    // Verificar feature
    const feature = await pool.query(`
      SELECT code, name, is_global_enabled 
      FROM features 
      WHERE code = 'SYSTEM_TRIP_DESIGNER'
    `);

    if (feature.rows.length > 0) {
      console.log(`\n🎯 Feature registrado: ${feature.rows[0].name} (${feature.rows[0].is_global_enabled ? 'Habilitado' : 'Deshabilitado'})`);
    }

    // Verificar secuencia de folios
    const seqCheck = await pool.query(`SELECT last_value FROM trip_proposal_folio_seq`);
    console.log(`\n📋 Secuencia de folios: AS-TRIP-${String(seqCheck.rows[0].last_value).padStart(4, '0')}`);

  } catch (error) {
    console.error('\n❌ Error en la migración:', error.message);
    if (error.detail) console.error('   Detalle:', error.detail);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('\n🔒 Conexión cerrada');
  }
}

runMigration();
