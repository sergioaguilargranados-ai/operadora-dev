require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  const q = await pool.query("SELECT days FROM itineraries WHERE title ILIKE '%Europa%' LIMIT 1");
  const days = q.rows[0].days;
  days.forEach(d => console.log("Day title:", d.title, "date:", d.date));
  pool.end();
}
run();
