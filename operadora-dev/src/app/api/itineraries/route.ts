import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId')
    const bookingId = searchParams.get('bookingId')

    let query = 'SELECT * FROM itineraries WHERE 1=1'
    const params: any[] = []
    let paramIndex = 1

    if (userId) {
      query += ` AND user_id = $${paramIndex}`
      params.push(userId)
      paramIndex++
    }

    if (bookingId) {
      query += ` AND booking_id = $${paramIndex}`
      params.push(bookingId)
      paramIndex++
    }

    query += ' ORDER BY created_at DESC'

    const result = await pool.query(query, params)

    return NextResponse.json({
      success: true,
      data: result.rows
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      booking_id, user_id, created_by,
      title, destination, description,
      start_date, end_date, days, notes, recommendations
    } = body

    const result = await pool.query(`
      INSERT INTO itineraries (
        booking_id, user_id, created_by, title, destination, description,
        start_date, end_date, days, notes, recommendations, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'draft')
      RETURNING *
    `, [booking_id, user_id, created_by, title, destination, description, start_date, end_date, days, notes, recommendations])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    }, { status: 201 })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updates } = body

    const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ')
    const values = Object.values(updates)

    const result = await pool.query(`
      UPDATE itineraries
      SET ${fields}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [id, ...values])

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
