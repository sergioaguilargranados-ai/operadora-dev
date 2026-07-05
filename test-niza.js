require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const res = await pool.query("SELECT foods, places FROM destination_content WHERE city ILIKE '%niza%' LIMIT 1");
  if (res.rows.length > 0) {
    console.log("Destination Content Foods:", res.rows[0].foods);
  }
  
  const itRes = await pool.query("SELECT days FROM itineraries WHERE title ILIKE '%Europa%' LIMIT 1");
  const days = itRes.rows[0].days;
  const nizaDay = days.find(d => d.title.includes("NIZA"));
  console.log("Itinerary Niza Day Places:", nizaDay.places);
  console.log("Itinerary Niza Day Foods:", nizaDay.foods);
  
  pool.end();
}
run();
