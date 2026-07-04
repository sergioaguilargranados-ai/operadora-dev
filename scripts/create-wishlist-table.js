require('dotenv').config({path:'.env.local'});
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS wishlist_items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        item_desc TEXT,
        item_img TEXT,
        city VARCHAR(100),
        itinerary_id INTEGER,
        day_index INTEGER,
        status VARCHAR(20) DEFAULT 'saved',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Table wishlist_items created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error creating table:', error);
    process.exit(1);
  }
}
run();
