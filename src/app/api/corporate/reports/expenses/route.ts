import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || '1'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const groupBy = searchParams.get('groupBy') || 'month' // month, week, day

    let dateFilter = ''
    if (dateFrom && dateTo) {
      dateFilter = `AND b.created_at BETWEEN '${dateFrom}' AND '${dateTo}'`
    } else {
      // Default: últimos 3 meses
      dateFilter = `AND b.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')`
    }

    // Gastos totales por tipo
    const expensesByType = await db.queryMany<any>(
      `SELECT
        b.type,
        COUNT(*) as count,
        SUM(b.total_price) as total,
        AVG(b.total_price) as average
       FROM bookings b
       WHERE b.tenant_id = $1
         AND b.status != 'cancelled'
         ${dateFilter}
       GROUP BY b.type
       ORDER BY total DESC`,
      [parseInt(tenantId)]
    )

    // Gastos por período
    let timeGrouping = ''
    if (groupBy === 'day') {
      timeGrouping = `DATE_TRUNC('day', b.created_at)`
    } else if (groupBy === 'week') {
      timeGrouping = `DATE_TRUNC('week', b.created_at)`
    } else {
      timeGrouping = `DATE_TRUNC('month', b.created_at)`
    }

    const expensesByPeriod = await db.queryMany<any>(
      `SELECT
        ${timeGrouping} as period,
        COUNT(*) as count,
        SUM(b.total_price) as total
       FROM bookings b
       WHERE b.tenant_id = $1
         AND b.status != 'cancelled'
         ${dateFilter}
       GROUP BY period
       ORDER BY period ASC`,
      [parseInt(tenantId)]
    )

    // Totales generales
    const totals = await db.queryOne<any>(
      `SELECT
        COUNT(*) as total_bookings,
        SUM(b.total_price) as total_expenses,
        AVG(b.total_price) as average_booking
       FROM bookings b
       WHERE b.tenant_id = $1
         AND b.status != 'cancelled'
         ${dateFilter}`,
      [parseInt(tenantId)]
    )

    // Comparativa con período anterior
    const comparison = await db.queryOne<any>(
      `SELECT
        SUM(b.total_price) as previous_period_total
       FROM bookings b
       WHERE b.tenant_id = $1
         AND b.status != 'cancelled'
         AND b.created_at < (SELECT MIN(created_at) FROM bookings WHERE tenant_id = $1 ${dateFilter})
         AND b.created_at >= (SELECT MIN(created_at) FROM bookings WHERE tenant_id = $1 ${dateFilter}) - INTERVAL '3 months'`,
      [parseInt(tenantId)]
    )

    const growthRate = comparison?.previous_period_total
      ? ((totals.total_expenses - comparison.previous_period_total) / comparison.previous_period_total) * 100
      : 0

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          ...totals,
          growth_rate: Math.round(growthRate * 10) / 10
        },
        byType: expensesByType,
        byPeriod: expensesByPeriod,
        period: {
          from: dateFrom,
          to: dateTo,
          groupBy
        }
      }
    })
  } catch (error: any) {
    console.error('Error generating expenses report:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
