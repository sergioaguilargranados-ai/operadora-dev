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

    const forecast = await WeatherService.getForecast(city, date)

    // If it doesn't exist, we can try to fetch it on the fly
    if (!forecast) {
      await WeatherService.fetchAndSaveForecast(city)
      const newForecast = await WeatherService.getForecast(city, date)
      if (newForecast) {
        return NextResponse.json({ success: true, data: newForecast })
      }
    }

    return NextResponse.json({ success: true, data: forecast })
  } catch (error: any) {
    console.error('Error fetching weather:', error)
    return NextResponse.json({ success: false, error: 'Error fetching weather' }, { status: 500 })
  }
}
