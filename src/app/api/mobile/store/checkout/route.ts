import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, items, total_amount, tenant_id = 1 } = body

    if (!user_id || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: 'User ID and items are required' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query('BEGIN')

      // Create Order
      const orderRes = await client.query(
        `INSERT INTO store_orders (tenant_id, user_id, total_amount, status)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [tenant_id, user_id, total_amount, 'paid'] // Simulando que el pago ya se procesó
      )
      
      const order_id = orderRes.rows[0].id

      // Create Order Items
      for (const item of items) {
        await client.query(
          `INSERT INTO store_order_items (order_id, product_id, quantity, price_at_time)
           VALUES ($1, $2, $3, $4)`,
          [order_id, item.product_id, item.quantity, item.price_at_time]
        )
      }

      await client.query('COMMIT')
      return NextResponse.json({ success: true, order_id })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error in store checkout:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}
