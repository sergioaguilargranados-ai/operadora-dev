require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  try {
    await pool.query(`
      ALTER TABLE weather_forecasts
      ADD COLUMN IF NOT EXISTS humidity NUMERIC,
      ADD COLUMN IF NOT EXISTS wind_speed NUMERIC,
      ADD COLUMN IF NOT EXISTS pop NUMERIC
    `);
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    pool.end();
  }
}

migrate();
