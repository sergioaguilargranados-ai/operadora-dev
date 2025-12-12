import { NextRequest, NextResponse } from 'next/server'
import { AmadeusAdapter } from '@/services/providers/AmadeusAdapter'

/**
 * GET /api/search
 * API de búsqueda unificada - Versión simplificada
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchType = searchParams.get('type') || 'hotel'

    if (searchType === 'hotel') {
      const city = searchParams.get('city')
      const checkin = searchParams.get('checkin')
      const checkout = searchParams.get('checkout')
      const guests = parseInt(searchParams.get('guests') || '2', 10)
      const rooms = parseInt(searchParams.get('rooms') || '1', 10)
      const currency = searchParams.get('currency') || 'MXN'

      return await searchHotels({
        city,
        checkin,
        checkout,
        guests,
        rooms,
        currency
      })
    }

    if (searchType === 'flight') {
      const origin = searchParams.get('origin')
      const destination = searchParams.get('destination')
      const departureDate = searchParams.get('departureDate')
      const returnDate = searchParams.get('returnDate')
      const adults = parseInt(searchParams.get('adults') || '1', 10)
      const children = parseInt(searchParams.get('children') || '0', 10)
      const cabinClass = searchParams.get('cabinClass') || 'economy'
      const currency = searchParams.get('currency') || 'MXN'

      return await searchFlights({
        origin,
        destination,
        departureDate,
        returnDate,
        adults,
        children,
        cabinClass,
        currency
      })
    }

    return NextResponse.json({
      success: false,
      error: 'Search type not supported. Use type=hotel or type=flight'
    }, { status: 400 })

  } catch (error) {
    console.error('Error in search API:', error)
    return NextResponse.json({
      success: false,
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * Búsqueda de hoteles
 */
async function searchHotels(params: {
  city: string | null
  checkin: string | null
  checkout: string | null
  guests: number
  rooms: number
  currency: string
}) {
  try {
    // Construir URL para llamar a /api/hotels
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.asoperadora.com'
    const queryParams = new URLSearchParams()

    if (params.city) {
      queryParams.append('city', params.city)
    }
    if (params.currency) {
      queryParams.append('currency', params.currency)
    }

    const hotelResponse = await fetch(`${baseUrl}/api/hotels?${queryParams.toString()}`, {
      cache: 'no-store'
    })

    if (!hotelResponse.ok) {
      throw new Error(`Hotels API returned ${hotelResponse.status}`)
    }

    const hotelData = await hotelResponse.json()

    if (!hotelData.success || !hotelData.data || hotelData.data.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        providers: {
          searched: ['database'],
          successful: ['database'],
          failed: []
        },
        message: 'No se encontraron hoteles en este destino',
        search_params: {
          city: params.city,
          checkin: params.checkin,
          checkout: params.checkout,
          guests: params.guests,
          rooms: params.rooms,
          currency: params.currency
        }
      }, { status: 200 })
    }

    // Transformar resultados al formato esperado
    const results = hotelData.data.map((hotel: any) => ({
      id: `hotel_${hotel.id}`,
      provider: 'database',
      type: 'hotel',
      price: hotel.price_per_night,
      currency: hotel.currency || params.currency,
      details: {
        name: hotel.name,
        city: hotel.city,
        country: hotel.country,
        address: hotel.address,
        starRating: hotel.star_rating,
        rating: hotel.rating,
        reviewCount: hotel.review_count,
        description: hotel.description,
        amenities: hotel.amenities || [],
        images: hotel.images || [],
        contact: {
          email: hotel.contact_email,
          phone: hotel.contact_phone
        }
      },
      rawData: hotel
    }))

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      providers: {
        searched: ['database'],
        successful: ['database'],
        failed: []
      },
      search_params: {
        city: params.city,
        checkin: params.checkin,
        checkout: params.checkout,
        guests: params.guests,
        rooms: params.rooms,
        currency: params.currency
      }
    })

  } catch (error) {
    console.error('Hotel search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Hotel search failed',
      providerErrors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 })
  }
}

/**
 * Búsqueda de vuelos - Llama directamente a AmadeusAdapter
 */
async function searchFlights(params: {
  origin: string | null
  destination: string | null
  departureDate: string | null
  returnDate: string | null
  adults: number
  children: number
  cabinClass: string
  currency: string
}) {
  try {
    console.log('🔍 searchFlights() - Starting')

    // Validar parámetros requeridos
    if (!params.origin || !params.destination) {
      return NextResponse.json({
        success: false,
        error: 'Origin and destination are required',
        providerErrors: []
      }, { status: 400 })
    }

    // Verificar credenciales de Amadeus
    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
      console.error('❌ Amadeus credentials not configured')
      return NextResponse.json({
        success: false,
        error: 'Amadeus API credentials not configured',
        providerErrors: ['Missing AMADEUS_API_KEY or AMADEUS_API_SECRET']
      }, { status: 503 })
    }

    console.log(`📡 Searching flights: ${params.origin} → ${params.destination}`)
    console.log(`   Date: ${params.departureDate}${params.returnDate ? ` → ${params.returnDate}` : ' (one-way)'}`)
    console.log(`   Passengers: ${params.adults} adults${params.children > 0 ? `, ${params.children} children` : ''}`)

    // Crear instancia de AmadeusAdapter
    const useSandbox = process.env.AMADEUS_SANDBOX === 'true'
    const amadeusAdapter = new AmadeusAdapter(
      process.env.AMADEUS_API_KEY,
      process.env.AMADEUS_API_SECRET,
      useSandbox
    )

    // Preparar parámetros para Amadeus
    const searchParams = {
      originLocationCode: params.origin.toUpperCase(),
      destinationLocationCode: params.destination.toUpperCase(),
      departureDate: params.departureDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returnDate: params.returnDate || undefined,
      adults: params.adults,
      children: params.children || 0,
      infants: 0,
      travelClass: params.cabinClass.toUpperCase(),
      currencyCode: params.currency,
      maxResults: 10,
      nonStop: false
    }

    // Buscar vuelos directamente con AmadeusAdapter
    const results = await amadeusAdapter.search(searchParams)

    console.log(`✅ Found ${results.length} flights from Amadeus`)

    if (results.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        total: 0,
        providers: {
          searched: ['amadeus'],
          successful: ['amadeus'],
          failed: []
        },
        message: 'No se encontraron vuelos para esta ruta',
        search_params: {
          origin: params.origin,
          destination: params.destination,
          departureDate: searchParams.departureDate,
          returnDate: params.returnDate,
          adults: params.adults,
          children: params.children,
          cabinClass: params.cabinClass,
          currency: params.currency
        }
      }, { status: 200 })
    }

    // Los resultados ya vienen normalizados del adapter
    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      providers: {
        searched: ['amadeus'],
        successful: ['amadeus'],
        failed: []
      },
      search_params: {
        origin: params.origin,
        destination: params.destination,
        departureDate: searchParams.departureDate,
        returnDate: params.returnDate,
        adults: params.adults,
        children: params.children,
        cabinClass: params.cabinClass,
        currency: params.currency
      }
    })

  } catch (error) {
    console.error('❌ Flight search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Flight search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      providerErrors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 })
  }
}
