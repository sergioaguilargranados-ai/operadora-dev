import { db } from './src/lib/db';
async function run() {
  const res = await db.query('SELECT id, company_name, logo_url FROM tenants');
  console.log(res.rows);
  process.exit(0);
}
run();
