import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const resolvedParams = await params
    const idOrTourId = resolvedParams?.id
    if (!idOrTourId || idOrTourId === 'undefined') {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 })
    }

    let itinerary = null;

    // 1. Try finding by booking_id FIRST (since mobile links by booking_id), then by id in itineraries
    if (!itinerary && !isNaN(Number(idOrTourId))) {
      let result = await dbQuery('SELECT * FROM itineraries WHERE booking_id = $1 LIMIT 1', [Number(idOrTourId)])
      if (result.rows.length === 0) {
        result = await dbQuery('SELECT * FROM itineraries WHERE id = $1 LIMIT 1', [Number(idOrTourId)])
      }
      if (result.rows.length > 0) itinerary = result.rows[0]
    }

    // 2. If not found by ID, try by tour_id
    if (!itinerary) {
      const result = await dbQuery('SELECT * FROM itineraries WHERE tour_id = $1 LIMIT 1', [idOrTourId])
      if (result.rows.length > 0) itinerary = result.rows[0]
    }

    // 3. Fallback: try by title or destination (for manually created trips without tour_id)
    if (!itinerary && isNaN(Number(idOrTourId))) {
      const searchPattern = `%${idOrTourId}%`
      const result = await dbQuery('SELECT * FROM itineraries WHERE title ILIKE $1 OR destination ILIKE $1 ORDER BY id DESC LIMIT 1', [searchPattern])
      if (result.rows.length > 0) itinerary = result.rows[0]
    }

    // 4. Si aún no existe y es un booking ID numérico, disparar auto-generación inmediata con IA
    if (!itinerary && !isNaN(Number(idOrTourId))) {
      try {
        const { TripWorkflowService } = await import('@/services/TripWorkflowService')
        await TripWorkflowService.executePostBookingWorkflow(Number(idOrTourId))
        const resAfter = await dbQuery('SELECT * FROM itineraries WHERE booking_id = $1 LIMIT 1', [Number(idOrTourId)])
        if (resAfter.rows.length > 0) itinerary = resAfter.rows[0]
      } catch (genErr) {
        console.error('Error auto-generating itinerary in /api/itineraries/[id]:', genErr)
      }
    }

    if (!itinerary) {
      return NextResponse.json({ success: false, error: 'Itinerario no encontrado' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: itinerary
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
