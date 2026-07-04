require('dotenv').config({path:'.env.local'});
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS weather_forecasts (
        id SERIAL PRIMARY KEY,
        city VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        temp DECIMAL(5,2),
        temp_min DECIMAL(5,2),
        temp_max DECIMAL(5,2),
        description VARCHAR(255),
        icon VARCHAR(50),
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(city, date)
      )
    `);
    console.log('Table weather_forecasts created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}
run();
