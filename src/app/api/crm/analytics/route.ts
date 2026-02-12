import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

/**
 * GET /api/crm/analytics
 * 
 * Parámetros:
 *  - view: 'overview' | 'funnel' | 'agents' | 'trends' | 'velocity' | 'sources'
 *  - days: número de días para tendencias (default 30)
 *  - tenant_id: opcional
 */
export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const view = sp.get('view') || 'overview'
        const tenantId = sp.get('tenant_id') ? parseInt(sp.get('tenant_id')!) : undefined
        const days = sp.get('days') ? parseInt(sp.get('days')!) : 30

        switch (view) {
            case 'overview': {
                const [kpis, sources, funnel] = await Promise.all([
                    crmService.getDashboardKPIs(tenantId),
                    crmService.getSourceDistribution(tenantId),
                    crmService.getConversionFunnel(tenantId),
                ])
                return NextResponse.json({
                    success: true,
                    data: { kpis, sources, funnel },
                })
            }

            case 'funnel': {
                const funnel = await crmService.getConversionFunnel(tenantId)
                return NextResponse.json({ success: true, data: funnel })
            }

            case 'agents': {
                const performance = await crmService.getAgentPerformance(tenantId)
                return NextResponse.json({ success: true, data: performance })
            }

            case 'trends': {
                const trends = await crmService.getTrendData(days, tenantId)
                return NextResponse.json({ success: true, data: trends })
            }

            case 'velocity': {
                const velocity = await crmService.getPipelineVelocity(tenantId)
                return NextResponse.json({ success: true, data: velocity })
            }

            case 'sources': {
                const sources = await crmService.getSourceDistribution(tenantId)
                return NextResponse.json({ success: true, data: sources })
            }

            default:
                return NextResponse.json({ success: false, error: 'Vista no válida' }, { status: 400 })
        }
    } catch (error) {
        console.error('Error en Analytics CRM:', error)
        return NextResponse.json(
            { success: false, error: 'Error al obtener analytics' },
            { status: 500 }
        )
    }
}
