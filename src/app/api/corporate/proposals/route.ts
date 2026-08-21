import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID is required' }, { status: 400 })
    }

    const proposals = await db.queryMany<any>(
      `SELECT 
         p.id, p.folio, p.destination, p.travel_dates, p.estimated_budget::text, p.status, p.created_at,
         u.name as requested_by_name
       FROM travel_proposals p
       LEFT JOIN tenant_users tu ON p.requested_by_id = tu.id
       LEFT JOIN users u ON tu.user_id = u.id
       WHERE p.tenant_id = $1
       ORDER BY p.created_at DESC`,
      [tenantId]
    )

    return NextResponse.json({ success: true, data: proposals })
  } catch (error: any) {
    console.error('Error fetching proposals:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tenantId, requestedById, destination, travelDates, estimatedBudget } = body
    
    const folio = 'PRP-' + Math.floor(10000 + Math.random() * 90000)

    const result = await db.queryOne<any>(
      `INSERT INTO travel_proposals (tenant_id, folio, requested_by_id, destination, travel_dates, estimated_budget)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [tenantId, folio, requestedById, destination, travelDates, estimatedBudget]
    )

    return NextResponse.json({ success: true, data: result })
  } catch (error: any) {
    console.error('Error creating proposal:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
