import { NextRequest, NextResponse } from 'next/server'
import SearchService from '@/services/SearchService'

/**
 * API de búsqueda de actividades y tours
 * GET /api/search/activities
 *
 * Query params:
 * - latitude: Latitud de la ubicación (ej: 48.856614)
 * - longitude: Longitud de la ubicación (ej: 2.352222)
 * - radius: (opcional) Radio de búsqueda en km (default: 20)
 * - city: (opcional) Nombre de ciudad para geocoding automático
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Opción 1: Coordenadas directas
    const latParam = searchParams.get('latitude')
    const lonParam = searchParams.get('longitude')

    // Opción 2: Nombre de ciudad (requiere geocoding)
    const city = searchParams.get('city')

    // Validar que se proporcione al menos una opción
    if ((!latParam || !lonParam) && !city) {
      return NextResponse.json(
        {
          success: false,
          error: 'Must provide either (latitude + longitude) or city parameter'
        },
        { status: 400 }
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
          {
            success: false,
            error: 'Invalid latitude or longitude'
          },
          { status: 400 }
        )
      }
    } else if (city) {
      // Geocoding simple de ciudades principales
      const coordinates = getCityCoordinates(city)

      if (!coordinates) {
        return NextResponse.json(
          {
            success: false,
            error: 'City not found. Please provide latitude and longitude instead.'
          },
          { status: 400 }
        )
      }

      latitude = coordinates.latitude
      longitude = coordinates.longitude
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing coordinates'
        },
        { status: 400 }
      )
    }

    const radiusParam = searchParams.get('radius')
    const radius = radiusParam ? parseInt(radiusParam) : 20

    if (isNaN(radius) || radius < 1 || radius > 100) {
      return NextResponse.json(
        {
          success: false,
          error: 'Radius must be a number between 1 and 100 km'
        },
        { status: 400 }
      )
    }

    console.log('🎭 Activities search request:', {
      latitude,
      longitude,
      radius,
      city: city || 'coordinates'
    })

    const params = {
      latitude,
      longitude,
      radius
    }

    const results = await SearchService.searchActivities(params)

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      searchParams: {
        ...params,
        city: city || undefined
      }
    })

  } catch (error) {
    console.error('❌ Error in activities API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Geocoding simple de ciudades principales
 */
function getCityCoordinates(city: string): { latitude: number; longitude: number } | null {
  const cityCoords: Record<string, { latitude: number; longitude: number }> = {
    // México
    'cancun': { latitude: 21.1619, longitude: -86.8515 },
    'cancún': { latitude: 21.1619, longitude: -86.8515 },
    'cdmx': { latitude: 19.4326, longitude: -99.1332 },
    'ciudad de mexico': { latitude: 19.4326, longitude: -99.1332 },
    'guadalajara': { latitude: 20.6597, longitude: -103.3496 },
    'monterrey': { latitude: 25.6866, longitude: -100.3161 },
    'puerto vallarta': { latitude: 20.6534, longitude: -105.2253 },
    'los cabos': { latitude: 22.8905, longitude: -109.9167 },

    // Internacional
    'paris': { latitude: 48.8566, longitude: 2.3522 },
    'londres': { latitude: 51.5074, longitude: -0.1278 },
    'london': { latitude: 51.5074, longitude: -0.1278 },
    'nueva york': { latitude: 40.7128, longitude: -74.0060 },
    'new york': { latitude: 40.7128, longitude: -74.0060 },
    'madrid': { latitude: 40.4168, longitude: -3.7038 },
    'barcelona': { latitude: 41.3851, longitude: 2.1734 },
    'roma': { latitude: 41.9028, longitude: 12.4964 },
    'rome': { latitude: 41.9028, longitude: 12.4964 },
    'miami': { latitude: 25.7617, longitude: -80.1918 },
    'los angeles': { latitude: 34.0522, longitude: -118.2437 },
    'tokyo': { latitude: 35.6762, longitude: 139.6503 },
    'tokio': { latitude: 35.6762, longitude: 139.6503 }
  }

  const normalized = city.toLowerCase().trim()
  return cityCoords[normalized] || null
}
