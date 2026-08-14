const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_rsdKEkaw1ZS2@ep-bold-hill-afbis0wk-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  try {
    const res3 = await pool.query("SELECT id, special_requests FROM bookings");
    const found = res3.rows.filter(r => JSON.stringify(r.special_requests).toLowerCase().includes('mejor viaje'));
    console.log('bookings with mejor viaje:', found);
    
    // Let's also check tours
    const resTours = await pool.query("SELECT * FROM information_schema.tables WHERE table_name = 'tours'");
    if (resTours.rows.length > 0) {
       const t = await pool.query("SELECT * FROM tours WHERE description ILIKE '%mejor viaje%'");
       console.log('tours:', t.rows);
    }
  } catch(e){
    console.log(e);
  } finally {
    pool.end();
  }
}
run();
