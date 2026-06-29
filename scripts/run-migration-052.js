const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('localhost')) ? false : { rejectUnauthorized: false }
});

async function run() {
  try {
    const sqlPath = path.join(__dirname, '../migrations/052_user_profile_fields.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running migration 052...');
    await pool.query(sql);
    console.log('Migration 052 successful');
  } catch (err) {
    console.error('Migration failed', err);
  } finally {
    await pool.end();
  }
}

run();
