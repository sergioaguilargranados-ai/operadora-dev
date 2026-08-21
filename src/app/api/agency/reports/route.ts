import { NextResponse } from 'next/server'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') || 'sales_by_period'
    const groupBy = searchParams.get('groupBy') || 'day'
    // Mock implementation for the report generation since this is mostly a file download or json return
    
    // Validate request
    if (!type) {
      return NextResponse.json({ success: false, error: 'Type is required' }, { status: 400 })
    }

    // In a real scenario, this would query the DB using groupBy and type
    const mockReportData = [
      { date: '2026-08-01', total_sales: 15000, bookings: 5 },
      { date: '2026-08-02', total_sales: 20000, bookings: 7 },
      { date: '2026-08-03', total_sales: 12000, bookings: 4 }
    ]

    return NextResponse.json({
      success: true,
      data: mockReportData
    })
  } catch (error: any) {
    console.error('Error generating report:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
