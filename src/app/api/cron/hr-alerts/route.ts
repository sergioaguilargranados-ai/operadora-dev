import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

/**
 * API Cron: Alertas de Vencimiento para RRHH y Documentos de Clientes
 * 
 * Endpoint diseñado para ser llamado por:
 *  - Vercel Cron Jobs (vercel.json → cron schedule)
 *  - Llamada manual desde admin panel
 *  - Webhook externo
 * 
 * GET /api/cron/hr-alerts → Ejecuta la revisión y genera alertas
 * 
 * Protección: requiere header x-cron-secret o query param secret
 */

const CRON_SECRET = process.env.CRON_SECRET || process.env.API_SECRET || 'hr-alerts-2026'

export async function GET(request: NextRequest) {
    try {
        // Verificar autenticación del cron
        const secret = request.headers.get('x-cron-secret') ||
            request.nextUrl.searchParams.get('secret') ||
            request.headers.get('authorization')?.replace('Bearer ', '')

        if (secret !== CRON_SECRET && process.env.NODE_ENV === 'production') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const sql = neon(process.env.DATABASE_URL!)
        const alerts: any[] = []
        const now = new Date().toISOString()

        // ═══════════════════════════════════════
        // 1. CONTRATOS POR VENCER (próximos 30 días)
        // ═══════════════════════════════════════
        try {
            const expiringContracts = await sql`
                SELECT 
                    c.id, c.contract_type, c.end_date, c.status,
                    e.first_name, e.last_name, e.email, e.employee_type,
                    e.tenant_id,
                    (c.end_date - CURRENT_DATE) AS days_remaining
                FROM hr_contracts c
                JOIN hr_employees e ON c.employee_id = e.id
                WHERE c.status = 'active'
                    AND c.end_date IS NOT NULL
                    AND c.end_date <= CURRENT_DATE + INTERVAL '30 days'
                    AND c.end_date >= CURRENT_DATE
                ORDER BY c.end_date ASC
            `

            for (const contract of expiringContracts) {
                const urgency = contract.days_remaining <= 7 ? 'critical' :
                    contract.days_remaining <= 15 ? 'high' : 'medium'

                alerts.push({
                    type: 'contract_expiring',
                    urgency,
                    entity_type: 'contract',
                    entity_id: contract.id,
                    tenant_id: contract.tenant_id,
                    title: `Contrato por vencer: ${contract.first_name} ${contract.last_name}`,
                    message: `El contrato ${contract.contract_type} vence en ${contract.days_remaining} días (${contract.end_date})`,
                    employee_name: `${contract.first_name} ${contract.last_name}`,
                    employee_email: contract.email,
                    days_remaining: contract.days_remaining,
                })

                // Registrar en audit log
                await sql`
                    INSERT INTO hr_audit_log (tenant_id, employee_id, action, entity_type, entity_id, description)
                    SELECT ${contract.tenant_id}, c.employee_id, 'contract_expiry_alert', 'contract', ${contract.id},
                        ${'Alerta automática: contrato vence en ' + contract.days_remaining + ' días'}
                    FROM hr_contracts c WHERE c.id = ${contract.id}
                    ON CONFLICT DO NOTHING
                `
            }
        } catch (e: any) {
            console.error('Error checking contracts:', e.message)
        }

        // ═══════════════════════════════════════
        // 2. LICENCIAS DE AGENTE POR VENCER (próximos 60 días)
        // ═══════════════════════════════════════
        try {
            const expiringLicenses = await sql`
                SELECT 
                    id, first_name, last_name, email, tenant_id,
                    agent_license_number, agent_license_expiry,
                    (agent_license_expiry - CURRENT_DATE) AS days_remaining
                FROM hr_employees
                WHERE employee_type = 'agent'
                    AND agent_license_expiry IS NOT NULL
                    AND agent_license_expiry <= CURRENT_DATE + INTERVAL '60 days'
                    AND agent_license_expiry >= CURRENT_DATE
                    AND employment_status = 'active'
                ORDER BY agent_license_expiry ASC
            `

            for (const agent of expiringLicenses) {
                const urgency = agent.days_remaining <= 15 ? 'critical' :
                    agent.days_remaining <= 30 ? 'high' : 'medium'

                alerts.push({
                    type: 'license_expiring',
                    urgency,
                    entity_type: 'employee',
                    entity_id: agent.id,
                    tenant_id: agent.tenant_id,
                    title: `Licencia por vencer: ${agent.first_name} ${agent.last_name}`,
                    message: `La licencia ${agent.agent_license_number} vence en ${agent.days_remaining} días`,
                    employee_name: `${agent.first_name} ${agent.last_name}`,
                    employee_email: agent.email,
                    days_remaining: agent.days_remaining,
                })
            }
        } catch (e: any) {
            console.error('Error checking licenses:', e.message)
        }

        // ═══════════════════════════════════════
        // 3. DOCUMENTOS DE EMPLEADOS POR VENCER (próximos 30 días)
        // ═══════════════════════════════════════
        try {
            const expiringDocs = await sql`
                SELECT 
                    d.id, d.document_type, d.expiry_date, d.file_name,
                    e.first_name, e.last_name, e.email, e.tenant_id,
                    (d.expiry_date - CURRENT_DATE) AS days_remaining
                FROM hr_employee_documents d
                JOIN hr_employees e ON d.employee_id = e.id
                WHERE d.deleted_at IS NULL
                    AND d.expiry_date IS NOT NULL
                    AND d.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
                    AND d.expiry_date >= CURRENT_DATE - INTERVAL '7 days'
                ORDER BY d.expiry_date ASC
            `

            for (const doc of expiringDocs) {
                const isExpired = doc.days_remaining < 0
                alerts.push({
                    type: isExpired ? 'document_expired' : 'document_expiring',
                    urgency: isExpired ? 'critical' : doc.days_remaining <= 7 ? 'high' : 'medium',
                    entity_type: 'employee_document',
                    entity_id: doc.id,
                    tenant_id: doc.tenant_id,
                    title: `Documento ${isExpired ? 'vencido' : 'por vencer'}: ${doc.document_type}`,
                    message: `${doc.file_name} de ${doc.first_name} ${doc.last_name} — ${isExpired ? 'venció hace' : 'vence en'} ${Math.abs(doc.days_remaining)} días`,
                    employee_name: `${doc.first_name} ${doc.last_name}`,
                    employee_email: doc.email,
                    days_remaining: doc.days_remaining,
                })
            }
        } catch (e: any) {
            console.error('Error checking employee docs:', e.message)
        }

        // ═══════════════════════════════════════
        // 4. DOCUMENTOS DE CLIENTES POR VENCER (próximos 30 días)
        // ═══════════════════════════════════════
        try {
            const expiringClientDocs = await sql`
                SELECT 
                    d.id, d.document_type, d.expiry_date, d.file_name, d.tenant_id,
                    ac.client_name, ac.client_email,
                    (d.expiry_date - CURRENT_DATE) AS days_remaining
                FROM documents d
                LEFT JOIN agency_clients ac ON d.agency_client_id = ac.id
                WHERE d.deleted_at IS NULL
                    AND d.agency_client_id IS NOT NULL
                    AND d.expiry_date IS NOT NULL
                    AND d.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
                    AND d.expiry_date >= CURRENT_DATE - INTERVAL '7 days'
                ORDER BY d.expiry_date ASC
            `

            for (const doc of expiringClientDocs) {
                const isExpired = doc.days_remaining < 0
                alerts.push({
                    type: isExpired ? 'client_document_expired' : 'client_document_expiring',
                    urgency: isExpired ? 'critical' : doc.days_remaining <= 7 ? 'high' : 'medium',
                    entity_type: 'client_document',
                    entity_id: doc.id,
                    tenant_id: doc.tenant_id,
                    title: `Doc cliente ${isExpired ? 'vencido' : 'por vencer'}: ${doc.document_type}`,
                    message: `${doc.file_name} de ${doc.client_name || 'Cliente'} — ${isExpired ? 'venció hace' : 'vence en'} ${Math.abs(doc.days_remaining)} días`,
                    client_name: doc.client_name,
                    client_email: doc.client_email,
                    days_remaining: doc.days_remaining,
                })
            }
        } catch (e: any) {
            console.error('Error checking client docs:', e.message)
        }

        // ═══════════════════════════════════════
        // 5. SOLICITUDES DE AUSENCIA PENDIENTES (más de 48h sin respuesta)
        // ═══════════════════════════════════════
        try {
            const pendingLeaves = await sql`
                SELECT 
                    lr.id, lr.leave_type, lr.start_date, lr.total_days,
                    lr.created_at, lr.tenant_id,
                    e.first_name, e.last_name, e.email,
                    EXTRACT(EPOCH FROM (NOW() - lr.created_at)) / 3600 AS hours_pending
                FROM hr_leave_requests lr
                JOIN hr_employees e ON lr.employee_id = e.id
                WHERE lr.status = 'pending'
                    AND lr.created_at < NOW() - INTERVAL '48 hours'
                ORDER BY lr.created_at ASC
            `

            for (const leave of pendingLeaves) {
                alerts.push({
                    type: 'leave_pending_review',
                    urgency: Math.round(leave.hours_pending) > 96 ? 'high' : 'medium',
                    entity_type: 'leave_request',
                    entity_id: leave.id,
                    tenant_id: leave.tenant_id,
                    title: `Ausencia pendiente: ${leave.first_name} ${leave.last_name}`,
                    message: `Solicitud de ${leave.leave_type} (${leave.total_days} días) pendiente hace ${Math.round(leave.hours_pending)}h`,
                    employee_name: `${leave.first_name} ${leave.last_name}`,
                    employee_email: leave.email,
                    hours_pending: Math.round(leave.hours_pending),
                })
            }
        } catch (e: any) {
            console.error('Error checking leaves:', e.message)
        }

        // ═══════════════════════════════════════
        // 6. EMPLEADOS EN PERÍODO DE PRUEBA A PUNTO DE TERMINAR
        // ═══════════════════════════════════════
        try {
            const probationEnding = await sql`
                SELECT 
                    e.id, e.first_name, e.last_name, e.email, e.tenant_id,
                    c.end_date,
                    (c.end_date - CURRENT_DATE) AS days_remaining
                FROM hr_employees e
                JOIN hr_contracts c ON c.employee_id = e.id
                WHERE e.employment_status = 'probation'
                    AND c.contract_type = 'probation'
                    AND c.status = 'active'
                    AND c.end_date IS NOT NULL
                    AND c.end_date <= CURRENT_DATE + INTERVAL '15 days'
                    AND c.end_date >= CURRENT_DATE
                ORDER BY c.end_date ASC
            `

            for (const emp of probationEnding) {
                alerts.push({
                    type: 'probation_ending',
                    urgency: emp.days_remaining <= 5 ? 'critical' : 'high',
                    entity_type: 'employee',
                    entity_id: emp.id,
                    tenant_id: emp.tenant_id,
                    title: `Período de prueba termina: ${emp.first_name} ${emp.last_name}`,
                    message: `Decidir contratación definitiva — quedan ${emp.days_remaining} días`,
                    employee_name: `${emp.first_name} ${emp.last_name}`,
                    employee_email: emp.email,
                    days_remaining: emp.days_remaining,
                })
            }
        } catch (e: any) {
            console.error('Error checking probation:', e.message)
        }

        // Agrupar por urgencia
        const summary = {
            total: alerts.length,
            critical: alerts.filter(a => a.urgency === 'critical').length,
            high: alerts.filter(a => a.urgency === 'high').length,
            medium: alerts.filter(a => a.urgency === 'medium').length,
            by_type: {
                contract_expiring: alerts.filter(a => a.type === 'contract_expiring').length,
                license_expiring: alerts.filter(a => a.type === 'license_expiring').length,
                document_expiring: alerts.filter(a => a.type.includes('document')).length,
                leave_pending: alerts.filter(a => a.type === 'leave_pending_review').length,
                probation_ending: alerts.filter(a => a.type === 'probation_ending').length,
            },
            executed_at: now,
        }

        return NextResponse.json({
            success: true,
            summary,
            alerts: alerts.sort((a, b) => {
                const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2 }
                return (urgencyOrder[a.urgency] || 3) - (urgencyOrder[b.urgency] || 3)
            }),
        })

    } catch (error: any) {
        console.error('Cron HR Alerts Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message,
        }, { status: 500 })
    }
}
