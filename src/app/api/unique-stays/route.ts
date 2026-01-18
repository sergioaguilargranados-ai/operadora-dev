import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get('limit') || '10'

    const result = await query(
      `SELECT * FROM unique_stays
       WHERE is_featured = true
       ORDER BY display_order ASC
       LIMIT $1`,
      [parseInt(limit)]
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error: any) {
    console.error('[UNIQUE STAYS] Error:', error)
    // Devolver datos mock en caso de error de BD
    const mockData = [
      {
        id: 1,
        property_name: 'Casa en el árbol',
        location: 'Chiapas, México',
        description: 'Experiencia única rodeado de naturaleza',
        image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&h=400&fit=crop',
        price_per_night: 2100,
        currency: 'MXN',
        rating: 4.9,
        total_reviews: 234,
        property_type: 'treehouse'
      },
      {
        id: 2,
        property_name: 'Hotel Boutique Colonial',
        location: 'Oaxaca, México',
        description: 'Arquitectura colonial con lujo moderno',
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop',
        price_per_night: 1950,
        currency: 'MXN',
        rating: 4.8,
        total_reviews: 189,
        property_type: 'boutique'
      },
      {
        id: 3,
        property_name: 'Villa con Piscina Privada',
        location: 'Tulum, México',
        description: 'Exclusividad y confort frente al mar',
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop',
        price_per_night: 4500,
        currency: 'MXN',
        rating: 5.0,
        total_reviews: 156,
        property_type: 'villa'
      }
    ]
    return NextResponse.json({
      success: true,
      data: mockData.slice(0, parseInt(request.nextUrl.searchParams.get('limit') || '10'))
    })
  }
}
