import { NextRequest, NextResponse } from 'next/server'
import { ApprovalService } from '@/services/ApprovalService'

/**
 * POST /api/approvals/[id]/reject
 * Rechazar una solicitud de viaje
 *
 * Body:
 * {
 *   approvedBy: number (ID del manager que rechaza)
 *   reason: string (razón obligatoria)
 * }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const approvalId = parseInt(id)

    if (isNaN(approvalId)) {
      return NextResponse.json(
        { success: false, error: 'ID de aprobación inválido' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { approvedBy, reason } = body

    if (!approvedBy || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: 'approvedBy y reason son requeridos para rechazar'
        },
        { status: 400 }
      )
    }

    const approval = await ApprovalService.reject({
      approvalId,
      approvedBy: parseInt(approvedBy),
      status: 'rejected',
      reason
    })

    return NextResponse.json({
      success: true,
      data: approval,
      message: 'Solicitud rechazada'
    })

  } catch (error: any) {
    console.error('Error rejecting request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al rechazar solicitud',
        details: error.message
      },
      { status: 500 }
    )
  }
}
