import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/crm/export
 * 
 * Exporta datos del CRM en formato CSV
 * Parámetros:
 *  - type: 'contacts' | 'interactions' | 'tasks' | 'pipeline'
 *  - stage: (opcional) filtrar por etapa pipeline
 *  - source: (opcional) filtrar por fuente
 *  - date_from / date_to: (opcional) rango de fechas
 */
export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const type = sp.get('type') || 'contacts'
        const stage = sp.get('stage')
        const source = sp.get('source')
        const dateFrom = sp.get('date_from')
        const dateTo = sp.get('date_to')

        let csvContent = ''
        let filename = ''

        switch (type) {
            case 'contacts': {
                const conditions: string[] = ["c.status = 'active'"]
                const params: (string | number)[] = []
                let paramIndex = 1

                if (stage) { conditions.push(`c.pipeline_stage = $${paramIndex++}`); params.push(stage) }
                if (source) { conditions.push(`c.source = $${paramIndex++}`); params.push(source) }
                if (dateFrom) { conditions.push(`c.created_at >= $${paramIndex++}`); params.push(dateFrom) }
                if (dateTo) { conditions.push(`c.created_at <= $${paramIndex++}`); params.push(dateTo) }

                const result = await query(`
          SELECT 
            c.id, c.full_name, c.email, c.phone, c.whatsapp,
            c.contact_type, c.source, c.pipeline_stage,
            c.lead_score, c.is_hot_lead,
            c.interested_destination, c.travel_dates_start, c.travel_dates_end,
            c.num_travelers, c.budget_min, c.budget_max, c.travel_type,
            c.total_bookings, c.total_quotes, c.ltv,
            c.days_in_stage, c.notes, c.tags,
            COALESCE(u.name, 'Sin asignar') AS assigned_agent,
            c.created_at, c.updated_at
          FROM crm_contacts c
          LEFT JOIN tenant_users tu ON c.assigned_agent_id = tu.id
          LEFT JOIN users u ON tu.user_id = u.id
          WHERE ${conditions.join(' AND ')}
          ORDER BY c.created_at DESC
        `, params)

                const headers = [
                    'ID', 'Nombre Completo', 'Email', 'Teléfono', 'WhatsApp',
                    'Tipo Contacto', 'Fuente', 'Etapa Pipeline',
                    'Score', 'Hot Lead',
                    'Destino Interesado', 'Fecha Inicio Viaje', 'Fecha Fin Viaje',
                    'Num Viajeros', 'Presupuesto Mín', 'Presupuesto Máx', 'Tipo Viaje',
                    'Total Reservas', 'Total Cotizaciones', 'LTV',
                    'Días en Etapa', 'Notas', 'Tags',
                    'Agente Asignado',
                    'Creado', 'Actualizado'
                ]

                csvContent = generateCSV(headers, result.rows.map(r => [
                    r.id, r.full_name, r.email || '', r.phone || '', r.whatsapp || '',
                    r.contact_type, r.source || '', r.pipeline_stage,
                    r.lead_score, r.is_hot_lead ? 'Sí' : 'No',
                    r.interested_destination || '', formatDate(r.travel_dates_start), formatDate(r.travel_dates_end),
                    r.num_travelers || '', r.budget_min || '', r.budget_max || '', r.travel_type || '',
                    r.total_bookings || 0, r.total_quotes || 0, r.ltv || 0,
                    r.days_in_stage || 0, cleanCSV(r.notes || ''), Array.isArray(r.tags) ? r.tags.join(', ') : '',
                    r.assigned_agent,
                    formatDateTime(r.created_at), formatDateTime(r.updated_at),
                ]))

                filename = `crm-contactos-${new Date().toISOString().slice(0, 10)}.csv`
                break
            }

            case 'interactions': {
                const conditions: string[] = ['1=1']
                const params: (string | number)[] = []
                let paramIndex = 1

                if (dateFrom) { conditions.push(`i.created_at >= $${paramIndex++}`); params.push(dateFrom) }
                if (dateTo) { conditions.push(`i.created_at <= $${paramIndex++}`); params.push(dateTo) }

                const result = await query(`
          SELECT 
            i.id, c.full_name AS contacto, i.interaction_type,
            i.subject, i.notes, i.outcome,
            i.channel, i.duration_minutes, i.is_automated,
            COALESCE(u.name, 'Sistema') AS realizado_por,
            i.created_at
          FROM crm_interactions i
          JOIN crm_contacts c ON i.contact_id = c.id
          LEFT JOIN users u ON i.performed_by = u.id
          WHERE ${conditions.join(' AND ')}
          ORDER BY i.created_at DESC
          LIMIT 5000
        `, params)

                const headers = [
                    'ID', 'Contacto', 'Tipo', 'Asunto', 'Notas', 'Resultado',
                    'Canal', 'Duración (min)', 'Automatizada', 'Realizado por', 'Fecha'
                ]

                csvContent = generateCSV(headers, result.rows.map(r => [
                    r.id, r.contacto, r.interaction_type,
                    cleanCSV(r.subject || ''), cleanCSV(r.notes || ''), r.outcome || '',
                    r.channel || '', r.duration_minutes || '', r.is_automated ? 'Sí' : 'No',
                    r.realizado_por, formatDateTime(r.created_at),
                ]))

                filename = `crm-interacciones-${new Date().toISOString().slice(0, 10)}.csv`
                break
            }

            case 'tasks': {
                const result = await query(`
          SELECT 
            t.id, c.full_name AS contacto, t.title,
            t.task_type, t.priority, t.status,
            t.due_date, t.completed_at,
            COALESCE(u.name, 'Sin asignar') AS asignado_a,
            t.notes, t.created_at
          FROM crm_tasks t
          LEFT JOIN crm_contacts c ON t.contact_id = c.id
          LEFT JOIN users u ON t.assigned_to = u.id
          ORDER BY t.due_date DESC
          LIMIT 5000
        `)

                const headers = [
                    'ID', 'Contacto', 'Título', 'Tipo', 'Prioridad', 'Estado',
                    'Fecha Vencimiento', 'Completado', 'Asignado a', 'Notas', 'Creado'
                ]

                csvContent = generateCSV(headers, result.rows.map(r => [
                    r.id, r.contacto || 'Sin contacto', cleanCSV(r.title),
                    r.task_type, r.priority, r.status,
                    formatDate(r.due_date), formatDateTime(r.completed_at),
                    r.asignado_a, cleanCSV(r.notes || ''), formatDateTime(r.created_at),
                ]))

                filename = `crm-tareas-${new Date().toISOString().slice(0, 10)}.csv`
                break
            }

            case 'pipeline': {
                const result = await query(`
          SELECT 
            pipeline_stage,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE is_hot_lead = true) AS hot_leads,
            ROUND(AVG(lead_score)::numeric, 1) AS avg_score,
            ROUND(AVG(days_in_stage)::numeric, 1) AS avg_days,
            COALESCE(SUM(COALESCE(budget_max, budget_min, 0)), 0) AS pipeline_value,
            COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) AS new_this_week
          FROM crm_contacts
          WHERE status = 'active'
          GROUP BY pipeline_stage
          ORDER BY
            CASE pipeline_stage
              WHEN 'new' THEN 1 WHEN 'qualified' THEN 2 WHEN 'interested' THEN 3
              WHEN 'quoted' THEN 4 WHEN 'negotiation' THEN 5 WHEN 'reserved' THEN 6
              WHEN 'paid' THEN 7 WHEN 'won' THEN 8 ELSE 9
            END
        `)

                const headers = [
                    'Etapa', 'Total', 'Hot Leads', 'Score Promedio',
                    'Días Promedio', 'Valor Pipeline', 'Nuevos esta Semana'
                ]

                csvContent = generateCSV(headers, result.rows.map(r => [
                    r.pipeline_stage, r.total, r.hot_leads, r.avg_score,
                    r.avg_days, r.pipeline_value, r.new_this_week,
                ]))

                filename = `crm-pipeline-${new Date().toISOString().slice(0, 10)}.csv`
                break
            }

            default:
                return NextResponse.json({ success: false, error: 'Tipo no válido' }, { status: 400 })
        }

        // BOM para UTF-8 en Excel
        const bom = '\uFEFF'

        return new NextResponse(bom + csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error('[CRM Export] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Error al exportar datos' },
            { status: 500 }
        )
    }
}

function generateCSV(headers: string[], rows: (string | number | boolean | null)[][]): string {
    const escape = (v: string | number | boolean | null) => {
        if (v === null || v === undefined) return ''
        const str = String(v)
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
        }
        return str
    }
    const lines = [headers.map(h => escape(h)).join(',')]
    for (const row of rows) {
        lines.push(row.map(v => escape(v)).join(','))
    }
    return lines.join('\n')
}

function formatDate(d: string | null): string {
    if (!d) return ''
    try { return new Date(d).toLocaleDateString('es-MX') } catch { return '' }
}

function formatDateTime(d: string | null): string {
    if (!d) return ''
    try { return new Date(d).toLocaleString('es-MX') } catch { return '' }
}

function cleanCSV(s: string): string {
    return s.replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ').trim()
}
