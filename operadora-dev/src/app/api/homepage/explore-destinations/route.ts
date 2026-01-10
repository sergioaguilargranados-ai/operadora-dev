import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const limit = request.nextUrl.searchParams.get('limit') || '10';

    const result = await query(
      `SELECT * FROM explore_destinations
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
    console.error('[EXPLORE DESTINATIONS] Error:', error);
    // Devolver datos mock en caso de error de BD
    const mockData = [
      {
        id: 1,
        destination: 'Cancún',
        destination_name: 'Cancún',
        city: 'Cancún',
        country: 'México',
        image_url: 'https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&h=400&fit=crop',
        price_from: 2500,
        currency: 'MXN',
        category: 'playa',
        hotels_count: 1234
      },
      {
        id: 2,
        destination: 'Ciudad de México',
        destination_name: 'Ciudad de México',
        city: 'CDMX',
        country: 'México',
        image_url: 'https://images.unsplash.com/photo-1518659526054-190340b32735?w=600&h=400&fit=crop',
        price_from: 1200,
        currency: 'MXN',
        category: 'ciudad',
        hotels_count: 856
      },
      {
        id: 3,
        destination: 'Tulum',
        destination_name: 'Tulum',
        city: 'Tulum',
        country: 'México',
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
        price_from: 2800,
        currency: 'MXN',
        category: 'playa',
        hotels_count: 523
      },
      {
        id: 4,
        destination: 'San Miguel de Allende',
        destination_name: 'San Miguel de Allende',
        city: 'San Miguel de Allende',
        country: 'México',
        image_url: 'https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=600&h=400&fit=crop',
        price_from: 1800,
        currency: 'MXN',
        category: 'ciudad',
        hotels_count: 312
      },
      {
        id: 5,
        destination: 'Los Cabos',
        destination_name: 'Los Cabos',
        city: 'Los Cabos',
        country: 'México',
        image_url: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=400&fit=crop',
        price_from: 3500,
        currency: 'MXN',
        category: 'playa',
        hotels_count: 445
      },
      {
        id: 6,
        destination: 'Oaxaca',
        destination_name: 'Oaxaca',
        city: 'Oaxaca',
        country: 'México',
        image_url: 'https://images.unsplash.com/photo-1547995886-6dc09384c6e6?w=600&h=400&fit=crop',
        price_from: 1600,
        currency: 'MXN',
        category: 'ciudad',
        hotels_count: 289
      }
    ];
    const requestLimit = request.nextUrl.searchParams.get('limit') || '10';
    return NextResponse.json({
      success: true,
      data: mockData.slice(0, parseInt(requestLimit))
    });
  }
}
