// Build: 01 Jul 2026
// Servicio de contenido por destino - Motor de contenido turístico generado por IA
// Genera y cachea información turística (comidas, lugares, frases, tips) para cada destino

import { pool } from '@/lib/db';

// ==================== INTERFACES ====================

export interface FoodItem {
  name: string;
  desc: string;
  img: string;
}

export interface PlaceItem {
  name: string;
  desc: string;
  img: string;
}

export interface SouvenirItem {
  name: string;
  desc: string;
  img: string;
}

export interface PhraseItem {
  es: string;
  local: string;
  pronunciation?: string;
}

export interface PracticalInfo {
  currency: { name: string; symbol: string; tip: string };
  language: { name: string; tip: string };
  climate: { type: string; tip: string };
  timezone: { zone: string; tip: string };
  voltage: { spec: string; plug_type: string; tip: string };
  emergency: { number: string; tip: string };
}

export interface DestinationContent {
  id?: number;
  destination_key: string;
  city: string;
  country: string;
  region?: string;
  general_description: string;
  foods: FoodItem[];
  places: PlaceItem[];
  souvenirs: SouvenirItem[];
  phrases: PhraseItem[];
  practical_info: PracticalInfo;
  travel_tips: string[];
  hero_image_url?: string;
  generated_by: string;
}

/** Respuesta esperada del modelo Gemini */
interface GeminiGeneratedContent {
  general_description: string;
  foods: Array<{ name: string; desc: string; image_search: string }>;
  places: Array<{ name: string; desc: string; image_search: string }>;
  souvenirs: Array<{ name: string; desc: string; image_search: string }>;
  phrases: PhraseItem[];
  practical_info: PracticalInfo;
  travel_tips: string[];
}

/** Item genérico con campo de búsqueda de imagen */
interface ImageSearchItem {
  name: string;
  image_search: string;
}

// ==================== SERVICIO ====================

export class DestinationContentService {

  /**
   * Obtiene todos los contenidos generados en la base de datos
   */
  static async getAllContent(): Promise<DestinationContent[]> {
    try {
      const result = await pool.query(`
        SELECT * FROM destination_content 
        ORDER BY created_at DESC
      `);
      
      return result.rows.map(row => this.rowToContent(row));
    } catch (error) {
      console.error('❌ Error al obtener todos los contenidos de destinos:', error);
      return [];
    }
  }

  // ────────────────────────────────────────────────────────
  // 1. Obtener contenido para una ciudad (cache-first)
  // ────────────────────────────────────────────────────────
  static async getContentForCity(city: string, country: string): Promise<DestinationContent> {
    try {
      const key = DestinationContentService.generateDestinationKey(city, country);

      // Buscar en cache (tabla destination_content)
      const cached = await pool.query(
        'SELECT * FROM destination_content WHERE destination_key = $1',
        [key]
      );

      if (cached.rows.length > 0) {
        console.log(`✅ Contenido encontrado en cache para: ${key}`);
        return DestinationContentService.rowToContent(cached.rows[0]);
      }

      // No existe en cache — generar con IA y guardar
      console.log(`🤖 Generando contenido con Gemini para: ${city}, ${country}`);
      const generated = await DestinationContentService.generateWithGemini(city, country);

      // Enriquecer con imágenes reales de Unsplash
      const foodsWithImages = await DestinationContentService.fetchUnsplashImages(
        generated.foods.map(f => ({ name: f.name, image_search: f.image_search }))
      );
      const placesWithImages = await DestinationContentService.fetchUnsplashImages(
        generated.places.map(p => ({ name: p.name, image_search: p.image_search }))
      );
      const souvenirsWithImages = await DestinationContentService.fetchUnsplashImages(
        generated.souvenirs.map(s => ({ name: s.name, image_search: s.image_search }))
      );

      // Obtener imagen hero del destino
      const heroImages = await DestinationContentService.fetchUnsplashImages(
        [{ name: city, image_search: `${city} ${country} travel landscape` }]
      );
      const heroImageUrl = heroImages.length > 0 ? heroImages[0].img : undefined;

      // Armar contenido final
      const content: DestinationContent = {
        destination_key: key,
        city,
        country,
        general_description: generated.general_description,
        foods: generated.foods.map((f, i) => ({
          name: f.name,
          desc: f.desc,
          img: foodsWithImages[i]?.img || 'https://images.unsplash.com/photo-random?w=400&q=80',
        })),
        places: generated.places.map((p, i) => ({
          name: p.name,
          desc: p.desc,
          img: placesWithImages[i]?.img || 'https://images.unsplash.com/photo-random?w=400&q=80',
        })),
        souvenirs: generated.souvenirs.map((s, i) => ({
          name: s.name,
          desc: s.desc,
          img: souvenirsWithImages[i]?.img || 'https://images.unsplash.com/photo-random?w=400&q=80',
        })),
        phrases: generated.phrases,
        practical_info: generated.practical_info,
        travel_tips: generated.travel_tips,
        hero_image_url: heroImageUrl,
        generated_by: 'gemini',
      };

      // Guardar en base de datos para cache futuro
      await DestinationContentService.saveToDatabase(content);

      return content;
    } catch (error: any) {
      console.error(`❌ Error obteniendo contenido para ${city}, ${country}:`, error.message);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────
  // 2. Generar contenido con Google Gemini
  // ────────────────────────────────────────────────────────
  static async generateWithGemini(city: string, country: string): Promise<GeminiGeneratedContent> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada en las variables de entorno');
    }

    const prompt = `Eres un experto en turismo y viajes internacionales. Genera contenido turístico completo en ESPAÑOL para el destino: ${city}, ${country}.

Responde ÚNICAMENTE con un JSON válido (sin markdown, sin backticks, sin texto adicional) con la siguiente estructura exacta:

{
  "general_description": "Descripción general del destino en 2-3 párrafos, mencionando su atractivo turístico principal, cultura y ambiente.",
  "foods": [
    {"name": "Nombre del platillo", "desc": "Descripción breve del platillo típico (1-2 oraciones)", "image_search": "término de búsqueda en inglés para encontrar una foto del platillo"}
  ],
  "places": [
    {"name": "Nombre del lugar turístico", "desc": "Descripción breve del lugar (1-2 oraciones)", "image_search": "término de búsqueda en inglés para encontrar una foto del lugar"}
  ],
  "souvenirs": [
    {"name": "Nombre del souvenir/artesanía", "desc": "Descripción breve (1-2 oraciones)", "image_search": "término de búsqueda en inglés para encontrar una foto del souvenir"}
  ],
  "phrases": [
    {"es": "Frase en español", "local": "Traducción al idioma local", "pronunciation": "Guía de pronunciación fonética"}
  ],
  "practical_info": {
    "currency": {"name": "Nombre de la moneda", "symbol": "Símbolo", "tip": "Consejo sobre uso de dinero"},
    "language": {"name": "Idioma principal", "tip": "Consejo sobre comunicación"},
    "climate": {"type": "Tipo de clima", "tip": "Consejo sobre qué ropa llevar"},
    "timezone": {"zone": "Zona horaria (ej: UTC+2)", "tip": "Consejo sobre diferencia horaria con México"},
    "voltage": {"spec": "Voltaje (ej: 220V/50Hz)", "plug_type": "Tipo de enchufe", "tip": "Consejo sobre adaptadores"},
    "emergency": {"number": "Número de emergencias", "tip": "Consejo de seguridad"}
  },
  "travel_tips": ["Consejo práctico 1", "Consejo práctico 2"]
}

REQUISITOS:
- foods: exactamente entre 4 y 6 platillos típicos
- places: exactamente entre 5 y 7 lugares turísticos imprescindibles
- souvenirs: exactamente entre 4 y 5 souvenirs o artesanías típicas
- phrases: exactamente entre 6 y 8 frases útiles en el idioma local del destino
- travel_tips: exactamente entre 3 y 5 consejos prácticos de viaje
- Todas las descripciones en español
- Los campos "image_search" deben ser términos de búsqueda en INGLÉS optimizados para encontrar buenas fotos en Unsplash
- La información práctica debe ser precisa y actualizada`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 4096,
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Error de Gemini API (${response.status}): ${errorBody}`);
      }

      const data = await response.json();

      // Extraer texto de la respuesta de Gemini
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        throw new Error('Respuesta vacía de Gemini API');
      }

      // Limpiar posibles backticks o envolturas de markdown
      const cleanJson = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/gi, '')
        .trim();

      const parsed: GeminiGeneratedContent = JSON.parse(cleanJson);

      // Validar campos mínimos
      if (!parsed.general_description || !parsed.foods || !parsed.places) {
        throw new Error('Respuesta de Gemini incompleta: faltan campos obligatorios');
      }

      return parsed;
    } catch (error: any) {
      console.error('❌ Error generando contenido con Gemini:', error.message);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────
  // 3. Obtener imágenes de Unsplash para cada item
  // ────────────────────────────────────────────────────────
  static async fetchUnsplashImages(
    items: ImageSearchItem[]
  ): Promise<Array<{ name: string; img: string }>> {
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    const results: Array<{ name: string; img: string }> = [];

    for (const item of items) {
      try {
        if (unsplashKey) {
          // Llamar a la API de Unsplash
          const searchQuery = encodeURIComponent(item.image_search);
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=1&client_id=${unsplashKey}`
          );

          if (response.ok) {
            const data = await response.json();
            const photoUrl = data?.results?.[0]?.urls?.regular
              || data?.results?.[0]?.urls?.small;

            if (photoUrl) {
              results.push({ name: item.name, img: photoUrl });
              continue;
            }
          }
        }

        // Fallback: imagen placeholder de Unsplash Source
        results.push({
          name: item.name,
          img: `https://images.unsplash.com/photo-random?w=400&q=80`,
        });
      } catch (error: any) {
        console.error(`⚠️ Error buscando imagen para "${item.name}":`, error.message);
        // Fallback silencioso
        results.push({
          name: item.name,
          img: `https://images.unsplash.com/photo-random?w=400&q=80`,
        });
      }
    }

    return results;
  }

  // ────────────────────────────────────────────────────────
  // 4. Enriquecer los días de un itinerario con contenido
  // ────────────────────────────────────────────────────────
  static async enrichItineraryDays(itineraryId: number): Promise<any> {
    try {
      // Obtener el itinerario de la base de datos
      const itineraryResult = await pool.query(
        'SELECT * FROM itineraries WHERE id = $1',
        [itineraryId]
      );

      if (itineraryResult.rows.length === 0) {
        throw new Error(`Itinerario con id ${itineraryId} no encontrado`);
      }

      const itinerary = itineraryResult.rows[0];
      const days = itinerary.days || [];
      const destination = itinerary.destination || '';

      // Extraer ciudad y país del destino del itinerario
      const { city: defaultCity, country: defaultCountry } =
        DestinationContentService.parseDestination(destination);

      // Enriquecer cada día del itinerario
      const enrichedDays = [];
      // Cache local para no regenerar contenido del mismo destino múltiples veces
      const contentCache: Record<string, DestinationContent> = {};

      for (const day of days) {
        try {
          // Intentar extraer ciudad del título del día o usar la del itinerario
          const dayTitle = day.title || day.titulo || '';
          const { city: dayCity, country: dayCountry } =
            DestinationContentService.parseDayCity(dayTitle, defaultCity, defaultCountry);

          if (!dayCity || !dayCountry) {
            // Sin destino identificable, mantener el día como está
            enrichedDays.push(day);
            continue;
          }

          const cacheKey = DestinationContentService.generateDestinationKey(dayCity, dayCountry);

          // Obtener contenido (del cache local o generando)
          if (!contentCache[cacheKey]) {
            contentCache[cacheKey] = await DestinationContentService.getContentForCity(
              dayCity,
              dayCountry
            );
          }

          const content = contentCache[cacheKey];

          // Enriquecer el día con el contenido del destino
          enrichedDays.push({
            ...day,
            foods: day.foods?.length > 0 ? day.foods : content.foods,
            places: day.places?.length > 0 ? day.places : content.places,
            souvenirs: day.souvenirs?.length > 0 ? day.souvenirs : content.souvenirs,
            phrases: day.phrases?.length > 0 ? day.phrases : content.phrases,
            practical_info: day.practical_info || content.practical_info,
            destination_content_key: cacheKey,
          });
        } catch (dayError: any) {
          console.error(`⚠️ Error enriqueciendo día "${day.title}":`, dayError.message);
          enrichedDays.push(day); // Mantener el día original si falla
        }
      }

      // Actualizar el itinerario en la base de datos
      await pool.query(
        'UPDATE itineraries SET days = $1, updated_at = NOW() WHERE id = $2',
        [JSON.stringify(enrichedDays), itineraryId]
      );

      return {
        ...itinerary,
        days: enrichedDays,
      };
    } catch (error: any) {
      console.error(`❌ Error enriqueciendo itinerario ${itineraryId}:`, error.message);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────
  // 5. Generar clave única de destino (normalizada)
  // ────────────────────────────────────────────────────────
  static generateDestinationKey(city: string, country: string): string {
    const normalize = (str: string): string =>
      str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
        .replace(/[^a-z0-9\s-]/g, '')     // Solo alfanuméricos, espacios y guiones
        .replace(/\s+/g, '-')             // Espacios a guiones
        .replace(/-+/g, '-')              // Múltiples guiones a uno solo
        .trim();

    return `${normalize(city)}-${normalize(country)}`;
  }

  // ==================== MÉTODOS AUXILIARES ====================

  /** Guardar contenido generado en la base de datos */
  private static async saveToDatabase(content: DestinationContent): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO destination_content
          (destination_key, city, country, region, general_description,
           foods, places, souvenirs, phrases, practical_info,
           travel_tips, hero_image_url, generated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (destination_key) DO UPDATE SET
           general_description = EXCLUDED.general_description,
           foods = EXCLUDED.foods,
           places = EXCLUDED.places,
           souvenirs = EXCLUDED.souvenirs,
           phrases = EXCLUDED.phrases,
           practical_info = EXCLUDED.practical_info,
           travel_tips = EXCLUDED.travel_tips,
           hero_image_url = EXCLUDED.hero_image_url,
           updated_at = NOW()`,
        [
          content.destination_key,
          content.city,
          content.country,
          content.region || null,
          content.general_description,
          JSON.stringify(content.foods),
          JSON.stringify(content.places),
          JSON.stringify(content.souvenirs),
          JSON.stringify(content.phrases),
          JSON.stringify(content.practical_info),
          content.travel_tips,
          content.hero_image_url || null,
          content.generated_by,
        ]
      );
      console.log(`💾 Contenido guardado en cache para: ${content.destination_key}`);
    } catch (error: any) {
      console.error('❌ Error guardando contenido en BD:', error.message);
      throw error;
    }
  }

  /** Eliminar contenido cacheado de un destino */
  static async deleteContent(destinationKey: string): Promise<boolean> {
    try {
      const result = await pool.query(
        'DELETE FROM destination_content WHERE destination_key = $1',
        [destinationKey]
      );
      return (result.rowCount ?? 0) > 0;
    } catch (error: any) {
      console.error('❌ Error eliminando contenido:', error.message);
      return false;
    }
  }

  /** Convertir fila de BD a interfaz DestinationContent */
  private static rowToContent(row: any): DestinationContent {
    return {
      id: row.id,
      destination_key: row.destination_key,
      city: row.city,
      country: row.country,
      region: row.region || undefined,
      general_description: row.general_description || '',
      foods: row.foods || [],
      places: row.places || [],
      souvenirs: row.souvenirs || [],
      phrases: row.phrases || [],
      practical_info: row.practical_info || {},
      travel_tips: row.travel_tips || [],
      hero_image_url: row.hero_image_url || undefined,
      generated_by: row.generated_by || 'gemini',
    };
  }

  /** Parsear destino en formato "Ciudad, País" o "Ciudad - País" */
  private static parseDestination(destination: string): { city: string; country: string } {
    if (!destination) return { city: '', country: '' };

    // Intentar separar por coma o guión
    const separators = [',', ' - ', ' – '];
    for (const sep of separators) {
      if (destination.includes(sep)) {
        const parts = destination.split(sep).map(p => p.trim());
        if (parts.length >= 2) {
          return { city: parts[0], country: parts[1] };
        }
      }
    }

    // Si no hay separador, asumir que es solo ciudad
    return { city: destination.trim(), country: '' };
  }

  /**
   * Intentar extraer la ciudad del título de un día del itinerario.
   * Si no se puede, usar los valores por defecto del itinerario.
   */
  private static parseDayCity(
    dayTitle: string,
    defaultCity: string,
    defaultCountry: string
  ): { city: string; country: string } {
    if (!dayTitle) return { city: defaultCity, country: defaultCountry };

    // Patrones comunes: "Día 1: Llegada a París", "Día 3 - Roma"
    const patterns = [
      /(?:llegada a|visita a|en|explorando|descubriendo)\s+(.+)/i,
      /día\s+\d+[:\s-]+(.+)/i,
    ];

    for (const pattern of patterns) {
      const match = dayTitle.match(pattern);
      if (match && match[1]) {
        const extracted = match[1].trim();
        // Si el texto extraído parece una ciudad (no muy largo), usarla
        if (extracted.length <= 50) {
          return { city: extracted, country: defaultCountry };
        }
      }
    }

    // Usar valores por defecto
    return { city: defaultCity, country: defaultCountry };
  }
}
