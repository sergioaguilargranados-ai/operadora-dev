import { NextRequest, NextResponse } from 'next/server'
import { ApprovalService } from '@/services/ApprovalService'

/**
 * POST /api/approvals/[id]/approve
 * Aprobar una solicitud de viaje
 *
 * Body:
 * {
 *   approvedBy: number (ID del manager que aprueba)
 *   reason?: string (comentarios opcionales)
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

    if (!approvedBy) {
      return NextResponse.json(
        { success: false, error: 'approvedBy es requerido' },
        { status: 400 }
      )
    }

    const approval = await ApprovalService.approve({
      approvalId,
      approvedBy: parseInt(approvedBy),
      status: 'approved',
      reason
    })

    return NextResponse.json({
      success: true,
      data: approval,
      message: 'Solicitud aprobada exitosamente'
    })

  } catch (error: any) {
    console.error('Error approving request:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al aprobar solicitud',
        details: error.message
      },
      { status: 500 }
    )
  }
}
