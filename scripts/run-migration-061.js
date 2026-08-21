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
    console.log('--- Corriendo Migración 061: Agent Commissions ---');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/061_agent_commissions.sql'), 'utf-8');
    await pool.query(sql);
    console.log('✅ Migración 061 completada con éxito.');
  } catch (error) {
    console.error('❌ Error aplicando migración 061:', error);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
