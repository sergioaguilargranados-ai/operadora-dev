import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * PUT /api/quotes/status
 * Actualiza el estado de una cotización (ya sea general o de tour)
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, type, status } = body

    if (!id || !type || !status) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros (id, type, status)' },
        { status: 400 }
      )
    }

    const validStatuses = [
      'draft', 'pending', 'sent', 'viewed', 'accepted',
      'en_proceso', 'contacted', 'quoted', 'confirmed',
      'rejected', 'cancelled', 'expired'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Estado no válido' },
        { status: 400 }
      )
    }

    let result;
    if (type === 'tour') {
      result = await query(
        `UPDATE tour_quotes SET status = $1 WHERE id = $2 RETURNING id`,
        [status, id]
      )
    } else {
      result = await query(
        `UPDATE quotes SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id`,
        [status, id]
      )
    }

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Cotización no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Estado actualizado correctamente'
    })

  } catch (error: any) {
    console.error('Error updating quote status:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Error al actualizar estado' },
      { status: 500 }
    )
  }
}
