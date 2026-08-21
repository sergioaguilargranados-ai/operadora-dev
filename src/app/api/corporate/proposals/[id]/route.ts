import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    const body = await request.json()
    const { tenantId, status } = body

    if (!tenantId || !status) {
      return NextResponse.json({ success: false, error: 'Tenant ID and status are required' }, { status: 400 })
    }

    const result = await db.queryOne<any>(
      `UPDATE travel_proposals SET status = $1, updated_at = NOW() WHERE id = $2 AND tenant_id = $3 RETURNING *`,
      [status, id, tenantId]
    )

    if (!result) {
      return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Error updating proposal:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
