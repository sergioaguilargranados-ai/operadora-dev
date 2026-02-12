/**
 * CRM Campaign Metrics Service
 * 
 * Tracking y dashboard de métricas de campañas de email:
 * - Open rate tracking con pixel invisible
 * - Click tracking con redirect URLs
 * - A/B testing para subjects y templates
 * - Dashboard de métricas por campaña
 * - Análisis comparativo entre campañas
 */

import { query, queryOne } from '@/lib/db'

// ═══════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════

export interface CampaignMetrics {
    campaign_id: string
    template_id: string
    template_name: string
    sent_at: string
    total_sent: number
    total_delivered: number
    total_opened: number
    total_clicked: number
    total_bounced: number
    total_unsubscribed: number
    open_rate: number
    click_rate: number
    bounce_rate: number
    ctr: number // click-to-open rate
}

export interface ABTestConfig {
    id?: number
    name: string
    variant_a: {
        template_id: string
        subject?: string
        contact_ids: number[]
    }
    variant_b: {
        template_id: string
        subject?: string
        contact_ids: number[]
    }
    winning_criteria: 'open_rate' | 'click_rate' | 'ctr'
    status: 'draft' | 'running' | 'completed'
    winner?: 'A' | 'B' | 'tie'
    created_at?: string
}

export interface ABTestResult {
    variant_a: CampaignMetrics
    variant_b: CampaignMetrics
    winner: 'A' | 'B' | 'tie'
    confidence: number
    improvement_percent: number
}

interface TrackingEvent {
    campaign_id: string
    contact_id: number
    event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed'
    metadata?: Record<string, unknown>
}

interface CampaignSummary {
    total_campaigns: number
    total_emails_sent: number
    avg_open_rate: number
    avg_click_rate: number
    best_performing_template: string
    campaigns: CampaignMetrics[]
}

// ═══════════════════════════════════════════
// SERVICIO
// ═══════════════════════════════════════════

class CRMCampaignMetricsService {

    /**
     * Registrar evento de tracking
     */
    async trackEvent(event: TrackingEvent): Promise<void> {
        await query(`
      INSERT INTO crm_campaign_events (campaign_id, contact_id, event_type, metadata, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT DO NOTHING
    `, [event.campaign_id, event.contact_id, event.event_type, JSON.stringify(event.metadata || {})])

        // Actualizar contadores de la campaña
        await query(`
      INSERT INTO crm_campaign_stats (campaign_id, total_${event.event_type}, updated_at)
      VALUES ($1, 1, NOW())
      ON CONFLICT (campaign_id) DO UPDATE SET
        total_${event.event_type} = crm_campaign_stats.total_${event.event_type} + 1,
        updated_at = NOW()
    `, [event.campaign_id])
    }

    /**
     * Registrar múltiples envíos de una campaña
     */
    async registerCampaignSend(
        campaignId: string,
        templateId: string,
        templateName: string,
        contactIds: number[],
        sentCount: number,
        failedCount: number
    ): Promise<void> {
        await query(`
      INSERT INTO crm_campaign_stats (campaign_id, template_id, template_name, total_sent, total_bounced, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      ON CONFLICT (campaign_id) DO UPDATE SET
        total_sent = $4,
        total_bounced = $5,
        updated_at = NOW()
    `, [campaignId, templateId, templateName, sentCount, failedCount])

        // Registrar eventos individuales
        for (const contactId of contactIds) {
            await query(`
        INSERT INTO crm_campaign_events (campaign_id, contact_id, event_type, created_at)
        VALUES ($1, $2, 'sent', NOW())
        ON CONFLICT DO NOTHING
      `, [campaignId, contactId])
        }
    }

    /**
     * Generar pixel de tracking para apertura
     */
    getOpenTrackingPixel(campaignId: string, contactId: number): string {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://asoperadora.com'
        return `<img src="${baseUrl}/api/crm/metrics/track?c=${campaignId}&u=${contactId}&e=opened" width="1" height="1" style="display:none" />`
    }

    /**
     * Generar URL de tracking para clicks
     */
    getClickTrackingUrl(campaignId: string, contactId: number, originalUrl: string): string {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://asoperadora.com'
        const encoded = encodeURIComponent(originalUrl)
        return `${baseUrl}/api/crm/metrics/track?c=${campaignId}&u=${contactId}&e=clicked&url=${encoded}`
    }

    /**
     * Obtener métricas de una campaña
     */
    async getCampaignMetrics(campaignId: string): Promise<CampaignMetrics | null> {
        const stats = await queryOne(`
      SELECT * FROM crm_campaign_stats WHERE campaign_id = $1
    `, [campaignId])

        if (!stats) return null

        const sent = Number(stats.total_sent) || 0
        const opened = Number(stats.total_opened) || 0
        const clicked = Number(stats.total_clicked) || 0
        const bounced = Number(stats.total_bounced) || 0
        const delivered = sent - bounced

        return {
            campaign_id: campaignId,
            template_id: stats.template_id || '',
            template_name: stats.template_name || '',
            sent_at: stats.created_at,
            total_sent: sent,
            total_delivered: delivered,
            total_opened: opened,
            total_clicked: clicked,
            total_bounced: bounced,
            total_unsubscribed: Number(stats.total_unsubscribed) || 0,
            open_rate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
            click_rate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0,
            bounce_rate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
            ctr: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
        }
    }

    /**
     * Obtener resumen general de todas las campañas
     */
    async getCampaignsSummary(): Promise<CampaignSummary> {
        const stats = await query(`
      SELECT * FROM crm_campaign_stats ORDER BY created_at DESC LIMIT 50
    `)

        const campaigns: CampaignMetrics[] = stats.rows.map((s: Record<string, unknown>) => {
            const sent = Number(s.total_sent) || 0
            const opened = Number(s.total_opened) || 0
            const clicked = Number(s.total_clicked) || 0
            const bounced = Number(s.total_bounced) || 0
            const delivered = sent - bounced

            return {
                campaign_id: s.campaign_id as string,
                template_id: (s.template_id || '') as string,
                template_name: (s.template_name || '') as string,
                sent_at: s.created_at as string,
                total_sent: sent,
                total_delivered: delivered,
                total_opened: opened,
                total_clicked: clicked,
                total_bounced: bounced,
                total_unsubscribed: Number(s.total_unsubscribed) || 0,
                open_rate: delivered > 0 ? Math.round((opened / delivered) * 100) : 0,
                click_rate: delivered > 0 ? Math.round((clicked / delivered) * 100) : 0,
                bounce_rate: sent > 0 ? Math.round((bounced / sent) * 100) : 0,
                ctr: opened > 0 ? Math.round((clicked / opened) * 100) : 0,
            }
        })

        const totalSent = campaigns.reduce((s, c) => s + c.total_sent, 0)
        const avgOpen = campaigns.length > 0 ? Math.round(campaigns.reduce((s, c) => s + c.open_rate, 0) / campaigns.length) : 0
        const avgClick = campaigns.length > 0 ? Math.round(campaigns.reduce((s, c) => s + c.click_rate, 0) / campaigns.length) : 0
        const best = campaigns.sort((a, b) => b.open_rate - a.open_rate)[0]?.template_name || 'N/A'

        return {
            total_campaigns: campaigns.length,
            total_emails_sent: totalSent,
            avg_open_rate: avgOpen,
            avg_click_rate: avgClick,
            best_performing_template: best,
            campaigns: campaigns.sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime()),
        }
    }

    /**
     * Crear test A/B
     */
    async createABTest(config: Omit<ABTestConfig, 'id' | 'status' | 'created_at'>): Promise<number> {
        const result = await queryOne(`
      INSERT INTO crm_ab_tests (name, variant_a, variant_b, winning_criteria, status, created_at)
      VALUES ($1, $2, $3, $4, 'draft', NOW())
      RETURNING id
    `, [config.name, JSON.stringify(config.variant_a), JSON.stringify(config.variant_b), config.winning_criteria])
        return result?.id
    }

    /**
     * Obtener tests A/B
     */
    async getABTests(): Promise<ABTestConfig[]> {
        const result = await query(`
      SELECT * FROM crm_ab_tests ORDER BY created_at DESC
    `)

        return result.rows.map((r: Record<string, unknown>) => ({
            id: r.id as number,
            name: r.name as string,
            variant_a: typeof r.variant_a === 'string' ? JSON.parse(r.variant_a as string) : r.variant_a,
            variant_b: typeof r.variant_b === 'string' ? JSON.parse(r.variant_b as string) : r.variant_b,
            winning_criteria: r.winning_criteria as ABTestConfig['winning_criteria'],
            status: r.status as ABTestConfig['status'],
            winner: r.winner as ABTestConfig['winner'],
            created_at: r.created_at as string,
        }))
    }

    /**
     * Evaluar resultados A/B test
     */
    async evaluateABTest(testId: number): Promise<ABTestResult | null> {
        const test = await queryOne(`SELECT * FROM crm_ab_tests WHERE id = $1`, [testId])
        if (!test) return null

        const variantA = typeof test.variant_a === 'string' ? JSON.parse(test.variant_a) : test.variant_a
        const variantB = typeof test.variant_b === 'string' ? JSON.parse(test.variant_b) : test.variant_b

        const campaignA = `abtest_${testId}_A`
        const campaignB = `abtest_${testId}_B`

        const metricsA = await this.getCampaignMetrics(campaignA)
        const metricsB = await this.getCampaignMetrics(campaignB)

        if (!metricsA || !metricsB) return null

        const criteria = test.winning_criteria as string
        const valueA = metricsA[criteria as keyof CampaignMetrics] as number
        const valueB = metricsB[criteria as keyof CampaignMetrics] as number

        let winner: 'A' | 'B' | 'tie' = 'tie'
        if (valueA > valueB * 1.05) winner = 'A'
        else if (valueB > valueA * 1.05) winner = 'B'

        const improvement = winner === 'tie' ? 0 :
            winner === 'A' ? Math.round(((valueA - valueB) / Math.max(valueB, 1)) * 100) :
                Math.round(((valueB - valueA) / Math.max(valueA, 1)) * 100)

        // Confidence = simple heuristic baseed on sample size
        const sampleSize = Math.min(metricsA.total_sent, metricsB.total_sent)
        const confidence = Math.min(95, Math.round(50 + sampleSize * 2))

        // Actualizar test
        await query(`
      UPDATE crm_ab_tests SET status = 'completed', winner = $2 WHERE id = $1
    `, [testId, winner])

        return {
            variant_a: metricsA,
            variant_b: metricsB,
            winner,
            confidence,
            improvement_percent: improvement,
        }
    }

    /**
     * Métricas por timeline (últimos 30 días)
     */
    async getTimelineMetrics(): Promise<{ date: string; sent: number; opened: number; clicked: number }[]> {
        const result = await query(`
      SELECT
        DATE(created_at) AS date,
        COUNT(*) FILTER (WHERE event_type = 'sent') AS sent,
        COUNT(*) FILTER (WHERE event_type = 'opened') AS opened,
        COUNT(*) FILTER (WHERE event_type = 'clicked') AS clicked
      FROM crm_campaign_events
      WHERE created_at >= NOW() - INTERVAL '30 days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `)

        return result.rows.map((r: Record<string, unknown>) => ({
            date: r.date as string,
            sent: Number(r.sent) || 0,
            opened: Number(r.opened) || 0,
            clicked: Number(r.clicked) || 0,
        }))
    }
}

export const crmCampaignMetricsService = new CRMCampaignMetricsService()
