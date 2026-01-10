import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

/**
 * GET /api/debug/check-db
 * Verificar estructura de la tabla bookings y conexión a BD
 */
export async function GET(request: NextRequest) {
  try {
    // Mostrar prefijo de DATABASE_URL
    const dbUrlPrefix = process.env.DATABASE_URL?.substring(0, 80) || 'NOT SET'

    // Obtener columnas de la tabla bookings
    const columnsResult = await query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      ORDER BY ordinal_position
    `)

    const columns = columnsResult.rows.map(r => r.column_name)

    // Verificar si existe columna 'type'
    const hasTypeColumn = columns.includes('type')

    // Contar registros
    const countResult = await query('SELECT COUNT(*) as total FROM bookings')
    const totalBookings = countResult.rows[0]?.total || 0

    return NextResponse.json({
      success: true,
      database: {
        url_prefix: dbUrlPrefix,
        connected: true
      },
      bookings_table: {
        columns: columns,
        has_type_column: hasTypeColumn,
        total_records: totalBookings
      },
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      database: {
        url_prefix: process.env.DATABASE_URL?.substring(0, 80) || 'NOT SET',
        connected: false
      }
    }, { status: 500 })
  }
}
