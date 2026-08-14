require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const conversions = await pool.query("SELECT * FROM referral_conversions");
    console.log('Conversions:', conversions.rows);

    const refUser = await pool.query("SELECT id FROM users WHERE email = 'referido@prueba.com'");
    if (refUser.rows.length > 0) {
      const conversionsForRef = await pool.query("SELECT * FROM referral_conversions WHERE new_user_id = $1", [refUser.rows[0].id]);
      console.log('Conversions for referido@prueba.com:', conversionsForRef.rows);
      
      const clicks = await pool.query("SELECT * FROM referral_clicks WHERE referrer_id = $1 OR referrer_id = 42", [refUser.rows[0].id]);
      console.log('Clicks:', clicks.rows);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
