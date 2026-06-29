const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  try {
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_itineraries_dates ON itineraries (user_id, start_date, end_date);
    `);
    console.log("Index created successfully.");
  } catch (error) {
    console.error("Error creating index:", error);
  } finally {
    pool.end();
  }
}
run();
