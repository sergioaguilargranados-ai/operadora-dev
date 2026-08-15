import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/roles
 * Listar roles con su conteo de usuarios y lista de permisos asociados
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const tenantIdParam = searchParams.get('tenant_id')

        let query = `
            SELECT 
                r.id,
                r.name,
                r.display_name,
                r.description,
                r.tenant_id,
                r.is_system,
                r.created_at,
                r.updated_at,
                t.company_name as tenant_name,
                COALESCE(user_counts.total_users, 0) as total_users,
                COALESCE(
                    json_agg(p.code) FILTER (WHERE p.code IS NOT NULL),
                    '[]'
                ) as permissions
            FROM roles r
            LEFT JOIN tenants t ON t.id = r.tenant_id
            LEFT JOIN (
                SELECT role, COUNT(*) as total_users
                FROM users
                GROUP BY role
            ) user_counts ON user_counts.role = r.name
            LEFT JOIN role_permissions rp ON rp.role_id = r.id
            LEFT JOIN permissions p ON p.id = rp.permission_id
        `

        const params: any[] = []
        if (tenantIdParam) {
            query += ` WHERE r.tenant_id = $1 OR r.tenant_id IS NULL `
            params.push(parseInt(tenantIdParam))
        }

        query += ` GROUP BY r.id, t.company_name, user_counts.total_users ORDER BY r.is_system DESC, r.name ASC `

        const result = await pool.query(query, params)

        return NextResponse.json({
            success: true,
            data: result.rows
        })
    } catch (error) {
        console.error('Error fetching admin roles:', error)
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 })
    }
}

/**
 * POST /api/admin/roles
 * Crear un nuevo rol (global o para un tenant) con sus permisos iniciales
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, display_name, description, tenant_id, permission_codes } = body

        if (!name) {
            return NextResponse.json({ success: false, error: 'El código del rol (name) es requerido' }, { status: 400 })
        }

        // Formatear código en mayúsculas sin espacios
        const formattedCode = name.trim().toUpperCase().replace(/\s+/g, '_')
        const formattedDisplayName = display_name || name.trim()

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Insertar rol
            const roleRes = await client.query(`
                INSERT INTO roles (name, display_name, description, tenant_id, is_system, created_at, updated_at)
                VALUES ($1, $2, $3, $4, false, NOW(), NOW())
                RETURNING *
            `, [formattedCode, formattedDisplayName, description || '', tenant_id || null])

            const newRole = roleRes.rows[0]

            // Asignar permisos si se proporcionaron
            if (Array.isArray(permission_codes) && permission_codes.length > 0) {
                const permsRes = await client.query(
                    `SELECT id, code FROM permissions WHERE code = ANY($1)`,
                    [permission_codes]
                )

                for (const p of permsRes.rows) {
                    await client.query(`
                        INSERT INTO role_permissions (role_id, permission_id, created_at)
                        VALUES ($1, $2, NOW())
                        ON CONFLICT DO NOTHING
                    `, [newRole.id, p.id])
                }
            }

            await client.query('COMMIT')

            return NextResponse.json({
                success: true,
                data: newRole,
                message: 'Rol creado exitosamente'
            }, { status: 201 })
        } catch (err: any) {
            await client.query('ROLLBACK')
            if (err.code === '23505') {
                return NextResponse.json({ success: false, error: 'Ya existe un rol con este código' }, { status: 409 })
            }
            throw err
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error creating role:', error)
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 })
    }
}

/**
 * PUT /api/admin/roles
 * Actualizar datos de un rol y su matriz de permisos
 */
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { id, display_name, description, permission_codes } = body

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID de rol es requerido' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            // Actualizar datos básicos
            await client.query(`
                UPDATE roles 
                SET display_name = COALESCE($1, display_name),
                    description = COALESCE($2, description),
                    updated_at = NOW()
                WHERE id = $3
            `, [display_name, description, id])

            // Si se envían permission_codes, actualizar la matriz en lote
            if (Array.isArray(permission_codes)) {
                // Eliminar permisos anteriores
                await client.query('DELETE FROM role_permissions WHERE role_id = $1', [id])

                // Insertar nuevos permisos
                if (permission_codes.length > 0) {
                    const permsRes = await client.query(
                        `SELECT id FROM permissions WHERE code = ANY($1)`,
                        [permission_codes]
                    )

                    for (const p of permsRes.rows) {
                        await client.query(`
                            INSERT INTO role_permissions (role_id, permission_id, created_at)
                            VALUES ($1, $2, NOW())
                            ON CONFLICT DO NOTHING
                        `, [id, p.id])
                    }
                }
            }

            await client.query('COMMIT')

            return NextResponse.json({
                success: true,
                message: 'Rol y matriz de permisos actualizados correctamente'
            })
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error updating role:', error)
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 })
    }
}

/**
 * DELETE /api/admin/roles
 * Eliminar rol (solo no pertenecientes al sistema y sin usuarios asignados)
 */
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ success: false, error: 'ID requerido' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            // Verificar si es rol de sistema
            const roleCheck = await client.query('SELECT name, is_system FROM roles WHERE id = $1', [parseInt(id)])
            if (roleCheck.rows.length === 0) {
                return NextResponse.json({ success: false, error: 'Rol no encontrado' }, { status: 404 })
            }

            if (roleCheck.rows[0].is_system) {
                return NextResponse.json({ success: false, error: 'No se pueden eliminar roles protegidos del sistema' }, { status: 403 })
            }

            // Verificar si tiene usuarios asignados
            const userCheck = await client.query('SELECT COUNT(*) FROM users WHERE role = $1', [roleCheck.rows[0].name])
            if (parseInt(userCheck.rows[0].count) > 0) {
                return NextResponse.json({
                    success: false,
                    error: `No se puede eliminar el rol porque tiene ${userCheck.rows[0].count} usuario(s) asignado(s)`
                }, { status: 400 })
            }

            await client.query('DELETE FROM roles WHERE id = $1', [parseInt(id)])

            return NextResponse.json({
                success: true,
                message: 'Rol eliminado exitosamente'
            })
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error deleting role:', error)
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 })
    }
}
