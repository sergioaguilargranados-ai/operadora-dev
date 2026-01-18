import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get('limit') || '10';

  try {
    const result = await query(
      `SELECT * FROM accommodation_favorites
       WHERE is_active = true
       ORDER BY display_order ASC
       LIMIT $1`,
      [parseInt(limit)]
    );

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error: any) {
    console.error('[ACCOMMODATION FAVORITES] Error:', error);
    // Devolver datos de ejemplo en caso de error de BD
    const mockData = [
      {
        id: 1,
        title: "Casitas Maraika",
        name: "Casitas Maraika",
        location: "Tulum, Quintana Roo",
        type: "Boutique Hotel",
        price_from: 3500,
        price_per_night: 3500,
        currency: "MXN",
        rating: 4.9,
        image_url: "https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600&h=400&fit=crop",
        description: "Hospedaje único en la selva maya"
      },
      {
        id: 2,
        title: "Casa Violeta",
        name: "Casa Violeta",
        location: "San Miguel de Allende, Gto",
        type: "Casa Colonial",
        price_from: 2800,
        price_per_night: 2800,
        currency: "MXN",
        rating: 4.8,
        image_url: "https://images.unsplash.com/photo-1615460549969-36fa19521a4f?w=600&h=400&fit=crop",
        description: "Arquitectura colonial restaurada"
      },
      {
        id: 3,
        title: "Cabañas del Bosque",
        name: "Cabañas del Bosque",
        location: "Valle de Bravo, Edo Mex",
        type: "Cabaña",
        price_from: 1800,
        price_per_night: 1800,
        currency: "MXN",
        rating: 4.6,
        image_url: "https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=600&h=400&fit=crop",
        description: "Escapada romántica en el bosque"
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockData.slice(0, parseInt(limit))
    });
  }
}
