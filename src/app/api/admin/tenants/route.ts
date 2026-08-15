import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/tenants
 * Lista simplificada de marcas blancas / tenants para selectores y administración
 */
export async function GET(req: NextRequest) {
    try {
        const result = await pool.query(`
            SELECT id, company_name, custom_domain, tenant_type, is_active, created_at
            FROM tenants
            ORDER BY id ASC
        `)

        return NextResponse.json({
            success: true,
            data: result.rows
        })
    } catch (error) {
        console.error('Error fetching admin tenants:', error)
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 })
    }
}
