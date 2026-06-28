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
      const result = await client.query(
        `SELECT * FROM store_products WHERE tenant_id = $1 ORDER BY id DESC`,
        [tenant_id]
      )
      return NextResponse.json({ success: true, data: result.rows })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching store products:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tenant_id, name, description, price, offer_price, image_url, category, status, stock } = body

    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO store_products (tenant_id, name, description, price, offer_price, image_url, category, status, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [tenant_id, name, description, price, offer_price, image_url, category, status || 'active', stock || 999]
      )
      return NextResponse.json({ success: true, data: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error creating store product:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, description, price, offer_price, image_url, category, status, stock } = body

    if (!id) return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })

    const client = await pool.connect()
    try {
      const result = await client.query(
        `UPDATE store_products 
         SET name = COALESCE($2, name),
             description = COALESCE($3, description),
             price = COALESCE($4, price),
             offer_price = $5,
             image_url = COALESCE($6, image_url),
             category = COALESCE($7, category),
             status = COALESCE($8, status),
             stock = COALESCE($9, stock),
             updated_at = NOW()
         WHERE id = $1 RETURNING *`,
        [id, name, description, price, offer_price, image_url, category, status, stock]
      )
      return NextResponse.json({ success: true, data: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating store product:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}
