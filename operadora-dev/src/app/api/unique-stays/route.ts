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
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
