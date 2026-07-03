import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idOrTourId = params.id
    if (!idOrTourId) {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 })
    }

    // Try finding by id first, if it fails try by tour_id
    let itinerary
    
    // Check if it's a number (ID)
    if (!isNaN(Number(idOrTourId))) {
      const result = await dbQuery('SELECT * FROM itineraries WHERE id = $1', [Number(idOrTourId)])
      if (result.rows.length > 0) itinerary = result.rows[0]
    }

    // If not found by ID, try by tour_id
    if (!itinerary) {
      const result = await dbQuery('SELECT * FROM itineraries WHERE tour_id = $1 LIMIT 1', [idOrTourId])
      if (result.rows.length > 0) itinerary = result.rows[0]
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
