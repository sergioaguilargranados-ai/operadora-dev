import { pool } from '@/lib/db';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

export interface CustomItineraryDay {
  day_number: number;
  date: string;
  title: string;
  description: string;
  meals: string;
  hotel: string;
  city: string;
  activities: string[];
  highlights: string[];
  optional_activities: string[];
}

export interface CustomItinerary {
  title: string;
  description: string;
  total_days: number;
  days: CustomItineraryDay[];
}

export class CustomItineraryService {
  
  static async generateItineraryForBooking(bookingId: number): Promise<boolean> {
    const client = await pool.connect();
    try {
      // 1. Obtener la reserva
      const result = await client.query('SELECT * FROM bookings WHERE id = $1', [bookingId]);
      if (result.rows.length === 0) {
        console.error(`Reserva ${bookingId} no encontrada`);
        return false;
      }
      
      const booking = result.rows[0];
      const destination = booking.destination || 'Destino sorpresa';
      let details = {};
      try {
        details = typeof booking.special_requests === 'string' ? JSON.parse(booking.special_requests) : (booking.special_requests || {});
      } catch (e) {}

      // Solo procesar si NO es de MegaTravel (booking_type genérico o custom, vuelo, etc.)
      // O si queremos forzarlo para todo, adelante. Lo generamos para todo lo que no sea mt_...
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.warn('No GEMINI_API_KEY configurada para CustomItineraryService');
        return false;
      }

      let startDateStr = '';
      let endDateStr = '';
      let origin = '';
      
      if (details.fecha_inicio) startDateStr = details.fecha_inicio;
      if (details.fecha_fin) endDateStr = details.fecha_fin;
      
      if (details.tipo === 'flight' && details.details?.outbound) {
        startDateStr = details.details.outbound.date;
        origin = details.details.outbound.origin;
        if (details.details?.inbound?.date) {
          endDateStr = details.details.inbound.date;
        }
      }

      let numDays = 5;
      if (startDateStr && endDateStr) {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const diffTime = end.getTime() - start.getTime();
          if (diffTime >= 0) {
            numDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          }
        }
      }

      const smartContext = `
Lugar de Salida: ${origin || 'No especificado'}
Lugar de Destino (Llegada): ${destination}
Fecha de Salida: ${startDateStr || 'No especificada'}
Fecha de Regreso: ${endDateStr || 'No especificada'}
Duración total calculada: ${numDays} días
      `.trim();

      const prompt = `
Actúa como un experto agente de viajes de lujo. 
Tienes un cliente con la siguiente información de viaje:
${smartContext}

Detalles adicionales crudos de la reserva: ${JSON.stringify(details)}

Genera un itinerario estructurado, realista y emocionante de EXACTAMENTE ${numDays} días de viaje.
Si es un viaje que incluye vuelos, el Día 1 debe ser la salida/llegada, y el último día (Día ${numDays}) debe ser el regreso.
Llena los días intermedios con actividades turísticas lógicas y atractivas para el destino.

Devuelve EXCLUSIVAMENTE un JSON con la siguiente estructura (sin markdown adicional):
{
  "title": "Nombre atractivo del itinerario (Ej: Descubriendo París)",
  "description": "Descripción general de 1 o 2 párrafos.",
  "total_days": ${numDays},
  "days": [
    {
      "day_number": 1,
      "title": "Día 1: Llegada y primer contacto",
      "description": "Qué harán este día...",
      "meals": "C", 
      "hotel": "Hotel sugerido o N/A",
      "city": "${destination}",
      "activities": ["Llegada al aeropuerto", "Caminata por el centro"],
      "highlights": ["El centro histórico"],
      "optional_activities": ["Tour nocturno"]
    }
  ]
}
`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error Gemini: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error('Respuesta vacía de Gemini');

      const cleanJson = rawText.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
      const parsed: CustomItinerary = JSON.parse(cleanJson);

      await client.query('BEGIN');

      // Borrar si existía uno previo
      await client.query('DELETE FROM custom_itineraries WHERE booking_id = $1', [bookingId]);

      // Guardar
      const insertItin = await client.query(`
        INSERT INTO custom_itineraries (booking_id, tenant_id, title, description, total_days, destination)
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
      `, [bookingId, booking.tenant_id, parsed.title, parsed.description, parsed.total_days, destination]);
      
      const itineraryId = insertItin.rows[0].id;

      for (const day of parsed.days) {
        await client.query(`
          INSERT INTO custom_itinerary_days (
            itinerary_id, day_number, title, description, meals, hotel, city, activities, highlights, optional_activities
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `, [
          itineraryId, day.day_number, day.title, day.description, 
          day.meals || '', day.hotel || '', day.city || destination,
          day.activities || [], day.highlights || [], day.optional_activities || []
        ]);
      }

      await client.query('COMMIT');
      return true;

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error generando custom itinerary:', error);
      return false;
    } finally {
      client.release();
    }
  }

}
