import { NextRequest, NextResponse } from 'next/server'
import { ApprovalService } from '@/services/ApprovalService'

/**
 * GET /api/approvals/pending
 * Obtener aprobaciones pendientes
 *
 * Query params:
 * - tenantId: ID del tenant (obligatorio)
 * - managerId: ID del manager (opcional, filtra por su equipo)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const managerId = searchParams.get('managerId')

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      )
    }

    const approvals = await ApprovalService.getPendingApprovals(
      parseInt(tenantId),
      managerId ? parseInt(managerId) : undefined
    )

    return NextResponse.json({
      success: true,
      data: approvals,
      count: approvals.length
    })

  } catch (error: any) {
    console.error('Error fetching pending approvals:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener aprobaciones pendientes',
        details: error.message
      },
      { status: 500 }
    )
  }
}
