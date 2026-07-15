import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env.local') });
config({ path: resolve(__dirname, '.env') });

async function check() {
  const { pool } = await import('./src/lib/db');
  
  try {
    const res = await pool.query("SELECT id, booking_id, days FROM itineraries WHERE booking_id = 123 LIMIT 1");
    console.log("ITINERARY:", res.rows[0]);
  } catch (e) {
    console.error(e);
  }

  process.exit(0);
}

check().catch(console.error);
