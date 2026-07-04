require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query("SELECT * FROM itineraries WHERE title ILIKE '%Europa%'");
  if (res.rows.length > 0) {
    console.log(JSON.stringify(res.rows[0].days, null, 2));
  } else {
    console.log("No groups found");
  }
  pool.end();
}
run();
