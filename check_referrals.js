require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const userColumns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log('Columns in users:', userColumns.rows.map(r => r.column_name));

    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
    `);
    console.log('All tables:', tables.rows.map(r => r.table_name));

    const cUser = await pool.query("SELECT * FROM users WHERE email = 'c@c.com'");
    console.log('User c@c.com:', cUser.rows[0] || 'Not found');

    const refUser = await pool.query("SELECT * FROM users WHERE email = 'referido@prueba.com'");
    console.log('User referido@prueba.com:', refUser.rows[0] || 'Not found');

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
