require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const itRes = await pool.query("SELECT id, days FROM itineraries WHERE id IN (3,4)");
  for (const it of itRes.rows) {
    if (!it.days) continue;
    console.log(`\nItinerary ${it.id}:`);
    for (const day of it.days) {
      if (day.souvenirs && day.souvenirs.length > 0) {
        console.log(`- Day ${day.title}`);
        for (const s of day.souvenirs) {
          console.log(`  * [${s.name}] -> ${s.img}`);
        }
      }
    }
  }
  pool.end();
}

run();
