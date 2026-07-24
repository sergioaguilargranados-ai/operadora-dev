require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const urColumns = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'user_referrals'");
    console.log('Columns in user_referrals:', urColumns.rows.map(r => r.column_name));
    
    if (urColumns.rows.length > 0) {
      const allUR = await pool.query("SELECT * FROM user_referrals");
      console.log('user_referrals:', allUR.rows);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
