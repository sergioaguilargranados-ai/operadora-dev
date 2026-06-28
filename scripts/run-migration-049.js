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
    
    const sqlPath = path.join(__dirname, '../migrations/049_rbac_and_multitenant_extensions.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing migration 049...');
    await client.query(sql);
    
    console.log('Migration 049 executed successfully!');
    client.release();
  } catch (err) {
    console.error('Error executing migration:', err);
  } finally {
    await pool.end();
  }
}

runMigration();
