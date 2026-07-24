import { NextRequest, NextResponse } from 'next/server'
import CurrencyService from '@/services/CurrencyService'
import { shouldRunCron, startCronLog, finishCronLog } from '@/lib/cronHelper'

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

  const searchParams = request.nextUrl?.searchParams || new URL(request.url).searchParams
  const force = searchParams.get('force') === 'true'

  if (!(await shouldRunCron('update_rates', force))) {
    return NextResponse.json({ success: true, message: 'Skipped by schedule' })
  }

  let logId: number | null = null;

  try {
    logId = await startCronLog('update_rates')
    const res = await CurrencyService.updateExchangeRates()
    await finishCronLog(logId, 'success', 'Rates updated successfully')
    return NextResponse.json({ success: true, message: 'Rates updated successfully', res })
  } catch (error: any) {
    console.error('Error in cron update-rates:', error)
    await finishCronLog(logId, 'error', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
