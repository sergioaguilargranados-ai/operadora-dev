import { NextRequest, NextResponse } from 'next/server'
import { query as dbQuery } from '@/lib/db'

export const dynamic = 'force-dynamic'

// Helper function to extract user ID from token
async function getUserIdFromToken(request: NextRequest): Promise<number | null> {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) return null
    const token = authHeader.replace('Bearer ', '')
    const jwt = require('jsonwebtoken')
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    return decoded.userId || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request)
    
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Find user's nearest upcoming trip
    const bookingsRes = await dbQuery(`
      SELECT id, destination, special_requests
      FROM bookings 
      WHERE user_id = $1 AND booking_status != 'cancelled'
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId])

    if (bookingsRes.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [
          { name: `Caminata Exploratoria`, points: 1500, img: "https://images.unsplash.com/photo-1590483868205-d91d96078696?auto=format&fit=crop&w=150&q=80", lat: 19.4326, lng: -99.1332 },
          { name: `Visita Guiada`, points: 2000, img: "https://images.unsplash.com/photo-1549474776-6644ee7890bc?auto=format&fit=crop&w=150&q=80", lat: 19.4350, lng: -99.1410 },
          { name: `Tour de Sabores`, points: 3000, img: "https://images.unsplash.com/photo-1574347713437-080c98e217d1?auto=format&fit=crop&w=150&q=80", lat: 19.4270, lng: -99.1670 }
        ]
      })
    }

    const booking = bookingsRes.rows[0]
    const details = typeof booking.special_requests === 'string' 
      ? JSON.parse(booking.special_requests) 
      : (booking.special_requests || {})

    const destination = booking.destination || details.destination || 'tu próximo destino'

    // 2. Find itinerary for this trip
    let itinerary = null
    
    const customRes = await dbQuery(`
      SELECT c.*, 
        (SELECT json_agg(d ORDER BY d.day_number) 
         FROM custom_itinerary_days d 
         WHERE d.itinerary_id = c.id) as days
      FROM custom_itineraries c
      WHERE c.booking_id = $1 LIMIT 1
    `, [booking.id])
    
    if (customRes.rows.length > 0) {
      itinerary = customRes.rows[0]
    }

    if (!itinerary) {
      const legacyRes = await dbQuery('SELECT * FROM itineraries WHERE booking_id = $1 LIMIT 1', [booking.id])
      if (legacyRes.rows.length > 0) itinerary = legacyRes.rows[0]
    }

    if (!itinerary && details.tour_id) {
      const legacyRes = await dbQuery('SELECT * FROM itineraries WHERE tour_id = $1 LIMIT 1', [details.tour_id])
      if (legacyRes.rows.length > 0) itinerary = legacyRes.rows[0]
    }

    // 3. Extract context for AI
    let context = `Destino: ${destination}. `
    if (itinerary && itinerary.days) {
      let daysArr = typeof itinerary.days === 'string' ? JSON.parse(itinerary.days) : itinerary.days
      if (Array.isArray(daysArr)) {
        // Take first 3 days to avoid huge prompts
        const previewDays = daysArr.slice(0, 3).map(d => d.title + ": " + (d.description || '')).join(' | ')
        context += `Itinerario resumido: ${previewDays}`
      }
    }

    // 4. Generate Challenges using OpenAI
    if (!process.env.OPENAI_API_KEY) {
      // Fallback si no hay OpenAI
      return NextResponse.json({
        success: true,
        data: [
          { name: `Caminata por ${destination}`, points: 1500, img: "https://images.unsplash.com/photo-1590483868205-d91d96078696?auto=format&fit=crop&w=150&q=80" },
          { name: `Explorando el centro histórico`, points: 2000, img: "https://images.unsplash.com/photo-1549474776-6644ee7890bc?auto=format&fit=crop&w=150&q=80" },
          { name: `Recorrido de monumentos`, points: 3000, img: "https://images.unsplash.com/photo-1574347713437-080c98e217d1?auto=format&fit=crop&w=150&q=80" }
        ]
      })
    }

    const prompt = `
Eres un asistente de viajes experto. Basado en este contexto del próximo viaje de un usuario: "${context}"
Genera exactamente 5 retos de caminata (puntos de interés) súper atractivos basados en los lugares reales que va a visitar.

Devuelve EXCLUSIVAMENTE un JSON con esta estructura exacta, sin markdown, sin backticks:
[
  { "name": "Torre Eiffel", "points": 2500, "lat": 48.8584, "lng": 2.2945 },
  { "name": "Museo del Louvre", "points": 1800, "lat": 48.8606, "lng": 2.3376 }
]

Asegúrate de incluir coordenadas (lat, lng) reales y precisas de los lugares turísticos mencionados.
Los 'points' (pasos estimados) deben ser realistas (ej. entre 1000 y 3000).
El 'name' no debe pasar de 6 palabras.
`

    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      })
    })

    if (!aiRes.ok) {
      throw new Error('Error de OpenAI API')
    }

    const aiData = await aiRes.json()
    let responseText = aiData.choices[0].message.content.trim()

    // Clean up potential markdown wrapper
    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim()
    } else if (responseText.startsWith('\`\`\`')) {
      responseText = responseText.replace(/\`\`\`/g, '').trim()
    }

    let challenges = []
    try {
      challenges = JSON.parse(responseText)
    } catch (e) {
      console.error('JSON Parse error from OpenAI:', responseText)
      challenges = [
        { name: `Caminata por ${destination}`, points: 1500 },
        { name: `Explorando el centro histórico`, points: 2000 },
        { name: `Recorrido de monumentos`, points: 3000 }
      ]
    }

    // Assign guaranteed valid images to prevent broken links
    const validImages = [
      "https://images.unsplash.com/photo-1590483868205-d91d96078696?auto=format&fit=crop&w=150&q=80", // Arch
      "https://images.unsplash.com/photo-1549474776-6644ee7890bc?auto=format&fit=crop&w=150&q=80", // Plaza
      "https://images.unsplash.com/photo-1574347713437-080c98e217d1?auto=format&fit=crop&w=150&q=80", // Monument
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=150&q=80", // Paris street
      "https://images.unsplash.com/photo-1543305113-82b47b116037?auto=format&fit=crop&w=150&q=80"  // European vibe
    ]

    challenges = challenges.map((ch: any, i: number) => ({
      id: `challenge_${Date.now()}_${i}`,
      name: ch.name,
      points: ch.points,
      lat: ch.lat || 0,
      lng: ch.lng || 0,
      img: validImages[i % validImages.length]
    }))

    return NextResponse.json({
      success: true,
      data: challenges
    })

  } catch (error: any) {
    console.error('Error fetching challenges:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
