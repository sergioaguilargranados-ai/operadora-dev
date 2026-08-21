import { NextRequest, NextResponse } from 'next/server'
import { CorporateService } from '@/services/CorporateService'

/**
 * GET /api/corporate/approvals
 * Obtener solicitudes de aprobación de viaje
 *
 * Query params:
 * - tenantId: ID del tenant (obligatorio)
 * - status?: 'pending' | 'approved' | 'rejected'
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const status = searchParams.get('status') || undefined

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      )
    }

    const approvals = await CorporateService.getApprovals(parseInt(tenantId), status)

    return NextResponse.json({
      success: true,
      data: approvals
    })
  } catch (error: any) {
    console.error('Error fetching corporate approvals:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener aprobaciones',
        details: error.message
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/corporate/approvals
 * Aprobar o rechazar solicitud de viaje
 *
 * Body:
 * - approvalId: number
 * - tenantId: number
 * - action: 'approved' | 'rejected'
 * - rejectionReason?: string
 * - approverId?: number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { approvalId, tenantId, action, rejectionReason, approverId } = body

    if (!approvalId || !tenantId || !action) {
      return NextResponse.json(
        { success: false, error: 'approvalId, tenantId y action son requeridos' },
        { status: 400 }
      )
    }

    if (action !== 'approved' && action !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'action debe ser "approved" o "rejected"' },
        { status: 400 }
      )
    }

    const result = await CorporateService.actionApproval(
      parseInt(approvalId),
      parseInt(tenantId),
      action,
      rejectionReason,
      approverId ? parseInt(approverId) : undefined
    )

    return NextResponse.json({
      success: true,
      data: result,
      message: action === 'approved' ? 'Solicitud aprobada con éxito' : 'Solicitud rechazada'
    })
  } catch (error: any) {
    console.error('Error updating approval status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al procesar la aprobación',
        details: error.message
      },
      { status: 500 }
    )
  }
}
