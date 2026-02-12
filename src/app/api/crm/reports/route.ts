import { NextRequest, NextResponse } from 'next/server'
import { crmReportService } from '@/services/CRMReportService'

/**
 * GET /api/crm/reports
 * 
 * Genera reportes PDF (como HTML imprimible)
 * 
 * Parámetros:
 *   type: 'contact_profile' | 'pipeline' | 'agent_performance'
 *   contact_id: (requerido para contact_profile)
 *   period: 'today' | 'week' | 'month' | 'quarter' | 'year'
 *   format: 'html' (default) | 'json'
 */
export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const type = sp.get('type') || 'pipeline'
        const format = sp.get('format') || 'html'
        const period = sp.get('period') || 'month'
        const contactId = sp.get('contact_id')

        let html = ''

        switch (type) {
            case 'contact_profile': {
                if (!contactId) {
                    return NextResponse.json({ success: false, error: 'contact_id requerido' }, { status: 400 })
                }
                html = await crmReportService.generateContactProfile(parseInt(contactId))
                break
            }

            case 'pipeline': {
                html = await crmReportService.generatePipelineReport({ period })
                break
            }

            case 'agent_performance': {
                html = await crmReportService.generateAgentPerformance({ period })
                break
            }

            default:
                return NextResponse.json({ success: false, error: `Tipo no válido: ${type}` }, { status: 400 })
        }

        if (format === 'json') {
            return NextResponse.json({ success: true, data: { html, type, period } })
        }

        // Devolver HTML directamente (se abre en navegador para imprimir)
        return new NextResponse(html, {
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'no-cache',
            },
        })
    } catch (error) {
        console.error('[CRM Reports]', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
