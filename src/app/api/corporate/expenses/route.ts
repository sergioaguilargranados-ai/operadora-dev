import { NextRequest, NextResponse } from 'next/server'
import { CorporateService } from '@/services/CorporateService'

/**
 * GET /api/corporate/expenses
 * Obtener métricas y desglose de gastos corporativos
 *
 * Query params:
 * - tenantId: ID del tenant (obligatorio)
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

    const expenses = await CorporateService.getExpenses(parseInt(tenantId))

    return NextResponse.json({
      success: true,
      data: expenses
    })
  } catch (error: any) {
    console.error('Error fetching corporate expenses:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener gastos corporativos',
        details: error.message
      },
      { status: 500 }
    )
  }
}
