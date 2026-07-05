import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get('city')
  if (!city) return NextResponse.json({ error: 'city required' }, { status: 400 })

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`, {
      headers: {
        'User-Agent': 'OperadoraViajesApp/1.0 (sergio@aguilar.com)'
      }
    })
    const data = await res.json()
    if (data && data.length > 0) {
      return NextResponse.json({ 
        success: true, 
        location: { 
          lat: parseFloat(data[0].lat), 
          lng: parseFloat(data[0].lon) 
        } 
      })
    }
    return NextResponse.json({ success: false, error: 'not found' }, { status: 404 })
  } catch (error) {
    console.error('Nominatim error:', error)
    return NextResponse.json({ success: false, error: 'failed' }, { status: 500 })
  }
}
