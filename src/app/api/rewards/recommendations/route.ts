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
        data: null
      })
    }

    const booking = bookingsRes.rows[0]
    const details = typeof booking.special_requests === 'string' 
      ? JSON.parse(booking.special_requests) 
      : (booking.special_requests || {})

    const destination = booking.destination || details.destination || 'tu próximo destino'

    // 2. Generate Recommendations using OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: true,
        data: {
          weatherTips: [
            { title: "Mantente hidratado", desc: "Lleva siempre una botella de agua contigo." },
            { title: "Protégete del sol", desc: "No olvides tu protector solar y sombrero." }
          ],
          medications: [
            { title: "Paracetamol", desc: "Para dolores de cabeza o fiebre." },
            { title: "Antihistamínicos", desc: "Por si presentas alguna alergia al clima." },
            { title: "Curitas", desc: "Esenciales para las largas caminatas." }
          ]
        }
      })
    }

    const prompt = `
Eres un experto doctor de medicina del viajero. El usuario viajará pronto a "${destination}".
Necesito que analices el clima típico general de esa región y sugieras:
1. Exactamente 2 tips de cuidado personal basados en el clima (ej. si hace calor: "Hidrátate", "Usa bloqueador").
2. Exactamente 3 medicamentos o artículos de botiquín recomendados para el clima o actividades comunes allí (ej. repelente de mosquitos, pastillas para el mareo de altitud, antihistamínicos, etc.).

Devuelve EXCLUSIVAMENTE un JSON con esta estructura exacta (en español), sin markdown, sin backticks:
{
  "weatherTips": [
    { "title": "Tip corto", "desc": "Explicación breve del tip climático." }
  ],
  "medications": [
    { "title": "Nombre Medicamento", "desc": "Para qué sirve en este viaje." }
  ]
}
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

    if (responseText.startsWith('\`\`\`json')) {
      responseText = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim()
    } else if (responseText.startsWith('\`\`\`')) {
      responseText = responseText.replace(/\`\`\`/g, '').trim()
    }

    let recommendations = null
    try {
      recommendations = JSON.parse(responseText)
    } catch (e) {
      console.error('JSON Parse error from OpenAI:', responseText)
      recommendations = {
        weatherTips: [
          { title: "Prepárate para el clima", desc: "Revisa el pronóstico antes de empacar." },
          { title: "Ropa cómoda", desc: "Lleva capas para adaptarte a cambios de temperatura." }
        ],
        medications: [
          { title: "Botiquín básico", desc: "Lleva paracetamol y curitas." },
          { title: "Repelente", desc: "Siempre útil en exteriores." },
          { title: "Medicinas personales", desc: "No olvides tus tratamientos médicos." }
        ]
      }
    }

    return NextResponse.json({
      success: true,
      data: recommendations
    })

  } catch (error: any) {
    console.error('Error fetching recommendations:', error)
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
