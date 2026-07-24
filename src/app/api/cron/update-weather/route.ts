import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import WeatherService from '@/services/WeatherService'
import { shouldRunCron, startCronLog, finishCronLog } from '@/lib/cronHelper'

export async function GET(request: NextRequest) {
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

  if (!(await shouldRunCron('update_weather', force))) {
    return NextResponse.json({ success: true, message: 'Skipped by schedule' })
  }

  let logId: number | null = null;
  try {
    logId = await startCronLog('update_weather')
    
    // Determine unique cities in upcoming itineraries (say, next 15 days)
    // For now, we can just get all unique cities from the database or just a few major ones if we want to save API calls
    // But since this is specific to itineraries, let's grab unique locations from upcoming groups
    const resGroups = await query(`
      SELECT distinct destination as region
      FROM itineraries 
      WHERE start_date >= CURRENT_DATE 
      AND start_date <= CURRENT_DATE + INTERVAL '30 days'
    `)
    
    // As a fallback, hardcode some common ones if there are no upcoming trips
    let cities = resGroups.rows.map((r: any) => r.region).filter(Boolean)
    if (cities.length === 0) {
      cities = ['Madrid', 'Paris', 'Rome', 'London', 'Berlin']
    }

    let successCount = 0
    for (const city of cities) {
      // split multiple cities if region is "Madrid / Paris"
      const parts = city.split(/[/,-]/).map((c: string) => c.trim())
      for (const p of parts) {
        if (p) {
          const ok = await WeatherService.fetchAndSaveForecast(p)
          if (ok) successCount++
        }
      }
    }

    const message = `Updated weather for ${successCount} cities`
    await finishCronLog(logId, 'success', message)
    return NextResponse.json({ success: true, message })
  } catch (error: any) {
    console.error('Error in cron update-weather:', error)
    await finishCronLog(logId, 'error', error.message)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
