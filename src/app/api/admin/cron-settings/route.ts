import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const result = await pool.query('SELECT * FROM cron_settings ORDER BY id ASC')
    return NextResponse.json({ success: true, data: result.rows })
  } catch (error: any) {
    console.error('Error fetching cron settings:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { cron_key, is_active, scheduled_hour } = body

    if (!cron_key) {
      return NextResponse.json({ success: false, error: 'cron_key is required' }, { status: 400 })
    }

    const result = await pool.query(
      `UPDATE cron_settings 
       SET is_active = $1, scheduled_hour = $2, updated_at = NOW() 
       WHERE cron_key = $3 
       RETURNING *`,
      [is_active, scheduled_hour, cron_key]
    )

    if (result.rows.length === 0) {
       // Insert if it didn't exist
       const insertRes = await pool.query(
         `INSERT INTO cron_settings (cron_key, is_active, scheduled_hour) 
          VALUES ($1, $2, $3) RETURNING *`,
         [cron_key, is_active, scheduled_hour]
       )
       return NextResponse.json({ success: true, data: insertRes.rows[0] })
    }

    return NextResponse.json({ success: true, data: result.rows[0] })
  } catch (error: any) {
    console.error('Error updating cron setting:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
