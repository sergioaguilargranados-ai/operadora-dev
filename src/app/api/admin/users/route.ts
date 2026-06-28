import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const type = searchParams.get('type') || 'all' // all, internal, agency

        const client = await pool.connect()
        try {
            // Fetch roles for the dropdown
            const rolesRes = await client.query('SELECT name FROM roles ORDER BY name')
            const availableRoles = rolesRes.rows.map(r => r.name)

            // Fetch users with their agency info if they belong to one
            // We use LEFT JOIN to tenant_users and tenants to see if they are linked
            let query = `
                SELECT 
                    u.id, u.name, u.email, u.phone, u.avatar_url, u.role as global_role, 
                    u.is_active, u.created_at, u.last_login,
                    tu.role as agency_role, t.company_name as agency_name, t.id as tenant_id
                FROM users u
                LEFT JOIN tenant_users tu ON u.id = tu.user_id
                LEFT JOIN tenants t ON tu.tenant_id = t.id
            `
            
            let queryParams: any[] = []
            
            if (type === 'internal') {
                query += ` WHERE u.role IN ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'EMPLOYEE') `
            } else if (type === 'agency') {
                query += ` WHERE tu.id IS NOT NULL `
            } else if (type === 'client') {
                query += ` WHERE u.role = 'USER' OR u.role IS NULL OR u.role = 'CLIENT' `
            }

            query += ` ORDER BY u.created_at DESC`

            const usersRes = await client.query(query, queryParams)

            return NextResponse.json({
                success: true,
                data: {
                    users: usersRes.rows,
                    roles: availableRoles
                }
            })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, role, is_active } = body

        if (!id) {
            return NextResponse.json({ success: false, error: 'User ID required' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            // Build dynamic update query
            const updates = []
            const values = []
            let paramIndex = 1

            if (role !== undefined) {
                updates.push(`role = $${paramIndex++}`)
                values.push(role)
            }
            
            if (is_active !== undefined) {
                updates.push(`is_active = $${paramIndex++}`)
                values.push(is_active)
            }

            if (updates.length > 0) {
                values.push(id)
                const query = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`
                await client.query(query, values)
            }

            return NextResponse.json({ success: true })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}
