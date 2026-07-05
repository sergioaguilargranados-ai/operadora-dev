require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

async function run() {
  const res = await pool.query("SELECT id, city, foods, places FROM destination_content");
  let count = 0;
  for (const row of res.rows) {
    let hasFallback = false;
    for (const food of row.foods) {
      if (food.img === FALLBACK_IMAGE) hasFallback = true;
    }
    for (const place of row.places) {
      if (place.img === FALLBACK_IMAGE) hasFallback = true;
    }
    if (hasFallback) {
      console.log(`City ${row.city} has fallback images!`);
      count++;
    }
  }
  console.log(`Total cities with fallback images: ${count}`);
  pool.end();
}
run();
