import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT * FROM homepage_hero WHERE is_active = true AND tenant_id = 1 LIMIT 1`
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0] || null
    })
  } catch (error: any) {
    console.error('[HERO GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, title, subtitle, description } = body

    const result = await query(
      `UPDATE homepage_hero
       SET image_url = COALESCE($1, image_url),
           title = COALESCE($2, title),
           subtitle = COALESCE($3, subtitle),
           description = COALESCE($4, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE tenant_id = 1
       RETURNING *`,
      [image_url, title, subtitle, description]
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error: any) {
    console.error('[HERO PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
