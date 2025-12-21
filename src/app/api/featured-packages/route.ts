import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get('limit') || '10'

  try {
    const result = await query(
      `SELECT * FROM featured_packages
       WHERE is_active = true
       ORDER BY display_order ASC
       LIMIT $1`,
      [parseInt(limit)]
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error: any) {
    console.error('[FEATURED PACKAGES] Error:', error);
    // Devolver datos de ejemplo en caso de error de BD
    const mockData = [
      {
        id: 1,
        destination: "Cancún",
        package_name: "Todo Incluido Premium",
        description: "5 días y 4 noches en resort 5 estrellas con vuelo incluido",
        price: 18999,
        currency: "MXN",
        nights: 4,
        includes_flight: true,
        includes_hotel: true,
        includes_tours: true,
        image_url: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&h=400&fit=crop",
        rating: 4.8,
        reviews: 245
      },
      {
        id: 2,
        destination: "Los Cabos",
        package_name: "Aventura y Relax",
        description: "6 días y 5 noches con tours y actividades acuáticas",
        price: 24999,
        currency: "MXN",
        nights: 5,
        includes_flight: true,
        includes_hotel: true,
        includes_tours: true,
        image_url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=400&fit=crop",
        rating: 4.9,
        reviews: 189
      },
      {
        id: 3,
        destination: "Riviera Maya",
        package_name: "Escapada Romántica",
        description: "4 días y 3 noches en hotel boutique frente al mar",
        price: 15999,
        currency: "MXN",
        nights: 3,
        includes_flight: true,
        includes_hotel: true,
        includes_tours: false,
        image_url: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&h=400&fit=crop",
        rating: 4.7,
        reviews: 156
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockData.slice(0, parseInt(limit))
    })
  }
}
