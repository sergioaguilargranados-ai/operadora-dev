import { NextRequest, NextResponse } from 'next/server'
import { queryOne, updateOne } from '@/lib/db'
/**
 * GET /api/commissions/[id]
 * Obtener detalles de una comisión
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
    const commission = await queryOne(`
      SELECT
        ac.*,
        t.name as agency_name,
        t.email as agency_email,
        b.booking_reference,
        b.booking_type,
        b.total_amount as booking_amount
      FROM agency_commissions ac
      LEFT JOIN tenants t ON ac.agency_id = t.id
      LEFT JOIN bookings b ON ac.booking_id = b.id
      WHERE ac.id = $1 AND ac.is_active = true
    `, [id])
    if (!commission) {
      return NextResponse.json({
        success: false,
        error: 'Commission not found'
      }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      data: commission
    })
  } catch (error) {
    console.error('Error fetching commission:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch commission',
      message: (error as Error).message
    }, { status: 500 })
  }
}
/**
 * PUT /api/commissions/[id]
 * Marcar comisión como pagada o ajustar monto
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
    const {
      action, // 'mark_paid', 'adjust_amount'
      payment_date,
      payment_method,
      payment_reference,
      adjusted_amount
    } = body
    const commission = await queryOne(`
      SELECT * FROM agency_commissions
      WHERE id = $1 AND is_active = true
    `, [id])
    if (!commission) {
      return NextResponse.json({
        success: false,
        error: 'Commission not found'
      }, { status: 404 })
    }
    let updates: any = {}
    if (action === 'mark_paid') {
      if (commission.status === 'paid') {
        return NextResponse.json({
          success: false,
          error: 'Commission is already paid'
        }, { status: 400 })
      }
      updates = {
        status: 'paid',
        payment_date: payment_date ? new Date(payment_date) : new Date(),
        payment_method: payment_method || 'Transferencia',
        payment_reference: payment_reference || '',
        updated_at: new Date()
      }
    }
    else if (action === 'adjust_amount') {
      if (!adjusted_amount) {
        return NextResponse.json({
          success: false,
          error: 'adjusted_amount is required'
        }, { status: 400 })
      }
      updates = {
        commission_amount: adjusted_amount,
        status: 'adjusted',
        adjustment_reason: body.adjustment_reason || 'Manual adjustment',
        updated_at: new Date()
      }
    }
    else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Must be: mark_paid or adjust_amount'
      }, { status: 400 })
    }
    const updatedCommission = await updateOne('agency_commissions', parseInt(id), updates)
    return NextResponse.json({
      success: true,
      data: updatedCommission,
      message: `Commission ${action === 'mark_paid' ? 'marked as paid' : 'adjusted'} successfully`
    })
  } catch (error) {
    console.error('Error updating commission:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update commission',
      message: (error as Error).message
    }, { status: 500 })
  }
}
/**
 * DELETE /api/commissions/[id]
 * Cancelar una comisión
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
    const commission = await queryOne(`
      SELECT * FROM agency_commissions
      WHERE id = $1 AND is_active = true
    `, [id])
    if (!commission) {
      return NextResponse.json({
        success: false,
        error: 'Commission not found'
      }, { status: 404 })
    }
    if (commission.status === 'paid') {
      return NextResponse.json({
        success: false,
        error: 'Cannot cancel paid commission'
      }, { status: 400 })
    }
    const body = await request.json().catch(() => ({}))
    const reason = body.reason || 'Cancelled by admin'
    const updatedCommission = await updateOne('agency_commissions', parseInt(id), {
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date(),
      updated_at: new Date()
    })
    return NextResponse.json({
      success: true,
      data: updatedCommission,
      message: 'Commission cancelled successfully'
    })
  } catch (error) {
    console.error('Error cancelling commission:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to cancel commission',
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