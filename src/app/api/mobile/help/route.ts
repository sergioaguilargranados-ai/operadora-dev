import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantIdParam = searchParams.get('tenant_id')
    const tenantId = tenantIdParam ? parseInt(tenantIdParam, 10) : 1

    const result = await query(
      `SELECT * FROM mobile_help_topics WHERE tenant_id = $1 ORDER BY order_index ASC`,
      [tenantId]
    )

    return NextResponse.json({
      success: true,
      data: result.rows
    })
  } catch (error: any) {
    console.error('[HELP GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, tenant_id, title, description, image_url, icon_name, order_index } = body

    const tenantId = parseInt(tenant_id, 10) || 1

    if (id) {
      // Update
      await query(
        `UPDATE mobile_help_topics 
         SET title = $1, description = $2, image_url = $3, icon_name = $4, order_index = $5, updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 AND tenant_id = $7`,
        [title, description, image_url, icon_name, order_index || 0, id, tenantId]
      )
    } else {
      // Insert
      await query(
        `INSERT INTO mobile_help_topics (tenant_id, title, description, image_url, icon_name, order_index)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [tenantId, title, description, image_url, icon_name, order_index || 0]
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[HELP POST] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
    }

    await query(`DELETE FROM mobile_help_topics WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[HELP DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
