const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('--- Corriendo Migración 060: Reestructura de Portal ---');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/060_portal_restructure_tables.sql'), 'utf-8');
    await pool.query(sql);
    console.log('✅ Migración 060 completada con éxito.');
  } catch (error) {
    console.error('❌ Error aplicando migración 060:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
