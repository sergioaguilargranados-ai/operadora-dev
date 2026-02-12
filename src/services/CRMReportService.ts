/**
 * CRM PDF Report Service
 * 
 * Genera reportes PDF del CRM en formato HTML-to-PDF.
 * Soporta múltiples tipos de reporte:
 *   - contact_profile: Perfil 360° del contacto
 *   - pipeline_report: Reporte de pipeline
 *   - agent_performance: Rendimiento de agentes
 *   - executive_summary: Resumen ejecutivo
 * 
 * Los reportes se generan como HTML estilizado que puede ser
 * impreso como PDF usando window.print() o convertido server-side.
 */

import { query } from '@/lib/db'

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

interface ReportOptions {
    period?: string
    tenant_id?: number
    contact_id?: number
    date_from?: string
    date_to?: string
}

// ═══════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════

class CRMReportService {

    /**
     * Generar reporte de perfil de contacto
     */
    async generateContactProfile(contactId: number): Promise<string> {
        const contactRes = await query(`
      SELECT c.*,
        (SELECT COUNT(*) FROM crm_interactions WHERE contact_id = c.id) AS interaction_count,
        (SELECT COUNT(*) FROM crm_tasks WHERE contact_id = c.id) AS task_count,
        (SELECT COUNT(*) FROM crm_tasks WHERE contact_id = c.id AND status = 'completed') AS tasks_completed
      FROM crm_contacts c WHERE c.id = $1
    `, [contactId])

        if (contactRes.rows.length === 0) return this.errorPage('Contacto no encontrado')
        const c = contactRes.rows[0]

        const interactions = await query(`
      SELECT interaction_type, subject, outcome, channel, created_at
      FROM crm_interactions
      WHERE contact_id = $1
      ORDER BY created_at DESC LIMIT 10
    `, [contactId])

        const tasks = await query(`
      SELECT title, task_type, status, priority, due_date
      FROM crm_tasks
      WHERE contact_id = $1
      ORDER BY created_at DESC LIMIT 10
    `, [contactId])

        const signals = typeof c.score_signals === 'string' ? JSON.parse(c.score_signals || '{}') : (c.score_signals || {})

        return this.wrapHTML(`Perfil — ${c.full_name}`, `
      <div class="header" style="background:linear-gradient(135deg,#0066FF,#4F46E5);">
        <h1>👤 Perfil del Contacto</h1>
        <p>${c.full_name}</p>
      </div>

      <div class="section">
        <h2>📋 Datos Generales</h2>
        <table class="data-table">
          <tr><td><strong>Nombre</strong></td><td>${c.full_name}</td></tr>
          <tr><td><strong>Email</strong></td><td>${c.email || '—'}</td></tr>
          <tr><td><strong>Teléfono</strong></td><td>${c.phone || '—'}</td></tr>
          <tr><td><strong>WhatsApp</strong></td><td>${c.whatsapp || '—'}</td></tr>
          <tr><td><strong>Tipo</strong></td><td>${c.contact_type === 'client' ? 'Cliente' : 'Lead'}</td></tr>
          <tr><td><strong>Fuente</strong></td><td>${c.source || '—'}</td></tr>
          <tr><td><strong>Etapa</strong></td><td>${c.pipeline_stage}</td></tr>
          <tr><td><strong>Score</strong></td><td><span class="score">${c.lead_score}</span></td></tr>
          <tr><td><strong>Hot Lead</strong></td><td>${c.is_hot_lead ? '🔥 Sí' : 'No'}</td></tr>
        </table>
      </div>

      <div class="section">
        <h2>✈️ Datos de Viaje</h2>
        <table class="data-table">
          <tr><td><strong>Destino</strong></td><td>${c.interested_destination || '—'}</td></tr>
          <tr><td><strong>Tipo de viaje</strong></td><td>${c.travel_type || '—'}</td></tr>
          <tr><td><strong>Viajeros</strong></td><td>${c.num_travelers || '—'}</td></tr>
          <tr><td><strong>Fechas</strong></td><td>${c.travel_dates_start ? this.fmtDate(c.travel_dates_start) : '—'} — ${c.travel_dates_end ? this.fmtDate(c.travel_dates_end) : '—'}</td></tr>
          <tr><td><strong>Presupuesto</strong></td><td>${c.budget_min || c.budget_max ? `$${c.budget_min || 0} - $${c.budget_max || 0}` : '—'}</td></tr>
        </table>
      </div>

      ${Object.keys(signals).length > 0 ? `
      <div class="section">
        <h2>📊 Señales de Score</h2>
        <div class="signals">
          ${Object.entries(signals).map(([k, v]) => `<span class="signal">${k}: <strong>${v}</strong></span>`).join(' ')}
        </div>
      </div>` : ''}

      <div class="section">
        <h2>💬 Últimas Interacciones (${c.interaction_count})</h2>
        ${interactions.rows.length > 0 ? `
        <table class="full-table">
          <thead><tr><th>Tipo</th><th>Asunto</th><th>Resultado</th><th>Canal</th><th>Fecha</th></tr></thead>
          <tbody>
            ${interactions.rows.map((i: Record<string, unknown>) => `
              <tr>
                <td>${i.interaction_type || ''}</td>
                <td>${i.subject || '—'}</td>
                <td>${i.outcome || '—'}</td>
                <td>${i.channel || '—'}</td>
                <td>${this.fmtDate(i.created_at as string)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>` : '<p class="empty">Sin interacciones registradas</p>'}
      </div>

      <div class="section">
        <h2>✅ Tareas (${c.task_count} total, ${c.tasks_completed} completadas)</h2>
        ${tasks.rows.length > 0 ? `
        <table class="full-table">
          <thead><tr><th>Título</th><th>Tipo</th><th>Estado</th><th>Prioridad</th><th>Vencimiento</th></tr></thead>
          <tbody>
            ${tasks.rows.map((t: Record<string, unknown>) => `
              <tr>
                <td>${t.title || ''}</td>
                <td>${t.task_type || ''}</td>
                <td>${t.status || ''}</td>
                <td>${t.priority || ''}</td>
                <td>${t.due_date ? this.fmtDate(t.due_date as string) : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>` : '<p class="empty">Sin tareas</p>'}
      </div>

      <div class="footer-note">
        Reporte generado el ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} — AS Operadora CRM
      </div>
    `)
    }

    /**
     * Generar reporte de pipeline
     */
    async generatePipelineReport(options: ReportOptions = {}): Promise<string> {
        const periodFilter = this.getPeriodSQL(options.period || 'month')

        const stageData = await query(`
      SELECT pipeline_stage, COUNT(*) AS count,
        COALESCE(SUM(COALESCE(budget_max, budget_min, 0)), 0) AS value,
        ROUND(AVG(lead_score)::numeric, 1) AS avg_score,
        ROUND(AVG(days_in_stage)::numeric, 1) AS avg_days
      FROM crm_contacts
      WHERE status = 'active' AND pipeline_stage NOT IN ('lost')
      GROUP BY pipeline_stage
      ORDER BY CASE pipeline_stage
        WHEN 'new' THEN 1 WHEN 'qualified' THEN 2 WHEN 'interested' THEN 3
        WHEN 'quoted' THEN 4 WHEN 'negotiation' THEN 5 WHEN 'reserved' THEN 6
        WHEN 'paid' THEN 7 WHEN 'won' THEN 8 ELSE 9
      END
    `)

        const overview = await query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE ${periodFilter}) AS new_in_period,
        COUNT(*) FILTER (WHERE pipeline_stage IN ('won', 'reserved', 'paid')) AS converted,
        COUNT(*) FILTER (WHERE pipeline_stage = 'lost') AS lost,
        COALESCE(SUM(COALESCE(budget_max, budget_min, 0)) FILTER (WHERE pipeline_stage NOT IN ('lost')), 0) AS total_value
      FROM crm_contacts WHERE status = 'active'
    `)

        const ov = overview.rows[0]

        return this.wrapHTML('Reporte de Pipeline', `
      <div class="header" style="background:linear-gradient(135deg,#059669,#10B981);">
        <h1>📊 Reporte de Pipeline</h1>
        <p>Período: ${options.period || 'mes actual'}</p>
      </div>

      <div class="section">
        <h2>🔢 Resumen General</h2>
        <div class="kpi-grid">
          <div class="kpi"><div class="kpi-value">${ov.total}</div><div class="kpi-label">Total contactos</div></div>
          <div class="kpi"><div class="kpi-value">${ov.new_in_period}</div><div class="kpi-label">Nuevos en período</div></div>
          <div class="kpi"><div class="kpi-value">${ov.converted}</div><div class="kpi-label">Convertidos</div></div>
          <div class="kpi"><div class="kpi-value">${ov.lost}</div><div class="kpi-label">Perdidos</div></div>
          <div class="kpi"><div class="kpi-value">$${Math.round(parseFloat(ov.total_value) || 0).toLocaleString('es-MX')}</div><div class="kpi-label">Valor total pipeline</div></div>
        </div>
      </div>

      <div class="section">
        <h2>🔄 Detalle por Etapa</h2>
        <table class="full-table">
          <thead><tr><th>Etapa</th><th>Contactos</th><th>Valor</th><th>Score Prom.</th><th>Días Prom.</th></tr></thead>
          <tbody>
            ${stageData.rows.map((s: Record<string, unknown>) => `
              <tr>
                <td><strong>${s.pipeline_stage}</strong></td>
                <td>${s.count}</td>
                <td>$${Math.round(parseFloat(String(s.value)) || 0).toLocaleString('es-MX')}</td>
                <td>${s.avg_score}</td>
                <td>${s.avg_days}d</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer-note">
        Reporte generado el ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} — AS Operadora CRM
      </div>
    `)
    }

    /**
     * Generar reporte de rendimiento de agentes
     */
    async generateAgentPerformance(options: ReportOptions = {}): Promise<string> {
        const agents = await query(`
      SELECT
        u.name AS agent_name,
        COUNT(DISTINCT c.id) AS total_contacts,
        COUNT(DISTINCT c.id) FILTER (WHERE c.pipeline_stage IN ('won', 'reserved', 'paid')) AS won,
        COUNT(DISTINCT c.id) FILTER (WHERE c.pipeline_stage = 'lost') AS lost,
        COALESCE(SUM(COALESCE(c.budget_max, c.budget_min, 0)) FILTER (WHERE c.pipeline_stage IN ('won', 'reserved', 'paid')), 0) AS revenue,
        ROUND(AVG(c.lead_score)::numeric, 1) AS avg_score,
        (SELECT COUNT(*) FROM crm_interactions i JOIN crm_contacts cc ON i.contact_id = cc.id WHERE cc.assigned_agent_id = tu.id) AS total_interactions,
        (SELECT COUNT(*) FROM crm_tasks t WHERE t.assigned_to = tu.id AND t.status = 'completed') AS tasks_completed
      FROM tenant_users tu
      JOIN users u ON tu.user_id = u.id
      LEFT JOIN crm_contacts c ON c.assigned_agent_id = tu.id AND c.status = 'active'
      WHERE tu.role IN ('AGENT', 'AGENCY_ADMIN')
      GROUP BY tu.id, u.name
      HAVING COUNT(DISTINCT c.id) > 0
      ORDER BY revenue DESC
    `)

        return this.wrapHTML('Rendimiento de Agentes', `
      <div class="header" style="background:linear-gradient(135deg,#F59E0B,#EAB308);">
        <h1>🏆 Rendimiento de Agentes</h1>
        <p>Reporte completo del equipo</p>
      </div>

      <div class="section">
        <table class="full-table">
          <thead>
            <tr>
              <th>#</th><th>Agente</th><th>Contactos</th><th>Ganados</th><th>Perdidos</th>
              <th>Revenue</th><th>Conv. %</th><th>Score Prom.</th><th>Interacciones</th><th>Tareas</th>
            </tr>
          </thead>
          <tbody>
            ${agents.rows.map((a: Record<string, unknown>, i: number) => {
            const total = parseInt(String(a.total_contacts)) || 0
            const won = parseInt(String(a.won)) || 0
            const convRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0'
            return `
                <tr>
                  <td>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</td>
                  <td><strong>${a.agent_name}</strong></td>
                  <td>${a.total_contacts}</td>
                  <td style="color:green;font-weight:600;">${a.won}</td>
                  <td style="color:red;">${a.lost}</td>
                  <td><strong>$${Math.round(parseFloat(String(a.revenue)) || 0).toLocaleString('es-MX')}</strong></td>
                  <td>${convRate}%</td>
                  <td>${a.avg_score}</td>
                  <td>${a.total_interactions}</td>
                  <td>${a.tasks_completed}</td>
                </tr>
              `
        }).join('')}
          </tbody>
        </table>
      </div>

      <div class="footer-note">
        Reporte generado el ${new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} — AS Operadora CRM
      </div>
    `)
    }

    // ═══════════════════════════════════════════
    // HTML WRAPPER
    // ═══════════════════════════════════════════

    private wrapHTML(title: string, body: string): string {
        return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${title} — AS Operadora CRM</title>
  <style>
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a1a; background: #fff; }
    .header { padding: 32px; text-align: center; color: #fff; }
    .header h1 { font-size: 24px; margin-bottom: 4px; }
    .header p { font-size: 14px; opacity: 0.85; }
    .section { padding: 24px 32px; border-bottom: 1px solid #eee; }
    .section h2 { font-size: 16px; color: #333; margin-bottom: 16px; }
    .data-table { width: 100%; }
    .data-table td { padding: 8px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
    .data-table td:first-child { width: 140px; color: #888; }
    .full-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .full-table th { background: #f8f9fa; padding: 10px 8px; text-align: left; font-weight: 600; color: #555; border-bottom: 2px solid #ddd; }
    .full-table td { padding: 8px; border-bottom: 1px solid #f0f0f0; }
    .full-table tbody tr:hover { background: #f8f9fa; }
    .score { display: inline-block; background: #EEF2FF; color: #4F46E5; padding: 2px 10px; border-radius: 12px; font-weight: 700; }
    .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }
    .kpi { background: #f8f9fa; padding: 16px; border-radius: 10px; text-align: center; }
    .kpi-value { font-size: 24px; font-weight: 800; color: #1a1a1a; }
    .kpi-label { font-size: 11px; color: #888; margin-top: 4px; text-transform: uppercase; }
    .signals { display: flex; flex-wrap: wrap; gap: 6px; }
    .signal { background: #EEF2FF; color: #4F46E5; padding: 4px 10px; border-radius: 12px; font-size: 11px; }
    .empty { color: #aaa; font-style: italic; font-size: 13px; }
    .footer-note { padding: 20px 32px; text-align: center; color: #aaa; font-size: 11px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  ${body}
</body>
</html>`
    }

    private errorPage(msg: string): string {
        return this.wrapHTML('Error', `<div class="section"><p>${msg}</p></div>`)
    }

    private fmtDate(d: string | Date): string {
        try {
            return new Date(d).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })
        } catch { return String(d) }
    }

    private getPeriodSQL(period: string): string {
        switch (period) {
            case 'today': return "created_at >= CURRENT_DATE"
            case 'week': return "created_at >= DATE_TRUNC('week', CURRENT_DATE)"
            case 'month': return "created_at >= DATE_TRUNC('month', CURRENT_DATE)"
            case 'quarter': return "created_at >= DATE_TRUNC('quarter', CURRENT_DATE)"
            case 'year': return "created_at >= DATE_TRUNC('year', CURRENT_DATE)"
            default: return "created_at >= DATE_TRUNC('month', CURRENT_DATE)"
        }
    }
}

export const crmReportService = new CRMReportService()
