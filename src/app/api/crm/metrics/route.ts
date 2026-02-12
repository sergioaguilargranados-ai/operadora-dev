import { NextRequest, NextResponse } from 'next/server'
import { crmCampaignMetricsService } from '@/services/CRMCampaignMetricsService'

/**
 * GET /api/crm/metrics
 *   action=summary -> resumen de todas las campañas
 *   action=campaign&campaign_id=xxx -> métricas de una campaña
 *   action=timeline -> timeline últimos 30 días
 *   action=abtests -> listar A/B tests
 *   action=evaluate_ab&test_id=xxx -> evaluar un A/B test
 * 
 * POST /api/crm/metrics
 *   action=register -> registrar envío de campaña
 *   action=create_abtest -> crear A/B test
 */

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const action = sp.get('action') || 'summary'

        switch (action) {
            case 'summary': {
                const summary = await crmCampaignMetricsService.getCampaignsSummary()
                return NextResponse.json({ success: true, data: summary })
            }

            case 'campaign': {
                const campaignId = sp.get('campaign_id')
                if (!campaignId) return NextResponse.json({ success: false, error: 'campaign_id requerido' }, { status: 400 })
                const metrics = await crmCampaignMetricsService.getCampaignMetrics(campaignId)
                return NextResponse.json({ success: true, data: metrics })
            }

            case 'timeline': {
                const timeline = await crmCampaignMetricsService.getTimelineMetrics()
                return NextResponse.json({ success: true, data: timeline })
            }

            case 'abtests': {
                const tests = await crmCampaignMetricsService.getABTests()
                return NextResponse.json({ success: true, data: tests })
            }

            case 'evaluate_ab': {
                const testId = sp.get('test_id')
                if (!testId) return NextResponse.json({ success: false, error: 'test_id requerido' }, { status: 400 })
                const result = await crmCampaignMetricsService.evaluateABTest(parseInt(testId))
                return NextResponse.json({ success: true, data: result })
            }

            default:
                return NextResponse.json({ success: false, error: `Acción no válida: ${action}` }, { status: 400 })
        }
    } catch (error) {
        console.error('[CRM Metrics]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { action } = body

        switch (action) {
            case 'register': {
                await crmCampaignMetricsService.registerCampaignSend(
                    body.campaign_id,
                    body.template_id,
                    body.template_name,
                    body.contact_ids || [],
                    body.sent_count || 0,
                    body.failed_count || 0
                )
                return NextResponse.json({ success: true })
            }

            case 'create_abtest': {
                const id = await crmCampaignMetricsService.createABTest(body.config)
                return NextResponse.json({ success: true, data: { id } })
            }

            default:
                return NextResponse.json({ success: false, error: `Acción no válida: ${action}` }, { status: 400 })
        }
    } catch (error) {
        console.error('[CRM Metrics]', error)
        return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
    }
}
