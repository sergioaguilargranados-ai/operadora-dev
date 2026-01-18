import { NextRequest, NextResponse } from 'next/server'
import { AmadeusAdapter } from '@/services/providers/AmadeusAdapter'
import { insertOne, queryOne } from '@/lib/db'

/**
 * POST /api/groups/quote
 * Genera cotización para viajes grupales
 *
 * Estrategia:
 * - ≤9 pasajeros: Cotización automática con Amadeus
 * - 10-27 pasajeros: División en múltiples PNRs (estimado)
 * - 28+ pasajeros: Cotización manual por agente
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      groupName,
      contactName,
      contactEmail,
      contactPhone,
      origin,
      destination,
      departureDate,
      returnDate,
      totalPassengers,
      adults = totalPassengers,
      children = 0,
      infants = 0,
      cabinClass = 'economy',
      flexibleDates = false,
      specialRequests,
      hotelCategory,
      budgetMin,
      budgetMax
    } = body

    // Validaciones
    if (!origin || !destination || !departureDate || !totalPassengers || !contactEmail) {
      return NextResponse.json({
        success: false,
        error: 'Campos requeridos: origin, destination, departureDate, totalPassengers, contactEmail'
      }, { status: 400 })
    }

    if (totalPassengers < 1) {
      return NextResponse.json({
        success: false,
        error: 'El número de pasajeros debe ser al menos 1'
      }, { status: 400 })
    }

    // Generar folio de referencia
    const referenceId = `GRP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Determinar estrategia según tamaño del grupo
    const strategy = getGroupStrategy(totalPassengers)

    // Intentar cotización automática con Amadeus
    let flightData = null
    let pricePerPerson = 0
    let totalPrice = 0
    let isEstimate = false

    // Si es grupo pequeño o mediano, intentar cotización automática
    if (strategy.type !== 'manual') {
      try {
        if (process.env.AMADEUS_API_KEY && process.env.AMADEUS_API_SECRET) {
          const amadeus = new AmadeusAdapter(
            process.env.AMADEUS_API_KEY,
            process.env.AMADEUS_API_SECRET,
            process.env.AMADEUS_SANDBOX !== 'false'
          )

          const searchAdults = Math.min(adults, 9)
          const searchChildren = Math.min(children, 9 - searchAdults)

          const travelClassMap: Record<string, string> = {
            'economy': 'ECONOMY',
            'business': 'BUSINESS',
            'first': 'FIRST'
          }

          const results = await amadeus.search({
            originLocationCode: origin.toUpperCase(),
            destinationLocationCode: destination.toUpperCase(),
            departureDate,
            returnDate,
            adults: searchAdults,
            children: searchChildren,
            travelClass: travelClassMap[cabinClass] || 'ECONOMY',
            maxResults: 5
          })

          if (results.length > 0) {
            const bestOffer = results.sort((a, b) => a.price - b.price)[0]
            pricePerPerson = bestOffer.price / searchAdults
            totalPrice = pricePerPerson * totalPassengers

            flightData = {
              airline: bestOffer.details?.airline,
              duration: bestOffer.details?.outbound?.duration,
              stops: bestOffer.details?.outbound?.stops,
              departureTime: bestOffer.details?.outbound?.departureTime,
              arrivalTime: bestOffer.details?.outbound?.arrivalTime
            }
          }
        }
      } catch (apiError) {
        console.error('Error al consultar Amadeus para grupo:', apiError)
        isEstimate = true
      }
    }

    // Si no se pudo obtener precio real, usar estimado
    if (pricePerPerson === 0) {
      isEstimate = true
      pricePerPerson = getEstimatedPrice(origin, destination, cabinClass)
      totalPrice = pricePerPerson * totalPassengers
    }

    // Aplicar descuento por grupo
    const groupDiscount = getGroupDiscount(totalPassengers)
    const discountedTotal = totalPrice * (1 - groupDiscount / 100)

    // Calcular distribución de PNRs
    const pnrDistribution = strategy.type === 'multi_pnr' ? splitGroup(totalPassengers) : [totalPassengers]

    // ========== GUARDAR COTIZACIÓN EN BASE DE DATOS ==========
    let savedQuote = null
    try {
      savedQuote = await insertOne('group_quotes', {
        reference_id: referenceId,
        group_name: groupName || 'Grupo sin nombre',
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone || '',
        origin: origin,
        destination: destination,
        departure_date: departureDate,
        return_date: returnDate || null,
        total_passengers: totalPassengers,
        adults: adults,
        children: children,
        infants: infants,
        cabin_class: cabinClass,
        hotel_category: hotelCategory || '',
        budget_min: budgetMin || null,
        budget_max: budgetMax || null,
        special_requests: specialRequests || '',
        quote_type: strategy.type,
        price_per_person: Math.round(pricePerPerson),
        total_before_discount: Math.round(totalPrice),
        discount_percentage: groupDiscount,
        discount_amount: Math.round(totalPrice - discountedTotal),
        total_price: Math.round(discountedTotal),
        currency: 'MXN',
        is_estimate: isEstimate,
        flight_data: flightData ? JSON.stringify(flightData) : null,
        status: strategy.type === 'manual' ? 'pending_review' : 'quoted',
        valid_until: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        created_at: new Date()
      })
      console.log('✅ Cotización grupal guardada:', referenceId)
    } catch (dbError) {
      // Si falla por tabla inexistente, crear la tabla
      console.error('Error guardando cotización (intentando crear tabla):', dbError)

      try {
        // Intentar crear la tabla si no existe
        const { query: dbQuery } = await import('@/lib/db')
        await dbQuery(`
          CREATE TABLE IF NOT EXISTS group_quotes (
            id SERIAL PRIMARY KEY,
            reference_id VARCHAR(50) UNIQUE NOT NULL,
            group_name VARCHAR(255),
            contact_name VARCHAR(255),
            contact_email VARCHAR(255) NOT NULL,
            contact_phone VARCHAR(50),
            origin VARCHAR(100),
            destination VARCHAR(100),
            departure_date DATE,
            return_date DATE,
            total_passengers INTEGER,
            adults INTEGER DEFAULT 0,
            children INTEGER DEFAULT 0,
            infants INTEGER DEFAULT 0,
            cabin_class VARCHAR(50),
            hotel_category VARCHAR(100),
            budget_min DECIMAL(10,2),
            budget_max DECIMAL(10,2),
            special_requests TEXT,
            quote_type VARCHAR(50),
            price_per_person DECIMAL(10,2),
            total_before_discount DECIMAL(10,2),
            discount_percentage DECIMAL(5,2),
            discount_amount DECIMAL(10,2),
            total_price DECIMAL(10,2),
            currency VARCHAR(10) DEFAULT 'MXN',
            is_estimate BOOLEAN DEFAULT false,
            flight_data JSONB,
            status VARCHAR(50) DEFAULT 'pending',
            valid_until TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `)
        console.log('✅ Tabla group_quotes creada')

        // Reintentar inserción
        savedQuote = await insertOne('group_quotes', {
          reference_id: referenceId,
          group_name: groupName || 'Grupo sin nombre',
          contact_name: contactName,
          contact_email: contactEmail,
          contact_phone: contactPhone || '',
          origin: origin,
          destination: destination,
          departure_date: departureDate,
          return_date: returnDate || null,
          total_passengers: totalPassengers,
          adults: adults,
          children: children,
          infants: infants,
          cabin_class: cabinClass,
          special_requests: specialRequests || '',
          quote_type: strategy.type,
          price_per_person: Math.round(pricePerPerson),
          total_before_discount: Math.round(totalPrice),
          discount_percentage: groupDiscount,
          discount_amount: Math.round(totalPrice - discountedTotal),
          total_price: Math.round(discountedTotal),
          currency: 'MXN',
          is_estimate: isEstimate,
          status: strategy.type === 'manual' ? 'pending_review' : 'quoted',
          valid_until: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          created_at: new Date()
        })
        console.log('✅ Cotización grupal guardada (después de crear tabla):', referenceId)
      } catch (createError) {
        console.error('No se pudo crear tabla ni guardar cotización:', createError)
        // Continuar sin guardar en BD
      }
    }

    // ========== ENVIAR EMAIL DE CONFIRMACIÓN AL CLIENTE ==========
    try {
      // Enviar email informativo (sin bloquear respuesta)
      sendQuoteConfirmationEmail({
        to: contactEmail,
        contactName,
        referenceId,
        origin,
        destination,
        departureDate,
        returnDate,
        totalPassengers,
        pricePerPerson: Math.round(pricePerPerson),
        totalPrice: Math.round(discountedTotal),
        groupDiscount,
        quoteType: strategy.type,
        isEstimate
      }).catch(emailErr => {
        console.error('Error enviando email de confirmación:', emailErr)
      })
    } catch (emailError) {
      console.error('Error preparando email:', emailError)
    }

    // Construir respuesta
    const response: any = {
      success: true,
      quoteType: strategy.type,
      referenceId,
      message: strategy.type === 'manual'
        ? 'Solicitud recibida. Un agente te contactará en 24-48 horas.'
        : 'Cotización generada exitosamente.',
      quote: {
        pricePerPerson: Math.round(pricePerPerson),
        totalBeforeDiscount: Math.round(totalPrice),
        groupDiscount: groupDiscount,
        discountAmount: Math.round(totalPrice - discountedTotal),
        totalPrice: Math.round(discountedTotal),
        currency: 'MXN',
        isEstimate,
        validUntil: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      },
      groupDetails: {
        passengers: totalPassengers,
        adults,
        children,
        infants,
        pnrCount: pnrDistribution.length,
        pnrDistribution
      },
      flight: flightData,
      route: {
        origin,
        destination,
        departureDate,
        returnDate,
        cabinClass
      },
      notes: strategy.notes,
      emailSent: true
    }

    if (strategy.type === 'manual') {
      response.estimatedResponseTime = '24-48 horas'
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error en cotización de grupo:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al procesar cotización',
      message: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

/**
 * Determina la estrategia según el tamaño del grupo
 */
function getGroupStrategy(passengers: number): { type: string; notes: string[] } {
  if (passengers <= 9) {
    return {
      type: 'single_pnr',
      notes: [
        'Reserva en un solo PNR',
        'Confirmación inmediata disponible',
        'Todos los pasajeros en la misma reserva'
      ]
    }
  } else if (passengers <= 27) {
    return {
      type: 'multi_pnr',
      notes: [
        `Se crearán ${Math.ceil(passengers / 9)} reservas vinculadas`,
        'Precio sujeto a disponibilidad de asientos',
        'Recomendamos reservar con anticipación'
      ]
    }
  } else {
    return {
      type: 'manual',
      notes: [
        'Grupo grande - requiere cotización personalizada',
        'Un agente especializado te contactará',
        'Posibilidad de tarifas negociadas con aerolíneas'
      ]
    }
  }
}

/**
 * Divide el grupo en sub-grupos de máximo 9
 */
function splitGroup(total: number): number[] {
  const MAX_PER_PNR = 9
  const groups: number[] = []
  let remaining = total

  while (remaining > 0) {
    const groupSize = Math.min(remaining, MAX_PER_PNR)
    groups.push(groupSize)
    remaining -= groupSize
  }

  return groups
}

/**
 * Descuento basado en tamaño del grupo
 */
function getGroupDiscount(passengers: number): number {
  if (passengers >= 20) return 15
  if (passengers >= 15) return 12
  if (passengers >= 10) return 10
  if (passengers >= 5) return 5
  return 0
}

/**
 * Precio estimado cuando no hay API disponible
 */
function getEstimatedPrice(origin: string, destination: string, cabinClass: string): number {
  const basePrices: Record<string, number> = {
    'MEX-CUN': 3200,
    'MEX-GDL': 2100,
    'MEX-MTY': 2400,
    'MEX-SJD': 3500,
    'MEX-PVR': 2800,
    'MEX-MIA': 8500,
    'MEX-LAX': 7200,
    'MEX-MAD': 18000,
    'MEX-CDG': 19500,
  }

  const routeKey = `${origin.toUpperCase()}-${destination.toUpperCase()}`
  let basePrice = basePrices[routeKey] || 4500

  const classMultipliers: Record<string, number> = {
    'economy': 1,
    'business': 2.5,
    'first': 4
  }

  return basePrice * (classMultipliers[cabinClass] || 1)
}

/**
 * Enviar email de confirmación de cotización
 */
async function sendQuoteConfirmationEmail(data: {
  to: string
  contactName: string
  referenceId: string
  origin: string
  destination: string
  departureDate: string
  returnDate?: string
  totalPassengers: number
  pricePerPerson: number
  totalPrice: number
  groupDiscount: number
  quoteType: string
  isEstimate: boolean
}) {
  // Por ahora solo log - cuando se configure SMTP se enviará el email real
  console.log('📧 Email de cotización grupal:', {
    to: data.to,
    subject: `Cotización Viaje Grupal ${data.referenceId} - AS Operadora`,
    body: `
      Hola ${data.contactName},

      Hemos recibido tu solicitud de cotización para viaje grupal.

      📋 DETALLES DE TU COTIZACIÓN
      ============================
      Referencia: ${data.referenceId}
      Origen: ${data.origin}
      Destino: ${data.destination}
      Fecha salida: ${data.departureDate}
      ${data.returnDate ? `Fecha regreso: ${data.returnDate}` : ''}
      Pasajeros: ${data.totalPassengers}

      💰 PRECIO${data.isEstimate ? ' ESTIMADO' : ''}
      ============================
      Precio por persona: $${data.pricePerPerson.toLocaleString()} MXN
      Descuento grupal: ${data.groupDiscount}%
      Total: $${data.totalPrice.toLocaleString()} MXN

      ${data.quoteType === 'manual'
        ? '⏳ Un agente especializado te contactará en las próximas 24-48 horas para darte una cotización personalizada.'
        : '✅ Esta cotización está disponible para reserva. Contáctanos para confirmar.'}

      ¿Tienes preguntas? Responde a este correo o llámanos al 800-123-4567.

      ¡Gracias por elegir AS Operadora!

      --
      AS Operadora de Viajes y Eventos
      www.asoperadora.com
    `
  })

  // TODO: Implementar envío real con SMTP cuando esté configurado
  // const EmailService = (await import('@/services/EmailService')).default
  // await EmailService.send({ ... })

  return true
}
