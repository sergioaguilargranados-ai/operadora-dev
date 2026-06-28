const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  await pool.query(`ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS address text`);
  console.log("Column added");
  pool.end();
}
run();
