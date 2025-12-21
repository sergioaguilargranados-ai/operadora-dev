import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get('limit') || '10';

  try {
    const result = await query(
      `SELECT * FROM flight_destinations
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
    console.error('[FLIGHT DESTINATIONS] Error:', error);
    // Devolver datos de ejemplo en caso de error de BD
    const mockData = [
      {
        id: 1,
        city: "Cancún",
        country: "México",
        price_from: 2500,
        currency: "MXN",
        image_url: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&h=400&fit=crop",
        airport_code: "CUN"
      },
      {
        id: 2,
        city: "Los Cabos",
        country: "México",
        price_from: 3200,
        currency: "MXN",
        image_url: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&h=400&fit=crop",
        airport_code: "SJD"
      },
      {
        id: 3,
        city: "Puerto Vallarta",
        country: "México",
        price_from: 2800,
        currency: "MXN",
        image_url: "https://images.unsplash.com/photo-1512813195452-66bec2d93950?w=600&h=400&fit=crop",
        airport_code: "PVR"
      },
      {
        id: 4,
        city: "Guadalajara",
        country: "México",
        price_from: 1800,
        currency: "MXN",
        image_url: "https://images.unsplash.com/photo-1518639192441-8fce0a366e2e?w=600&h=400&fit=crop",
        airport_code: "GDL"
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockData.slice(0, parseInt(limit))
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { city, country, price_from, currency, image_url, airport_code, display_order } = body;

    if (!city || !price_from || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO flight_destinations
       (city, country, price_from, currency, image_url, airport_code, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [city, country || 'México', price_from, currency || 'MXN', image_url, airport_code, display_order || 0]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('[FLIGHT DESTINATIONS CREATE] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, city, country, price_from, currency, image_url, airport_code, display_order, is_active } = body;

    if (!id || !city || !price_from || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE flight_destinations
       SET city = $1, country = $2, price_from = $3, currency = $4,
           image_url = $5, airport_code = $6, display_order = $7, is_active = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [city, country, price_from, currency, image_url, airport_code, display_order, is_active, id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('[FLIGHT DESTINATIONS UPDATE] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requerido' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE flight_destinations
       SET is_active = false, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [parseInt(id)]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('[FLIGHT DESTINATIONS DELETE] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
