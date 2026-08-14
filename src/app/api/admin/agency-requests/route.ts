import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function GET(request: NextRequest) {
    try {
        // Obtenemos los usuarios cuyo rol es UNDER_REVIEW_AGENCY y hacemos join con su tenant
        const results = await query(`
            SELECT 
                u.id as user_id, 
                u.name as user_name, 
                u.email as user_email,
                u.phone as user_phone,
                t.id as tenant_id,
                t.company_name,
                t.legal_name,
                t.slogan,
                t.custom_domain,
                t.logo_url,
                t.created_at
            FROM users u
            JOIN tenants t ON u.tenant_id = t.id
            WHERE u.role = 'UNDER_REVIEW_AGENCY'
            ORDER BY t.created_at DESC
        `)

        return NextResponse.json({ success: true, data: results.rows })
    } catch (error: any) {
        console.error('Error fetching agency requests:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
