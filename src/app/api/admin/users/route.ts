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
            // Obtener estado actual antes de actualizar
            const prevUserRes = await client.query('SELECT name, email, role, is_active FROM users WHERE id = $1', [id])
            const prevUser = prevUserRes.rows[0]

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

            let updatedUser = null
            if (updates.length > 0) {
                values.push(id)
                const query = `UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex} RETURNING id, name, email, role, is_active`
                const updateRes = await client.query(query, values)
                updatedUser = updateRes.rows[0]
            }

            // Si se activó la cuenta (cambió de inactivo a activo o se estableció en true), enviar correo de aprobación
            if (is_active === true && (!prevUser || prevUser.is_active === false)) {
                try {
                    const { sendAccountApprovedEmail } = await import('@/lib/emailHelper')
                    const userToSend = updatedUser || prevUser
                    if (userToSend?.email) {
                        await sendAccountApprovedEmail({
                            name: userToSend.name,
                            email: userToSend.email,
                            role: userToSend.role
                        })
                        console.log(`✉️ Correo de cuenta aprobada enviado con éxito a: ${userToSend.email}`)
                    }
                } catch (emailErr) {
                    console.error('Error al enviar correo de cuenta aprobada:', emailErr)
                }
            }

            return NextResponse.json({ success: true, data: updatedUser })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error updating user:', error)
        return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const email = searchParams.get('email')
        const id = searchParams.get('id')

        if (!id && !email) {
            return NextResponse.json({ success: false, error: 'Se requiere id o email' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            let targetUserId = id
            let targetEmail = email

            if (id && !email) {
                const uRes = await client.query('SELECT email FROM users WHERE id = $1', [id])
                targetEmail = uRes.rows[0]?.email
            } else if (email && !id) {
                const uRes = await client.query('SELECT id FROM users WHERE LOWER(email) = LOWER($1)', [email.trim()])
                targetUserId = uRes.rows[0]?.id
            }

            if (targetUserId) {
                await client.query('DELETE FROM active_sessions WHERE user_id = $1', [targetUserId])
                await client.query('DELETE FROM tenant_users WHERE user_id = $1', [targetUserId])
                await client.query('DELETE FROM users WHERE id = $1', [targetUserId])
            }

            if (targetEmail) {
                await client.query('DELETE FROM crm_contacts WHERE LOWER(email) = LOWER($1)', [targetEmail.trim()])
                await client.query('DELETE FROM expo_leads WHERE LOWER(email) = LOWER($1)', [targetEmail.trim()])
                await client.query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [targetEmail.trim()])
            }

            await client.query('COMMIT')
            console.log(`🗑️ Usuario eliminado completamente: ID ${targetUserId}, Email ${targetEmail}`)

            return NextResponse.json({ success: true, message: `Usuario ${targetEmail || targetUserId} eliminado correctamente` })
        } catch (err: any) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    } catch (error: any) {
        console.error('Error deleting user:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
