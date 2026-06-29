const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  const res = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND (table_name ILIKE '%itinerar%')
  `);
  console.log("Matching tables:", res.rows);
  
  // also check columns of the most likely tables
  for (let row of res.rows) {
    const cols = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
    `, [row.table_name]);
    console.log(`\nTable ${row.table_name}:`);
    cols.rows.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));
  }
  pool.end();
}
run();
