import { NextRequest, NextResponse } from 'next/server'
import { crmService } from '@/services/CRMService'

/**
 * GET /api/crm/stats
 * Métricas de KPIs del CRM para panel de agencias
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams
    const tenantId = sp.get('tenant_id') || sp.get('tenantId') || sp.get('agency_id')
    const tId = tenantId ? parseInt(tenantId) : undefined

    const [kpis, sources] = await Promise.all([
      crmService.getDashboardKPIs(tId),
      crmService.getSourceDistribution(tId),
    ])

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        sources,
        totalContacts: kpis.total_contacts,
        activeLeads: kpis.active_leads,
        pipelineValue: kpis.pipeline_value,
        conversionRate: kpis.conversion_rate,
        overdueTasks: kpis.overdue_tasks,
      }
    })
  } catch (error: any) {
    console.error('Error in /api/crm/stats:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
