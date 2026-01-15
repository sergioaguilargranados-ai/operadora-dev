import { NextRequest, NextResponse } from 'next/server'
import { ApprovalService } from '@/services/ApprovalService'

/**
 * GET /api/approvals/history
 * Obtener historial de aprobaciones
 *
 * Query params:
 * - tenantId: ID del tenant (obligatorio)
 * - employeeId?: Filtrar por empleado
 * - managerId?: Filtrar por manager
 * - status?: Filtrar por estado (approved, rejected, pending)
 * - dateFrom?: Fecha desde (YYYY-MM-DD)
 * - dateTo?: Fecha hasta (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      )
    }

    const filters = {
      employeeId: searchParams.get('employeeId')
        ? parseInt(searchParams.get('employeeId')!)
        : undefined,
      managerId: searchParams.get('managerId')
        ? parseInt(searchParams.get('managerId')!)
        : undefined,
      status: searchParams.get('status') || undefined,
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined
    }

    const approvals = await ApprovalService.getHistory(
      parseInt(tenantId),
      filters
    )

    return NextResponse.json({
      success: true,
      data: approvals,
      count: approvals.length,
      filters
    })

  } catch (error: any) {
    console.error('Error fetching approval history:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener historial',
        details: error.message
      },
      { status: 500 }
    )
  }
}
