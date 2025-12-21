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
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
