import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    if (!user_id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        `SELECT p.id, p.amount, p.currency, p.status, p.payment_method, p.transaction_id, p.created_at
         FROM payment_transactions p
         LEFT JOIN bookings b ON p.booking_id = b.id
         WHERE p.user_id = $1 OR b.user_id = $1
         ORDER BY p.created_at DESC`,
        [user_id]
      )

      return NextResponse.json({ success: true, data: result.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching mobile payments:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}
