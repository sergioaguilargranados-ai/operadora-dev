require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    const res = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' AND column_name LIKE '%terms%'");
    console.log("Columns matching 'terms':", res.rows.map(r => r.column_name));
  } catch(e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
main();
