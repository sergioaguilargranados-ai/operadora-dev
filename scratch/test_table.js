require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
pool.query("SELECT tablename FROM pg_tables WHERE tablename = 'entity_documents'").then(res => {
  console.log('TABLE EXISTS:', res.rows.length > 0);
  pool.end();
}).catch(console.error);
