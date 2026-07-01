import { NextRequest, NextResponse } from 'next/server'
import { DestinationContentService } from '@/services/DestinationContentService'

/**
 * POST /api/itineraries/[id]/enrich
 * Enriquece los días de un itinerario con contenido turístico de cada destino
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID de itinerario inválido' },
        { status: 400 }
      )
    }

    const enrichedItinerary = await DestinationContentService.enrichItineraryDays(id)

    return NextResponse.json({
      success: true,
      data: enrichedItinerary,
      message: 'Itinerario enriquecido con contenido de destinos',
    })
  } catch (error: any) {
    console.error(`❌ Error en POST /api/itineraries/${params.id}/enrich:`, error.message)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
