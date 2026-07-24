require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function check() {
  try {
    const checkUR = await pool.query("SELECT * FROM user_referrals WHERE referrer_id = 42 AND referred_id = 44");
    if (checkUR.rows.length === 0) {
      await pool.query("INSERT INTO user_referrals (referrer_id, referred_id, points_awarded, status) VALUES (42, 44, 0, 'active')");
      console.log("Inserted missing user_referrals link for 42 -> 44.");
    } else {
      console.log("Link already exists.");
    }
    
    // Also, award points for the booking? The user said "confirme una reserva para el nuevo referido entre ya ve la reseerva pero no lo considera como su referido"
    // I will not manually award points because I don't know the amount paid, just linking them is enough for now to show up in "Referidos".
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

check();
