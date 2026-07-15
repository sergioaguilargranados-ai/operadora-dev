import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '.env.local') });
config({ path: resolve(__dirname, '.env') });

async function main() {
  const { pool } = await import('./src/lib/db');
  const { CustomItineraryService } = await import('./src/services/CustomItineraryService');

  const result = await pool.query('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 3');
  console.log("Últimas 3 reservas:", result.rows.map(r => ({id: r.id, mt_id: r.mt_id, destination: r.destination})));
  
  // Re-generate for the latest booking
  if (result.rows.length > 0) {
    const latestBooking = result.rows[0];
    console.log(`Re-generando itinerario IA para la reserva ${latestBooking.id} (${latestBooking.destination})...`);
    
    const success = await CustomItineraryService.generateItineraryForBooking(latestBooking.id);
    if (success) {
      console.log('¡Itinerario enriquecido generado con éxito!');
    } else {
      console.log('Falló la generación del itinerario.');
    }
  }

  process.exit(0);
}

main().catch(console.error);
