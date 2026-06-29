import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ success: false })
    }

    // Busca un itinerario activo para hoy usando el índice idx_itineraries_dates
    const result = await query(
      `SELECT tour_id, start_date, end_date FROM itineraries 
       WHERE user_id = $1 
         AND start_date <= CURRENT_DATE 
         AND end_date >= CURRENT_DATE 
       LIMIT 1`,
      [parseInt(userId, 10)]
    )
    
    if (result.rows.length > 0) {
      const trip = result.rows[0]
      // Calcular qué día es hoy dentro del viaje (0-indexed)
      const startDate = new Date(trip.start_date)
      const today = new Date()
      // Normalizar horas
      startDate.setHours(0, 0, 0, 0)
      today.setHours(0, 0, 0, 0)
      
      const diffTime = Math.abs(today.getTime() - startDate.getTime())
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
      
      return NextResponse.json({ 
        success: true, 
        tour_id: trip.tour_id, 
        dayIndex: diffDays 
      })
    }
    
    return NextResponse.json({ success: false })
  } catch (error) {
    console.error('[ITINERARY TODAY GET] Error:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
