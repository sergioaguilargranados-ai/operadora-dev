import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export const runtime = 'nodejs'

export interface MenuItemData {
    id: number
    section_key: string
    section_title: string
    section_order: number
    item_key: string
    label: string
    icon_name: string | null
    route: string
    badge: string | null
    permission_code: string | null
    parent_item_key: string | null
    sort_order: number
    is_active: boolean
    tenant_id: number | null
    subItems?: MenuItemData[]
}

export interface MenuSectionData {
    key: string
    title: string
    order: number
    items: MenuItemData[]
}

/**
 * GET /api/admin/menu
 * Obtener la estructura jerárquica del menú organizada por secciones
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url)
        const tenantIdParam = searchParams.get('tenant_id')

        let query = `
            SELECT 
                id, section_key, section_title, section_order,
                item_key, label, icon_name, route, badge,
                permission_code, parent_item_key, sort_order,
                is_active, tenant_id
            FROM navigation_menu_items
        `
        const params: any[] = []

        if (tenantIdParam && tenantIdParam !== 'all' && tenantIdParam !== 'global') {
            query += ` WHERE tenant_id = $1 OR tenant_id IS NULL `
            params.push(parseInt(tenantIdParam))
        } else {
            query += ` WHERE tenant_id IS NULL `
        }

        query += ` ORDER BY section_order ASC, sort_order ASC `

        const result = await pool.query(query, params)
        const allRows: MenuItemData[] = result.rows

        // Separar items principales y sub-ítems
        const parentItems = allRows.filter(r => !r.parent_item_key)
        const subItems = allRows.filter(r => !!r.parent_item_key)

        // Agrupar sub-ítems en sus respectivos padres
        const parentMap = new Map<string, MenuItemData>()
        for (const p of parentItems) {
            p.subItems = []
            parentMap.set(p.item_key, p)
        }

        for (const sub of subItems) {
            if (sub.parent_item_key && parentMap.has(sub.parent_item_key)) {
                parentMap.get(sub.parent_item_key)!.subItems!.push(sub)
            }
        }

        // Agrupar por secciones
        const sectionsMap = new Map<string, MenuSectionData>()
        for (const item of parentItems) {
            if (!sectionsMap.has(item.section_key)) {
                sectionsMap.set(item.section_key, {
                    key: item.section_key,
                    title: item.section_title,
                    order: item.section_order,
                    items: []
                })
            }
            sectionsMap.get(item.section_key)!.items.push(item)
        }

        const sections = Array.from(sectionsMap.values()).sort((a, b) => a.order - b.order)

        return NextResponse.json({
            success: true,
            data: {
                sections,
                rawItems: allRows
            }
        })
    } catch (error) {
        console.error('Error fetching admin menu:', error)
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 })
    }
}

/**
 * PUT /api/admin/menu
 * Actualizar orden, secciones y visibilidad de los elementos del menú en lote
 */
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json()
        const { items, tenant_id } = body

        if (!Array.isArray(items)) {
            return NextResponse.json({ success: false, error: 'Lista de ítems inválida' }, { status: 400 })
        }

        const client = await pool.connect()
        try {
            await client.query('BEGIN')

            for (const item of items) {
                await client.query(`
                    UPDATE navigation_menu_items
                    SET 
                        section_key = COALESCE($1, section_key),
                        section_title = COALESCE($2, section_title),
                        section_order = COALESCE($3, section_order),
                        sort_order = COALESCE($4, sort_order),
                        is_active = COALESCE($5, is_active),
                        updated_at = NOW()
                    WHERE item_key = $6 AND (tenant_id = $7 OR (tenant_id IS NULL AND $7 IS NULL))
                `, [
                    item.section_key,
                    item.section_title,
                    item.section_order,
                    item.sort_order,
                    item.is_active,
                    item.item_key,
                    tenant_id || null
                ])
            }

            await client.query('COMMIT')

            return NextResponse.json({
                success: true,
                message: 'Estructura del menú actualizada exitosamente'
            })
        } catch (err) {
            await client.query('ROLLBACK')
            throw err
        } finally {
            client.release()
        }
    } catch (error) {
        console.error('Error updating menu:', error)
        return NextResponse.json({
            success: false,
            error: (error as Error).message
        }, { status: 500 })
    }
}
