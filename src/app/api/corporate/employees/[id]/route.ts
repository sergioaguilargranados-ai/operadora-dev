import { NextRequest, NextResponse } from 'next/server'
import { CorporateService } from '@/services/CorporateService'
import { query } from '@/lib/db'

/**
 * PUT /api/corporate/employees/[id]
 * Actualizar empleado
 *
 * Body:
 * {
 *   tenantId: number
 *   name?: string
 *   role?: string
 *   department?: string
 *   costCenter?: string
 *   managerId?: number
 *   isActive?: boolean
 * }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'ID de empleado inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { tenantId, ...updates } = body

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      )
    }

    const employee = await CorporateService.updateEmployee(
      userId,
      parseInt(tenantId),
      updates
    )

    return NextResponse.json({
      success: true,
      data: employee,
      message: 'Empleado actualizado exitosamente'
    })

  } catch (error: any) {
    console.error('Error updating employee:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al actualizar empleado',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/corporate/employees/[id]
 * Eliminar empleado (soft delete)
 *
 * Body:
 * {
 *   tenantId: number
 * }
 *
 * Validaciones:
 * - No eliminar si tiene reservas activas
 * - Soft delete (is_active = false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'ID de empleado inválido' },
        { status: 400 }
      )
    }

    const body = await request.json().catch(() => ({}))
    const { tenantId } = body

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      )
    }

    // 1. Verificar que el empleado existe y pertenece al tenant
    const employeeCheck = await query(
      `SELECT u.id, u.email, u.name
       FROM users u
       INNER JOIN tenant_users tu ON u.id = tu.user_id
       WHERE u.id = $1
         AND tu.tenant_id = $2
         AND u.is_active = true`,
      [userId, tenantId]
    )

    if (!employeeCheck.rows || employeeCheck.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Empleado no encontrado o ya eliminado'
        },
        { status: 404 }
      )
    }

    // 2. Verificar si tiene reservas activas
    const hasActiveBookings = await query(
      `SELECT COUNT(*) as count
       FROM bookings
       WHERE user_id = $1
         AND status NOT IN ('cancelled', 'completed')
         AND is_active = true`,
      [userId]
    )

    const activeBookingsCount = parseInt(hasActiveBookings.rows?.[0]?.count || '0', 10)

    if (activeBookingsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `No se puede eliminar el empleado. Tiene ${activeBookingsCount} reserva(s) activa(s).`,
          details: {
            activeBookings: activeBookingsCount,
            suggestion: 'Cancele o complete las reservas antes de eliminar el empleado, o use la opción de desactivar en su lugar.'
          }
        },
        { status: 400 }
      )
    }

    // 3. Soft delete del usuario
    await query(
      `UPDATE users
       SET is_active = false,
           updated_at = NOW()
       WHERE id = $1`,
      [userId]
    )

    // 4. Soft delete de la relación tenant_users
    await query(
      `UPDATE tenant_users
       SET updated_at = NOW()
       WHERE user_id = $1
         AND tenant_id = $2`,
      [userId, tenantId]
    )

    const employee = employeeCheck.rows[0]

    console.log(`✅ Employee deleted: ${employee.email} (ID: ${userId}) from tenant ${tenantId}`)

    return NextResponse.json({
      success: true,
      message: 'Empleado eliminado exitosamente',
      data: {
        id: userId,
        email: employee.email,
        name: employee.name,
        deletedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Error deleting employee:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al eliminar empleado',
        details: error.message
      },
      { status: 500 }
    )
  }
}
