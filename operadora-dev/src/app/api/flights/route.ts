import { NextRequest, NextResponse } from 'next/server'
import { AmadeusAdapter } from '@/services/providers/AmadeusAdapter'

/**
 * GET /api/flights
 * Búsqueda de vuelos con Amadeus API REAL
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Parámetros de búsqueda
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')
    const departureDate = searchParams.get('departureDate')
    const returnDate = searchParams.get('returnDate')
    const adults = parseInt(searchParams.get('adults') || '1', 10)
    const children = parseInt(searchParams.get('children') || '0', 10)
    const cabinClass = searchParams.get('cabinClass') || 'ECONOMY'
    const currency = searchParams.get('currency') || 'MXN'

    // Validación básica
    if (!origin || !destination) {
      return NextResponse.json({
        success: false,
        error: 'Origin and destination are required'
      }, { status: 400 })
    }

    // Verificar que las credenciales de Amadeus estén configuradas
    if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
      console.error('❌ Amadeus credentials not configured')
      return NextResponse.json({
        success: false,
        error: 'Amadeus API credentials not configured',
        message: 'Please add AMADEUS_API_KEY and AMADEUS_API_SECRET to environment variables'
      }, { status: 503 })
    }

    console.log('🔍 Searching flights with Amadeus API...')
    console.log(`   Route: ${origin} → ${destination}`)
    console.log(`   Date: ${departureDate}${returnDate ? ` → ${returnDate}` : ' (one-way)'}`)
    console.log(`   Passengers: ${adults} adults${children > 0 ? `, ${children} children` : ''}`)

    // Crear instancia de AmadeusAdapter
    const useSandbox = process.env.AMADEUS_SANDBOX === 'true'
    const amadeusAdapter = new AmadeusAdapter(
      process.env.AMADEUS_API_KEY,
      process.env.AMADEUS_API_SECRET,
      useSandbox
    )

    // Preparar parámetros para Amadeus
    const amadeusParams = {
      originLocationCode: origin.toUpperCase(),
      destinationLocationCode: destination.toUpperCase(),
      departureDate: departureDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      returnDate: returnDate || undefined,
      adults,
      children: children || 0,
      infants: 0,
      travelClass: cabinClass.toUpperCase(),
      currencyCode: currency,
      maxResults: 15,
      nonStop: false
    }

    // Buscar vuelos en Amadeus
    const results = await amadeusAdapter.search(amadeusParams)

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
        message: 'No se encontraron vuelos para esta ruta'
      }, { status: 200 })
    }

    return NextResponse.json({
      success: true,
      data: results,
      total: results.length,
      search_params: {
        origin,
        destination,
        departureDate: amadeusParams.departureDate,
        returnDate,
        adults,
        children,
        cabinClass,
        currency
      },
      providers: {
        searched: ['amadeus'],
        successful: ['amadeus'],
        failed: []
      }
    })

  } catch (error) {
    console.error('❌ Error searching flights:', error)
    return NextResponse.json({
      success: false,
      error: 'Flight search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      providers: {
        searched: ['amadeus'],
        successful: [],
        failed: [{
          provider: 'amadeus',
          error: error instanceof Error ? error.message : 'Unknown error'
        }]
      }
    }, { status: 500 })
  }
}
