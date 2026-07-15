import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env.local') });
config({ path: resolve(__dirname, '.env') });

async function check() {
  const { pool } = await import('./src/lib/db');
  
  try {
    await pool.query(`
      ALTER TABLE custom_itinerary_days
      ADD COLUMN IF NOT EXISTS foods JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS places JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS souvenirs JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS phrases JSONB DEFAULT '[]'::jsonb,
      ADD COLUMN IF NOT EXISTS practical_info JSONB DEFAULT '{}'::jsonb;
    `);
    console.log("Columns added to custom_itinerary_days successfully.");
  } catch (e) {
    console.error(e);
  }

  process.exit(0);
}

check().catch(console.error);
