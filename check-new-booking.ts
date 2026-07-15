import 'dotenv/config';
import { pool } from './src/lib/db';

async function main() {
  const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 3');
  console.log("Últimas 3 reservas:", result.rows.map(r => ({id: r.id, mt_id: r.mt_id, client_name: r.client_name, status: r.status, special_requests: r.special_requests})));
  
  const itineraries = await pool.query('SELECT * FROM custom_itineraries ORDER BY created_at DESC LIMIT 3');
  console.log("Últimos itinerarios IA:", itineraries.rows.map(i => ({id: i.id, booking_id: i.booking_id, days: i.days.length})));
  
  process.exit(0);
}
main().catch(console.error);
