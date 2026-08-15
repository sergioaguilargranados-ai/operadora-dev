import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import { verifyToken } from '@/services/AuthService'

export const runtime = 'nodejs'

/**
 * GET /api/auth/permissions
 * Obtiene los permisos efectivos del usuario actual (o GUEST si es público)
 */
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('authorization')
        let userRole = 'GUEST'
        let userId: number | null = null
        let tenantId: number | null = null

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const decoded = await verifyToken(token)
            if (decoded) {
                userRole = decoded.role || 'USER'
                userId = decoded.userId || null
            }
        }

        // Si es SUPER_ADMIN, conceder todos los permisos del sistema
        if (userRole === 'SUPER_ADMIN') {
            const allPerms = await pool.query('SELECT code FROM permissions')
            return NextResponse.json({
                success: true,
                data: {
                    role: userRole,
                    isSuperAdmin: true,
                    permissions: allPerms.rows.map(r => r.code)
                }
            })
        }

        // Consultar permisos asignados al rol en la base de datos
        const permsResult = await pool.query(`
            SELECT DISTINCT p.code
            FROM permissions p
            JOIN role_permissions rp ON p.id = rp.permission_id
            JOIN roles r ON r.id = rp.role_id
            WHERE r.name = $1
        `, [userRole])

        const permissions = permsResult.rows.map(r => r.code)

        return NextResponse.json({
            success: true,
            data: {
                role: userRole,
                isSuperAdmin: false,
                permissions
            }
        })
    } catch (error) {
        console.error('Error fetching auth permissions:', error)
        return NextResponse.json({
            success: false,
            error: 'Error al obtener permisos'
        }, { status: 500 })
    }
}
