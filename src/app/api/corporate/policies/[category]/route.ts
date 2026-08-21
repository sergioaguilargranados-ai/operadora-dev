import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: Request,
  { params }: { params: { category: string } }
) {
  try {
    const category = params.category
    const body = await request.json()
    const { tenantId, isActive, detailedRules } = body

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID is required' }, { status: 400 })
    }

    // UPSERT policy for category
    const existing = await db.queryOne<{ id: number }>(
      'SELECT id FROM corporate_policies WHERE tenant_id = $1 AND category = $2',
      [tenantId, category]
    )

    if (existing) {
      await db.query(
        'UPDATE corporate_policies SET is_active = $1, detailed_rules = $2, updated_at = NOW() WHERE id = $3',
        [isActive, detailedRules, existing.id]
      )
    } else {
      await db.query(
        'INSERT INTO corporate_policies (tenant_id, category, is_active, detailed_rules) VALUES ($1, $2, $3, $4)',
        [tenantId, category, isActive, detailedRules]
      )
    }

    return NextResponse.json({ success: true, message: 'Política actualizada exitosamente' })
  } catch (error: any) {
    console.error('Error updating corporate policy:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
