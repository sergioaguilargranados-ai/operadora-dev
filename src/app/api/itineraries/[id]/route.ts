import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const idOrTourId = params.id
    if (!idOrTourId) {
      return NextResponse.json({ success: false, error: 'ID es requerido' }, { status: 400 })
    }

    let itinerary = null;

    // 1. Try finding by booking_id in custom_itineraries first
    if (!isNaN(Number(idOrTourId))) {
      const customRes = await dbQuery(`
        SELECT c.*, 
          (SELECT json_agg(d ORDER BY d.day_number) 
           FROM custom_itinerary_days d 
           WHERE d.itinerary_id = c.id) as days
        FROM custom_itineraries c
        WHERE c.booking_id = $1 LIMIT 1
      `, [Number(idOrTourId)]);
      
      if (customRes.rows.length > 0) {
        itinerary = customRes.rows[0];
      }
    }

    // 2. Try finding by id in legacy itineraries
    if (!itinerary && !isNaN(Number(idOrTourId))) {
      const result = await dbQuery('SELECT * FROM itineraries WHERE id = $1', [Number(idOrTourId)])
      if (result.rows.length > 0) itinerary = result.rows[0]
    }

    // 3. If not found by ID, try by tour_id
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
