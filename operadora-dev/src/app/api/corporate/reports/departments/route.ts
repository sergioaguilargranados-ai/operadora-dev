import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || '1'
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let dateFilter = ''
    if (dateFrom && dateTo) {
      dateFilter = `AND b.created_at BETWEEN '${dateFrom}' AND '${dateTo}'`
    } else {
      dateFilter = `AND b.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '3 months')`
    }

    // Gastos por departamento
    const departmentExpenses = await db.queryMany<any>(
      `SELECT
        COALESCE(tu.department, 'Sin departamento') as department,
        COUNT(b.id) as total_bookings,
        COUNT(DISTINCT b.user_id) as total_travelers,
        SUM(b.total_price) as total_expenses,
        AVG(b.total_price) as average_booking,
        MAX(b.total_price) as max_booking,
        MIN(b.total_price) as min_booking
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       LEFT JOIN tenant_users tu ON u.id = tu.user_id AND tu.tenant_id = b.tenant_id
       WHERE b.tenant_id = $1
         AND b.status != 'cancelled'
         ${dateFilter}
       GROUP BY tu.department
       ORDER BY total_expenses DESC`,
      [parseInt(tenantId)]
    )

    // Top viajeros por departamento
    const topTravelersByDept = await db.queryMany<any>(
      `SELECT
        COALESCE(tu.department, 'Sin departamento') as department,
        u.name as traveler_name,
        COUNT(b.id) as trips,
        SUM(b.total_price) as total_spent,
        ROW_NUMBER() OVER (PARTITION BY tu.department ORDER BY COUNT(b.id) DESC) as rank
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       LEFT JOIN tenant_users tu ON u.id = tu.user_id AND tu.tenant_id = b.tenant_id
       WHERE b.tenant_id = $1
         AND b.status != 'cancelled'
         ${dateFilter}
       GROUP BY tu.department, u.id, u.name
       HAVING COUNT(b.id) > 0
       ORDER BY tu.department, rank`,
      [parseInt(tenantId)]
    )

    // Agrupar top travelers
    const topTravelersGrouped = topTravelersByDept.reduce((acc: any, curr: any) => {
      if (!acc[curr.department]) {
        acc[curr.department] = []
      }
      if (curr.rank <= 5) {
        acc[curr.department].push({
          name: curr.traveler_name,
          trips: curr.trips,
          total_spent: curr.total_spent
        })
      }
      return acc
    }, {})

    // Destinos más visitados por departamento
    const topDestinationsByDept = await db.queryMany<any>(
      `SELECT
        COALESCE(tu.department, 'Sin departamento') as department,
        b.destination,
        COUNT(*) as visits,
        SUM(b.total_price) as total_spent
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       LEFT JOIN tenant_users tu ON u.id = tu.user_id AND tu.tenant_id = b.tenant_id
       WHERE b.tenant_id = $1
         AND b.status != 'cancelled'
         AND b.destination IS NOT NULL
         ${dateFilter}
       GROUP BY tu.department, b.destination
       ORDER BY tu.department, visits DESC`,
      [parseInt(tenantId)]
    )

    // Agrupar destinos
    const topDestinationsGrouped = topDestinationsByDept.reduce((acc: any, curr: any) => {
      if (!acc[curr.department]) {
        acc[curr.department] = []
      }
      if (acc[curr.department].length < 5) {
        acc[curr.department].push({
          destination: curr.destination,
          visits: curr.visits,
          total_spent: curr.total_spent
        })
      }
      return acc
    }, {})

    // Enriquecer datos de departamentos
    const enrichedDepartments = departmentExpenses.map(dept => ({
      ...dept,
      top_travelers: topTravelersGrouped[dept.department] || [],
      top_destinations: topDestinationsGrouped[dept.department] || []
    }))

    return NextResponse.json({
      success: true,
      data: {
        departments: enrichedDepartments,
        summary: {
          total_departments: departmentExpenses.length,
          total_expenses: departmentExpenses.reduce((sum, d) => sum + parseFloat(d.total_expenses || 0), 0),
          total_bookings: departmentExpenses.reduce((sum, d) => sum + parseInt(d.total_bookings || 0), 0)
        }
      }
    })
  } catch (error: any) {
    console.error('Error generating department report:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
