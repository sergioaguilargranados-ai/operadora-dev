import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });
config({ path: resolve(__dirname, '../.env') });

async function main() {
  const { pool } = await import('../src/lib/db');
  
  const result = await pool.query("SELECT * FROM destination_content WHERE city = 'ROMA' LIMIT 1");
  const data = result.rows[0];
  
  if (!data) {
    console.error('No data found for ROMA');
    process.exit(1);
  }

  console.log('--- FOOD 0 ---');
  console.log(JSON.stringify(data.foods[0], null, 2));
  console.log('\n--- PLACE 0 ---');
  console.log(JSON.stringify(data.places[0], null, 2));
  process.exit(0);
}

main().catch(console.error);
