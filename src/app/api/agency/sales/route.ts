import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

/**
 * GET /api/agency/sales
 * Obtener estadísticas y reportes de ventas para el panel de agencia
 *
 * Query params:
 * - tenantId?: string | number
 * - agency_id?: string | number
 * - days?: number (default 7 o 30)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || searchParams.get('agency_id') || '1'
    const days = parseInt(searchParams.get('days') || '7')
    const tId = parseInt(tenantId)

    // 1. KPIs Generales de Ventas
    const kpiRes = await db.queryOne<{
      total_reservas: string
      confirmadas: string
      pendientes: string
      ventas_totales: string
      ticket_promedio: string
    }>(
      `SELECT 
         COUNT(*)::text as total_reservas,
         COUNT(*) FILTER (WHERE status = 'confirmed')::text as confirmadas,
         COUNT(*) FILTER (WHERE status = 'pending')::text as pendientes,
         COALESCE(SUM(total_price) FILTER (WHERE status != 'cancelled'), 0)::text as ventas_totales,
         COALESCE(AVG(total_price) FILTER (WHERE status != 'cancelled'), 0)::text as ticket_promedio
       FROM bookings
       WHERE tenant_id = $1`,
      [tId]
    )

    // 2. Tendencia de Ventas Diaria
    const trendRes = await db.queryMany<{
      date: string
      ventas: string
      count: string
    }>(
      `SELECT 
         TO_CHAR(created_at, 'DD/MM') as date,
         COALESCE(SUM(total_price), 0)::text as ventas,
         COUNT(*)::text as count
       FROM bookings
       WHERE tenant_id = $1 
         AND status != 'cancelled'
         AND created_at >= NOW() - ($2 || ' days')::INTERVAL
       GROUP BY TO_CHAR(created_at, 'DD/MM'), DATE(created_at)
       ORDER BY DATE(created_at) ASC`,
      [tId, days.toString()]
    )

    // 3. Distribución por Producto / Servicio (Donut)
    const productRes = await db.queryMany<{
      name: string
      count: string
      total: string
    }>(
      `SELECT 
         COALESCE(booking_type, 'Otros') as name,
         COUNT(*)::text as count,
         COALESCE(SUM(total_price), 0)::text as total
       FROM bookings
       WHERE tenant_id = $1 AND status != 'cancelled'
       GROUP BY booking_type
       ORDER BY SUM(total_price) DESC`,
      [tId]
    )

    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#8B5CF6']
    const totalProdSales = productRes.reduce((acc, p) => acc + parseFloat(p.total || '0'), 0)

    const productData = productRes.map((p, idx) => ({
      name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
      count: parseInt(p.count || '0'),
      total: parseFloat(p.total || '0'),
      value: totalProdSales > 0 ? Math.round((parseFloat(p.total || '0') / totalProdSales) * 100) : 0,
      color: colors[idx % colors.length]
    }))

    // 4. Últimas Ventas
    const recentSales = await db.queryMany<{
      id: number
      booking_reference: string
      booking_type: string
      destination: string
      total_price: string
      status: string
      created_at: Date
      client_name: string
      client_email: string
    }>(
      `SELECT 
         b.id,
         COALESCE(b.booking_reference, 'AS-' || b.id) as booking_reference,
         b.booking_type,
         b.destination,
         b.total_price::text,
         b.status,
         b.created_at,
         COALESCE(u.name, 'Cliente Mostrador') as client_name,
         COALESCE(u.email, '') as client_email
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.tenant_id = $1
       ORDER BY b.created_at DESC
       LIMIT 20`,
      [tId]
    )

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalBookings: parseInt(kpiRes?.total_reservas || '0'),
          confirmedBookings: parseInt(kpiRes?.confirmadas || '0'),
          pendingBookings: parseInt(kpiRes?.pendientes || '0'),
          totalSales: parseFloat(kpiRes?.ventas_totales || '0'),
          averageTicket: parseFloat(kpiRes?.ticket_promedio || '0')
        },
        salesTrend: trendRes.map(t => ({
          date: t.date,
          ventas: parseFloat(t.ventas || '0'),
          count: parseInt(t.count || '0')
        })),
        productBreakdown: productData,
        recentSales: recentSales.map(s => ({
          id: s.id,
          reference: s.booking_reference,
          type: s.booking_type,
          destination: s.destination || 'Destino general',
          amount: parseFloat(s.total_price || '0'),
          status: s.status,
          createdAt: s.created_at,
          clientName: s.client_name,
          clientEmail: s.client_email
        }))
      }
    })
  } catch (error: any) {
    console.error('Error fetching agency sales:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener ventas de agencia', details: error.message },
      { status: 500 }
    )
  }
}
