import { NextRequest, NextResponse } from 'next/server'
import { query, insertOne } from '@/lib/db'

// GET /api/mobile/rewards/progress?user_id=X&tenant_id=Y
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const tenantId = searchParams.get('tenant_id') || '1'

    if (!userId) {
      return NextResponse.json({ success: false, error: 'user_id is required' }, { status: 400 })
    }

    const result = await query(
      `SELECT * FROM rewards_progress WHERE user_id = $1 AND tenant_id = $2`,
      [userId, tenantId]
    )

    let progress = result.rows[0]

    if (!progress) {
      // Return 0 if no progress yet
      progress = {
        current_steps: 0,
        history_log: []
      }
    }

    return NextResponse.json({
      success: true,
      data: progress
    })
  } catch (error: any) {
    console.error('[REWARDS PROGRESS GET] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST /api/mobile/rewards/progress
// { user_id, tenant_id, add_steps, location_name }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, tenant_id, add_steps, location_name } = body

    if (!user_id || !add_steps) {
      return NextResponse.json({ success: false, error: 'user_id and add_steps are required' }, { status: 400 })
    }

    const tId = tenant_id || 1

    // Verificar si ya existe
    const existing = await query(
      `SELECT * FROM rewards_progress WHERE user_id = $1 AND tenant_id = $2`,
      [user_id, tId]
    )

    let newSteps = 0
    let history = []

    if (existing.rows.length > 0) {
      const row = existing.rows[0]
      newSteps = (row.current_steps || 0) + Number(add_steps)
      history = row.history_log || []
      history.push({
        location: location_name || 'Exploración',
        steps: add_steps,
        timestamp: new Date().toISOString()
      })

      await query(
        `UPDATE rewards_progress 
         SET current_steps = $1, history_log = $2, updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [newSteps, JSON.stringify(history), row.id]
      )
    } else {
      newSteps = Number(add_steps)
      history.push({
        location: location_name || 'Exploración',
        steps: add_steps,
        timestamp: new Date().toISOString()
      })

      await insertOne('rewards_progress', {
        user_id: user_id,
        tenant_id: tId,
        current_steps: newSteps,
        history_log: JSON.stringify(history)
      })
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        current_steps: newSteps,
        history_log: history
      } 
    })
  } catch (error: any) {
    console.error('[REWARDS PROGRESS POST] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
