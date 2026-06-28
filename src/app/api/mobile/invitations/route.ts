import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, channel, target_name, target_contact, personal_message, trip_id } = body

    if (!user_id || !channel || !target_contact) {
      return NextResponse.json({ success: false, error: 'Faltan datos obligatorios' }, { status: 400 })
    }

    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO group_invitations (user_id, channel, target_name, target_contact, personal_message, trip_id, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [user_id, channel, target_name || 'Amigo', target_contact, personal_message || null, trip_id || null, 'sent']
      )

      return NextResponse.json({ success: true, data: result.rows[0] })
    } finally {
      client.release()
    }
  } catch (error) {
    console.error('Error recording invitation:', error)
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
  }
}
