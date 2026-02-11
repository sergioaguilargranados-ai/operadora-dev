import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * GET /api/admin/agencies
 * Vista global de todas las agencias registradas (Super Admin)
 * Incluye métricas agregadas: agentes, clientes, bookings, comisiones
 */
export async function GET(request: NextRequest) {
    try {
        // Listar todas las agencias (tenants) con métricas
        const result = await query(`
      SELECT 
        t.id,
        t.company_name,
        t.slug,
        t.is_active,
        t.created_at,
        -- Agentes
        COALESCE(agent_counts.total_agents, 0) AS total_agents,
        COALESCE(agent_counts.active_agents, 0) AS active_agents,
        -- Clientes
        COALESCE(client_counts.total_clients, 0) AS total_clients,
        -- Bookings
        COALESCE(booking_counts.total_bookings, 0) AS total_bookings,
        COALESCE(booking_counts.total_revenue, 0) AS total_revenue,
        -- Comisiones
        COALESCE(commission_counts.total_commissions, 0) AS total_commissions,
        COALESCE(commission_counts.pending_commissions, 0) AS pending_commissions,
        COALESCE(commission_counts.available_commissions, 0) AS available_commissions,
        COALESCE(commission_counts.paid_commissions, 0) AS paid_commissions
      FROM tenants t
      LEFT JOIN (
        SELECT tenant_id,
          COUNT(*) AS total_agents,
          COUNT(*) FILTER (WHERE is_active = true) AS active_agents
        FROM tenant_users
        GROUP BY tenant_id
      ) agent_counts ON agent_counts.tenant_id = t.id
      LEFT JOIN (
        SELECT agency_id, COUNT(*) AS total_clients
        FROM agency_clients
        GROUP BY agency_id
      ) client_counts ON client_counts.agency_id = t.id
      LEFT JOIN (
        SELECT tenant_id,
          COUNT(*) AS total_bookings,
          COALESCE(SUM(total_price), 0) AS total_revenue
        FROM bookings
        WHERE booking_status NOT IN ('cancelled')
        GROUP BY tenant_id
      ) booking_counts ON booking_counts.tenant_id = t.id
      LEFT JOIN (
        SELECT agency_id,
          COALESCE(SUM(commission_amount), 0) AS total_commissions,
          COALESCE(SUM(commission_amount) FILTER (WHERE status = 'pending'), 0) AS pending_commissions,
          COALESCE(SUM(commission_amount) FILTER (WHERE status = 'available'), 0) AS available_commissions,
          COALESCE(SUM(commission_amount) FILTER (WHERE status = 'paid'), 0) AS paid_commissions
        FROM agency_commissions
        WHERE is_active = true
        GROUP BY agency_id
      ) commission_counts ON commission_counts.agency_id = t.id
      ORDER BY COALESCE(commission_counts.total_commissions, 0) DESC, t.company_name ASC
    `)

        // Totales globales
        const globalStats = {
            total_agencies: result.rows.length,
            total_agents: result.rows.reduce((sum: number, r: any) => sum + parseInt(r.total_agents), 0),
            total_clients: result.rows.reduce((sum: number, r: any) => sum + parseInt(r.total_clients), 0),
            total_bookings: result.rows.reduce((sum: number, r: any) => sum + parseInt(r.total_bookings), 0),
            total_revenue: result.rows.reduce((sum: number, r: any) => sum + parseFloat(r.total_revenue), 0),
            total_commissions: result.rows.reduce((sum: number, r: any) => sum + parseFloat(r.total_commissions), 0),
            pending_commissions: result.rows.reduce((sum: number, r: any) => sum + parseFloat(r.pending_commissions), 0),
            available_commissions: result.rows.reduce((sum: number, r: any) => sum + parseFloat(r.available_commissions), 0),
            paid_commissions: result.rows.reduce((sum: number, r: any) => sum + parseFloat(r.paid_commissions), 0)
        }

        return NextResponse.json({
            success: true,
            data: {
                agencies: result.rows,
                global: globalStats
            }
        })
    } catch (error) {
        console.error('Error fetching admin agencies:', error)
        return NextResponse.json({
            success: false, error: (error as Error).message
        }, { status: 500 })
    }
}
