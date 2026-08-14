require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const itRes = await pool.query("SELECT id, days FROM itineraries WHERE id = 4");
  for (const it of itRes.rows) {
    if (!it.days) continue;
    for (const day of it.days) {
      if (day.title && day.title.includes('DÍA 12')) {
        console.log(`\n- Day ${day.title}`);
        console.log("Souvenirs:");
        for (const s of day.souvenirs || []) {
          console.log(`  * [${s.name}] -> ${s.img}`);
        }
      }
    }
  }
  pool.end();
}

run();
