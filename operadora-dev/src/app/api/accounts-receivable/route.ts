import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, insertOne, updateOne } from '@/lib/db'

/**
 * GET /api/accounts-receivable
 * Listar cuentas por cobrar con filtros y estadísticas
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action') // stats, overdue
    const status = searchParams.get('status') // pending, paid, overdue, cancelled
    const customerId = searchParams.get('customer_id')

    // Acción: Estadísticas
    if (action === 'stats') {
      const stats = await queryOne(`
        SELECT
          COUNT(*) as total_cuentas,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as pagadas,
          SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as vencidas,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as monto_pendiente,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as monto_cobrado,
          SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as monto_vencido
        FROM accounts_receivable
        WHERE is_active = true
      `)

      return NextResponse.json({
        success: true,
        data: stats
      })
    }

    // Acción: Solo vencidas
    if (action === 'overdue') {
      const result = await query(`
        SELECT
          ar.*,
          u.name as customer_name,
          u.email as customer_email
        FROM accounts_receivable ar
        LEFT JOIN users u ON ar.customer_id = u.id
        WHERE ar.status = 'overdue'
          AND ar.is_active = true
        ORDER BY ar.due_date ASC
      `, [])

      return NextResponse.json({
        success: true,
        data: result.rows || [],
        total: (result.rows || []).length
      })
    }

    // Listar con filtros
    let sql = `
      SELECT
        ar.*,
        u.name as customer_name,
        u.email as customer_email,
        b.booking_reference,
        b.booking_type
      FROM accounts_receivable ar
      LEFT JOIN users u ON ar.customer_id = u.id
      LEFT JOIN bookings b ON ar.booking_id = b.id
      WHERE ar.is_active = true
    `

    const params: any[] = []
    let paramIndex = 1

    if (status) {
      sql += ` AND ar.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (customerId) {
      sql += ` AND ar.customer_id = $${paramIndex}`
      params.push(customerId)
      paramIndex++
    }

    sql += ` ORDER BY ar.due_date ASC`

    const result = await query(sql, params)
    const accounts = result.rows || []

    return NextResponse.json({
      success: true,
      data: accounts,
      total: accounts.length
    })

  } catch (error) {
    console.error('Error fetching accounts receivable:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch accounts receivable',
      message: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * POST /api/accounts-receivable
 * Crear una cuenta por cobrar
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

    const {
      customer_id,
      booking_id,
      amount,
      currency,
      due_date,
      description,
      payment_terms
    } = body

    // Validaciones
    if (!customer_id || !amount || !due_date) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: customer_id, amount, due_date'
      }, { status: 400 })
    }

    // Crear cuenta por cobrar
    const account = await insertOne('accounts_receivable', {
      customer_id,
      booking_id: booking_id || null,
      amount,
      currency: currency || 'MXN',
      balance: amount, // Inicialmente el balance es igual al monto
      due_date: new Date(due_date),
      status: 'pending',
      description: description || '',
      payment_terms: payment_terms || 'Pago inmediato',
      created_by: userId
    })

    return NextResponse.json({
      success: true,
      data: account,
      message: 'Account receivable created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating account receivable:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create account receivable',
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
