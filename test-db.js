const { Pool } = require('pg');
require('dotenv').config({path: '.env.local'});
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
async function test() {
  const user = await pool.query('SELECT id FROM users WHERE email = $1', ['c@c.com']);
  if (!user.rows.length) return console.log('User not found');
  const userId = user.rows[0].id;
  console.log('User ID:', userId);
  
  const res = await pool.query(`
      SELECT 
        b.id as booking_id, 
        b.destination,
        b.total_price, 
        b.currency,
        (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE booking_id = b.id AND status = 'completed') as paid_amount
      FROM bookings b
      WHERE b.user_id = $1
      AND b.booking_status != 'cancelled'
    `, [userId]);
    
  console.log('Bookings:', res.rows);
  pool.end();
}
test();
