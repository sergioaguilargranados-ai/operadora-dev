import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

export const dynamic = 'force-dynamic'

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

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const res = await dbQuery(`
      SELECT 
        b.id as booking_id, 
        b.destination,
        b.special_requests,
        b.total_price, 
        b.currency,
        (SELECT COALESCE(SUM(amount), 0) FROM payment_transactions WHERE booking_id = b.id AND status = 'completed') as paid_amount
      FROM bookings b
      WHERE (b.user_id = $1 OR EXISTS (
          SELECT 1 FROM payment_transactions p2 WHERE p2.booking_id = b.id AND p2.user_id = $1
      ))
      AND b.booking_status != 'cancelled'
    `, [userId])

    const pendingPayments = res.rows.map(row => {
      const details = typeof row.special_requests === 'string' ? JSON.parse(row.special_requests) : (row.special_requests || {})
      const destination = row.destination || details.destination || details.tour_name || 'Viaje'
      const pending = Number(row.total_price) - Number(row.paid_amount)
      
      return {
        booking_id: row.booking_id,
        destination,
        total_price: Number(row.total_price),
        paid_amount: Number(row.paid_amount),
        pending_amount: pending > 0 ? pending : 0,
        currency: row.currency || 'USD'
      }
    }).filter(p => p.pending_amount > 0)

    return NextResponse.json({
      success: true,
      data: pendingPayments
    })

  } catch (error: any) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
