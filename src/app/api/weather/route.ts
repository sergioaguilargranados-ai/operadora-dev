import { NextRequest, NextResponse } from 'next/server'
import WeatherService from '@/services/WeatherService'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const date = searchParams.get('date')

    if (!city || !date) {
      return NextResponse.json({ success: false, error: 'city and date are required' }, { status: 400 })
    }

    // Fetch extended forecast (up to 5 days)
    const extended = await WeatherService.getExtendedForecast(city, date)

    // If it doesn't exist, we can try to fetch it on the fly
    if (!extended || extended.length === 0) {
      await WeatherService.fetchAndSaveForecast(city)
      const newExtended = await WeatherService.getExtendedForecast(city, date)
      if (newExtended && newExtended.length > 0) {
        return NextResponse.json({ 
          success: true, 
          data: newExtended[0],
          extended: newExtended 
        })
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: extended && extended.length > 0 ? extended[0] : null,
      extended: extended || [] 
    })
  } catch (error: any) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ success: false, error: 'Error fetching weather' }, { status: 500 })
  }
}
