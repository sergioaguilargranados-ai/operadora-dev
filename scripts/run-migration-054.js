const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const sqlPath = path.join(__dirname, '../migrations/054_create_destination_content.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Ejecutando migración 054...');
    await pool.query(sql);
    console.log('✅ Migración aplicada exitosamente.');
  } catch (err) {
    console.error('❌ Error aplicando migración:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
