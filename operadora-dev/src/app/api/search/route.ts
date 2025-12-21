import { NextRequest, NextResponse } from 'next/server'
import { AmadeusAdapter } from '@/services/providers/AmadeusAdapter'
import { PolicyValidationService } from '@/services/PolicyValidationService'
import SearchService from '@/services/SearchService'

/**
 * GET /api/search
 * API de búsqueda unificada - Con validación de políticas corporativas
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const searchType = searchParams.get('type') || 'hotel'
    const tenantId = searchParams.get('tenantId') || '1' // TODO: Obtener del usuario autenticado

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
        currency,
        tenantId: parseInt(tenantId)
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
        currency,
        tenantId: parseInt(tenantId)
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
 * Búsqueda de hoteles con validación de políticas
 */
async function searchHotels(params: {
  city: string | null
  checkin: string | null
  checkout: string | null
  guests: number
  rooms: number
  currency: string
  tenantId: number
}) {
  try {
    if (!params.city || !params.checkin || !params.checkout) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters: city, checkin, checkout'
      }, { status: 400 })
    }

    console.log('🏨 Searching hotels with SearchService:', params)

    // Usar SearchService con Amadeus
    const results = await SearchService.searchHotels({
      city: params.city,
      checkInDate: params.checkin,
      checkOutDate: params.checkout,
      adults: params.guests,
      rooms: params.rooms,
      currency: params.currency
    })

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
        message: 'No se encontraron hoteles en este destino',
        search_params: params
      }, { status: 200 })
    }

    // Transformar al formato esperado por el frontend
    const transformedResults = results.map((hotel: any) => ({
      id: hotel.id,
      provider: hotel.provider,
      type: 'hotel',
      price: hotel.price,
      price_per_night: hotel.price,
      check_in_date: params.checkin,
      currency: hotel.currency,
      details: {
        name: hotel.details.hotelName,
        city: hotel.details.cityCode,
        address: hotel.details.location,
        starRating: 4,
        rating: 4.5,
        reviewCount: 100,
        description: hotel.details.room?.description || '',
        amenities: [],
        images: [],
        ...hotel.details
      },
      rawData: hotel.rawData
    }))

    // Validar contra políticas corporativas
    let finalResults = transformedResults
    if (params.tenantId && transformedResults.length > 0) {
      try {
        finalResults = await PolicyValidationService.validateSearchResults(
          params.tenantId,
          transformedResults,
          'hotel'
        )
        console.log(`✅ Validated ${finalResults.length} hotels against corporate policy`)
      } catch (error) {
        console.error('⚠️ Policy validation failed:', error)
      }
    }

    return NextResponse.json({
      success: true,
      data: finalResults,
      total: finalResults.length,
      providers: {
        searched: ['amadeus'],
        successful: ['amadeus'],
        failed: []
      },
      search_params: params
    })

  } catch (error) {
    console.error('❌ Hotel search error:', error)
    return NextResponse.json({
      success: false,
      error: 'Hotel search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      providerErrors: [error instanceof Error ? error.message : 'Unknown error']
    }, { status: 500 })
  }
}

/**
 * Búsqueda de vuelos con validación de políticas
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
  tenantId: number
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
    let results = await amadeusAdapter.search(searchParams)

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

    // 🔥 VALIDAR CONTRA POLÍTICAS CORPORATIVAS
    if (params.tenantId && results.length > 0) {
      try {
        // Asegurarnos de que cada resultado tenga los campos necesarios para validación
        results = results.map((flight: any) => ({
          ...flight,
          flightClass: flight.class || flight.details?.class || params.cabinClass || 'economy',
          departure_date: flight.departure_date || searchParams.departureDate
        }))

        results = await PolicyValidationService.validateSearchResults(
          params.tenantId,
          results,
          'flight'
        )
        console.log(`✅ Validated ${results.length} flights against corporate policy`)
      } catch (error) {
        console.error('⚠️ Policy validation failed:', error)
        // No fallar la búsqueda si la validación falla, solo continuar sin validación
      }
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
