import { NextRequest, NextResponse } from 'next/server'
import { DestinationContentService } from '@/services/DestinationContentService'

/**
 * GET /api/itineraries/[id]/enrich-plan
 * Devuelve la lista de ciudades que necesitan ser procesadas para este itinerario.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const itineraryId = parseInt(params.id)
    if (isNaN(itineraryId)) {
      return NextResponse.json({ success: false, error: 'ID de itinerario inválido' }, { status: 400 })
    }

    const plan = await DestinationContentService.getEnrichmentPlan(itineraryId)

    return NextResponse.json({ 
      success: true, 
      data: plan
    })
  } catch (error: any) {
    console.error('Error en /api/itineraries/[id]/enrich-plan:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor' }, 
      { status: 500 }
    )
  }
}
