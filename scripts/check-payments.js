require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query('SELECT * FROM payment_transactions LIMIT 2').then(r => console.log(r.rows)).finally(() => process.exit(0));
