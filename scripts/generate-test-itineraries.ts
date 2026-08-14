import 'dotenv/config';
import { CustomItineraryService } from '../src/services/CustomItineraryService';
import { pool } from '../src/lib/db';

async function main() {
  const testIds = [120, 121]; // Reservas de prueba
  
  for (const bookingId of testIds) {
    console.log(`Generando itinerario IA para la reserva ${bookingId}...`);
    try {
      const success = await CustomItineraryService.generateItineraryForBooking(bookingId);
      if (success) {
        console.log(`✅ Itinerario generado con éxito para reserva ${bookingId}`);
      } else {
        console.log(`❌ Falló la generación para reserva ${bookingId}`);
      }
    } catch (err) {
      console.error(`Error procesando reserva ${bookingId}:`, err);
    }
  }
  
  // Imprimir un resumen
  const itineraries = await pool.query('SELECT * FROM custom_itineraries WHERE booking_id = ANY($1)', [testIds]);
  console.log("\nItinerarios en BD:", itineraries.rows.map(i => ({id: i.id, booking_id: i.booking_id, days: i.total_days})));
  
  await pool.end();
  process.exit(0);
}

main().catch(console.error);
