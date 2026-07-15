require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log("Adding column accepted_terms_at to users table...");
    await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS accepted_terms_at TIMESTAMP WITH TIME ZONE;");
    console.log("Column added successfully!");
  } catch(e) {
    console.error("Error:", e.message);
  } finally {
    pool.end();
  }
}

main();
