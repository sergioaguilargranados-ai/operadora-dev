import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenant_id = searchParams.get('tenant_id') || 1

    const client = await pool.connect()
    try {
      const query = `
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM store_orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.tenant_id = $1
        ORDER BY o.created_at DESC
      `
      const result = await client.query(query, [tenant_id])
      
      // Obtener items por orden (para simplificar, obtenemos todos los items de la agencia)
      const itemsQuery = `
        SELECT i.*, p.name as product_name
        FROM store_order_items i
        JOIN store_orders o ON i.order_id = o.id
        JOIN store_products p ON i.product_id = p.id
        WHERE o.tenant_id = $1
      `
      const itemsResult = await client.query(itemsQuery, [tenant_id])
      const allItems = itemsResult.rows

      const orders = result.rows.map(order => ({
        ...order,
        items: allItems.filter(item => item.order_id === order.id)
      }))

      return NextResponse.json({ success: true, data: orders })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching store orders:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) return NextResponse.json({ success: false, error: 'ID and Status are required' }, { status: 400 })

    const client = await pool.connect()
    try {
      const result = await client.query(
        `UPDATE store_orders 
         SET status = $2, updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [id, status]
      )
      return NextResponse.json({ success: true, data: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating store order:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}
