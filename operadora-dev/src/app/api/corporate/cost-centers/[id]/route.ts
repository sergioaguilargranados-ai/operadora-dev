import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * PUT /api/corporate/cost-centers/[id]
 * Actualizar centro de costo
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const costCenterId = parseInt(id)

    if (isNaN(costCenterId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { name, description, budget, managerId, isActive } = body

    const updates: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`)
      values.push(name)
      paramIndex++
    }

    if (description !== undefined) {
      updates.push(`description = $${paramIndex}`)
      values.push(description)
      paramIndex++
    }

    if (budget !== undefined) {
      updates.push(`budget = $${paramIndex}`)
      values.push(budget)
      paramIndex++
    }

    if (managerId !== undefined) {
      updates.push(`manager_id = $${paramIndex}`)
      values.push(managerId ? parseInt(managerId) : null)
      paramIndex++
    }

    if (isActive !== undefined) {
      updates.push(`is_active = $${paramIndex}`)
      values.push(isActive)
      paramIndex++
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No hay datos para actualizar' },
        { status: 400 }
      )
    }

    values.push(costCenterId)

    const result = await db.query<any>(
      `UPDATE cost_centers
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    )

    if (!result.rows[0]) {
      return NextResponse.json(
        { success: false, error: 'Centro de costo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
      message: 'Centro de costo actualizado'
    })
  } catch (error: any) {
    console.error('Error updating cost center:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/corporate/cost-centers/[id]
 * Eliminar (soft delete) centro de costo
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const costCenterId = parseInt(id)

    if (isNaN(costCenterId)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido' },
        { status: 400 }
      )
    }

    // Verificar si tiene reservas asignadas
    const hasBookings = await db.queryOne<any>(
      'SELECT COUNT(*) as count FROM bookings WHERE cost_center_id = $1',
      [costCenterId]
    )

    if (hasBookings && parseInt(hasBookings.count) > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'No se puede eliminar. Tiene reservas asignadas.'
        },
        { status: 400 }
      )
    }

    // Soft delete
    await db.query(
      'UPDATE cost_centers SET is_active = false, updated_at = NOW() WHERE id = $1',
      [costCenterId]
    )

    return NextResponse.json({
      success: true,
      message: 'Centro de costo eliminado'
    })
  } catch (error: any) {
    console.error('Error deleting cost center:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
