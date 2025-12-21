import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/payments
 * Listar transacciones de pago
 *
 * Query params:
 * - tenantId?: number
 * - userId?: number
 * - status?: 'pending' | 'completed' | 'failed' | 'refunded'
 * - paymentMethod?: 'stripe' | 'paypal'
 * - startDate?: string
 * - endDate?: string
 * - limit?: number
 * - offset?: number
 *
 * Response:
 * {
 *   success: true
 *   data: PaymentTransaction[]
 *   total: number
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const tenantId = searchParams.get('tenantId')
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const paymentMethod = searchParams.get('paymentMethod')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Construir query dinámicamente
    let queryText = `
      SELECT
        pt.id,
        pt.booking_id,
        pt.user_id,
        pt.tenant_id,
        pt.amount,
        pt.currency,
        pt.status,
        pt.payment_method,
        pt.transaction_id,
        pt.capture_id,
        pt.payer_email,
        pt.payer_id,
        pt.error_message,
        pt.created_at,
        pt.paid_at,
        pt.refunded_at,
        u.name as user_name,
        u.email as user_email,
        b.booking_type as booking_type,
        b.service_type as service_name
      FROM payment_transactions pt
      LEFT JOIN users u ON pt.user_id = u.id
      LEFT JOIN bookings b ON pt.booking_id = b.id
      WHERE 1=1
    `

    const queryParams: any[] = []
    let paramCount = 0

    if (tenantId) {
      paramCount++
      queryText += ` AND pt.tenant_id = $${paramCount}`
      queryParams.push(parseInt(tenantId))
    }

    if (userId) {
      paramCount++
      queryText += ` AND pt.user_id = $${paramCount}`
      queryParams.push(parseInt(userId))
    }

    if (status) {
      paramCount++
      queryText += ` AND pt.status = $${paramCount}`
      queryParams.push(status)
    }

    if (paymentMethod) {
      paramCount++
      queryText += ` AND pt.payment_method = $${paramCount}`
      queryParams.push(paymentMethod)
    }

    if (startDate) {
      paramCount++
      queryText += ` AND pt.created_at >= $${paramCount}`
      queryParams.push(startDate)
    }

    if (endDate) {
      paramCount++
      queryText += ` AND pt.created_at <= $${paramCount}`
      queryParams.push(endDate)
    }

    // Query para contar total
    const countQueryText = queryText.replace(
      /SELECT .* FROM/,
      'SELECT COUNT(*) FROM'
    )
    const countResult = await query(countQueryText, queryParams)
    const total = parseInt(countResult.rows?.[0]?.count || '0')

    // Query principal con paginación
    queryText += ` ORDER BY pt.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`
    queryParams.push(limit, offset)

    const result = await query(queryText, queryParams)

    return NextResponse.json({
      success: true,
      data: result.rows || [],
      total,
      limit,
      offset
    })

  } catch (error: any) {
    console.error('Error fetching payments:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al obtener transacciones',
        details: error.message
      },
      { status: 500 }
    )
  }
}
