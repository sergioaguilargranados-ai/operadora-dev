/**
 * API: CRM Pipeline
 * GET — Vista Kanban del pipeline o métricas
 * v2.314
 */

import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const view = sp.get('view') || 'kanban' // kanban | metrics
        const tenantId = sp.get('tenant_id') ? parseInt(sp.get('tenant_id')!) : undefined

        if (view === 'metrics') {
            const dateRange = sp.get('start') && sp.get('end')
                ? { start: sp.get('start')!, end: sp.get('end')! }
                : undefined

            const metrics = await crmService.getPipelineMetrics(tenantId, dateRange)

            return NextResponse.json({
                success: true,
                data: metrics
            })
        }

        // Vista Kanban
        const pipeline = await crmService.getPipelineView({
            tenant_id: tenantId,
            agent_id: sp.get('agent_id') ? parseInt(sp.get('agent_id')!) : undefined,
            search: sp.get('search') || undefined,
        })

        return NextResponse.json({
            success: true,
            data: pipeline
        })
    } catch (error) {
        console.error('Error getting CRM pipeline:', error)
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        )
    }
}
