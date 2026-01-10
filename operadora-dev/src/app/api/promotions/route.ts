import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  const limit = request.nextUrl.searchParams.get('limit') || '10'

  try {
    const result = await query(
      `SELECT * FROM promotions
       WHERE is_active = true
       ORDER BY display_order ASC, created_at DESC
       LIMIT $1`,
      [parseInt(limit)]
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error: any) {
    console.error('[PROMOTIONS] Error:', error);
    // Devolver datos de ejemplo en caso de error de BD
    const mockData = [
      {
        id: 1,
        title: "Cancún All Inclusive",
        description: "5 días 4 noches con todo incluido",
        discount_percentage: 25,
        price: 12999,
        discount_price: 9749,
        image_url: "https://images.unsplash.com/photo-1568402102990-bc541580b59f?w=600&h=400&fit=crop",
        badge_text: "Oferta Limitada",
        link_url: "/oferta/1",
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: "hoteles"
      },
      {
        id: 2,
        title: "Vuelos a Europa",
        description: "Desde Ciudad de México",
        discount_percentage: 30,
        price: 18000,
        discount_price: 12600,
        image_url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=400&fit=crop",
        badge_text: "¡Oferta Flash!",
        link_url: "/oferta/2",
        valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        category: "vuelos"
      },
      {
        id: 3,
        title: "Tour por la Riviera Maya",
        description: "Todo incluido con excursiones",
        discount_percentage: 20,
        price: 15999,
        discount_price: 12799,
        image_url: "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&h=400&fit=crop",
        badge_text: "Popular",
        link_url: "/oferta/3",
        valid_until: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
        category: "paquetes"
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockData.slice(0, parseInt(limit))
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      discount_percentage,
      image_url,
      badge_text,
      link_url,
      valid_until,
      display_order = 0
    } = body;

    if (!title || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Título e imagen son requeridos' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO promotions
       (title, description, discount_percentage, image_url, category, badge_text, link_url, valid_until, display_order)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description, discount_percentage, image_url, 'general', badge_text, link_url, valid_until, display_order]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('[PROMOTIONS CREATE] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      description,
      discount_percentage,
      image_url,
      badge_text,
      link_url,
      valid_until,
      display_order,
      is_active
    } = body;

    if (!id || !title || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE promotions
       SET title = $1, description = $2, discount_percentage = $3,
           image_url = $4, badge_text = $5, link_url = $6,
           valid_until = $7, display_order = $8, is_active = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [title, description, discount_percentage, image_url, badge_text, link_url, valid_until, display_order, is_active, id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('[PROMOTIONS UPDATE] Error:', error);
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

    // Soft delete
    const result = await query(
      `UPDATE promotions
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
    console.error('[PROMOTIONS DELETE] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
