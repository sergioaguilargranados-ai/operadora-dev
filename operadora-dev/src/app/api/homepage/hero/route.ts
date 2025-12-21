import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const result = await query(
      `SELECT * FROM featured_hero
       WHERE is_active = true
       ORDER BY id DESC
       LIMIT 1`
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0] || null
    });
  } catch (error: any) {
    console.error('[HERO] Error:', error);
    // Devolver datos de ejemplo en caso de error de BD
    return NextResponse.json({
      success: true,
      data: {
        id: 1,
        title: "Explora el mundo con AS Operadora",
        subtitle: "Experiencias que inspiran",
        description: "Descubre los mejores destinos con las mejores ofertas",
        image_url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&h=600&fit=crop",
        cta_text: "Buscar destinos",
        cta_link: "/resultados"
      }
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, subtitle, description, image_url, cta_text, cta_link } = body;

    if (!id || !title || !image_url) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos' },
        { status: 400 }
      );
    }

    const result = await query(
      `UPDATE featured_hero
       SET title = $1, subtitle = $2, description = $3,
           image_url = $4, cta_text = $5, cta_link = $6,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, subtitle, description, image_url, cta_text, cta_link, id]
    );

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error: any) {
    console.error('[HERO UPDATE] Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
