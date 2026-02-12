import { NextRequest, NextResponse } from 'next/server'
import { crmEscalationService } from '@/services/CRMEscalationService'

/**
 * POST /api/crm/escalation
 * Ejecuta un ciclo de escalación manualmente (o por cron)
 */
export async function POST(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const secret = sp.get('secret')

        // Simple auth check for cron calls
        const expectedSecret = process.env.CRM_WEBHOOK_SECRET || process.env.WEBHOOK_INTERNAL_SECRET || 'as-operadora-crm-2026'
        if (secret && secret !== expectedSecret) {
            return NextResponse.json({ success: false, error: 'Invalid secret' }, { status: 403 })
        }

        const result = await crmEscalationService.runEscalationCycle()

        return NextResponse.json({
            success: true,
            data: result,
            message: `Escalation cycle complete: ${result.escalated} escalated, ${result.hot_leads_notified} hot leads, ${result.stale_contacts_flagged} stale, ${result.overdue_tasks_escalated} overdue tasks`,
        })
    } catch (error) {
        console.error('[CRM Escalation] Error:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
