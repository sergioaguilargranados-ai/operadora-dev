require('dotenv').config({path: '.env.local'});
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
async function run() {
  const client = await pool.connect();
  try {
    const user_id = '1';
    console.log('Fetching user...');
    const result = await client.query(
      `SELECT id, name, email, phone, wants_travel_insurance, date_of_birth, emergency_contacts, image FROM users WHERE id = $1`,
      [user_id]
    );
    console.log('User fetched', result.rows[0]);
    
    console.log('Fetching documents...');
    const docsResult = await client.query(
      `SELECT id, document_name as name, document_url as url FROM entity_documents WHERE entity_type = 'user' AND entity_id = $1`,
      [user_id]
    );
    console.log('Docs fetched', docsResult.rows);
  } catch (e) {
    console.error('ERROR OCCURRED', e);
  } finally {
    client.release();
    pool.end();
  }
}
run();
