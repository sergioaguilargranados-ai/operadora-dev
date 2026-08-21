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

    // 0. Handle 'active' / 'current' special parameter
    if (idOrTourId === 'active' || idOrTourId === 'current') {
      const resActive = await dbQuery(`
        SELECT * FROM itineraries 
        WHERE (start_date >= CURRENT_DATE OR end_date >= CURRENT_DATE) 
        ORDER BY start_date ASC LIMIT 1
      `)
      if (resActive.rows.length > 0) {
        itinerary = resActive.rows[0]
      } else {
        const resFallback = await dbQuery('SELECT * FROM itineraries ORDER BY id DESC LIMIT 1')
        if (resFallback.rows.length > 0) itinerary = resFallback.rows[0]
      }
    }

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

    // Resolve hero_image dynamically from MegaTravel scraping or destination catalog
    let resolvedHero = null;
    let daysParsed = typeof itinerary.days === 'string' ? JSON.parse(itinerary.days) : (itinerary.days || []);
    if (Array.isArray(daysParsed) && daysParsed.length > 0 && daysParsed[0]?.hero_image) {
      resolvedHero = daysParsed[0].hero_image;
    }

    if (!resolvedHero && itinerary.tour_id) {
      const codeDigits = itinerary.tour_id.replace(/\D/g, '');
      if (codeDigits) {
        const mtRes = await dbQuery('SELECT main_image FROM megatravel_packages WHERE mt_code ILIKE $1 AND main_image IS NOT NULL LIMIT 1', [`%${codeDigits}%`]);
        if (mtRes.rows.length > 0) resolvedHero = mtRes.rows[0].main_image;
      }
    }

    if (!resolvedHero && itinerary.title) {
      const mtNameRes = await dbQuery('SELECT main_image FROM megatravel_packages WHERE name ILIKE $1 AND main_image IS NOT NULL LIMIT 1', [`%${itinerary.title}%`]);
      if (mtNameRes.rows.length > 0) resolvedHero = mtNameRes.rows[0].main_image;
    }

    if (!resolvedHero) {
      const { getTourOrDestinationHeroImage } = await import('@/lib/image-fallbacks');
      resolvedHero = getTourOrDestinationHeroImage(itinerary.title, itinerary.destination, itinerary.tour_id);
    }

    itinerary.hero_image = resolvedHero;

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
