// Build: 01 Jul 2026
// Servicio de contenido por destino - Motor de contenido turístico generado por IA
// Genera y cachea información turística (comidas, lugares, frases, tips) para cada destino

import { pool } from '@/lib/db';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80';

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

      // Enriquecer con imágenes reales de Pexels/Unsplash
      const foodsWithImages = await DestinationContentService.fetchRealImages(
        generated.foods.map(f => ({ name: f.name, image_search: f.image_search }))
      );
      const placesWithImages = await DestinationContentService.fetchRealImages(
        generated.places.map(p => ({ name: p.name, image_search: p.image_search }))
      );
      const souvenirsWithImages = await DestinationContentService.fetchRealImages(
        generated.souvenirs.map(s => ({ name: s.name, image_search: s.image_search }))
      );

      // Obtener imagen hero del destino
      const heroImages = await DestinationContentService.fetchRealImages(
        [{ name: city, image_search: `${city} ${country} travel landscape scenery no people` }]
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
          img: foodsWithImages[i]?.img || FALLBACK_IMAGE,
        })),
        places: generated.places.map((p, i) => ({
          name: p.name,
          desc: p.desc,
          img: placesWithImages[i]?.img || FALLBACK_IMAGE,
        })),
        souvenirs: generated.souvenirs.map((s, i) => ({
          name: s.name,
          desc: s.desc,
          img: souvenirsWithImages[i]?.img || FALLBACK_IMAGE,
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
  "general_description": "Breve descripción general del destino en 1 solo párrafo corto (máximo 40 palabras), mencionando su atractivo principal.",
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
- Los campos "image_search" deben ser términos de búsqueda en INGLÉS optimizados para encontrar fotos (importante: incluye palabras como "landscape", "scenery" o "no people" para evitar fotos donde salgan caras de personas)
- La información práctica debe ser precisa y actualizada`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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
        if (response.status === 429) {
          throw new Error('Se ha excedido la cuota gratuita de la API de Gemini (Error 429 - Quota Exceeded). Es necesario configurar facturación en Google Cloud para esta API Key o utilizar otra llave con cuota disponible.');
        }
        try {
          const errObj = JSON.parse(errorBody);
          throw new Error(`Error de Gemini API (${response.status}): ${errObj.error?.message || 'Error desconocido'}`);
        } catch(e) {
          throw new Error(`Error de Gemini API (${response.status})`);
        }
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
  // 3. Obtener imágenes reales (Pexels / Unsplash)
  // ────────────────────────────────────────────────────────
  static async fetchRealImages(
    items: ImageSearchItem[]
  ): Promise<Array<{ name: string; img: string }>> {
    const pexelsKey = process.env.PEXELS_API_KEY;
    const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
    const results: Array<{ name: string; img: string }> = [];

    for (const item of items) {
      try {
        const searchQuery = encodeURIComponent(item.image_search);
        let photoUrl = null;

        // 1. Intentar con Pexels primero
        if (pexelsKey && !photoUrl) {
          const response = await fetch(
            `https://api.pexels.com/v1/search?query=${searchQuery}&per_page=1`,
            { headers: { Authorization: pexelsKey } }
          );
          if (response.ok) {
            const data = await response.json();
            photoUrl = data?.photos?.[0]?.src?.large || data?.photos?.[0]?.src?.medium;
          }
        }

        // 2. Intentar con Unsplash si no hay respuesta de Pexels
        if (unsplashKey && !photoUrl) {
          const response = await fetch(
            `https://api.unsplash.com/search/photos?query=${searchQuery}&per_page=1&client_id=${unsplashKey}`
          );
          if (response.ok) {
            const data = await response.json();
            photoUrl = data?.results?.[0]?.urls?.regular || data?.results?.[0]?.urls?.small;
          }
        }

        // 3. Fallback a Wikipedia (¡Sin límites de API!)
        if (!photoUrl) {
          try {
            const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${searchQuery}&utf8=&format=json`);
            if (searchRes.ok) {
              const searchData = await searchRes.json();
              if (searchData?.query?.search?.length > 0) {
                const title = searchData.query.search[0].title;
                const imgRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`);
                if (imgRes.ok) {
                  const imgData = await imgRes.json();
                  const pages = imgData?.query?.pages;
                  if (pages) {
                    const pageId = Object.keys(pages)[0];
                    if (pages[pageId]?.original?.source) {
                      photoUrl = pages[pageId].original.source;
                    }
                  }
                }
              }
            }
          } catch (e) {
            console.error('Wikipedia fallback error:', e);
          }
        }

        if (photoUrl) {
          results.push({ name: item.name, img: photoUrl });
        } else {
          // Fallback final: imagen genérica
          results.push({
            name: item.name,
            img: FALLBACK_IMAGE,
          });
        }
      } catch (error: any) {
        console.error(`⚠️ Error buscando imagen para "${item.name}":`, error.message);
        results.push({
          name: item.name,
          img: FALLBACK_IMAGE,
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
          let { city: dayCity, country: dayCountry } =
            DestinationContentService.parseDayCity(dayTitle, defaultCity, defaultCountry);

          if (!dayCity) {
            // Sin ciudad identificable, mantener el día como está
            enrichedDays.push(day);
            continue;
          }

          // Si no tenemos país, buscar la ciudad en destination_content para deducirlo
          if (!dayCountry) {
            try {
              const cityLookup = await pool.query(
                'SELECT country FROM destination_content WHERE LOWER(city) = LOWER($1) LIMIT 1',
                [dayCity]
              );
              if (cityLookup.rows.length > 0) {
                dayCountry = cityLookup.rows[0].country;
                console.log(`🔍 País deducido de BD para ${dayCity}: ${dayCountry}`);
              } else {
                // Fallback: usar el destino general (ej. "Europa") como país para que la IA lo resuelva
                dayCountry = defaultCity || 'Mundo';
                console.log(`⚠️ No se encontró país, usando fallback "${dayCountry}" para ${dayCity}`);
              }
            } catch (lookupErr: any) {
              console.error(`⚠️ Error buscando país para ${dayCity}:`, lookupErr.message);
              dayCountry = defaultCity || 'Mundo';
            }
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

          const hasValidFoods = day.foods?.length > 0 && day.foods[0].name && !['La mejor comida', 'comida 1'].includes(day.foods[0].name);
          const hasValidPlaces = day.places?.length > 0 && day.places[0].name && !['lugar 1'].includes(day.places[0].name);
          const hasValidSouvenirs = day.souvenirs?.length > 0 && day.souvenirs[0].name && !['suvenir 1'].includes(day.souvenirs[0].name);
          const hasValidPhrases = day.phrases?.length > 0 && day.phrases[0].es && !['hola', 'Gracias '].includes(day.phrases[0].es);

          // Enriquecer el día con el contenido del destino, sobrescribiendo placeholders
          enrichedDays.push({
            ...day,
            foods: hasValidFoods ? day.foods : content.foods,
            places: hasValidPlaces ? day.places : content.places,
            souvenirs: hasValidSouvenirs ? day.souvenirs : content.souvenirs,
            phrases: hasValidPhrases ? day.phrases : content.phrases,
            practical_info: day.practical_info || content.practical_info,
            general_description: content.general_description,
            travel_tips: content.travel_tips,
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

  /**
   * Obtiene el plan de enriquecimiento (lista de ciudades únicas) para un itinerario.
   * Esto sirve para que el frontend pueda procesar una por una y mostrar una barra de progreso,
   * evitando timeouts de Vercel (Error 504).
   */
  static async getEnrichmentPlan(itineraryId: number): Promise<Array<{city: string, country: string}>> {
    try {
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

      const { city: defaultCity, country: defaultCountry } =
        DestinationContentService.parseDestination(destination);

      const uniqueDestinations = new Map<string, {city: string, country: string}>();

      for (const day of days) {
        const dayTitle = day.title || day.titulo || '';
        let { city: dayCity, country: dayCountry } =
          DestinationContentService.parseDayCity(dayTitle, defaultCity, defaultCountry);

        if (!dayCity) continue;

        if (!dayCountry) {
          try {
            const cityLookup = await pool.query(
              'SELECT country FROM destination_content WHERE LOWER(city) = LOWER($1) LIMIT 1',
              [dayCity]
            );
            if (cityLookup.rows.length > 0) {
              dayCountry = cityLookup.rows[0].country;
            } else {
              dayCountry = defaultCity || 'Mundo';
            }
          } catch (e) {
            dayCountry = defaultCity || 'Mundo';
          }
        }

        const key = DestinationContentService.generateDestinationKey(dayCity, dayCountry);
        if (!uniqueDestinations.has(key)) {
          uniqueDestinations.set(key, { city: dayCity, country: dayCountry });
        }
      }

      return Array.from(uniqueDestinations.values());
    } catch (error: any) {
      console.error(`❌ Error obteniendo plan de enriquecimiento para ${itineraryId}:`, error.message);
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
        let extracted = match[1].trim();
        
        // Si el formato es "MÉXICO - MADRID" o "VENECIA – ROMA", tomar la última ciudad (el destino)
        if (extracted.includes('-') || extracted.includes('–') || extracted.includes('—')) {
          const parts = extracted.split(/[-–—]/).map(p => p.trim()).filter(p => p.length > 0);
          if (parts.length > 0) {
            extracted = parts[parts.length - 1];
          }
        }

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
