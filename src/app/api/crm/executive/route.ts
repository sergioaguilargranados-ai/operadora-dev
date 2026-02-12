import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/crm/executive
 * 
 * Dashboard ejecutivo con KPIs de agencia
 * Diseñado para gerentes y dueños de agencia
 * 
 * Parámetros:
 *   - period: 'today' | 'week' | 'month' | 'quarter' | 'year'
 *   - tenant_id: (opcional)
 */
export async function GET(request: NextRequest) {
    try {
        const sp = request.nextUrl.searchParams
        const period = sp.get('period') || 'month'
        const tenantFilter = sp.get('tenant_id') ? `AND tenant_id = ${parseInt(sp.get('tenant_id')!)}` : ''

        const periodFilter = getPeriodFilter(period)

        // Ejecutar todas las consultas en paralelo
        const [
            overview,
            pipelineValue,
            conversionMetrics,
            topAgents,
            topSources,
            revenueByMonth,
            stageDistribution,
            urgentItems,
            velocityAvg,
            activitySummary,
        ] = await Promise.all([
            // 1. Overview general
            query(`
        SELECT
          COUNT(*) AS total_contacts,
          COUNT(*) FILTER (WHERE ${periodFilter}) AS new_in_period,
          COUNT(*) FILTER (WHERE is_hot_lead = true) AS hot_leads,
          COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid')) AS converted,
          COUNT(*) FILTER (WHERE pipeline_stage = 'lost') AS lost,
          COALESCE(SUM(COALESCE(budget_max, budget_min, 0)) FILTER (WHERE pipeline_stage NOT IN ('lost')), 0) AS pipeline_value,
          COALESCE(SUM(COALESCE(budget_max, budget_min, 0)) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid')), 0) AS revenue_closed,
          ROUND(AVG(lead_score)::numeric, 1) AS avg_score,
          COUNT(*) FILTER (WHERE assigned_agent_id IS NULL AND pipeline_stage NOT IN ('won', 'lost')) AS unassigned
        FROM crm_contacts
        WHERE status = 'active' ${tenantFilter}
      `),

            // 2. Valor del pipeline por etapa
            query(`
        SELECT
          pipeline_stage,
          COUNT(*) AS count,
          COALESCE(SUM(COALESCE(budget_max, budget_min, 0)), 0) AS value
        FROM crm_contacts
        WHERE status = 'active' AND pipeline_stage NOT IN ('lost') ${tenantFilter}
        GROUP BY pipeline_stage
        ORDER BY
          CASE pipeline_stage
            WHEN 'new' THEN 1 WHEN 'qualified' THEN 2 WHEN 'interested' THEN 3
            WHEN 'quoted' THEN 4 WHEN 'negotiation' THEN 5 WHEN 'reserved' THEN 6
            WHEN 'paid' THEN 7 WHEN 'won' THEN 8 ELSE 9
          END
      `),

            // 3. Métricas de conversión
            query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid')) AS converted,
          CASE WHEN COUNT(*) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid'))::numeric / COUNT(*)::numeric * 100, 1)
            ELSE 0
          END AS conversion_rate,
          CASE WHEN COUNT(*) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE pipeline_stage = 'lost')::numeric / COUNT(*)::numeric * 100, 1)
            ELSE 0
          END AS loss_rate,
          COALESCE(ROUND(AVG(
            CASE WHEN pipeline_stage IN ('won', 'reserved', 'paid')
              THEN EXTRACT(EPOCH FROM (COALESCE(stage_changed_at, NOW()) - first_contact_at)) / 86400
            END
          )::numeric, 1), 0) AS avg_days_to_close
        FROM crm_contacts
        WHERE status = 'active' AND ${periodFilter} ${tenantFilter}
      `),

            // 4. Top 5 agentes
            query(`
        SELECT
          u.name AS agent_name,
          COUNT(DISTINCT c.id) AS total,
          COUNT(DISTINCT c.id) FILTER (WHERE c.pipeline_stage IN ('won', 'reserved', 'paid')) AS won,
          COALESCE(SUM(COALESCE(c.budget_max, c.budget_min, 0)) FILTER (WHERE c.pipeline_stage IN ('won', 'reserved', 'paid')), 0) AS revenue,
          CASE WHEN COUNT(DISTINCT c.id) > 0
            THEN ROUND(COUNT(DISTINCT c.id) FILTER (WHERE c.pipeline_stage IN ('won', 'reserved', 'paid'))::numeric / COUNT(DISTINCT c.id)::numeric * 100, 1)
            ELSE 0
          END AS conversion_rate
        FROM tenant_users tu
        JOIN users u ON tu.user_id = u.id
        LEFT JOIN crm_contacts c ON c.assigned_agent_id = tu.id AND c.status = 'active' ${tenantFilter}
        WHERE tu.role IN ('AGENT', 'AGENCY_ADMIN')
        GROUP BY tu.id, u.name
        HAVING COUNT(DISTINCT c.id) > 0
        ORDER BY won DESC, revenue DESC
        LIMIT 5
      `),

            // 5. Top fuentes de leads
            query(`
        SELECT
          COALESCE(source, 'Directo') AS source,
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid')) AS converted,
          CASE WHEN COUNT(*) > 0
            THEN ROUND(COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid'))::numeric / COUNT(*)::numeric * 100, 1)
            ELSE 0
          END AS conversion_rate
        FROM crm_contacts
        WHERE status = 'active' AND ${periodFilter} ${tenantFilter}
        GROUP BY source
        ORDER BY total DESC
        LIMIT 8
      `),

            // 6. Revenue por mes (últimos 6 meses)
            query(`
        SELECT
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') AS month,
          TO_CHAR(DATE_TRUNC('month', created_at), 'Mon') AS month_label,
          COUNT(*) AS new_contacts,
          COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid')) AS conversions,
          COALESCE(SUM(COALESCE(budget_max, budget_min, 0)) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid')), 0) AS revenue
        FROM crm_contacts
        WHERE status = 'active'
          AND created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '5 months'
          ${tenantFilter}
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month ASC
      `),

            // 7. Distribución por etapa (para pie chart)
            query(`
        SELECT pipeline_stage, COUNT(*) AS count
        FROM crm_contacts
        WHERE status = 'active' AND pipeline_stage NOT IN ('lost') ${tenantFilter}
        GROUP BY pipeline_stage
        ORDER BY count DESC
      `),

            // 8. Items urgentes
            query(`
        SELECT
          (SELECT COUNT(*) FROM crm_tasks WHERE status = 'pending' AND due_date < NOW()) AS overdue_tasks,
          (SELECT COUNT(*) FROM crm_contacts WHERE is_hot_lead = true AND pipeline_stage NOT IN ('won', 'lost') ${tenantFilter}) AS active_hot_leads,
          (SELECT COUNT(*) FROM crm_notifications WHERE is_read = false AND priority IN ('high', 'urgent')) AS urgent_notifications,
          (SELECT COUNT(*) FROM crm_contacts WHERE assigned_agent_id IS NULL AND pipeline_stage NOT IN ('won', 'lost') AND status = 'active' ${tenantFilter}) AS unassigned
      `),

            // 9. Velocidad promedio de cierre
            query(`
        SELECT
          COALESCE(ROUND(AVG(
            EXTRACT(EPOCH FROM (COALESCE(stage_changed_at, NOW()) - first_contact_at)) / 86400
          )::numeric, 1), 0) AS avg_days_to_close,
          COALESCE(ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY
            EXTRACT(EPOCH FROM (COALESCE(stage_changed_at, NOW()) - first_contact_at)) / 86400
          )::numeric, 1), 0) AS median_days_to_close
        FROM crm_contacts
        WHERE pipeline_stage IN ('won', 'reserved', 'paid')
          AND first_contact_at IS NOT NULL
          ${tenantFilter}
      `),

            // 10. Resumen de actividad del período
            query(`
        SELECT
          (SELECT COUNT(*) FROM crm_interactions WHERE ${periodFilter.replace('created_at', 'crm_interactions.created_at')}) AS total_interactions,
          (SELECT COUNT(*) FROM crm_tasks WHERE ${periodFilter.replace('created_at', 'crm_tasks.created_at')}) AS total_tasks_created,
          (SELECT COUNT(*) FROM crm_tasks WHERE status = 'completed' AND ${periodFilter.replace('created_at', 'completed_at')}) AS tasks_completed,
          (SELECT COUNT(*) FROM crm_contacts WHERE ${periodFilter} ${tenantFilter}) AS new_contacts
      `),
        ])

        return NextResponse.json({
            success: true,
            data: {
                period,
                overview: overview.rows[0],
                pipeline_by_stage: pipelineValue.rows,
                conversion_metrics: conversionMetrics.rows[0],
                top_agents: topAgents.rows,
                top_sources: topSources.rows,
                revenue_by_month: revenueByMonth.rows,
                stage_distribution: stageDistribution.rows,
                urgent_items: urgentItems.rows[0],
                velocity: velocityAvg.rows[0],
                activity_summary: activitySummary.rows[0],
            },
        })
    } catch (error) {
        console.error('[CRM Executive] Error:', error)
        return NextResponse.json(
            { success: false, error: 'Error al cargar dashboard ejecutivo' },
            { status: 500 }
        )
    }
}

function getPeriodFilter(period: string): string {
    switch (period) {
        case 'today': return "created_at >= CURRENT_DATE"
        case 'week': return "created_at >= DATE_TRUNC('week', CURRENT_DATE)"
        case 'month': return "created_at >= DATE_TRUNC('month', CURRENT_DATE)"
        case 'quarter': return "created_at >= DATE_TRUNC('quarter', CURRENT_DATE)"
        case 'year': return "created_at >= DATE_TRUNC('year', CURRENT_DATE)"
        default: return "created_at >= DATE_TRUNC('month', CURRENT_DATE)"
    }
}
