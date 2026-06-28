const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    const sqlPath = path.join(__dirname, '../migrations/050_mobile_app_v3.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing migration 050...');
    await client.query(sql);
    
    console.log('Migration 050 executed successfully!');
    client.release();
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
