import { NextRequest, NextResponse } from 'next/server'
import { crmPredictiveService } from '@/services/CRMPredictiveService'

/**
 * GET /api/crm/predictive
 * 
 * Scoring predictivo del CRM
 * 
 * Params:
 *   action: 'predict' | 'top_predictions'
 *   contact_id: (requerido para predict)
 *   limit: (para top_predictions, default 20)
 */
export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const action = sp.get('action') || 'top_predictions'

        switch (action) {
            case 'predict': {
                const contactId = sp.get('contact_id')
                if (!contactId) {
                    return NextResponse.json({ success: false, error: 'contact_id requerido' }, { status: 400 })
                }
                const prediction = await crmPredictiveService.predictScore(parseInt(contactId))
                return NextResponse.json({ success: true, data: prediction })
            }

            case 'top_predictions': {
                const limit = parseInt(sp.get('limit') || '20')
                const predictions = await crmPredictiveService.getTopPredictions(limit)
                return NextResponse.json({ success: true, data: predictions })
            }

            default:
                return NextResponse.json({ success: false, error: `Acción no válida: ${action}` }, { status: 400 })
        }
    } catch (error) {
        console.error('[CRM Predictive]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}
