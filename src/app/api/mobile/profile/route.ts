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
        `SELECT id, name, email, phone, wants_travel_insurance FROM users WHERE id = $1`,
        [user_id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      // Obtener documentos
      const docsResult = await client.query(
        `SELECT id, title as name, document_url as url FROM entity_documents WHERE entity_type = 'user' AND entity_id = $1`,
        [user_id]
      )

      const user = result.rows[0]
      user.documents = docsResult.rows

      return NextResponse.json({ success: true, data: user })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error fetching mobile profile:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, phone, wants_travel_insurance } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      await client.query(
        `UPDATE users 
         SET name = COALESCE($2, name),
             phone = COALESCE($3, phone),
             wants_travel_insurance = COALESCE($4, wants_travel_insurance)
         WHERE id = $1`,
        [id, name, phone, wants_travel_insurance]
      )
      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating mobile profile:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}
