import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const tenantId = searchParams.get('tenant_id') || 1 

        const client = await pool.connect()
        try {
            // Fetch agents (users with AGENT role in tenant_users)
            const result = await client.query(`
                SELECT 
                    u.id as user_id, u.name, u.email, u.phone, u.avatar_url, u.address,
                    tu.id as agent_id, tu.referral_code, tu.agent_commission_split, tu.agent_status, tu.created_at
                FROM tenant_users tu
                JOIN users u ON tu.user_id = u.id
                WHERE tu.tenant_id = $1 AND tu.role = 'AGENT'
                ORDER BY u.name ASC
            `, [tenantId])

            return NextResponse.json({ success: true, data: result.rows })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error fetching agents:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { user_id, agent_commission_split, agent_status, avatar_url, address, phone } = body

        if (!user_id) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Update user table info
            if (avatar_url !== undefined || address !== undefined || phone !== undefined) {
                const userUpdates = []
                const userValues = []
                let i = 1
                if (avatar_url !== undefined) { userUpdates.push(`avatar_url = $${i++}`); userValues.push(avatar_url) }
                if (address !== undefined) { userUpdates.push(`address = $${i++}`); userValues.push(address) }
                if (phone !== undefined) { userUpdates.push(`phone = $${i++}`); userValues.push(phone) }
                
                if (userUpdates.length > 0) {
                    userValues.push(user_id)
                    await client.query(`UPDATE users SET ${userUpdates.join(', ')} WHERE id = $${i}`, userValues)
                }
            }

            // Update tenant_users info
            if (agent_commission_split !== undefined || agent_status !== undefined) {
                const tuUpdates = []
                const tuValues = []
                let j = 1
                if (agent_commission_split !== undefined) { tuUpdates.push(`agent_commission_split = $${j++}`); tuValues.push(agent_commission_split) }
                if (agent_status !== undefined) { tuUpdates.push(`agent_status = $${j++}`); tuValues.push(agent_status) }
                
                if (tuUpdates.length > 0) {
                    tuValues.push(user_id)
                    await client.query(`UPDATE tenant_users SET ${tuUpdates.join(', ')} WHERE user_id = $${j} AND role = 'AGENT'`, tuValues)
                }
            }

            await client.query('COMMIT')
            return NextResponse.json({ success: true })
        } catch(e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error updating agent:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}
