require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res2 = await pool.query("SELECT id, description FROM custom_itineraries WHERE description ILIKE '%mejor viaje%'");
    console.log('custom_itineraries:', res2.rows);
    const res3 = await pool.query("SELECT id, description FROM itineraries WHERE description ILIKE '%mejor viaje%'");
    console.log('itineraries:', res3.rows);
  } catch (e) {
    console.error(e);
  } finally {
    pool.end();
  }
}
run();
