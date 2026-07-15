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
      SELECT id, destination, service_name, special_requests
      FROM bookings 
      WHERE user_id = $1 AND booking_status != 'cancelled'
      ORDER BY created_at DESC 
      LIMIT 1
    `, [userId])

    if (bookingsRes.rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: [] // No trips, will fallback in UI
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
Genera exactamente 3 retos de caminata turística (AS Retos) súper atractivos basados en los lugares reales que va a visitar en su itinerario o destino.

Devuelve EXCLUSIVAMENTE un JSON con esta estructura exacta, sin markdown, sin backticks:
[
  { "name": "Caminata de la Torre Eiffel al Louvre", "points": 2500, "img": "https://images.unsplash.com/photo-1543305113-82b47b116037?w=150&q=80" },
  { "name": "Explorando Montmartre a pie", "points": 1800, "img": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=150&q=80" }
]

Las URLs de "img" deben ser fotos reales de Unsplash (usa palabras clave en inglés para la búsqueda, ej. https://images.unsplash.com/photo-1543305113-82b47b116037?auto=format&fit=crop&w=150&q=80 o un término genérico hermoso del destino). Solo invéntate IDs realistas o usa links confiables de unsplash (puedes usar source.unsplash si hace falta, o genéricas de viajes). Si no estás seguro de la URL de la imagen, usa imágenes genéricas arquitectónicas de Unsplash como:
https://images.unsplash.com/photo-1590483868205-d91d96078696?auto=format&fit=crop&w=150&q=80
https://images.unsplash.com/photo-1549474776-6644ee7890bc?auto=format&fit=crop&w=150&q=80
https://images.unsplash.com/photo-1574347713437-080c98e217d1?auto=format&fit=crop&w=150&q=80

Los 'points' (pasos estimados) deben ser realistas para la caminata (ej. entre 1000 y 8000).
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
        { name: `Caminata por ${destination}`, points: 1500, img: "https://images.unsplash.com/photo-1590483868205-d91d96078696?auto=format&fit=crop&w=150&q=80" },
        { name: `Explorando el centro histórico`, points: 2000, img: "https://images.unsplash.com/photo-1549474776-6644ee7890bc?auto=format&fit=crop&w=150&q=80" },
        { name: `Recorrido de monumentos`, points: 3000, img: "https://images.unsplash.com/photo-1574347713437-080c98e217d1?auto=format&fit=crop&w=150&q=80" }
      ]
    }

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
