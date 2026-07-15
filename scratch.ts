import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env.local') });
config({ path: resolve(__dirname, '.env') });

async function check() {
  const { pool } = await import('./src/lib/db');
  
  try {
    await pool.query(`
      ALTER TABLE wishlist_items ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'souvenir';
    `);
    console.log("Column 'category' added successfully.");
  } catch (e) {
    console.error(e);
  }

  process.exit(0);
}

check().catch(console.error);
