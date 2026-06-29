const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const res = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND (table_name ILIKE '%reward%' OR table_name ILIKE '%loyalty%' OR table_name ILIKE '%step%')
  `);
  console.log("Matching tables:", res.rows);
  pool.end();
}
run();
