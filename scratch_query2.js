require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    const res = await pool.query("SELECT id, special_requests FROM bookings WHERE special_requests::text ILIKE '%mejor viaje%'");
    console.log('Found in bookings:', res.rows);
    if(res.rows.length > 0) {
      console.log('UPDATING...');
      await pool.query("UPDATE bookings SET special_requests = (REPLACE(special_requests::text, 'El mejor viaje?', '¡El mejor viaje!'))::jsonb WHERE special_requests::text ILIKE '%mejor viaje%'");
      console.log('UPDATED');
    }
  } catch(e){
    console.log(e);
  } finally {
    pool.end();
  }
}
run();
