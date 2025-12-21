import { NextRequest, NextResponse } from 'next/server'
import SearchService from '@/services/SearchService'

/**
 * API de búsqueda de transfers (autos privados/compartidos/taxis)
 * GET /api/search/transfers
 *
 * Query params:
 * - startLocationCode: Código IATA o dirección de origen (ej: CDG, MEX)
 * - endLocationCode: Código IATA o dirección de destino
 * - transferDate: Fecha en formato YYYY-MM-DD
 * - transferTime: Hora en formato HH:mm:ss
 * - passengers: Número de pasajeros (1-8)
 * - transferType: (opcional) PRIVATE, SHARED, TAXI
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    // Validar parámetros obligatorios
    const startLocationCode = searchParams.get('startLocationCode')
    const endLocationCode = searchParams.get('endLocationCode')
    const transferDate = searchParams.get('transferDate')
    const transferTime = searchParams.get('transferTime')
    const passengersParam = searchParams.get('passengers')

    if (!startLocationCode || !endLocationCode || !transferDate || !transferTime || !passengersParam) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: startLocationCode, endLocationCode, transferDate, transferTime, passengers'
        },
        { status: 400 }
      )
    }

    const passengers = parseInt(passengersParam)

    if (isNaN(passengers) || passengers < 1 || passengers > 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'Passengers must be a number between 1 and 8'
        },
        { status: 400 }
      )
    }

    // Parámetros opcionales
    const transferType = searchParams.get('transferType') || undefined

    console.log('🚗 Transfer search request:', {
      startLocationCode,
      endLocationCode,
      transferDate,
      transferTime,
      passengers,
      transferType
    })

    const params = {
      startLocationCode,
      endLocationCode,
      transferDate,
      transferTime,
      passengers,
      transferType
    }

    const results = await SearchService.searchTransfers(params)

    return NextResponse.json({
      success: true,
      data: results,
      count: results.length,
      searchParams: params
    })

  } catch (error) {
    console.error('❌ Error in transfers API:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
