import { NextRequest, NextResponse } from 'next/server'
import SearchService from '@/services/SearchService'
import { successResponse, errorResponse } from '@/types/api-response'

/**
 * API de búsqueda de actividades y tours
 * GET /api/search/activities
 *
 * Query params:
 * - latitude: Latitud de la ubicación (ej: 48.856614)
 * - longitude: Longitud de la ubicación (ej: 2.352222)
 * - radius: (opcional) Radio de búsqueda en km (default: 20)
 * - city: (opcional) Nombre de ciudad para geocoding automático
 * - view: compact (opcional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Opción 1: Coordenadas directas
    const latParam = searchParams.get('latitude')
    const lonParam = searchParams.get('longitude')

    // Opción 2: Nombre de ciudad (requiere geocoding)
    const city = searchParams.get('city')
    const view = (searchParams.get('view') || '').toLowerCase()

    // Validar que se proporcione al menos una opción
    if ((!latParam || !lonParam) && !city) {
      return NextResponse.json(
        errorResponse('ACTIVITY_PARAMS', 'Must provide either (latitude + longitude) or city parameter'),
        { status: 400, headers: { 'X-API-Version': '1.0' } }
      )
    }

    let latitude: number
    let longitude: number

    if (latParam && lonParam) {
      // Usar coordenadas directas
      latitude = parseFloat(latParam)
      longitude = parseFloat(lonParam)

      if (isNaN(latitude) || isNaN(longitude)) {
        return NextResponse.json(
          errorResponse('COORDS_INVALID', 'Invalid latitude or longitude'),
          { status: 400, headers: { 'X-API-Version': '1.0' } }
        )
      }
    } else if (city) {
      // Buscar coordenadas en BD primero, luego fallback a mapeo estático
      const coordinates = await getCityCoordinatesFromDB(city)

      if (!coordinates) {
        return NextResponse.json(
          errorResponse('CITY_NOT_FOUND', 'City not found. Please provide latitude and longitude instead or try a different city.'),
          { status: 400, headers: { 'X-API-Version': '1.0' } }
        )
      }

      latitude = coordinates.latitude
      longitude = coordinates.longitude
    } else {
      return NextResponse.json(
        errorResponse('COORDS_MISSING', 'Missing coordinates'),
        { status: 400, headers: { 'X-API-Version': '1.0' } }
      )
    }

    const radiusParam = searchParams.get('radius')
    const radius = radiusParam ? parseInt(radiusParam) : 20

    if (isNaN(radius) || radius < 1 || radius > 100) {
      return NextResponse.json(
        errorResponse('RADIUS_INVALID', 'Radius must be a number between 1 and 100 km'),
        { status: 400, headers: { 'X-API-Version': '1.0' } }
      )
    }

    const params = { latitude, longitude, radius }
    const results = await SearchService.searchActivities(params)

    const compact = (a: any) => ({
      id: a.id,
      name: a.name || a.title,
      location: a.location || a.city,
      price: a.price || a.price_from || 0,
      currency: a.currency || 'MXN',
      image_url: a.image_url || (Array.isArray(a.images) ? a.images[0] : null),
      rating: a.rating || null,
    })

    const payload = view === 'compact' ? results.map(compact) : results

    return NextResponse.json(
      successResponse(payload, { total: payload.length }),
      { headers: { 'X-API-Version': '1.0' } }
    )

  } catch (error) {
    console.error('❌ Error in activities API:', error)
    return NextResponse.json(
      errorResponse('ACTIVITIES_ERROR', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500, headers: { 'X-API-Version': '1.0' } }
    )
  }
}

/**
 * Obtener coordenadas de ciudad desde BD (método principal)
 */
async function getCityCoordinatesFromDB(city: string): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const { queryOne } = await import('@/lib/db')

    // Normalizar nombre de ciudad
    const normalizedCity = city
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

    const result = await queryOne(
      'SELECT latitude, longitude FROM cities WHERE normalized_name = $1 AND latitude IS NOT NULL AND longitude IS NOT NULL LIMIT 1',
      [normalizedCity]
    )

    if (result && result.latitude && result.longitude) {
      return {
        latitude: parseFloat(result.latitude),
        longitude: parseFloat(result.longitude)
      }
    }

    // Fallback a mapeo estático
    return getCityCoordinatesStatic(city)
  } catch (error) {
    console.error('Error fetching coordinates from DB:', error)
    return getCityCoordinatesStatic(city)
  }
}

/**
 * Geocoding simple de ciudades principales (fallback estático)
 */
function getCityCoordinatesStatic(city: string): { latitude: number; longitude: number } | null {
  const cityCoords: Record<string, { latitude: number; longitude: number }> = {
    // México - Playas
    'cancun': { latitude: 21.1619, longitude: -86.8515 },
    'cancún': { latitude: 21.1619, longitude: -86.8515 },
    'quintana roo': { latitude: 21.1619, longitude: -86.8515 }, // Default a Cancún
    'playa del carmen': { latitude: 20.6296, longitude: -87.0739 },
    'riviera maya': { latitude: 20.5060, longitude: -87.4530 },
    'tulum': { latitude: 20.2114, longitude: -87.4654 },
    'cozumel': { latitude: 20.4230, longitude: -86.9223 },
    'isla mujeres': { latitude: 21.2320, longitude: -86.7310 },
    'puerto vallarta': { latitude: 20.6534, longitude: -105.2253 },
    'los cabos': { latitude: 22.8905, longitude: -109.9167 },
    'cabo san lucas': { latitude: 22.8905, longitude: -109.9167 },
    'san jose del cabo': { latitude: 23.0622, longitude: -109.6987 },
    'la paz': { latitude: 24.1426, longitude: -110.3128 },
    'mazatlan': { latitude: 23.2494, longitude: -106.4111 },
    'mazatlán': { latitude: 23.2494, longitude: -106.4111 },
    'acapulco': { latitude: 16.8531, longitude: -99.8237 },
    'ixtapa': { latitude: 17.6657, longitude: -101.6058 },
    'zihuatanejo': { latitude: 17.6416, longitude: -101.5515 },
    'huatulco': { latitude: 15.7690, longitude: -96.1260 },
    'puerto escondido': { latitude: 15.8619, longitude: -97.0767 },

    // México - Ciudades
    'cdmx': { latitude: 19.4326, longitude: -99.1332 },
    'ciudad de mexico': { latitude: 19.4326, longitude: -99.1332 },
    'mexico city': { latitude: 19.4326, longitude: -99.1332 },
    'guadalajara': { latitude: 20.6597, longitude: -103.3496 },
    'monterrey': { latitude: 25.6866, longitude: -100.3161 },
    'merida': { latitude: 20.9674, longitude: -89.5926 },
    'mérida': { latitude: 20.9674, longitude: -89.5926 },
    'oaxaca': { latitude: 17.0732, longitude: -96.7266 },
    'puebla': { latitude: 19.0414, longitude: -98.2063 },
    'queretaro': { latitude: 20.5888, longitude: -100.3899 },
    'querétaro': { latitude: 20.5888, longitude: -100.3899 },
    'leon': { latitude: 21.1250, longitude: -101.6860 },
    'león': { latitude: 21.1250, longitude: -101.6860 },
    'tijuana': { latitude: 32.5149, longitude: -117.0382 },
    'san miguel de allende': { latitude: 20.9144, longitude: -100.7452 },
    'guanajuato': { latitude: 21.0190, longitude: -101.2574 },
    'san cristobal de las casas': { latitude: 16.7370, longitude: -92.6376 },
    'taxco': { latitude: 18.5564, longitude: -99.6050 },
    'valle de bravo': { latitude: 19.1936, longitude: -100.1314 },
    'tepoztlan': { latitude: 18.9850, longitude: -99.0945 },
    'tepoztlán': { latitude: 18.9850, longitude: -99.0945 },

    // USA
    'miami': { latitude: 25.7617, longitude: -80.1918 },
    'orlando': { latitude: 28.5383, longitude: -81.3792 },
    'nueva york': { latitude: 40.7128, longitude: -74.0060 },
    'new york': { latitude: 40.7128, longitude: -74.0060 },
    'los angeles': { latitude: 34.0522, longitude: -118.2437 },
    'las vegas': { latitude: 36.1699, longitude: -115.1398 },
    'san francisco': { latitude: 37.7749, longitude: -122.4194 },
    'chicago': { latitude: 41.8781, longitude: -87.6298 },
    'houston': { latitude: 29.7604, longitude: -95.3698 },
    'san diego': { latitude: 32.7157, longitude: -117.1611 },
    'honolulu': { latitude: 21.3069, longitude: -157.8583 },
    'hawaii': { latitude: 21.3069, longitude: -157.8583 },

    // Europa
    'paris': { latitude: 48.8566, longitude: 2.3522 },
    'parís': { latitude: 48.8566, longitude: 2.3522 },
    'londres': { latitude: 51.5074, longitude: -0.1278 },
    'london': { latitude: 51.5074, longitude: -0.1278 },
    'madrid': { latitude: 40.4168, longitude: -3.7038 },
    'barcelona': { latitude: 41.3851, longitude: 2.1734 },
    'roma': { latitude: 41.9028, longitude: 12.4964 },
    'rome': { latitude: 41.9028, longitude: 12.4964 },
    'venecia': { latitude: 45.4408, longitude: 12.3155 },
    'venice': { latitude: 45.4408, longitude: 12.3155 },
    'florencia': { latitude: 43.7696, longitude: 11.2558 },
    'florence': { latitude: 43.7696, longitude: 11.2558 },
    'amsterdam': { latitude: 52.3676, longitude: 4.9041 },
    'ámsterdam': { latitude: 52.3676, longitude: 4.9041 },
    'berlin': { latitude: 52.5200, longitude: 13.4050 },
    'berlín': { latitude: 52.5200, longitude: 13.4050 },
    'praga': { latitude: 50.0755, longitude: 14.4378 },
    'prague': { latitude: 50.0755, longitude: 14.4378 },
    'viena': { latitude: 48.2082, longitude: 16.3738 },
    'vienna': { latitude: 48.2082, longitude: 16.3738 },
    'ibiza': { latitude: 38.9067, longitude: 1.4206 },
    'mallorca': { latitude: 39.6953, longitude: 3.0176 },
    'niza': { latitude: 43.7102, longitude: 7.2620 },
    'nice': { latitude: 43.7102, longitude: 7.2620 },

    // Caribe
    'punta cana': { latitude: 18.5820, longitude: -68.4055 },
    'santo domingo': { latitude: 18.4861, longitude: -69.9312 },
    'la habana': { latitude: 23.1136, longitude: -82.3666 },
    'havana': { latitude: 23.1136, longitude: -82.3666 },
    'varadero': { latitude: 23.1536, longitude: -81.2860 },
    'san juan': { latitude: 18.4655, longitude: -66.1057 },
    'aruba': { latitude: 12.5211, longitude: -69.9683 },

    // Centroamérica
    'ciudad de panama': { latitude: 8.9824, longitude: -79.5199 },
    'panama city': { latitude: 8.9824, longitude: -79.5199 },
    'san jose': { latitude: 9.9281, longitude: -84.0907 },
    'guanacaste': { latitude: 10.4983, longitude: -85.3933 },

    // Sudamérica
    'buenos aires': { latitude: -34.6037, longitude: -58.3816 },
    'rio de janeiro': { latitude: -22.9068, longitude: -43.1729 },
    'río de janeiro': { latitude: -22.9068, longitude: -43.1729 },
    'sao paulo': { latitude: -23.5505, longitude: -46.6333 },
    'são paulo': { latitude: -23.5505, longitude: -46.6333 },
    'lima': { latitude: -12.0464, longitude: -77.0428 },
    'cusco': { latitude: -13.5319, longitude: -71.9675 },
    'bogota': { latitude: 4.7110, longitude: -74.0721 },
    'bogotá': { latitude: 4.7110, longitude: -74.0721 },
    'cartagena': { latitude: 10.3910, longitude: -75.4794 },

    // Asia
    'tokyo': { latitude: 35.6762, longitude: 139.6503 },
    'tokio': { latitude: 35.6762, longitude: 139.6503 },
    'bangkok': { latitude: 13.7563, longitude: 100.5018 },
    'dubai': { latitude: 25.2048, longitude: 55.2708 },
    'singapur': { latitude: 1.3521, longitude: 103.8198 },
    'singapore': { latitude: 1.3521, longitude: 103.8198 }
  }

  // Normalizar: quitar acentos, lowercase, trim
  const originalNormalized = city
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  // Intentar varias estrategias de búsqueda
  const searchStrategies: string[] = []

  // 1. String completo normalizado
  searchStrategies.push(originalNormalized)

  // 2. Si viene con formato "Ciudad, Estado, País", probar cada parte
  if (originalNormalized.includes(',')) {
    const parts = originalNormalized.split(',').map(p => p.trim())
    parts.forEach(part => {
      if (part.length > 2) {
        searchStrategies.push(part)
      }
    })
  }

  // 3. Palabras individuales (para casos como "playa del carmen")
  const words = originalNormalized.replace(/,/g, ' ').split(' ').filter(w => w.length > 3)

  // Buscar coincidencia directa con cada estrategia
  for (const searchTerm of searchStrategies) {
    if (cityCoords[searchTerm]) {
      return cityCoords[searchTerm]
    }
  }

  // Buscar coincidencia parcial más flexible
  for (const searchTerm of searchStrategies) {
    for (const [key, coords] of Object.entries(cityCoords)) {
      // Si el searchTerm contiene la key o viceversa
      if (searchTerm.includes(key) || key.includes(searchTerm)) {
        return coords
      }
    }
  }

  // Buscar por palabras individuales como último recurso
  for (const word of words) {
    for (const [key, coords] of Object.entries(cityCoords)) {
      if (key.includes(word) || word.includes(key)) {
        return coords
      }
    }
  }

  return null
}
