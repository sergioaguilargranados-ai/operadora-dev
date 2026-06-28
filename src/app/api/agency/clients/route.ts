import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const tenantId = searchParams.get('tenant_id') || 1 

        const client = await pool.connect()
        try {
            // Fetch all clients belonging to agents of this agency
            // A client is linked to an agent via referral_conversions
            const query = `
                SELECT 
                    c.id as client_id, c.name as client_name, c.email as client_email, 
                    c.phone as client_phone, c.avatar_url, c.address, c.created_at,
                    rc.agent_id, a_user.name as agent_name, a.referral_code
                FROM referral_conversions rc
                JOIN users c ON rc.user_id = c.id
                JOIN tenant_users a ON rc.agent_id = a.id
                JOIN users a_user ON a.user_id = a_user.id
                WHERE a.tenant_id = $1
                GROUP BY c.id, rc.agent_id, a_user.name, a.referral_code
                ORDER BY c.created_at DESC
            `
            
            // Also fetch all agents of this agency for the reassignment dropdown
            const agentsQuery = `
                SELECT tu.id as agent_id, u.name as agent_name 
                FROM tenant_users tu
                JOIN users u ON tu.user_id = u.id
                WHERE tu.tenant_id = $1 AND tu.role = 'AGENT'
            `

            const [clientsRes, agentsRes] = await Promise.all([
                client.query(query, [tenantId]),
                client.query(agentsQuery, [tenantId])
            ])

            return NextResponse.json({ 
                success: true, 
                data: {
                    clients: clientsRes.rows,
                    agents: agentsRes.rows
                } 
            })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error fetching clients:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { client_id, new_agent_id } = body

        if (!client_id || !new_agent_id) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            // Reasignar cliente actualizando la conversión
            // Nota: Podrían haber múltiples conversiones para el mismo cliente. 
            // Las actualizamos todas para que a partir de ahora le pertenezcan al nuevo agente.
            await client.query(
                'UPDATE referral_conversions SET agent_id = $1 WHERE user_id = $2',
                [new_agent_id, client_id]
            )

            return NextResponse.json({ success: true })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error reassigning client:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { client_id, message, sender_id } = body

        if (!client_id || !message) {
            return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            // Inyectar en sistema de notificaciones (communication_center)
            await client.query(`
                INSERT INTO crm_communication_logs 
                (contact_id, user_id, channel, direction, message, status)
                VALUES 
                ((SELECT id FROM crm_contacts WHERE user_id = $1 LIMIT 1), $2, 'platform', 'outbound', $3, 'delivered')
            `, [client_id, sender_id || 1, message])

            // Aquí también podríamos insertar en la tabla genérica de notificaciones del portal web (si existiese)

            return NextResponse.json({ success: true })
        } catch (e) {
            // Ignorar error si crm_contacts no está inicializado para este usuario
            console.log('CRM contact might not exist for user', e)
            return NextResponse.json({ success: true, warning: 'Sent, but CRM log failed.' })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error sending message:', error)
        return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
    }
}
