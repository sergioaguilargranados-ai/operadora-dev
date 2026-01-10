import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT * FROM featured_hero WHERE is_active = true ORDER BY id DESC LIMIT 1`
    )

    return NextResponse.json({
      success: true,
      data: result.rows[0] || null
    })
  } catch (error: any) {
    console.error('[HERO GET] Error:', error)
    // Devolver datos mock en caso de error de BD
    const mockData = {
      id: 1,
      title: "Descubre tu próximo destino",
      subtitle: "Ofertas exclusivas en vuelos, hoteles y paquetes",
      description: "Encuentra los mejores precios en viajes a todo el mundo",
      image_url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=900&fit=crop",
      is_active: true
    }
    return NextResponse.json({
      success: true,
      data: mockData
    })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { image_url, title, subtitle, description } = body

    const result = await query(
      `UPDATE featured_hero
       SET image_url = COALESCE($1, image_url),
           title = COALESCE($2, title),
           subtitle = COALESCE($3, subtitle),
           description = COALESCE($4, description),
           updated_at = CURRENT_TIMESTAMP
       WHERE is_active = true
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
