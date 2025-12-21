import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/corporate/cost-centers
 * Listar todos los centros de costo
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || '1'

    const costCenters = await db.queryMany<any>(
      `SELECT
        cc.*,
        COUNT(DISTINCT b.id) as total_bookings,
        COUNT(DISTINCT tu.user_id) as total_employees,
        COALESCE(SUM(b.total_price), 0) as total_expenses
       FROM cost_centers cc
       LEFT JOIN tenant_users tu ON cc.code = tu.cost_center AND tu.tenant_id = cc.tenant_id
       LEFT JOIN bookings b ON b.cost_center_id = cc.id AND b.status != 'cancelled'
       WHERE cc.tenant_id = $1
       GROUP BY cc.id
       ORDER BY cc.name ASC`,
      [parseInt(tenantId)]
    )

    return NextResponse.json({
      success: true,
      data: costCenters
    })
  } catch (error: any) {
    console.error('Error fetching cost centers:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST /api/corporate/cost-centers
 * Crear nuevo centro de costo
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantId, code, name, description, budget, managerId } = body

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: 'Código y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que código no exista
    const existing = await db.queryOne<any>(
      'SELECT id FROM cost_centers WHERE tenant_id = $1 AND code = $2',
      [parseInt(tenantId), code]
    )

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'El código ya existe' },
        { status: 400 }
      )
    }

    const costCenter = await db.query<any>(
      `INSERT INTO cost_centers
       (tenant_id, code, name, description, budget, manager_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING *`,
      [
        parseInt(tenantId),
        code,
        name,
        description || null,
        budget || null,
        managerId ? parseInt(managerId) : null
      ]
    )

    return NextResponse.json({
      success: true,
      data: costCenter.rows[0],
      message: 'Centro de costo creado exitosamente'
    })
  } catch (error: any) {
    console.error('Error creating cost center:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
