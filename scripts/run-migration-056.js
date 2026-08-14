const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  try {
    console.log('Running migration 056...');
    const sql = fs.readFileSync(path.join(__dirname, '../migrations/056_custom_itineraries.sql'), 'utf-8');
    await pool.query(sql);
    console.log('Migration 056 applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    pool.end();
    process.exit(0);
  }
}

main();

main();
