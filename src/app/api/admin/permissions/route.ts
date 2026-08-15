import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/permissions
 * Catálogo completo de permisos del sistema agrupados por módulo
 */
export async function GET(req: NextRequest) {
    try {
        const result = await pool.query(`
            SELECT id, code, module, action, description, created_at
            FROM permissions
            ORDER BY module, action, code
        `)

        // Agrupar por módulo
        const grouped: Record<string, any[]> = {}
        for (const p of result.rows) {
            if (!grouped[p.module]) {
                grouped[p.module] = []
            }
            grouped[p.module].push(p)
        }

        return NextResponse.json({
            success: true,
            data: {
                permissions: result.rows,
                grouped
            }
        })
    } catch (error) {
        console.error('Error fetching admin permissions:', error)
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 })
    }
}
