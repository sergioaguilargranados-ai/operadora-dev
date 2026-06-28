import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, amount, currency, payment_method } = body

    if (!user_id || !amount) {
      return NextResponse.json({ success: false, error: 'User ID and amount are required' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const transactionId = `TX-${Date.now()}`
      
      const result = await client.query(
        `INSERT INTO payment_transactions (user_id, amount, currency, status, payment_method, transaction_id)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [user_id, amount, currency || 'MXN', 'completed', payment_method || 'card', transactionId]
      )

      return NextResponse.json({ success: true, data: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}
