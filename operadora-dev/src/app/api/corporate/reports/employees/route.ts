import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId') || '1'
    const employeeId = searchParams.get('employeeId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    let dateFilter = ''
    if (dateFrom && dateTo) {
      dateFilter = `AND b.created_at BETWEEN '${dateFrom}' AND '${dateTo}'`
    } else {
      dateFilter = `AND b.created_at >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '6 months')`
    }

    let employeeFilter = ''
    if (employeeId) {
      employeeFilter = `AND b.user_id = ${parseInt(employeeId)}`
    }

    // Estadísticas por empleado
    const employeeStats = await db.queryMany<any>(
      `SELECT
        u.id,
        u.name,
        u.email,
        COALESCE(tu.department, 'Sin departamento') as department,
        tu.role,
        COUNT(b.id) as total_trips,
        SUM(b.total_price) as total_spent,
        AVG(b.total_price) as average_trip,
        MAX(b.total_price) as max_trip,
        MIN(b.total_price) as min_trip,
        COUNT(DISTINCT b.destination) as destinations_visited,
        MIN(b.created_at) as first_trip,
        MAX(b.created_at) as last_trip
       FROM users u
       LEFT JOIN tenant_users tu ON u.id = tu.user_id AND tu.tenant_id = $1
       LEFT JOIN bookings b ON u.id = b.user_id AND b.tenant_id = $1 AND b.status != 'cancelled' ${dateFilter}
       WHERE tu.tenant_id = $1 ${employeeFilter}
       GROUP BY u.id, u.name, u.email, tu.department, tu.role
       HAVING COUNT(b.id) > 0
       ORDER BY total_spent DESC`,
      [parseInt(tenantId)]
    )

    // Si es un empleado específico, obtener más detalles
    if (employeeId) {
      const employee = employeeStats[0]

      if (!employee) {
        return NextResponse.json({
          success: false,
          error: 'Empleado no encontrado'
        }, { status: 404 })
      }

      // Historial completo de viajes
      const tripHistory = await db.queryMany<any>(
        `SELECT
          b.id,
          b.type,
          b.destination,
          b.total_price,
          b.status,
          b.created_at,
          b.departure_date,
          b.return_date
         FROM bookings b
         WHERE b.user_id = $1
           AND b.tenant_id = $2
           ${dateFilter}
         ORDER BY b.created_at DESC`,
        [parseInt(employeeId), parseInt(tenantId)]
      )

      // Destinos visitados
      const destinations = await db.queryMany<any>(
        `SELECT
          b.destination,
          COUNT(*) as visits,
          SUM(b.total_price) as total_spent,
          MAX(b.created_at) as last_visit
         FROM bookings b
         WHERE b.user_id = $1
           AND b.tenant_id = $2
           AND b.status != 'cancelled'
           AND b.destination IS NOT NULL
           ${dateFilter}
         GROUP BY b.destination
         ORDER BY visits DESC`,
        [parseInt(employeeId), parseInt(tenantId)]
      )

      // Gastos por mes
      const monthlyExpenses = await db.queryMany<any>(
        `SELECT
          DATE_TRUNC('month', b.created_at) as month,
          COUNT(*) as trips,
          SUM(b.total_price) as total
         FROM bookings b
         WHERE b.user_id = $1
           AND b.tenant_id = $2
           AND b.status != 'cancelled'
           ${dateFilter}
         GROUP BY month
         ORDER BY month DESC`,
        [parseInt(employeeId), parseInt(tenantId)]
      )

      return NextResponse.json({
        success: true,
        data: {
          employee: {
            ...employee,
            trip_history: tripHistory,
            destinations,
            monthly_expenses: monthlyExpenses
          }
        }
      })
    }

    // Listado de todos los empleados
    return NextResponse.json({
      success: true,
      data: {
        employees: employeeStats,
        summary: {
          total_employees: employeeStats.length,
          total_trips: employeeStats.reduce((sum, e) => sum + parseInt(e.total_trips || 0), 0),
          total_spent: employeeStats.reduce((sum, e) => sum + parseFloat(e.total_spent || 0), 0),
          average_per_employee: employeeStats.length > 0
            ? employeeStats.reduce((sum, e) => sum + parseFloat(e.total_spent || 0), 0) / employeeStats.length
            : 0
        }
      }
    })
  } catch (error: any) {
    console.error('Error generating employee report:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
