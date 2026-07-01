export const dynamic = 'force-dynamic'

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
        `SELECT id, name, email, phone, wants_travel_insurance, date_of_birth, emergency_contacts, image FROM users WHERE id = $1`,
        [user_id]
      )

      if (result.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
      }

      // Obtener documentos
      const docsResult = await client.query(
        `SELECT id, document_name as name, document_url as url FROM entity_documents WHERE entity_type = 'user' AND entity_id = $1`,
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
    const { id, name, phone, wants_travel_insurance, date_of_birth, emergency_contacts, image } = body

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      // Build dynamic update query to only update provided fields
      const updates = []
      const values = [id]
      let paramCount = 2

      if (name !== undefined) { updates.push(`name = $${paramCount++}`); values.push(name) }
      if (phone !== undefined) { updates.push(`phone = $${paramCount++}`); values.push(phone) }
      if (wants_travel_insurance !== undefined) { updates.push(`wants_travel_insurance = $${paramCount++}`); values.push(wants_travel_insurance) }
      if (date_of_birth !== undefined) { updates.push(`date_of_birth = $${paramCount++}`); values.push(date_of_birth || null) }
      if (emergency_contacts !== undefined) { updates.push(`emergency_contacts = $${paramCount++}`); values.push(emergency_contacts ? JSON.stringify(emergency_contacts) : null) }
      if (image !== undefined) { updates.push(`image = $${paramCount++}`); values.push(image) }

      if (updates.length > 0) {
        await client.query(
          `UPDATE users SET ${updates.join(', ')} WHERE id = $1`,
          values
        )
      }
      return NextResponse.json({ success: true })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error updating mobile profile:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}
