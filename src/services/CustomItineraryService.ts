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
  foods?: { name: string; desc: string; img: string }[];
  places?: { name: string; desc: string; img: string }[];
  souvenirs?: { name: string; desc: string; img: string }[];
  phrases?: { local: string; span: string }[];
  practical_info?: { currency: { name: string; symbol: string }; timezone: string; weather: string };
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
      } else {
        // Intentar rescatar total_days previo si ya existía el itinerario (para no sobreescribir con 5 por error)
        const prevRes = await client.query('SELECT days FROM itineraries WHERE booking_id = $1', [bookingId]);
        if (prevRes.rows.length > 0 && prevRes.rows[0].days) {
          const daysArr = typeof prevRes.rows[0].days === 'string' ? JSON.parse(prevRes.rows[0].days) : prevRes.rows[0].days;
          if (Array.isArray(daysArr) && daysArr.length > 0) {
            numDays = daysArr.length;
          }
        } else if (details.pasajeros === 1 && destination === 'Europa') { // Parche temporal para el tour Descubriendo Europa si no había previo
          numDays = 19;
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
      "optional_activities": ["Tour nocturno"],
      "foods": [
        { "name": "Nombre de Platillo", "desc": "Breve descripción", "img": "https://image.pollinations.ai/prompt/food%20name?width=600&height=400&nologo=true" }
      ],
      "places": [
        { "name": "Lugar Imperdible", "desc": "Breve descripción", "img": "https://image.pollinations.ai/prompt/place%20name?width=600&height=400&nologo=true" }
      ],
      "souvenirs": [
        { "name": "Souvenir Sugerido", "desc": "Breve descripción", "img": "https://image.pollinations.ai/prompt/souvenir%20name?width=600&height=400&nologo=true" }
      ],
      "phrases": [
        { "local": "Frase en el idioma del destino", "span": "Traducción al español" }
      ],
      "practical_info": {
        "currency": { "name": "Nombre de moneda", "symbol": "Símbolo" },
        "timezone": "Zona horaria",
        "weather": "Clima típico en esa época"
      }
    }
  ]
}

Nota sobre las imágenes (img): Utiliza URLs reales usando pollinations.ai con palabras clave representativas y en INGLÉS del lugar o platillo, en este formato exacto: https://image.pollinations.ai/prompt/keyword1%20keyword2?width=600&height=400&nologo=true
Por ejemplo, si la comida es "Pasta", usa "https://image.pollinations.ai/prompt/italian%20pasta%20food?width=600&height=400&nologo=true". No inventes identificadores, siempre concatena las palabras clave separadas por %20.
Asegúrate de que las palabras clave de la imagen estén en inglés para obtener mejores resultados fotográficos.
`;

      const openAiKey = process.env.OPENAI_API_KEY;
      if (!openAiKey) {
        throw new Error('OPENAI_API_KEY no configurada');
      }

      const response = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openAiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API Error:", response.status, errorText);
        throw new Error(`Error OpenAI: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content;
      if (!rawText) throw new Error('Respuesta vacía de Gemini');

      const cleanJson = rawText.replace(/\\x60\\x60\\x60json\\s*/gi, '').replace(/\\x60\\x60\\x60\\s*/gi, '').trim();
      const parsed: CustomItinerary = JSON.parse(cleanJson);

      await client.query('BEGIN');

      // Borrar si existía uno previo
      await client.query('DELETE FROM itineraries WHERE booking_id = $1', [bookingId]);

      // Guardar
      const insertItin = await client.query(`
        INSERT INTO itineraries (booking_id, user_id, title, description, destination, start_date, end_date, days)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id
      `, [
        bookingId, 
        booking.user_id, 
        parsed.title, 
        parsed.description, 
        destination, 
        startDateStr || null, 
        endDateStr || null, 
        JSON.stringify(parsed.days)
      ]);
      
      const itineraryId = insertItin.rows[0].id;

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
