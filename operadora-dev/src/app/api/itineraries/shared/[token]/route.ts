import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Buscar itinerario por token
    const result = await pool.query(
      'SELECT * FROM itineraries WHERE shared_token = $1 AND is_shared = true',
      [token]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Itinerario no encontrado o no disponible'
      }, { status: 404 })
    }

    const itinerary = result.rows[0]

    // No exponer información sensible
    delete itinerary.user_id
    delete itinerary.created_by
    delete itinerary.booking_id

    return NextResponse.json({
      success: true,
      data: itinerary
    })

  } catch (error: any) {
    console.error('Error fetching shared itinerary:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
