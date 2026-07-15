import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env.local') });
config({ path: resolve(__dirname, '.env') });

async function check() {
  const { pool } = await import('./src/lib/db');
  
  try {
    const res = await pool.query(`
      SELECT 
        b.id as booking_id, 
        b.destination,
        b.special_requests,
        b.total_price, 
        b.currency,
        COALESCE(SUM(p.amount), 0) as paid_amount
      FROM bookings b
      LEFT JOIN payment_transactions p ON p.booking_id = b.id AND p.status = 'completed'
      WHERE b.user_id = 42 AND b.booking_status != 'cancelled'
      GROUP BY b.id
    `);
    console.log("PENDING BALANCES:");
    res.rows.forEach(r => {
      console.log(`Booking ${r.booking_id}: Total ${r.total_price}, Paid ${r.paid_amount}, Pending: ${Number(r.total_price) - Number(r.paid_amount)}`);
    });
  } catch (e) {
    console.error(e);
  }

  process.exit(0);
}

check().catch(console.error);
