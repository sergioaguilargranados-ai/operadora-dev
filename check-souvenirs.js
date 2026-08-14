require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query("SELECT id, city, souvenirs FROM destination_content");
  
  for (const row of res.rows) {
    if (row.souvenirs && row.souvenirs.length > 0) {
      console.log(`\n--- ${row.city.toUpperCase()} ---`);
      for (const s of row.souvenirs) {
        console.log(`- ${s.name}: ${s.img}`);
      }
    }
  }
  
  pool.end();
}

run();
