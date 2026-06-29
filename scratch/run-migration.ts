import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';

async function run() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    const file = path.join(__dirname, '../migrations/051_rewards_progress.sql');
    const sql = fs.readFileSync(file, 'utf8');
    await pool.query(sql);
    console.log('Migration 051 run successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
    process.exit(0);
  }
}
run();
