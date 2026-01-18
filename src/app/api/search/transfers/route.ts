import { NextRequest, NextResponse } from 'next/server'
import SearchService from '@/services/SearchService'
import { successResponse, errorResponse } from '@/types/api-response'

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
 * - view: compact (opcional)
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
    const view = (searchParams.get('view') || '').toLowerCase()

    if (!startLocationCode || !endLocationCode || !transferDate || !transferTime || !passengersParam) {
      return NextResponse.json(
        errorResponse('TRANSFER_PARAMS', 'Missing required parameters: startLocationCode, endLocationCode, transferDate, transferTime, passengers'),
        { status: 400, headers: { 'X-API-Version': '1.0' } }
      )
    }

    const passengers = parseInt(passengersParam)

    if (isNaN(passengers) || passengers < 1 || passengers > 8) {
      return NextResponse.json(
        errorResponse('PASSENGERS_INVALID', 'Passengers must be a number between 1 and 8'),
        { status: 400, headers: { 'X-API-Version': '1.0' } }
      )
    }

    // Parámetros opcionales
    const transferType = searchParams.get('transferType') || undefined

    const params = {
      startLocationCode,
      endLocationCode,
      transferDate,
      transferTime,
      passengers,
      transferType
    }

    const results = await SearchService.searchTransfers(params)

    const compact = (t: any) => ({
      id: t.id,
      vehicle: t.vehicle || t.name,
      capacity: t.capacity || t.maxPassengers,
      price: t.price || 0,
      currency: t.currency || 'MXN',
      provider: t.provider || 'local',
      image_url: t.image_url || null,
    })

    const payload = view === 'compact' ? results.map(compact) : results

    return NextResponse.json(
      successResponse(payload, { total: payload.length }),
      { headers: { 'X-API-Version': '1.0' } }
    )

  } catch (error) {
    console.error('❌ Error in transfers API:', error)
    return NextResponse.json(
      errorResponse('TRANSFERS_ERROR', error instanceof Error ? error.message : 'Unknown error'),
      { status: 500, headers: { 'X-API-Version': '1.0' } }
    )
  }
}
