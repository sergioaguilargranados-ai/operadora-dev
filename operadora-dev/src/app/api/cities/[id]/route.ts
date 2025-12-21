import { NextRequest, NextResponse } from 'next/server'
import { createAmadeusCitySearch } from '@/services/providers/AmadeusCitySearch'

/**
 * GET /api/cities/[id]
 * Obtener información detallada de una ciudad
 *
 * @param id - Código IATA de la ciudad (ej: CUN, MEX, GDL)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Crear instancia del servicio Amadeus
    const amadeusService = createAmadeusCitySearch()

    if (!amadeusService) {
      // Si no hay credenciales, retornar datos mock
      return NextResponse.json({
        success: true,
        data: getMockCityData(id),
        source: 'mock'
      })
    }

    // Buscar información de la ciudad
    const cityInfo = await amadeusService.getCityInfo(id)

    if (!cityInfo) {
      return NextResponse.json({
        success: false,
        error: 'Ciudad no encontrada'
      }, { status: 404 })
    }

    // Obtener aeropuertos y puntos de interés
    const [airports, pois] = await Promise.all([
      amadeusService.getAirports(id),
      cityInfo.coordinates
        ? amadeusService.getPointsOfInterest(
            cityInfo.coordinates.latitude,
            cityInfo.coordinates.longitude
          )
        : Promise.resolve([])
    ])

    // Combinar toda la información
    const response = {
      ...cityInfo,
      airports,
      attractions: pois.map(poi => poi.name),
      photos: getDefaultPhotos(),
      description: `Descubre ${cityInfo.name}, un destino increíble que combina historia, cultura y belleza natural.`,
      bestTimeToVisit: 'Todo el año',
      averageTemperature: '24°C',
      currency: getCurrency(cityInfo.country),
      language: getLanguage(cityInfo.country)
    }

    return NextResponse.json({
      success: true,
      data: response,
      source: 'amadeus'
    })

  } catch (error: any) {
    console.error('Error fetching city data:', error)

    return NextResponse.json({
      success: false,
      error: 'Error al obtener información de la ciudad',
      details: error.message
    }, { status: 500 })
  }
}

/**
 * Datos mock para cuando no hay credenciales de Amadeus
 */
function getMockCityData(id: string) {
  const cities: Record<string, any> = {
    'CUN': {
      id: 'CUN',
      name: 'Cancún',
      country: 'MX',
      iataCode: 'CUN',
      description: 'Paraíso caribeño con playas de arena blanca y aguas turquesas',
      airports: [{ name: 'Aeropuerto Internacional de Cancún', code: 'CUN' }],
      attractions: ['Zona Hotelera', 'Playa Delfines', 'Isla Mujeres', 'Xcaret'],
      bestTimeToVisit: 'Noviembre - Abril',
      averageTemperature: '27°C',
      currency: 'MXN',
      language: 'Español',
      timezone: 'GMT-5'
    },
    'MEX': {
      id: 'MEX',
      name: 'Ciudad de México',
      country: 'MX',
      iataCode: 'MEX',
      description: 'Capital vibrante llena de historia, cultura y gastronomía',
      airports: [{ name: 'Aeropuerto Internacional Benito Juárez', code: 'MEX' }],
      attractions: ['Zócalo', 'Museo Frida Kahlo', 'Teotihuacán', 'Chapultepec'],
      bestTimeToVisit: 'Octubre - Mayo',
      averageTemperature: '16°C',
      currency: 'MXN',
      language: 'Español',
      timezone: 'GMT-6'
    }
  }

  return cities[id] || {
    id,
    name: 'Ciudad',
    country: 'MX',
    iataCode: id,
    description: 'Destino turístico increíble',
    airports: [],
    attractions: [],
    bestTimeToVisit: 'Todo el año',
    averageTemperature: '24°C',
    currency: 'MXN',
    language: 'Español',
    timezone: 'GMT-6'
  }
}

/**
 * Fotos por defecto (Unsplash)
 */
function getDefaultPhotos(): string[] {
  return [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=800&q=80',
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&q=80',
    'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=800&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
    'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?w=800&q=80'
  ]
}

/**
 * Obtener moneda según país
 */
function getCurrency(countryCode: string): string {
  const currencies: Record<string, string> = {
    'MX': 'MXN',
    'US': 'USD',
    'CA': 'CAD',
    'ES': 'EUR',
    'FR': 'EUR',
    'IT': 'EUR',
    'GB': 'GBP'
  }
  return currencies[countryCode] || 'USD'
}

/**
 * Obtener idioma según país
 */
function getLanguage(countryCode: string): string {
  const languages: Record<string, string> = {
    'MX': 'Español',
    'US': 'English',
    'CA': 'English/Français',
    'ES': 'Español',
    'FR': 'Français',
    'IT': 'Italiano',
    'GB': 'English'
  }
  return languages[countryCode] || 'English'
}
