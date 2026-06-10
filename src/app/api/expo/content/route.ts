import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      'SELECT id, hero_video_url, hero_title, hero_subtitle, sections_json FROM expo_landing_content ORDER BY id DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ success: true, data: null });
    }
    
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error fetching expo content:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { hero_video_url, hero_title, hero_subtitle, sections_json } = body;
    
    // Convert sections_json to string if it's an object
    const sectionsStr = typeof sections_json === 'string' ? sections_json : JSON.stringify(sections_json);

    // Actualizar el primer registro o insertar si no existe (el ID 1)
    const result = await query(
      `INSERT INTO expo_landing_content (id, hero_video_url, hero_title, hero_subtitle, sections_json, updated_at, updated_by)
       VALUES (1, $1, $2, $3, $4, CURRENT_TIMESTAMP, 'admin')
       ON CONFLICT (id) DO UPDATE SET 
         hero_video_url = EXCLUDED.hero_video_url,
         hero_title = EXCLUDED.hero_title,
         hero_subtitle = EXCLUDED.hero_subtitle,
         sections_json = EXCLUDED.sections_json,
         updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [hero_video_url, hero_title, hero_subtitle, sectionsStr]
    );

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    console.error('Error updating expo content:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
