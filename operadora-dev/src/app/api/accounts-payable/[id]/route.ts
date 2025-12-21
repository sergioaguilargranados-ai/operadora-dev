import { NextRequest, NextResponse } from 'next/server'
import { queryOne, updateOne, insertOne } from '@/lib/db'
/**
 * GET /api/accounts-payable/[id]
 * Obtener detalles de una cuenta por pagar
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }
    const { id } = await params
    const account = await queryOne(`
      SELECT
        ap.*,
        p.name as provider_name,
        p.provider_type,
        b.booking_reference
      FROM accounts_payable ap
      LEFT JOIN api_providers p ON ap.provider_id = p.id
      LEFT JOIN bookings b ON ap.booking_id = b.id
      WHERE ap.id = $1 AND ap.is_active = true
    `, [id])
    if (!account) {
      return NextResponse.json({
        success: false,
        error: 'Account payable not found'
      }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      data: account
    })
  } catch (error) {
    console.error('Error fetching account payable:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch account payable',
      message: (error as Error).message
    }, { status: 500 })
  }
}
/**
 * PUT /api/accounts-payable/[id]
 * Registrar un pago de la cuenta por pagar
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    const { payment_amount, payment_method, payment_reference, payment_date } = body
    if (!payment_amount) {
      return NextResponse.json({
        success: false,
        error: 'payment_amount is required'
      }, { status: 400 })
    }
    const account = await queryOne(`
      SELECT * FROM accounts_payable
      WHERE id = $1 AND is_active = true
    `, [id])
    if (!account) {
      return NextResponse.json({
        success: false,
        error: 'Account payable not found'
      }, { status: 404 })
    }
    if (account.status === 'paid') {
      return NextResponse.json({
        success: false,
        error: 'Account is already paid'
      }, { status: 400 })
    }
    // Calcular nuevo balance
    const newBalance = parseFloat(account.balance) - parseFloat(payment_amount)
    if (newBalance < -0.01) {
      return NextResponse.json({
        success: false,
        error: 'Payment amount exceeds balance'
      }, { status: 400 })
    }
    // Determinar nuevo status
    let newStatus = account.status
    let paidAt = account.paid_at
    if (newBalance <= 0.01) {
      newStatus = 'paid'
      paidAt = new Date()
    } else {
      newStatus = 'partial'
    }
    // Actualizar cuenta por pagar
    const updatedAccount = await updateOne('accounts_payable', parseInt(id), {
      balance: newBalance,
      status: newStatus,
      paid_at: paidAt,
      updated_at: new Date()
    })
    // Registrar el pago en historial
    await insertOne('payment_transactions', {
      account_payable_id: parseInt(id),
      amount: payment_amount,
      payment_method: payment_method || 'Transferencia',
      payment_reference: payment_reference || '',
      payment_date: payment_date ? new Date(payment_date) : new Date(),
      created_by: userId
    })
    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: 'Payment registered successfully'
    })
  } catch (error) {
    console.error('Error registering payment:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to register payment',
      message: (error as Error).message
    }, { status: 500 })
  }
}
/**
 * DELETE /api/accounts-payable/[id]
 * Cancelar una cuenta por pagar
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromToken(request)
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }
    const { id } = await params
    const account = await queryOne(`
      SELECT * FROM accounts_payable
      WHERE id = $1 AND is_active = true
    `, [id])
    if (!account) {
      return NextResponse.json({
        success: false,
        error: 'Account payable not found'
      }, { status: 404 })
    }
    if (account.status === 'paid' || account.status === 'partial') {
      return NextResponse.json({
        success: false,
        error: 'Cannot cancel account with payments'
      }, { status: 400 })
    }
    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'Cancelled by user'
    const updatedAccount = await updateOne('accounts_payable', parseInt(id), {
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date(),
      updated_at: new Date()
    })
    return NextResponse.json({
      success: true,
      data: updatedAccount,
      message: 'Account payable cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling account payable:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel account payable',
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