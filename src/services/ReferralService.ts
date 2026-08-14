/**
 * ReferralService - Tracking de referidos y conversiones
 * 
 * Flujo: Liga con ?r=CODE → Cookie 30 días → Registro → Booking → Comisión
 */

import { query, queryOne } from '@/lib/db'

export interface ReferralClick {
    id: number
    agent_id: number
    referral_code: string
    ip_address: string | null
    user_agent: string | null
    landing_page: string | null
    utm_source: string | null
    created_at: Date
}

export interface ReferralStats {
    total_clicks: number
    clicks_today: number
    clicks_this_week: number
    clicks_this_month: number
    total_conversions: number
    registrations: number
    bookings: number
    conversion_rate: string
    ltv: number // Life Time Value
}

export class ReferralService {

    /**
     * Registrar un clic en liga de referido
     */
    async trackClick(data: {
        agentId: number
        referralCode: string
        ipAddress?: string
        userAgent?: string
        refererUrl?: string
        landingPage?: string
        utmSource?: string
        utmMedium?: string
        utmCampaign?: string
        sessionId?: string
    }): Promise<ReferralClick> {
        const result = await query(`
      INSERT INTO referral_clicks 
        (agent_id, referral_code, ip_address, user_agent, referer_url, landing_page, utm_source, utm_medium, utm_campaign, session_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
            data.agentId,
            data.referralCode,
            data.ipAddress || null,
            data.userAgent || null,
            data.refererUrl || null,
            data.landingPage || null,
            data.utmSource || null,
            data.utmMedium || null,
            data.utmCampaign || null,
            data.sessionId || null
        ])

        return result.rows[0]
    }

    /**
     * Registrar una conversión
     */
    async trackConversion(data: {
        clickId?: number
        agentId: number
        userId?: number
        conversionType: 'registration' | 'booking' | 'payment'
        bookingId?: number
        revenueAmount?: number
        currency?: string
    }): Promise<any> {
        const result = await query(`
      INSERT INTO referral_conversions 
        (click_id, agent_id, user_id, conversion_type, booking_id, revenue_amount, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [
            data.clickId || null,
            data.agentId,
            data.userId || null,
            data.conversionType,
            data.bookingId || null,
            data.revenueAmount || 0,
            data.currency || 'MXN'
        ])

        return result.rows[0]
    }

    /**
     * Obtener estadísticas de referidos por agente
     */
    async getAgentStats(agentId: number): Promise<ReferralStats> {
        const [clicks, conversions, ltv] = await Promise.all([
            // Clics por período
            query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE) AS today,
          COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)) AS this_week,
          COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS this_month
        FROM referral_clicks
        WHERE agent_id = $1
      `, [agentId]),

            // Conversiones por tipo
            query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE conversion_type = 'registration') AS registrations,
          COUNT(*) FILTER (WHERE conversion_type = 'booking') AS bookings
        FROM referral_conversions
        WHERE agent_id = $1
      `, [agentId]),

            // LTV (Life Time Value promedio de clientes referidos)
            query(`
        SELECT
          COALESCE(AVG(total_revenue), 0) AS avg_ltv
        FROM agency_clients
        WHERE agent_id = (SELECT user_id FROM tenant_users WHERE id = $1)
          AND total_revenue > 0
      `, [agentId])
        ])

        const totalClicks = parseInt(clicks.rows[0]?.total || '0')
        const totalConversions = parseInt(conversions.rows[0]?.total || '0')

        return {
            total_clicks: totalClicks,
            clicks_today: parseInt(clicks.rows[0]?.today || '0'),
            clicks_this_week: parseInt(clicks.rows[0]?.this_week || '0'),
            clicks_this_month: parseInt(clicks.rows[0]?.this_month || '0'),
            total_conversions: totalConversions,
            registrations: parseInt(conversions.rows[0]?.registrations || '0'),
            bookings: parseInt(conversions.rows[0]?.bookings || '0'),
            conversion_rate: totalClicks > 0
                ? ((totalConversions / totalClicks) * 100).toFixed(1)
                : '0.0',
            ltv: parseFloat(ltv.rows[0]?.avg_ltv || '0')
        }
    }

    /**
     * Obtener estadísticas de referidos para toda la agencia
     */
    async getAgencyStats(agencyId: number): Promise<any> {
        const result = await query(`
      SELECT
        COUNT(DISTINCT rc.agent_id) AS agents_with_referrals,
        COUNT(rc.id) AS total_clicks,
        COUNT(rc.id) FILTER (WHERE rc.created_at >= DATE_TRUNC('month', CURRENT_DATE)) AS clicks_this_month,
        (SELECT COUNT(*) FROM referral_conversions rcv 
         JOIN tenant_users tu ON rcv.agent_id = tu.id 
         WHERE tu.tenant_id = $1) AS total_conversions,
        (SELECT COUNT(*) FROM referral_conversions rcv 
         JOIN tenant_users tu ON rcv.agent_id = tu.id 
         WHERE tu.tenant_id = $1 AND rcv.conversion_type = 'booking') AS booking_conversions,
        (SELECT COALESCE(SUM(rcv.revenue_amount), 0) FROM referral_conversions rcv 
         JOIN tenant_users tu ON rcv.agent_id = tu.id 
         WHERE tu.tenant_id = $1) AS total_revenue
      FROM referral_clicks rc
      JOIN tenant_users tu ON rc.agent_id = tu.id
      WHERE tu.tenant_id = $1
    `, [agencyId])

        return result.rows[0]
    }

    /**
     * Obtener lista de clics recientes
     */
    async getRecentClicks(agentId: number, limit: number = 50): Promise<ReferralClick[]> {
        const result = await query(`
      SELECT * FROM referral_clicks
      WHERE agent_id = $1
      ORDER BY created_at DESC
      LIMIT $2
    `, [agentId, limit])

        return result.rows || []
    }

    /**
     * Obtener prospectos (registro sin booking aún)
     */
    async getProspects(agentId: number): Promise<any[]> {
        const result = await query(`
      SELECT 
        rcv.id,
        u.name,
        u.email,
        rcv.created_at AS registration_date,
        (SELECT MAX(s.created_at) FROM searches s WHERE s.user_id = u.id) AS last_search
      FROM referral_conversions rcv
      JOIN users u ON rcv.user_id = u.id
      WHERE rcv.agent_id = $1
        AND rcv.conversion_type = 'registration'
        AND NOT EXISTS (
          SELECT 1 FROM referral_conversions r2 
          WHERE r2.agent_id = $1 AND r2.user_id = u.id AND r2.conversion_type = 'booking'
        )
      ORDER BY rcv.created_at DESC
    `, [agentId])

        return result.rows || []
    }
}

export const referralService = new ReferralService()
