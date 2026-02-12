/**
 * API: CRM Dashboard
 * GET — KPIs, métricas y actividad reciente del CRM
 * v2.314
 */

import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const tenantId = sp.get('tenant_id') ? parseInt(sp.get('tenant_id')!) : undefined

        const [kpis, sources, recentActivity, hotLeads, stages] = await Promise.all([
            crmService.getDashboardKPIs(tenantId),
            crmService.getSourceDistribution(tenantId),
            crmService.getRecentActivity(tenantId, 15),
            crmService.getHotLeads(tenantId, 10),
            crmService.getPipelineStages(tenantId),
        ])

        return NextResponse.json({
            success: true,
            data: {
                kpis,
                sources,
                recent_activity: recentActivity,
                hot_leads: hotLeads,
                pipeline_stages: stages,
            }
        })
    } catch (error) {
        console.error('Error getting CRM dashboard:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
