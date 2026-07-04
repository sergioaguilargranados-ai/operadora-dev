import { NextRequest, NextResponse } from 'next/server'
import CurrencyService from '@/services/CurrencyService'

export async function GET(request: NextRequest) {
  // Validate CRON_SECRET if it's set and we are in production
  const authHeader = request.headers.get('authorization')
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const res = await CurrencyService.updateExchangeRates()
    return NextResponse.json({ success: true, message: 'Rates updated successfully', res })
  } catch (error: any) {
    console.error('Error in cron update-rates:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
