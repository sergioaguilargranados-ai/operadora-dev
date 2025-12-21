import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, insertOne } from '@/lib/db'

/**
 * GET /api/accounts-payable
 * Listar cuentas por pagar con filtros y estadísticas
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
    const providerId = searchParams.get('provider_id')

    // Acción: Estadísticas
    if (action === 'stats') {
      const stats = await queryOne(`
        SELECT
          COUNT(*) as total_cuentas,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pendientes,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as pagadas,
          SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as vencidas,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as monto_pendiente,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as monto_pagado,
          SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as monto_vencido
        FROM accounts_payable
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
          ap.*,
          p.name as provider_name
        FROM accounts_payable ap
        LEFT JOIN api_providers p ON ap.provider_id = p.id
        WHERE ap.status = 'overdue'
          AND ap.is_active = true
        ORDER BY ap.due_date ASC
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
        ap.*,
        p.name as provider_name,
        p.provider_type,
        b.booking_reference
      FROM accounts_payable ap
      LEFT JOIN api_providers p ON ap.provider_id = p.id
      LEFT JOIN bookings b ON ap.booking_id = b.id
      WHERE ap.is_active = true
    `

    const params: any[] = []
    let paramIndex = 1

    if (status) {
      sql += ` AND ap.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (providerId) {
      sql += ` AND ap.provider_id = $${paramIndex}`
      params.push(providerId)
      paramIndex++
    }

    sql += ` ORDER BY ap.due_date ASC`

    const result = await query(sql, params)
    const accounts = result.rows || []

    return NextResponse.json({
      success: true,
      data: accounts,
      total: accounts.length
    })

  } catch (error) {
    console.error('Error fetching accounts payable:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch accounts payable',
      message: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * POST /api/accounts-payable
 * Crear una cuenta por pagar
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
      provider_id,
      booking_id,
      amount,
      currency,
      due_date,
      description,
      invoice_number,
      payment_terms
    } = body

    // Validaciones
    if (!provider_id || !amount || !due_date) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: provider_id, amount, due_date'
      }, { status: 400 })
    }

    // Crear cuenta por pagar
    const account = await insertOne('accounts_payable', {
      provider_id,
      booking_id: booking_id || null,
      amount,
      currency: currency || 'MXN',
      balance: amount,
      due_date: new Date(due_date),
      status: 'pending',
      description: description || '',
      invoice_number: invoice_number || '',
      payment_terms: payment_terms || 'Net 30',
      created_by: userId
    })

    return NextResponse.json({
      success: true,
      data: account,
      message: 'Account payable created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating account payable:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create account payable',
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
