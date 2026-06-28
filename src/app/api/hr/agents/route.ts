import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const tenantId = searchParams.get('tenant_id') || 1 

        const client = await pool.connect()
        try {
            // we will query users joining with hr_employees if possible, but the schema shows hr_employees has full names.
            // Let's assume agents are inserted into hr_employees. If the table is empty, we'll see empty array.
            const result = await client.query(`
                SELECT 
                    e.id, e.user_id, e.first_name, e.last_name, e.email, e.phone, 
                    e.photo_url, e.agent_commission_rate, e.agent_license_number,
                    e.is_active, e.created_at,
                    COALESCE(
                        (
                            SELECT json_agg(json_build_object('id', d.id, 'document_name', d.document_name, 'document_url', d.document_url, 'document_type', d.document_type, 'created_at', d.created_at))
                            FROM entity_documents d 
                            WHERE d.entity_type = 'agent' AND d.entity_id = e.id
                        ), 
                        '[]'::json
                    ) as documents
                FROM hr_employees e
                WHERE e.tenant_id = $1 AND (e.employee_type = 'agent' OR e.employee_type IS NULL)
                ORDER BY e.created_at DESC
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
        const { id, first_name, last_name, email, phone, agent_commission_rate, agent_license_number, photo_url, is_active } = body

        if (!id) {
            return NextResponse.json({ success: false, error: 'Agent ID required' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            const query = `
                UPDATE hr_employees 
                SET 
                    first_name = COALESCE($2, first_name),
                    last_name = COALESCE($3, last_name),
                    email = COALESCE($4, email),
                    phone = COALESCE($5, phone),
                    agent_commission_rate = COALESCE($6, agent_commission_rate),
                    agent_license_number = COALESCE($7, agent_license_number),
                    photo_url = COALESCE($8, photo_url),
                    is_active = COALESCE($9, is_active),
                    updated_at = NOW()
                WHERE id = $1
            `
            const values = [id, first_name, last_name, email, phone, agent_commission_rate, agent_license_number, photo_url, is_active]
            
            await client.query(query, values)
            
            return NextResponse.json({ success: true })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error updating agent:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}
