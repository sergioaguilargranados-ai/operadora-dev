import { NextRequest, NextResponse } from 'next/server'
import SearchService from '@/services/SearchService'
import AmadeusAdapter from '@/services/providers/AmadeusAdapter'
import KiwiAdapter from '@/services/providers/KiwiAdapter'
import BookingAdapter from '@/services/providers/BookingAdapter'
import ExpediaAdapter from '@/services/providers/ExpediaAdapter'
import CurrencyService from '@/services/CurrencyService'

/**
 * GET /api/search
 * API unificada de búsqueda multi-proveedor
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchType = searchParams.get('type') || 'flight'

    // Obtener user ID si está autenticado (opcional)
    const userId = getUserIdIfAuthenticated(request)

    // Guardar búsqueda en historial
    if (userId) {
      await SearchService.saveSearch(userId, {
        search_type: searchType as any,
        ...Object.fromEntries(searchParams.entries())
      })
    }

    // Enrutar según tipo de búsqueda
    switch (searchType) {
      case 'flight':
        return await searchFlights(searchParams, userId)

      case 'hotel':
        return await searchHotels(searchParams, userId)

      case 'package':
        return await searchPackages(searchParams, userId)

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid search type. Must be: flight, hotel, or package'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      message: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * Búsqueda de vuelos (múltiples proveedores)
 */
async function searchFlights(params: URLSearchParams, userId: number | null) {
  const origin = params.get('origin')
  const destination = params.get('destination')
  const departureDate = params.get('departureDate')
  const returnDate = params.get('returnDate')
  const adults = parseInt(params.get('adults') || '1', 10)
  const children = parseInt(params.get('children') || '0', 10)
  const cabinClass = params.get('cabinClass') || 'economy'
  const currency = params.get('currency') || 'MXN'
  const providers = params.get('providers')?.split(',') || ['amadeus', 'kiwi', 'expedia']

  // Validaciones
  if (!origin || !destination || !departureDate) {
    return NextResponse.json({
      success: false,
      error: 'origin, destination, and departureDate are required'
    }, { status: 400 })
  }

  const results = []
  const errors: string[] = []

  // Buscar en Amadeus (si está habilitado)
  if (providers.includes('amadeus') && process.env.AMADEUS_API_KEY) {
    try {
      const amadeus = new AmadeusAdapter(
        process.env.AMADEUS_API_KEY,
        process.env.AMADEUS_API_SECRET || '',
        process.env.AMADEUS_SANDBOX === 'true'
      )

      const amadeusResults = await amadeus.search({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        returnDate,
        adults,
        children,
        travelClass: cabinClass.toUpperCase()
      })

      results.push(...amadeusResults)
    } catch (error) {
      console.error('Amadeus search error:', error)
      errors.push('Amadeus: ' + (error as Error).message)
    }
  }

  // Buscar en Kiwi (si está habilitado)
  if (providers.includes('kiwi') && process.env.KIWI_API_KEY) {
    try {
      const kiwi = new KiwiAdapter(process.env.KIWI_API_KEY)

      const kiwiResults = await kiwi.search({
        fly_from: origin,
        fly_to: destination,
        date_from: departureDate,
        date_to: departureDate,
        return_date: returnDate,
        adults,
        children,
        cabin_class: cabinClass,
        currency
      })

      results.push(...kiwiResults)
    } catch (error) {
      console.error('Kiwi search error:', error)
      errors.push('Kiwi: ' + (error as Error).message)
    }
  }

  // Buscar en Expedia (si está habilitado)
  if (providers.includes('expedia') && process.env.EXPEDIA_API_KEY && process.env.EXPEDIA_API_SECRET) {
    try {
      const expedia = new ExpediaAdapter(
        process.env.EXPEDIA_API_KEY,
        process.env.EXPEDIA_API_SECRET,
        process.env.EXPEDIA_SANDBOX === 'true'
      )

      const expediaResults = await expedia.searchFlights({
        originLocationCode: origin,
        destinationLocationCode: destination,
        departureDate,
        returnDate,
        adults,
        children,
        travelClass: cabinClass,
        currency
      })

      results.push(...expediaResults)
    } catch (error) {
      console.error('Expedia search error:', error)
      errors.push('Expedia: ' + (error as Error).message)
    }
  }

  // Si no hay resultados de ningún proveedor
  if (results.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'No flights found',
      providerErrors: errors
    }, { status: 404 })
  }

  // Convertir precios a moneda solicitada si es necesario
  const convertedResults = await convertResultsCurrency(results, currency)

  // Ordenar por precio (menor a mayor)
  const sortedResults = convertedResults.sort((a, b) => a.price - b.price)

  // Deduplicar (mismo vuelo de diferentes proveedores)
  const uniqueResults = deduplicateFlights(sortedResults)

  return NextResponse.json({
    success: true,
    data: uniqueResults,
    total: uniqueResults.length,
    providers: {
      searched: providers,
      successful: providers.filter(p =>
        !errors.some(e => e.toLowerCase().includes(p))
      ),
      failed: errors
    },
    search_params: {
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      children,
      cabinClass,
      currency
    }
  })
}

/**
 * Búsqueda de hoteles
 */
async function searchHotels(params: URLSearchParams, userId: number | null) {
  const city = params.get('city') || params.get('destination')
  const checkin = params.get('checkin') || params.get('checkIn')
  const checkout = params.get('checkout') || params.get('checkOut')
  const guests = parseInt(params.get('guests') || params.get('adults') || '2', 10)
  const rooms = parseInt(params.get('rooms') || '1', 10)
  const currency = params.get('currency') || 'MXN'
  const providers = params.get('providers')?.split(',') || ['booking', 'expedia', 'database']

  if (!city || !checkin || !checkout) {
    return NextResponse.json({
      success: false,
      error: 'city, checkin, and checkout are required'
    }, { status: 400 })
  }

  const results = []
  const errors: string[] = []

  // Buscar en base de datos local
  if (providers.includes('database')) {
    try {
      // Usar la API de hotels existente
      const dbResponse = await fetch(
        `http://localhost:3000/api/hotels?city=${city}&currency=${currency}`,
        { cache: 'no-store' }
      )

      if (dbResponse.ok) {
        const data = await dbResponse.json()
        results.push(...(data.data || []))
      }
    } catch (error) {
      console.error('Database search error:', error)
      errors.push('Database: ' + (error as Error).message)
    }
  }

  // Buscar en Booking.com (si está habilitado)
  if (providers.includes('booking') && process.env.BOOKING_API_KEY) {
    try {
      const booking = new BookingAdapter(
        process.env.BOOKING_API_KEY,
        process.env.BOOKING_AFFILIATE_ID || ''
      )

      const bookingResults = await booking.search({
        city,
        checkin,
        checkout,
        guests,
        rooms,
        currency
      })

      results.push(...bookingResults)
    } catch (error) {
      console.error('Booking search error:', error)
      errors.push('Booking: ' + (error as Error).message)
    }
  }

  // Buscar en Expedia (si está habilitado)
  if (providers.includes('expedia') && process.env.EXPEDIA_API_KEY && process.env.EXPEDIA_API_SECRET) {
    try {
      const expedia = new ExpediaAdapter(
        process.env.EXPEDIA_API_KEY,
        process.env.EXPEDIA_API_SECRET,
        process.env.EXPEDIA_SANDBOX === 'true'
      )

      const expediaResults = await expedia.searchHotels({
        city,
        checkin,
        checkout,
        guests,
        rooms,
        currency
      })

      results.push(...expediaResults)
    } catch (error) {
      console.error('Expedia search error:', error)
      errors.push('Expedia: ' + (error as Error).message)
    }
  }

  if (results.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'No hotels found',
      providerErrors: errors
    }, { status: 404 })
  }

  // Ordenar por rating (mayor a menor) y luego por precio
  const sortedResults = results.sort((a, b) => {
    const ratingDiff = (b.details?.rating || 0) - (a.details?.rating || 0)
    if (ratingDiff !== 0) return ratingDiff
    return a.price - b.price
  })

  return NextResponse.json({
    success: true,
    data: sortedResults,
    total: sortedResults.length,
    providers: {
      searched: providers,
      successful: providers.filter(p =>
        !errors.some(e => e.toLowerCase().includes(p))
      ),
      failed: errors
    },
    search_params: {
      city,
      checkin,
      checkout,
      guests,
      rooms,
      currency
    }
  })
}

/**
 * Búsqueda de paquetes (vuelo + hotel)
 */
async function searchPackages(params: URLSearchParams, userId: number | null) {
  const origin = params.get('origin')
  const destination = params.get('destination') || params.get('city')
  const departureDate = params.get('departureDate')
  const returnDate = params.get('returnDate')
  const adults = parseInt(params.get('adults') || '2', 10)
  const children = parseInt(params.get('children') || '0', 10)
  const currency = params.get('currency') || 'MXN'
  const providers = params.get('providers')?.split(',') || ['expedia']

  if (!origin || !destination || !departureDate || !returnDate) {
    return NextResponse.json({
      success: false,
      error: 'origin, destination, departureDate, and returnDate are required for packages'
    }, { status: 400 })
  }

  const packages = []
  const errors: string[] = []

  // Buscar paquetes reales en Expedia (si está habilitado)
  if (providers.includes('expedia') && process.env.EXPEDIA_API_KEY && process.env.EXPEDIA_API_SECRET) {
    try {
      const expedia = new ExpediaAdapter(
        process.env.EXPEDIA_API_KEY,
        process.env.EXPEDIA_API_SECRET,
        process.env.EXPEDIA_SANDBOX === 'true'
      )

      const expediaPackages = await expedia.searchPackages({
        originLocationCode: origin,
        city: destination,
        departureDate,
        returnDate,
        adults,
        children,
        currency
      })

      packages.push(...expediaPackages)
    } catch (error) {
      console.error('Expedia packages error:', error)
      errors.push('Expedia: ' + (error as Error).message)
    }
  }

  // Fallback: Combinar vuelos y hoteles manualmente si no hay paquetes de Expedia
  if (packages.length === 0) {
    // Buscar vuelos y hoteles en paralelo
    const [flightsResponse, hotelsResponse] = await Promise.all([
      searchFlights(params, userId),
      searchHotels(params, userId)
    ])

    const flights = await flightsResponse.json()
    const hotels = await hotelsResponse.json()

    if (flights.success && hotels.success) {
      // Combinar mejores opciones
      const topFlights = flights.data.slice(0, 3)
      const topHotels = hotels.data.slice(0, 5)

      for (const flight of topFlights) {
        for (const hotel of topHotels) {
          packages.push({
            id: `pkg_${flight.id}_${hotel.id}`,
            provider: 'combined',
            type: 'package',
            price: flight.price + hotel.price,
            currency: flight.currency,
            details: {
              flight,
              hotel,
              savings: calculateSavings(flight.price, hotel.price)
            },
            rawData: { flight, hotel }
          })
        }
      }
    }
  }

  if (packages.length === 0) {
    return NextResponse.json({
      success: false,
      error: 'No packages found',
      providerErrors: errors
    }, { status: 404 })
  }

  // Ordenar por precio total
  packages.sort((a, b) => a.price - b.price)

  return NextResponse.json({
    success: true,
    data: packages.slice(0, 10), // Top 10 paquetes
    total: packages.length,
    providers: {
      searched: providers,
      successful: providers.filter(p => !errors.some(e => e.toLowerCase().includes(p))),
      failed: errors
    }
  })
}

/**
 * Helper: Convertir resultados a moneda deseada
 */
async function convertResultsCurrency(results: any[], targetCurrency: string) {
  if (!results.length) return results

  return Promise.all(results.map(async (result) => {
    if (result.currency === targetCurrency) return result

    const converted = await CurrencyService.convert(
      result.price,
      result.currency,
      targetCurrency
    )

    return {
      ...result,
      originalPrice: result.price,
      originalCurrency: result.currency,
      price: converted.amount,
      currency: targetCurrency,
      exchangeRate: converted.rate
    }
  }))
}

/**
 * Helper: Deduplicar vuelos (mismo horario, misma aerolínea)
 */
function deduplicateFlights(flights: any[]) {
  const seen = new Map()

  return flights.filter(flight => {
    const key = `${flight.details?.outbound?.origin}_${flight.details?.outbound?.destination}_${flight.details?.outbound?.departureTime}_${flight.details?.airline}`

    if (seen.has(key)) {
      // Si ya vimos este vuelo, quedarnos con el más barato
      const existing = seen.get(key)
      if (flight.price < existing.price) {
        seen.set(key, flight)
        return true
      }
      return false
    }

    seen.set(key, flight)
    return true
  })
}

/**
 * Helper: Calcular ahorro de paquete
 */
function calculateSavings(flightPrice: number, hotelPrice: number): number {
  const total = flightPrice + hotelPrice
  // Descuento simulado del 5% por paquete
  return total * 0.05
}

/**
 * Helper: Obtener user ID si está autenticado
 */
function getUserIdIfAuthenticated(request: NextRequest): number | null {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    const token = authHeader.replace('Bearer ', '')
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    return decoded.userId || null
  } catch {
    return null
  }
}
