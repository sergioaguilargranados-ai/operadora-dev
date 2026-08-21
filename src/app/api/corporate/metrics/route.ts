import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json({ success: false, error: 'Tenant ID is required' }, { status: 400 })
    }

    // Advanced Metrics Simulation from DB data
    const flightsStats = await db.queryOne<{ count: string, avg_price: string }>(
      `SELECT COUNT(*)::text as count, AVG(total_price)::text as avg_price FROM bookings WHERE tenant_id = $1 AND booking_type ILIKE '%vuelo%'`,
      [tenantId]
    )

    const hotelsStats = await db.queryOne<{ count: string, avg_price: string }>(
      `SELECT COUNT(*)::text as count, AVG(total_price)::text as avg_price FROM bookings WHERE tenant_id = $1 AND booking_type ILIKE '%hotel%'`,
      [tenantId]
    )

    return NextResponse.json({
      success: true,
      data: {
        flights: {
          avgPrice: parseFloat(flightsStats?.avg_price || '0'),
          avgAdvance: 14,
          savingsRate: 15.2,
          costPerMile: 0.12
        },
        hotels: {
          avgPricePerNight: parseFloat(hotelsStats?.avg_price || '0') / 2, // mock assumption 2 nights
          attachmentRate: 85,
          savingsRate: 18.5
        },
        cars: { avgPricePerDay: 850, economyPercent: 75 },
        trains: { avgPricePerTicket: 1200, firstClassPercent: 10 },
        meals: { avgCostPerDay: 450 },
        groundTransport: { avgCostPerDay: 300 },
        co2: {
          totalTons: 12.5,
          breakdown: { flights: 70, trains: 10, other: 20 },
          compensationCost: 1500
        },
        compliance: {
          overall: 88,
          breakdown: { compliant: 88, exceptions: 10, nonCompliant: 2 },
          byCategory: {
            flights: 90, hotels: 85, cars: 95, trains: 100, other: 80
          }
        },
        emissionPreferences: {
          method: 'Estándar DEFRA 2024',
          scope1: true,
          scope2: true,
          scope3: false,
          updateFrequency: 'Mensual'
        }
      }
    })
  } catch (error: any) {
    console.error('Error fetching advanced metrics:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
