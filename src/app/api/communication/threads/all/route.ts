import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/communication/threads/all
 * Admin: devuelve TODOS los threads sin restricción de usuario
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')

        let sql = `
            SELECT
                t.*,
                u_client.name  AS client_name,
                u_client.email AS client_email,
                u_agent.name   AS agent_name
            FROM communication_threads t
            LEFT JOIN users u_client ON t.client_id = u_client.id
            LEFT JOIN users u_agent  ON t.assigned_agent_id = u_agent.id
        `
        const params: any[] = []

        const conditions: string[] = []
        if (status && status !== 'all') {
            conditions.push(`t.status = $${params.length + 1}`)
            params.push(status)
        }
        
        const clientId = searchParams.get('client_id')
        if (clientId) {
            conditions.push(`t.client_id = $${params.length + 1}`)
            params.push(clientId)
        }
        
        if (conditions.length > 0) {
            sql += ` WHERE ` + conditions.join(' AND ')
        }

        sql += ` ORDER BY t.last_message_at DESC NULLS LAST, t.created_at DESC LIMIT 200`

        const result = await query(sql, params)

        return NextResponse.json({
            success: true,
            data: result.rows,
            total: result.rows.length
        })
    } catch (error: any) {
        console.error('[THREADS ALL] Error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
