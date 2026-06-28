import { NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function GET() {
    try {
        const client = await pool.connect()
        try {
            // Fetch roles
            const rolesResult = await client.query('SELECT * FROM roles ORDER BY id ASC')
            
            // Fetch all permissions
            const permsResult = await client.query('SELECT * FROM permissions ORDER BY module, name')
            
            // Fetch mapping
            const rolePermsResult = await client.query('SELECT * FROM role_permissions')
            
            // Group permissions by role
            const roles = rolesResult.rows.map(r => {
                const permsForRole = rolePermsResult.rows
                    .filter(rp => rp.role_id === r.id)
                    .map(rp => rp.permission_id)
                return { ...r, permissions: permsForRole }
            })

            return NextResponse.json({
                success: true,
                data: {
                    roles,
                    all_permissions: permsResult.rows
                }
            })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error fetching roles:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, description, permissions } = body

        if (!name) {
            return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            
            // 1. Create role
            const roleRes = await client.query(
                'INSERT INTO roles (name, description, is_system) VALUES ($1, $2, false) RETURNING id',
                [name, description]
            )
            const roleId = roleRes.rows[0].id

            // 2. Add permissions
            if (permissions && Array.isArray(permissions)) {
                for (const pId of permissions) {
                    await client.query(
                        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
                        [roleId, pId]
                    )
                }
            }

            await client.query('COMMIT')
            return NextResponse.json({ success: true, role_id: roleId })
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error creating role:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json()
        const { id, description, permissions } = body

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID is required' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')
            
            // 1. Update role description
            if (description !== undefined) {
                await client.query(
                    'UPDATE roles SET description = $1, updated_at = NOW() WHERE id = $2',
                    [description, id]
                )
            }

            // 2. Update permissions (delete all, insert new)
            if (permissions && Array.isArray(permissions)) {
                await client.query('DELETE FROM role_permissions WHERE role_id = $1', [id])
                
                for (const pId of permissions) {
                    await client.query(
                        'INSERT INTO role_permissions (role_id, permission_id) VALUES ($1, $2)',
                        [id, pId]
                    )
                }
            }

            await client.query('COMMIT')
            return NextResponse.json({ success: true })
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error updating role:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}
