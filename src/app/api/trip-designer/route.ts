import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

/**
 * POST /api/trip-designer
 * API del Diseñador de Viajes con IA
 * 
 * Modos de operación:
 *  - mode: "chat"      → Conversación guiada para capturar requisitos
 *  - mode: "generate"  → Generar itinerario con los datos capturados
 *  - mode: "get"       → Obtener propuesta existente por ID o folio
 */

// =====================================================
// Interfaces
// =====================================================

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface CapturedFields {
  traveler_name?: string
  traveler_email?: string
  traveler_phone?: string
  num_adults?: number
  num_children?: number
  num_infants?: number
  children_ages?: number[]
  destination?: string
  specific_cities?: string[]
  origin_city?: string
  start_date?: string
  end_date?: string
  duration_nights?: number
  flexibility?: string
  trip_type?: string
  travel_style?: string
  pace?: string
  interests?: string[]
  must_see?: string[]
  avoid?: string[]
  budget_total?: number
  budget_currency?: string
  budget_flexibility?: string
  hotel_category?: string
  meal_preference?: string
  transport_preference?: string[]
  dietary_restrictions?: string[]
  mobility_needs?: string
  special_occasions?: string[]
  additional_notes?: string
}

interface TripDay {
  day_number: number
  date?: string
  city: string
  title: string
  activities: Array<{
    time: string
    name: string
    description: string
    type: string
    duration_hours: number
    estimated_cost: number
    currency: string
  }>
  hotel: {
    name: string
    category: string
    estimated_cost: number
  }
  transport?: {
    type: string
    details: string
    estimated_cost: number
  }
  meals: Array<{
    type: string
    restaurant: string
    cuisine: string
    estimated_cost: number
    notes?: string
  }>
  estimated_day_cost: number
  tips?: string[]
}

// =====================================================
// System Prompt para el Travel Designer
// =====================================================

const TRAVEL_DESIGNER_SYSTEM_PROMPT = `Eres un diseñador de viajes profesional de AS Operadora, una agencia de viajes mexicana de nivel premium. Tu nombre es "AS Travel Designer".

TU MISIÓN: Guiar al cliente en una conversación natural para capturar todos los datos necesarios y diseñar un itinerario personalizado excepcional.

FLUJO DE CONVERSACIÓN (sigue este orden, pero sé flexible):
1. Saluda cálidamente y pregunta por el destino soñado
2. Pregunta fechas de viaje (o flexibilidad)
3. Pregunta número de viajeros (adultos, niños con edades)
4. Pregunta tipo de experiencia preferida
5. Pregunta presupuesto aproximado (en MXN o USD)
6. Pregunta intereses específicos y lugares imperdibles
7. Pregunta restricciones o necesidades especiales
8. Pregunta ocasiones especiales (si las hay)
9. Confirma un RESUMEN de todo antes de generar

REGLAS DE CONVERSACIÓN:
- Haz UNA pregunta a la vez (máximo 2 si están relacionadas)
- Sé conversacional y amigable, NO un formulario aburrido
- Usa emojis con moderación para ser amigable ✈️🌍
- Sugiere opciones cuando ayude ("¿Prefieres un ritmo relajado o intenso?")
- Muestra conocimiento y entusiasmo por los destinos
- Si el cliente no sabe algo, ofrece sugerencias basadas en su perfil
- Si el cliente menciona algo relevante fuera de orden, captura esa info
- SIEMPRE responde en español

EXTRACCIÓN DE DATOS:
En cada respuesta, además de tu mensaje conversacional, debes extraer los datos mencionados en formato JSON.
Responde SIEMPRE con un JSON válido con esta estructura exacta:
{
  "message": "Tu respuesta conversacional aquí",
  "extracted_fields": {
    // Solo incluye campos que el usuario ACABA de mencionar
    // Usa null para campos no mencionados
  },
  "next_step": "destination|dates|travelers|experience|budget|interests|restrictions|occasions|summary|ready",
  "completion_percentage": 0-100,
  "missing_required": ["lista de campos obligatorios que faltan"]
}

CAMPOS REQUERIDOS (obligatorios antes de generar):
- destination, start_date o duration_nights, num_adults, trip_type, budget_total

CAMPOS OPCIONALES (mejoran la propuesta):
- specific_cities, origin_city, end_date, flexibility, travel_style, pace, 
  interests, must_see, avoid, budget_currency, hotel_category, meal_preference,
  transport_preference, dietary_restrictions, mobility_needs, special_occasions

CUANDO TENGAS TODOS LOS DATOS REQUERIDOS:
Presenta un resumen completo y pregunta: "¿Todo correcto? ¿Quieres que genere tu itinerario personalizado?"
Si confirma, establece next_step como "ready".`

// =====================================================
// System Prompt para GENERAR el itinerario
// =====================================================

const ITINERARY_GENERATION_PROMPT = `Eres un diseñador de viajes experto. Genera un itinerario detallado día por día basado en los requisitos del cliente.

FORMATO DE RESPUESTA (JSON estricto):
{
  "itinerary_title": "Título atractivo del viaje",
  "summary": "Resumen ejecutivo de 2-3 líneas",
  "days": [
    {
      "day_number": 1,
      "city": "Ciudad",
      "title": "Día 1: Título descriptivo",
      "activities": [
        {
          "time": "09:00",
          "name": "Nombre de la actividad",
          "description": "Descripción breve pero inspiradora",
          "type": "cultural|aventura|gastronomia|relax|compras|transporte",
          "duration_hours": 2,
          "estimated_cost": 500,
          "currency": "MXN"
        }
      ],
      "hotel": {
        "name": "Nombre sugerido del hotel",
        "category": "4_star",
        "estimated_cost": 2500
      },
      "transport": {
        "type": "flight|train|bus|taxi|walk",
        "details": "Detalles del traslado",
        "estimated_cost": 0
      },
      "meals": [
        {
          "type": "breakfast|lunch|dinner",
          "restaurant": "Nombre del restaurante",
          "cuisine": "Tipo de cocina",
          "estimated_cost": 400,
          "notes": "Especialidad o nota"
        }
      ],
      "estimated_day_cost": 5000,
      "tips": ["Tip útil para ese día"]
    }
  ],
  "total_estimated_cost": 50000,
  "currency": "MXN",
  "packing_tips": ["Lista de cosas que empacar"],
  "important_notes": ["Notas importantes del viaje"]
}

REGLAS DE GENERACIÓN:
- Respeta el presupuesto, ritmo y estilo indicados
- Incluye restaurantes reales y reconocidos cuando sea posible
- Sugiere hoteles apropiados al estilo (no inventar nombres falsos, usar categorías genéricas si no estás seguro)
- Distribuye actividades según el ritmo: relaxed (2-3/día), moderate (3-4/día), intense (5+/día)
- Incluye tiempos de traslado realistas
- Considera edad de niños para actividades familiares
- Respeta restricciones dietéticas y de movilidad
- Incluye los "must_see" del cliente
- Evita lo que el cliente indicó en "avoid"
- Costos en la moneda indicada por el cliente
- Tips locales útiles y prácticos
- RESPONDE SOLO CON JSON VÁLIDO, sin texto adicional`

// =====================================================
// POST Handler
// =====================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mode } = body

    switch (mode) {
      case 'chat':
        return handleChat(body)
      case 'generate':
        return handleGenerate(body)
      case 'get':
        return handleGet(body)
      default:
        return NextResponse.json({ success: false, error: 'Modo inválido' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('[TRIP-DESIGNER] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Error interno'
    }, { status: 500 })
  }
}

// =====================================================
// Chat: Conversación guiada
// =====================================================

async function handleChat(body: {
  message: string
  history?: ChatMessage[]
  captured_fields?: CapturedFields
  proposal_id?: number
}) {
  const { message, history = [], captured_fields = {} } = body

  if (!message) {
    return NextResponse.json({ success: false, error: 'Mensaje requerido' }, { status: 400 })
  }

  // Verificar OpenAI
  if (!process.env.OPENAI_API_KEY) {
    return handleChatFallback(message, captured_fields)
  }

  // Construir contexto con campos ya capturados
  const fieldsContext = Object.keys(captured_fields).length > 0
    ? `\n\nDATOS YA CAPTURADOS:\n${JSON.stringify(captured_fields, null, 2)}`
    : ''

  const messages: ChatMessage[] = [
    { role: 'system', content: TRAVEL_DESIGNER_SYSTEM_PROMPT + fieldsContext },
    ...history.slice(-12), // Últimos 12 mensajes para contexto
    { role: 'user', content: message }
  ]

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        messages,
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('[TRIP-DESIGNER] OpenAI error:', errorData)
      return handleChatFallback(message, captured_fields)
    }

    const data = await response.json()
    const rawContent = data.choices[0]?.message?.content || '{}'

    let parsed
    try {
      parsed = JSON.parse(rawContent)
    } catch {
      console.error('[TRIP-DESIGNER] Failed to parse AI response:', rawContent)
      parsed = {
        message: rawContent,
        extracted_fields: {},
        next_step: 'destination',
        completion_percentage: 0,
        missing_required: ['destination', 'dates', 'travelers', 'budget']
      }
    }

    // Merge extracted fields con los existentes
    const updatedFields = {
      ...captured_fields,
      ...Object.fromEntries(
        Object.entries(parsed.extracted_fields || {}).filter(([, v]) => v != null)
      )
    }

    // Si hay proposal_id, actualizar en BD
    if (body.proposal_id) {
      await pool.query(
        `UPDATE ai_trip_proposals 
         SET captured_fields = $1, 
             chat_history = chat_history || $2::jsonb,
             updated_at = NOW()
         WHERE id = $3`,
        [
          JSON.stringify(updatedFields),
          JSON.stringify([
            { role: 'user', content: message, timestamp: new Date().toISOString() },
            { role: 'assistant', content: parsed.message, timestamp: new Date().toISOString() }
          ]),
          body.proposal_id
        ]
      )
    }

    return NextResponse.json({
      success: true,
      message: parsed.message,
      extracted_fields: parsed.extracted_fields || {},
      all_captured_fields: updatedFields,
      next_step: parsed.next_step || 'destination',
      completion_percentage: parsed.completion_percentage || 0,
      missing_required: parsed.missing_required || [],
      is_ready: parsed.next_step === 'ready',
      source: 'openai',
      usage: {
        prompt_tokens: data.usage?.prompt_tokens,
        completion_tokens: data.usage?.completion_tokens
      }
    })

  } catch (error: any) {
    console.error('[TRIP-DESIGNER] OpenAI request failed:', error)
    return handleChatFallback(message, captured_fields)
  }
}

// =====================================================
// Chat Fallback: Sin OpenAI
// =====================================================

function handleChatFallback(message: string, captured_fields: CapturedFields) {
  const lower = message.toLowerCase()
  let responseMessage = ''
  const extractedFields: Partial<CapturedFields> = {}
  let nextStep = 'destination'
  let completionPercentage = 0

  // Determinar qué paso falta
  if (!captured_fields.destination) {
    if (lower.length > 2) {
      // Intentar extraer el destino
      extractedFields.destination = message.trim()
      responseMessage = `🌍 ¡${message.trim()}! Excelente elección. ¿Cuándo te gustaría viajar? Puedes darme fechas específicas o un rango flexible.`
      nextStep = 'dates'
      completionPercentage = 15
    } else {
      responseMessage = '✈️ ¡Hola! Soy tu diseñador de viajes personal de AS Operadora. Vamos a crear el viaje perfecto para ti. ¿A dónde te gustaría ir?'
      nextStep = 'destination'
      completionPercentage = 0
    }
  } else if (!captured_fields.start_date && !captured_fields.duration_nights) {
    responseMessage = '📅 ¡Perfecto! ¿Cuántos días/noches te gustaría que dure el viaje? ¿Tienes fechas específicas en mente?'
    nextStep = 'dates'
    completionPercentage = 20
  } else if (!captured_fields.num_adults) {
    responseMessage = '👥 ¿Cuántas personas viajan? Dime el número de adultos y si hay niños (con sus edades).'
    nextStep = 'travelers'
    completionPercentage = 35
  } else if (!captured_fields.trip_type) {
    responseMessage = '🎯 ¿Qué tipo de experiencia buscas?\n\n• 🏛️ Cultural (museos, historia)\n• 🏖️ Playa (relax, sol)\n• ⛰️ Aventura (deportes, naturaleza)\n• 💑 Romance (parejas)\n• 👨‍👩‍👧‍👦 Familiar\n• 🍷 Gastronómico\n• 🌿 Naturaleza y ecoturismo'
    nextStep = 'experience'
    completionPercentage = 50
  } else if (!captured_fields.budget_total) {
    responseMessage = '💰 ¿Cuál es tu presupuesto aproximado? Puede ser un rango. (ej: "$50,000 MXN" o "$3,000 USD")'
    nextStep = 'budget'
    completionPercentage = 65
  } else if (!captured_fields.interests || captured_fields.interests.length === 0) {
    responseMessage = '🎨 ¿Qué intereses específicos tienes? Por ejemplo: historia, arte, gastronomía, compras, vida nocturna, fotografía, bienestar/spa...\n\n¿Hay algún lugar que sea imperdible para ti?'
    nextStep = 'interests'
    completionPercentage = 80
  } else {
    responseMessage = `📋 ¡Ya tengo toda la información! Aquí el resumen:\n\n🗺️ Destino: ${captured_fields.destination}\n📅 Duración: ${captured_fields.duration_nights || '?'} noches\n👥 Viajeros: ${captured_fields.num_adults} adultos\n🎯 Tipo: ${captured_fields.trip_type}\n💰 Presupuesto: $${captured_fields.budget_total?.toLocaleString()} ${captured_fields.budget_currency || 'MXN'}\n\n¿Todo correcto? ¿Genero tu itinerario personalizado? 🚀`
    nextStep = 'ready'
    completionPercentage = 100
  }

  const allFields = {
    ...captured_fields,
    ...Object.fromEntries(
      Object.entries(extractedFields).filter(([, v]) => v != null)
    )
  }

  return NextResponse.json({
    success: true,
    message: responseMessage,
    extracted_fields: extractedFields,
    all_captured_fields: allFields,
    next_step: nextStep,
    completion_percentage: completionPercentage,
    missing_required: getMissingRequired(allFields),
    is_ready: nextStep === 'ready',
    source: 'fallback'
  })
}

// =====================================================
// Generate: Crear itinerario con IA
// =====================================================

async function handleGenerate(body: {
  proposal_id?: number
  captured_fields: CapturedFields
}) {
  const { captured_fields } = body

  // Validar campos requeridos
  const missing = getMissingRequired(captured_fields)
  if (missing.length > 0) {
    return NextResponse.json({
      success: false,
      error: 'Faltan campos requeridos',
      missing_required: missing
    }, { status: 400 })
  }

  // 1. BUSCAR PAQUETES REALES DE MEGATRAVEL
  let mtPackagesContext = "";
  try {
    const mtResult = await pool.query(
      `SELECT mt_code, name, price_usd, total_price_usd, days, cities, mt_url 
       FROM megatravel_packages_with_prices 
       WHERE (destination_region ILIKE $1 OR name ILIKE $1 OR $1 = ANY(countries) OR $1 = ANY(cities))
       AND is_active = true
       ORDER BY total_price_usd ASC
       LIMIT 3`,
      [`%${captured_fields.destination}%`]
    );

    if (mtResult.rows.length > 0) {
      mtPackagesContext = "\n\nPAQUETES REALES DISPONIBLES EN NUESTRO CATÁLOGO (MEGA TRAVEL):\n" + 
        mtResult.rows.map(p => 
          `- ${p.name} (${p.mt_code}): ${p.days} días, desde $${p.total_price_usd} USD. Visita: ${p.cities?.join(', ')}. URL: ${p.mt_url}`
        ).join("\n") + 
        "\n\nINSTRUCCIÓN: Si alguno de estos paquetes encaja con lo que el cliente busca, menciónalo explícitamente como 'Recomendación de catálogo de AS Operadora' y trata de alinear el itinerario a sus ciudades.";
    }
  } catch (e) {
    console.warn("Error fetching MegaTravel packages:", e);
  }

  // Crear o actualizar propuesta en BD
  let proposalId = body.proposal_id

  if (!proposalId) {
    const result = await pool.query(
      `INSERT INTO ai_trip_proposals (
        traveler_name, traveler_email, traveler_phone,
        num_adults, num_children, num_infants, children_ages,
        destination, specific_cities, origin_city,
        start_date, end_date, duration_nights, flexibility,
        trip_type, travel_style, pace,
        interests, must_see, avoid,
        budget_total, budget_currency, budget_flexibility,
        hotel_category, meal_preference, transport_preference,
        dietary_restrictions, mobility_needs, special_occasions,
        additional_notes, captured_fields, status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, 'ai_pending'
      ) RETURNING id, folio`,
      [
        captured_fields.traveler_name || 'Viajero',
        captured_fields.traveler_email,
        captured_fields.traveler_phone,
        captured_fields.num_adults || 1,
        captured_fields.num_children || 0,
        captured_fields.num_infants || 0,
        captured_fields.children_ages || null,
        captured_fields.destination,
        captured_fields.specific_cities || null,
        captured_fields.origin_city,
        captured_fields.start_date || null,
        captured_fields.end_date || null,
        captured_fields.duration_nights,
        captured_fields.flexibility || 'flexible',
        captured_fields.trip_type,
        captured_fields.travel_style || 'comfort',
        captured_fields.pace || 'moderate',
        captured_fields.interests || null,
        captured_fields.must_see || null,
        captured_fields.avoid || null,
        captured_fields.budget_total,
        captured_fields.budget_currency || 'MXN',
        captured_fields.budget_flexibility || 'flexible',
        captured_fields.hotel_category,
        captured_fields.meal_preference,
        captured_fields.transport_preference || null,
        captured_fields.dietary_restrictions || null,
        captured_fields.mobility_needs,
        captured_fields.special_occasions || null,
        captured_fields.additional_notes,
        JSON.stringify(captured_fields)
      ]
    )
    proposalId = result.rows[0].id
  } else {
    await pool.query(
      `UPDATE ai_trip_proposals SET status = 'ai_pending', updated_at = NOW() WHERE id = $1`,
      [proposalId]
    )
  }

  // Generar itinerario con IA
  if (process.env.OPENAI_API_KEY) {
    try {
      const itinerary = await generateItineraryWithAI(captured_fields, mtPackagesContext)

      // Guardar itinerario en propuesta
      await pool.query(
        `UPDATE ai_trip_proposals 
         SET ai_itinerary = $1, 
             ai_model_used = $2,
             ai_generated_at = NOW(),
             status = 'ai_generated',
             updated_at = NOW()
         WHERE id = $3`,
        [JSON.stringify(itinerary), process.env.OPENAI_MODEL || 'gpt-4o', proposalId]
      )

      // Parsear días e insertar en ai_trip_days
      if (itinerary.days && Array.isArray(itinerary.days)) {
        for (const day of itinerary.days) {
          await pool.query(
            `INSERT INTO ai_trip_days (
              proposal_id, day_number, city, title,
              activities, hotel_name, hotel_category, hotel_estimated_cost,
              transport_type, transport_details, transport_estimated_cost,
              meals, estimated_day_cost, sort_order
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            ON CONFLICT (proposal_id, day_number) DO UPDATE SET
              city = EXCLUDED.city, title = EXCLUDED.title,
              activities = EXCLUDED.activities, hotel_name = EXCLUDED.hotel_name,
              hotel_category = EXCLUDED.hotel_category, hotel_estimated_cost = EXCLUDED.hotel_estimated_cost,
              transport_type = EXCLUDED.transport_type, transport_details = EXCLUDED.transport_details,
              transport_estimated_cost = EXCLUDED.transport_estimated_cost,
              meals = EXCLUDED.meals, estimated_day_cost = EXCLUDED.estimated_day_cost`,
            [
              proposalId,
              day.day_number,
              day.city,
              day.title,
              JSON.stringify(day.activities || []),
              day.hotel?.name,
              day.hotel?.category,
              day.hotel?.estimated_cost,
              day.transport?.type,
              day.transport?.details,
              day.transport?.estimated_cost,
              JSON.stringify(day.meals || []),
              day.estimated_day_cost,
              day.day_number
            ]
          )
        }
      }

      // Obtener propuesta completa
      const proposal = await getProposalById(proposalId as number)

      return NextResponse.json({
        success: true,
        proposal,
        itinerary,
        source: 'openai'
      })

    } catch (error: any) {
      console.error('[TRIP-DESIGNER] AI generation failed:', error)
      await pool.query(
        `UPDATE ai_trip_proposals SET status = 'captured', updated_at = NOW() WHERE id = $1`,
        [proposalId]
      )
      return NextResponse.json({
        success: false,
        error: 'Error generando itinerario con IA. Intenta de nuevo.',
        proposal_id: proposalId
      }, { status: 500 })
    }
  }

  // Sin OpenAI: marcar como captured para revisión manual
  await pool.query(
    `UPDATE ai_trip_proposals SET status = 'captured', updated_at = NOW() WHERE id = $1`,
    [proposalId]
  )

  const proposal = await getProposalById(proposalId as number)

  return NextResponse.json({
    success: true,
    proposal,
    itinerary: null,
    message: 'Propuesta guardada. Un agente generará tu itinerario personalizado pronto.',
    source: 'manual'
  })
}

// =====================================================
// Generate Itinerary with OpenAI
// =====================================================

async function generateItineraryWithAI(fields: CapturedFields, additionalContext: string = "") {
  const userPrompt = `Genera un itinerario detallado para este viaje:

DESTINO: ${fields.destination}${fields.specific_cities?.length ? ` (Ciudades: ${fields.specific_cities.join(', ')})` : ''}
ORIGEN: ${fields.origin_city || 'Ciudad de México'}
DURACIÓN: ${fields.duration_nights || 7} noches
FECHAS: ${fields.start_date || 'Flexible'} a ${fields.end_date || 'Flexible'}
VIAJEROS: ${fields.num_adults || 1} adultos${fields.num_children ? `, ${fields.num_children} niños (edades: ${fields.children_ages?.join(', ')})` : ''}
TIPO: ${fields.trip_type || 'cultural'}
ESTILO: ${fields.travel_style || 'comfort'}
RITMO: ${fields.pace || 'moderate'}
PRESUPUESTO: $${fields.budget_total?.toLocaleString() || '50,000'} ${fields.budget_currency || 'MXN'} (${fields.budget_flexibility || 'flexible'})
HOTEL: ${fields.hotel_category || '4 estrellas'}
COMIDAS: ${fields.meal_preference || 'desayuno incluido'}
INTERESES: ${fields.interests?.join(', ') || 'General'}
IMPERDIBLES: ${fields.must_see?.join(', ') || 'Los más populares'}
EVITAR: ${fields.avoid?.join(', ') || 'Nada específico'}
DIETA: ${fields.dietary_restrictions?.join(', ') || 'Sin restricciones'}
MOVILIDAD: ${fields.mobility_needs || 'Sin restricciones'}
OCASIONES: ${fields.special_occasions?.join(', ') || 'Ninguna'}
NOTAS: ${fields.additional_notes || 'Ninguna'}${additionalContext}

Genera el itinerario completo día por día en formato JSON.`

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: ITINERARY_GENERATION_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(`OpenAI error: ${JSON.stringify(error)}`)
  }

  const data = await response.json()
  const content = data.choices[0]?.message?.content || '{}'

  try {
    return JSON.parse(content)
  } catch {
    throw new Error('Failed to parse AI itinerary response')
  }
}

// =====================================================
// Get: Obtener propuesta
// =====================================================

async function handleGet(body: { proposal_id?: number; folio?: string }) {
  const { proposal_id, folio } = body

  if (!proposal_id && !folio) {
    return NextResponse.json({ success: false, error: 'ID o folio requerido' }, { status: 400 })
  }

  let proposal
  if (proposal_id) {
    proposal = await getProposalById(proposal_id as number)
  } else {
    const result = await pool.query(
      `SELECT * FROM ai_trip_proposals WHERE folio = $1`,
      [folio]
    )
    if (result.rows[0]) {
      proposal = await getProposalById(result.rows[0].id)
    }
  }

  if (!proposal) {
    return NextResponse.json({ success: false, error: 'Propuesta no encontrada' }, { status: 404 })
  }

  return NextResponse.json({ success: true, proposal })
}

// =====================================================
// Helpers
// =====================================================

async function getProposalById(id: number) {
  const proposalResult = await pool.query(
    `SELECT * FROM ai_trip_proposals WHERE id = $1`,
    [id]
  )

  if (!proposalResult.rows[0]) return null

  const daysResult = await pool.query(
    `SELECT * FROM ai_trip_days WHERE proposal_id = $1 ORDER BY day_number`,
    [id]
  )

  const servicesResult = await pool.query(
    `SELECT * FROM ai_trip_services WHERE proposal_id = $1 ORDER BY created_at`,
    [id]
  )

  return {
    ...proposalResult.rows[0],
    days: daysResult.rows,
    services: servicesResult.rows
  }
}

function getMissingRequired(fields: CapturedFields): string[] {
  const missing: string[] = []
  if (!fields.destination) missing.push('destination')
  if (!fields.start_date && !fields.duration_nights) missing.push('dates')
  if (!fields.num_adults) missing.push('travelers')
  if (!fields.trip_type) missing.push('trip_type')
  if (!fields.budget_total) missing.push('budget')
  return missing
}
