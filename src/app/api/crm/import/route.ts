import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * POST /api/crm/import
 * 
 * Importa contactos desde CSV. 
 * Espera un body JSON con { rows: [...], mapping: {...}, options: {...} }
 * 
 * El frontend se encarga de parsear el CSV y enviarlo como JSON.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { rows, mapping, options } = body

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ success: false, error: 'No hay filas para importar' }, { status: 400 })
        }

        if (!mapping || typeof mapping !== 'object') {
            return NextResponse.json({ success: false, error: 'Mapeo de columnas requerido' }, { status: 400 })
        }

        const skipDuplicates = options?.skip_duplicates !== false
        const defaultSource = options?.default_source || 'csv_import'
        const defaultStage = options?.default_stage || 'new'
        const defaultContactType = options?.default_contact_type || 'lead'

        let imported = 0
        let skipped = 0
        let errors: { row: number; error: string }[] = []

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i]
            try {
                const fullName = getField(row, mapping.full_name)
                if (!fullName || fullName.trim().length === 0) {
                    errors.push({ row: i + 1, error: 'Nombre completo vacío' })
                    skipped++
                    continue
                }

                const email = getField(row, mapping.email) || null
                const phone = getField(row, mapping.phone) || null

                // Verificar duplicado por email
                if (skipDuplicates && email) {
                    const existing = await query(
                        `SELECT id FROM crm_contacts WHERE email = $1 AND status = 'active' LIMIT 1`,
                        [email]
                    )
                    if (existing.rows.length > 0) {
                        skipped++
                        continue
                    }
                }

                // Verificar duplicado por teléfono
                if (skipDuplicates && phone && !email) {
                    const existing = await query(
                        `SELECT id FROM crm_contacts WHERE phone = $1 AND status = 'active' LIMIT 1`,
                        [phone]
                    )
                    if (existing.rows.length > 0) {
                        skipped++
                        continue
                    }
                }

                await query(`
          INSERT INTO crm_contacts (
            full_name, email, phone, whatsapp,
            contact_type, source, pipeline_stage,
            interested_destination, num_travelers,
            budget_min, budget_max, travel_type,
            notes, tags,
            lead_score, is_hot_lead, days_in_stage,
            first_contact_at, stage_changed_at,
            created_at, updated_at
          ) VALUES (
            $1, $2, $3, $4,
            $5, $6, $7,
            $8, $9,
            $10, $11, $12,
            $13, $14,
            0, false, 0,
            NOW(), NOW(),
            NOW(), NOW()
          )
        `, [
                    fullName.trim(),
                    email?.trim() || null,
                    phone?.trim() || null,
                    getField(row, mapping.whatsapp)?.trim() || phone?.trim() || null,
                    getField(row, mapping.contact_type) || defaultContactType,
                    getField(row, mapping.source) || defaultSource,
                    getField(row, mapping.pipeline_stage) || defaultStage,
                    getField(row, mapping.interested_destination) || null,
                    parseInt(getField(row, mapping.num_travelers) || '0') || null,
                    parseFloat(getField(row, mapping.budget_min) || '0') || null,
                    parseFloat(getField(row, mapping.budget_max) || '0') || null,
                    getField(row, mapping.travel_type) || null,
                    getField(row, mapping.notes) || null,
                    getField(row, mapping.tags) ? `{${getField(row, mapping.tags)}}` : '{}',
                ])

                imported++
            } catch (err: unknown) {
                const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
                errors.push({ row: i + 1, error: errorMsg })
                skipped++
            }
        }

        // Limitar errores a 20 para no saturar la respuesta
        if (errors.length > 20) {
            errors = errors.slice(0, 20)
        }

        return NextResponse.json({
            success: true,
            data: {
                total_rows: rows.length,
                imported,
                skipped,
                errors,
            }
        })
    } catch (error) {
        console.error('[CRM Import] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Error al importar contactos' },
            { status: 500 }
        )
    }
}

function getField(row: Record<string, string>, columnName?: string): string | null {
    if (!columnName || columnName === '_skip') return null
    return row[columnName] || null
}
