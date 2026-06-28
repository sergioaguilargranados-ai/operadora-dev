import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        // Por defecto usamos tenant_id = 1 (M&M Travel Agency) para demostración
        // En producción se sacaría de la sesión del usuario logueado.
        const tenantId = searchParams.get('tenant_id') || 1 

        const client = await pool.connect()
        try {
            const result = await client.query(`
                SELECT 
                    id, company_name, legal_name, tax_id, email, phone, 
                    address, legal_representative, b2b_agent_number,
                    support_email, support_phone, support_whatsapp,
                    logo_url, mobile_logo_url, logo_dark_url, primary_color, secondary_color, 
                    accent_color, slogan, custom_domain, is_active
                FROM tenants
                WHERE id = $1
            `, [tenantId])

            if (result.rows.length === 0) {
                return NextResponse.json({ success: false, error: 'Agency not found' }, { status: 404 })
            }

            return NextResponse.json({ success: true, data: result.rows[0] })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error fetching agency settings:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { 
            id, company_name, legal_name, address, legal_representative, b2b_agent_number,
            support_email, support_phone, support_whatsapp,
            logo_url, mobile_logo_url, logo_dark_url, primary_color, secondary_color, accent_color, slogan, custom_domain
        } = body

        if (!id) {
            return NextResponse.json({ success: false, error: 'Agency ID required' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            const query = `
                UPDATE tenants 
                SET 
                    company_name = COALESCE($2, company_name),
                    legal_name = COALESCE($3, legal_name),
                    address = COALESCE($4, address),
                    legal_representative = COALESCE($5, legal_representative),
                    b2b_agent_number = COALESCE($6, b2b_agent_number),
                    support_email = COALESCE($7, support_email),
                    support_phone = COALESCE($8, support_phone),
                    support_whatsapp = COALESCE($9, support_whatsapp),
                    logo_url = COALESCE($10, logo_url),
                    mobile_logo_url = COALESCE($11, mobile_logo_url),
                    primary_color = COALESCE($12, primary_color),
                    secondary_color = COALESCE($13, secondary_color),
                    accent_color = COALESCE($14, accent_color),
                    slogan = COALESCE($15, slogan),
                    custom_domain = COALESCE($16, custom_domain),
                    logo_dark_url = COALESCE($17, logo_dark_url),
                    updated_at = NOW()
                WHERE id = $1
            `
            const values = [
                id, company_name, legal_name, address, legal_representative, b2b_agent_number,
                support_email, support_phone, support_whatsapp,
                logo_url, mobile_logo_url, primary_color, secondary_color, accent_color, slogan, custom_domain, logo_dark_url
            ]
            
            await client.query(query, values)
            
            return NextResponse.json({ success: true })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error updating agency settings:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}
