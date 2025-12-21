import { NextRequest, NextResponse } from 'next/server'
import { CorporateService } from '@/services/CorporateService'

/**
 * GET /api/corporate/stats
 * Obtener estadísticas del dashboard corporativo
 *
 * Query params:
 * - tenantId: ID del tenant (obligatorio)
 * - dateFrom?: Fecha desde (YYYY-MM-DD)
 * - dateTo?: Fecha hasta (YYYY-MM-DD)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')
    const dateFrom = searchParams.get('dateFrom') || undefined
    const dateTo = searchParams.get('dateTo') || undefined

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'tenantId es requerido' },
        { status: 400 }
      )
    }

    const stats = await CorporateService.getDashboardStats(
      parseInt(tenantId),
      dateFrom,
      dateTo
    )

    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error: any) {
    console.error('Error fetching corporate stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener estadísticas',
        details: error.message
      },
      { status: 500 }
    )
  }
}
