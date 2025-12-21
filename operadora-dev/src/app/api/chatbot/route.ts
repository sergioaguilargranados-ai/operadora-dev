import { NextRequest, NextResponse } from 'next/server'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * POST /api/chatbot
 * Procesa mensajes del chatbot con IA contextual
 */
export async function POST(request: NextRequest) {
  try {
    const { message, context, history } = await request.json()

    if (!message) {
      return NextResponse.json({
        success: false,
        error: 'Mensaje requerido'
      }, { status: 400 })
    }

    // Intentar usar OpenAI si está configurado
    if (process.env.OPENAI_API_KEY) {
      const response = await generateOpenAIResponse(message, context, history)
      return NextResponse.json({
        success: true,
        response,
        source: 'openai'
      })
    }

    // Fallback: Sistema de respuestas inteligentes
    const response = generateSmartResponse(message, context)
    return NextResponse.json({
      success: true,
      response,
      source: 'smart-rules'
    })

  } catch (error: any) {
    console.error('[CHATBOT] Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Error procesando mensaje'
    }, { status: 500 })
  }
}

/**
 * Genera respuesta usando OpenAI GPT-4
 */
async function generateOpenAIResponse(
  message: string,
  context: string,
  history: Message[]
): Promise<string> {
  const systemPrompt = getSystemPrompt(context)

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-10), // Últimos 10 mensajes
    { role: 'user', content: message }
  ]

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      temperature: 0.7,
      max_tokens: 500
    })
  })

  if (!response.ok) {
    throw new Error('Error en OpenAI API')
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || 'Lo siento, no pude generar una respuesta.'
}

/**
 * Sistema de respuestas inteligentes basado en reglas
 */
function generateSmartResponse(message: string, context: string): string {
  const lowerMessage = message.toLowerCase()

  // Saludos
  if (/^(hola|hi|hey|buenos|buenas)/i.test(lowerMessage)) {
    return '¡Hola! 👋 Bienvenido a AS Operadora. ¿Te gustaría buscar vuelos, hoteles o paquetes vacacionales?'
  }

  // Búsqueda de vuelos
  if (lowerMessage.includes('vuelo') || lowerMessage.includes('volar') || lowerMessage.includes('avion')) {
    return '✈️ ¡Claro! Puedo ayudarte a buscar vuelos. ¿A dónde te gustaría viajar? Por ejemplo:\n\n"Busco un vuelo de Ciudad de México a Cancún"\n\nTambién puedes decirme las fechas que tienes en mente.'
  }

  // Búsqueda de hoteles
  if (lowerMessage.includes('hotel') || lowerMessage.includes('hospedaje') || lowerMessage.includes('alojamiento')) {
    return '🏨 ¡Perfecto! Puedo ayudarte a encontrar el hotel ideal. ¿En qué ciudad te gustaría hospedarte?\n\nPuedo mostrarte opciones con:\n• Mejores precios\n• Ubicaciones céntricas\n• Comodidades especiales'
  }

  // Paquetes
  if (lowerMessage.includes('paquete') || lowerMessage.includes('todo incluido') || lowerMessage.includes('vacaciones')) {
    return '📦 ¡Excelente! Nuestros paquetes incluyen vuelo + hotel con grandes descuentos.\n\n¿Te interesa algún destino en particular?\n• Playa (Cancún, Los Cabos, Puerto Vallarta)\n• Ciudad (CDMX, Guadalajara, Monterrey)\n• Internacional (París, Nueva York, Madrid)'
  }

  // Precios
  if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuanto') || lowerMessage.includes('cuánto')) {
    return '💰 Los precios varían según:\n• Destino\n• Fechas de viaje\n• Temporada (alta/baja)\n• Anticipación de compra\n\n¿Me dices a dónde quieres viajar y cuándo? Te busco las mejores opciones.'
  }

  // Ayuda con reservas
  if (lowerMessage.includes('reserva') || lowerMessage.includes('reservar') || lowerMessage.includes('booking')) {
    return '📋 Para hacer una reserva necesito:\n1. Destino\n2. Fechas (ida y vuelta si es redondo)\n3. Número de pasajeros\n4. Preferencias (ventana, pasillo, etc.)\n\n¿Tienes esta información lista?'
  }

  // Cancelaciones
  if (lowerMessage.includes('cancelar') || lowerMessage.includes('cancelación') || lowerMessage.includes('reembolso')) {
    return '❌ Para cancelaciones:\n\n• Entra a "Mis Reservas" con tu email\n• Selecciona la reserva\n• Revisa la política de cancelación\n• Solicita el reembolso si aplica\n\n¿Necesitas ayuda con alguna reserva específica?'
  }

  // Pagos
  if (lowerMessage.includes('pagar') || lowerMessage.includes('pago') || lowerMessage.includes('tarjeta')) {
    return '💳 Aceptamos:\n• Tarjetas de crédito/débito (Visa, Mastercard, AMEX)\n• PayPal\n• Transferencia bancaria\n• Pago en efectivo (sucursales)\n\nTodos los pagos son 100% seguros con encriptación SSL.'
  }

  // Destinos populares
  if (lowerMessage.includes('destino') || lowerMessage.includes('donde') || lowerMessage.includes('dónde')) {
    return '🌎 Destinos más populares:\n\n🇲🇽 **México:**\n• Cancún\n• Los Cabos\n• Puerto Vallarta\n• Playa del Carmen\n\n🌍 **Internacional:**\n• París, Francia\n• Nueva York, USA\n• Madrid, España\n• Roma, Italia\n\n¿Alguno te interesa?'
  }

  // Documentos
  if (lowerMessage.includes('documento') || lowerMessage.includes('pasaporte') || lowerMessage.includes('visa')) {
    return '📄 Documentación necesaria:\n\n**Nacional:**\n• INE/IFE o Pasaporte\n\n**Internacional:**\n• Pasaporte vigente (6 meses mínimo)\n• Visa (según destino)\n• Certificado de vacunación (algunos países)\n\n¿Viajas a algún destino específico?'
  }

  // Contacto
  if (lowerMessage.includes('contacto') || lowerMessage.includes('teléfono') || lowerMessage.includes('whatsapp') || lowerMessage.includes('email')) {
    return '📞 Contáctanos:\n\n• 📱 WhatsApp: +52 55 1234 5678\n• ✉️ Email: info@asoperadora.com\n• ☎️ Teléfono: 55 1234 5678\n\nHorario: Lun-Vie 9:00-18:00, Sáb 10:00-14:00'
  }

  // Gracias / Despedida
  if (lowerMessage.includes('gracias') || lowerMessage.includes('bye') || lowerMessage.includes('adios') || lowerMessage.includes('adiós')) {
    return '¡De nada! 😊 Fue un placer ayudarte. Si tienes más preguntas, aquí estaré. ¡Buen viaje! ✈️'
  }

  // Respuesta general contextual
  if (context === 'homepage') {
    return '¿En qué puedo ayudarte hoy? Puedo ayudarte con:\n\n✈️ Búsqueda de vuelos\n🏨 Reservas de hoteles\n📦 Paquetes todo incluido\n💰 Información de precios\n📋 Estado de reservas\n\n¿Qué te interesa?'
  }

  // Fallback inteligente
  return 'Entiendo tu pregunta. ¿Podrías darme más detalles?\n\nPuedo ayudarte con:\n• Vuelos\n• Hoteles\n• Paquetes\n• Reservas\n• Precios\n\n¿Cuál de estos te interesa?'
}

/**
 * Genera el prompt del sistema según el contexto
 */
function getSystemPrompt(context: string): string {
  const basePrompt = `Eres un asistente virtual amigable y profesional de AS Operadora, una agencia de viajes mexicana.

Tu objetivo es ayudar a los clientes con:
- Búsqueda de vuelos, hoteles y paquetes
- Información sobre destinos
- Proceso de reservas
- Preguntas sobre pagos y cancelaciones
- Recomendaciones personalizadas

Reglas:
- Responde siempre en español
- Sé amable, claro y conciso
- Usa emojis ocasionalmente para ser más amigable
- Si no sabes algo, admítelo y ofrece contactar a un agente humano
- Sugiere opciones concretas cuando sea posible
- Menciona precios en MXN (pesos mexicanos)

Contexto actual: ${context}
`

  return basePrompt
}
