import { NextRequest, NextResponse } from 'next/server'
import HotelAutoSaveService from '@/services/HotelAutoSaveService'
import { query } from '@/lib/db'

/**
 * GET /api/hotels/review
 * Obtiene hoteles que necesitan revisión manual
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)

    const hotels = await HotelAutoSaveService.getHotelsNeedingReview(limit)

    return NextResponse.json({
      success: true,
      data: hotels,
      total: hotels.length
    })
  } catch (error) {
    console.error('Error getting hotels needing review:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to get hotels needing review',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

/**
 * PATCH /api/hotels/review
 * Marca un hotel como revisado
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { hotelId, updates } = body

    if (!hotelId) {
      return NextResponse.json({
        success: false,
        error: 'Hotel ID is required'
      }, { status: 400 })
    }

    // Si hay actualizaciones, aplicarlas
    if (updates) {
      const fields = []
      const values = []
      let index = 1

      for (const [key, value] of Object.entries(updates)) {
        fields.push(`${key} = $${index}`)
        values.push(value)
        index++
      }

      if (fields.length > 0) {
        values.push(hotelId)
        await query(
          `UPDATE hotels SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
           WHERE id = $${index}`,
          values
        )
      }
    }

    // Marcar como revisado
    await HotelAutoSaveService.markAsReviewed(hotelId)

    return NextResponse.json({
      success: true,
      message: 'Hotel marked as reviewed'
    })
  } catch (error) {
    console.error('Error marking hotel as reviewed:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update hotel',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
