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
    console.log('--- Corriendo Migración 059: cron logs ---');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/059_cron_logs.sql'), 'utf-8');
    await pool.query(sql);
    console.log('✅ Migración 059 completada con éxito.');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

main();
