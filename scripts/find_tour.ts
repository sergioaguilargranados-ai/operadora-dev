import { pool } from '../src/lib/db';

async function main() {
  const result = await pool.query(`SELECT id, title, url FROM itineraries WHERE url LIKE '%gran-tour-de-europa-12019%' OR title ILIKE '%gran tour de europa%'`);
  console.log(result.rows);
  process.exit(0);
}

main().catch(console.error);
