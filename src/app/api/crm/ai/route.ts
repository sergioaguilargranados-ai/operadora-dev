import { NextRequest, NextResponse } from 'next/server'
import { crmAIService } from '@/services/CRMAIService'

/**
 * GET /api/crm/ai
 * 
 * Endpoints de IA para el CRM:
 *  - action=insights&contact_id=X  → Insights del contacto
 *  - action=score&contact_id=X     → Scoring avanzado
 *  - action=script&contact_id=X&scenario=Y → Script de conversación
 *  - action=notification_summary&type=X&contact_id=Y → Resumen para notificación
 *  - action=batch_score             → Recalcular todos los scores
 */
export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const action = sp.get('action') || 'insights'
        const contactId = sp.get('contact_id') ? parseInt(sp.get('contact_id')!) : null

        switch (action) {
            case 'insights': {
                if (!contactId) return NextResponse.json({ success: false, error: 'contact_id requerido' }, { status: 400 })
                const insights = await crmAIService.generateContactInsights(contactId)
                return NextResponse.json({ success: true, data: insights })
            }

            case 'score': {
                if (!contactId) return NextResponse.json({ success: false, error: 'contact_id requerido' }, { status: 400 })
                const score = await crmAIService.calculateAdvancedScore(contactId)
                return NextResponse.json({ success: true, data: score })
            }

            case 'script': {
                if (!contactId) return NextResponse.json({ success: false, error: 'contact_id requerido' }, { status: 400 })
                const scenario = sp.get('scenario') || 'first_contact'
                const script = await crmAIService.generateTalkingScript(contactId, scenario)
                return NextResponse.json({ success: true, data: script })
            }

            case 'notification_summary': {
                if (!contactId) return NextResponse.json({ success: false, error: 'contact_id requerido' }, { status: 400 })
                const type = sp.get('type') || 'stage_changed'
                const summary = await crmAIService.generateNotificationSummary(type, contactId)
                return NextResponse.json({ success: true, data: summary })
            }

            case 'batch_score': {
                const result = await crmAIService.batchRecalculateScores()
                return NextResponse.json({ success: true, data: result })
            }

            default:
                return NextResponse.json({ success: false, error: 'Acción no válida' }, { status: 400 })
        }
    } catch (error) {
        console.error('[CRM-AI] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Error en servicio de IA' },
            { status: 500 }
        )
    }
}
