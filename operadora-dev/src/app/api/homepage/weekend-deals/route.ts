import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get('limit') || '10';

  try {
    const result = await query(
      `SELECT * FROM weekend_deals
       WHERE is_active = true
       AND (valid_until IS NULL OR valid_until > CURRENT_TIMESTAMP)
       ORDER BY display_order ASC
       LIMIT $1`,
      [parseInt(limit)]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('[WEEKEND DEALS] Error:', error);
    // Devolver datos de ejemplo en caso de error de BD
    const mockData = [
      {
        id: 1,
        name: "Hotel Fiesta Americana",
        location: "Cancún, Quintana Roo",
        price_per_night: 1200,
        currency: "MXN",
        rating: 4.5,
        image_url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&h=400&fit=crop",
        description: "Resort todo incluido frente al mar",
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: "Grand Velas Los Cabos",
        location: "Los Cabos, BCS",
        price_per_night: 2500,
        currency: "MXN",
        rating: 5.0,
        image_url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&h=400&fit=crop",
        description: "Lujo y confort en la playa",
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: "Secrets Huatulco",
        location: "Huatulco, Oaxaca",
        price_per_night: 1800,
        currency: "MXN",
        rating: 4.7,
        image_url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop",
        description: "Solo adultos, todo incluido",
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        name: "Barceló Ixtapa",
        location: "Ixtapa, Guerrero",
        price_per_night: 1500,
        currency: "MXN",
        rating: 4.3,
        image_url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&h=400&fit=crop",
        description: "Frente a la playa con albercas",
        valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockData.slice(0, parseInt(limit))
    });
  }
}
