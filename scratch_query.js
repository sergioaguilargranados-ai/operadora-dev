const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require' });

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
