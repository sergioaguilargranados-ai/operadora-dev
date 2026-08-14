import { NextRequest, NextResponse } from 'next/server'
import CurrencyService from '@/services/CurrencyService'
import { shouldRunCron, startCronLog, finishCronLog } from '@/lib/cronHelper'
import { verifyAdminAuth } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  // Validate CRON_SECRET or Admin Auth
  const authHeader = request.headers.get('authorization')
  const xCronSecret = request.headers.get('x-cron-secret')
  const cronSecret = process.env.CRON_SECRET

  let isAuthorized = false
  if (cronSecret && (authHeader === `Bearer ${cronSecret}` || xCronSecret === cronSecret)) {
    isAuthorized = true
  }

  if (!isAuthorized) {
    const adminAuth = await verifyAdminAuth(request)
    if (adminAuth.authorized) {
      isAuthorized = true
    }
  }

  if (!isAuthorized && process.env.NODE_ENV !== 'production' && !cronSecret) {
    isAuthorized = true
  }

  if (!isAuthorized) {
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
