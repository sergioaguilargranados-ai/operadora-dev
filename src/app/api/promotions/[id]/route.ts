import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await query(
      'SELECT * FROM promotions WHERE id = $1',
      [id]
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Promoción no encontrada'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0]
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
