import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, insertOne } from '@/lib/db'

/**
 * GET /api/commissions
 * Listar comisiones con filtros y estadísticas
 */
export async function GET(request: NextRequest) {
  try {
    // getUserIdFromToken ahora es opcional para testing
    const userId = await getUserIdFromToken(request)

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') // stats, by-agency, pending
    const agencyId = searchParams.get('agency_id')
    const status = searchParams.get('status') // pending, paid, cancelled
    const startDate = searchParams.get('start_date')
    const endDate = searchParams.get('end_date')

    // Acción: Estadísticas
    if (action === 'stats') {
      const stats = await queryOne(`
        SELECT
          COUNT(*) as total_comisiones,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as pagadas,
          SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as canceladas,
          SUM(CASE WHEN status = 'pending' THEN commission_amount ELSE 0 END) as monto_pendiente,
          SUM(CASE WHEN status = 'paid' THEN commission_amount ELSE 0 END) as monto_pagado,
          AVG(commission_percentage) as promedio_porcentaje
        FROM agency_commissions
        WHERE is_active = true
      `)

      return NextResponse.json({
        success: true,
        data: stats
      })
    }

    // Acción: Por agencia
    if (action === 'by-agency') {
      const result = await query(`
        SELECT
          t.id as agency_id,
          t.name as agency_name,
          COUNT(ac.id) as total_comisiones,
          SUM(CASE WHEN ac.status = 'pending' THEN ac.commission_amount ELSE 0 END) as monto_pendiente,
          SUM(CASE WHEN ac.status = 'paid' THEN ac.commission_amount ELSE 0 END) as monto_pagado,
          SUM(ac.commission_amount) as monto_total
        FROM tenants t
        LEFT JOIN agency_commissions ac ON t.id = ac.agency_id AND ac.is_active = true
        WHERE t.tenant_type = 'agency'
        GROUP BY t.id, t.name
        ORDER BY monto_total DESC
      `, [])

      return NextResponse.json({
        success: true,
        data: result.rows || []
      })
    }

    // Listar con filtros
    let sql = `
      SELECT
        ac.*,
        t.name as agency_name,
        b.booking_reference,
        b.booking_type,
        b.total_amount as booking_amount
      FROM agency_commissions ac
      LEFT JOIN tenants t ON ac.agency_id = t.id
      LEFT JOIN bookings b ON ac.booking_id = b.id
      WHERE ac.is_active = true
    `

    const params: any[] = []
    let paramIndex = 1

    if (agencyId) {
      sql += ` AND ac.agency_id = $${paramIndex}`
      params.push(agencyId)
      paramIndex++
    }

    if (status) {
      sql += ` AND ac.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (startDate) {
      sql += ` AND ac.created_at >= $${paramIndex}`
      params.push(startDate)
      paramIndex++
    }

    if (endDate) {
      sql += ` AND ac.created_at <= $${paramIndex}`
      params.push(endDate)
      paramIndex++
    }

    sql += ` ORDER BY ac.created_at DESC`

    const result = await query(sql, params)
    const commissions = result.rows || []

    return NextResponse.json({
      success: true,
      data: commissions,
      total: commissions.length
    })

  } catch (error) {
    console.error('Error fetching commissions:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch commissions',
      message: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * POST /api/commissions
 * Calcular y crear comisión automáticamente desde una reserva
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()
    const { booking_id } = body

    if (!booking_id) {
      return NextResponse.json({
        success: false,
        error: 'booking_id is required'
      }, { status: 400 })
    }

    // Obtener datos de la reserva
    const booking = await queryOne(`
      SELECT
        b.*,
        u.tenant_id,
        t.tenant_type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      LEFT JOIN tenants t ON u.tenant_id = t.id
      WHERE b.id = $1
    `, [booking_id])

    if (!booking) {
      return NextResponse.json({
        success: false,
        error: 'Booking not found'
      }, { status: 404 })
    }

    // Verificar si ya existe comisión para esta reserva
    const existingCommission = await queryOne(`
      SELECT * FROM agency_commissions
      WHERE booking_id = $1 AND is_active = true
    `, [booking_id])

    if (existingCommission) {
      return NextResponse.json({
        success: false,
        error: 'Commission already exists for this booking'
      }, { status: 400 })
    }

    // Obtener configuración de comisión de la agencia
    let commissionPercentage = 10 // Default: 10%
    let commissionTier = 'standard'

    if (booking.tenant_id && booking.tenant_type === 'agency') {
      const agencyConfig = await queryOne(`
        SELECT
          default_commission_percentage,
          commission_tier
        FROM tenant_configurations
        WHERE tenant_id = $1
      `, [booking.tenant_id])

      if (agencyConfig) {
        commissionPercentage = agencyConfig.default_commission_percentage || 10
        commissionTier = agencyConfig.commission_tier || 'standard'
      }
    }

    // Calcular monto de comisión
    const bookingAmount = parseFloat(booking.total_amount)
    const commissionAmount = bookingAmount * (commissionPercentage / 100)

    // Crear comisión
    const commission = await insertOne('agency_commissions', {
      agency_id: booking.tenant_id,
      booking_id: booking_id,
      commission_percentage: commissionPercentage,
      commission_amount: commissionAmount,
      base_amount: bookingAmount,
      currency: booking.currency || 'MXN',
      commission_tier: commissionTier,
      status: 'pending',
      calculation_date: new Date(),
      created_by: userId
    })

    return NextResponse.json({
      success: true,
      data: commission,
      message: 'Commission calculated and created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating commission:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create commission',
      message: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * Helper: Obtener user ID del token JWT
 */
async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null

    const token = authHeader.replace('Bearer ', '')
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any

    return decoded.userId || null
  } catch {
    return null
  }
}
