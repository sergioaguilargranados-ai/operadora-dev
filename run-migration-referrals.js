const { Pool } = require('pg');
require('dotenv').config({path: '.env.local'});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  try {
    console.log('Starting migration for referrals...');

    // 1. Add columns to users if they don't exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
      ADD COLUMN IF NOT EXISTS member_points INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS wallet_balance NUMERIC(10,2) DEFAULT 0;
    `);
    console.log('Added columns to users table.');

    // 2. Create user_referrals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_referrals (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        referred_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        status VARCHAR(20) DEFAULT 'active',
        points_awarded INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Created user_referrals table.');

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    pool.end();
  }
}

migrate();
