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
        `SELECT id, amount, currency, status, payment_method, transaction_id, created_at
         FROM payment_transactions 
         WHERE user_id = $1
         ORDER BY created_at DESC`,
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
