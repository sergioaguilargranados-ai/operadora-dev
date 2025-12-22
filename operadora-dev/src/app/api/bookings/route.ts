import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, insertOne } from '@/lib/db'
import AmadeusAdapter from '@/services/providers/AmadeusAdapter'
import KiwiAdapter from '@/services/providers/KiwiAdapter'
import ExpediaAdapter from '@/services/providers/ExpediaAdapter'

/**
 * GET /api/bookings
 * Listar reservas del usuario autenticado
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener user ID del token JWT (opcional por ahora)
    let userId = await getUserIdFromToken(request)

    // Si no hay token, usar userId de query params para testing
    if (!userId) {
      const searchParams = request.nextUrl.searchParams
      const userIdParam = searchParams.get('userId')
      if (userIdParam) {
        userId = parseInt(userIdParam)
      } else {
        return NextResponse.json({
          success: false,
          error: 'Unauthorized - userId required'
        }, { status: 401 })
      }
    }

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // pending, confirmed, cancelled
    const type = searchParams.get('type') // flight, hotel, package
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    // Construir query
    let sql = `
      SELECT
        b.id,
        b.booking_type,
        b.booking_reference,
        b.provider,
        b.status,
        b.total_amount,
        b.currency,
        b.booking_details,
        b.traveler_info,
        b.created_at,
        b.confirmed_at,
        b.cancelled_at,
        b.cancellation_reason
      FROM bookings b
      WHERE b.user_id = $1
        AND b.is_active = true
    `

    const params: any[] = [userId]
    let paramIndex = 2

    if (status) {
      sql += ` AND b.status = $${paramIndex}`
      params.push(status)
      paramIndex++
    }

    if (type) {
      sql += ` AND b.booking_type = $${paramIndex}`
      params.push(type)
      paramIndex++
    }

    sql += ` ORDER BY b.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`
    params.push(limit, offset)

    const bookingsResult = await query(sql, params)
    const bookings = bookingsResult.rows || []

    // Contar total
    let countSql = `
      SELECT COUNT(*) as total
      FROM bookings
      WHERE user_id = $1 AND is_active = true
    `
    const countParams: any[] = [userId]
    let countParamIndex = 2

    if (status) {
      countSql += ` AND status = ${countParamIndex}`
      countParams.push(status)
      countParamIndex++
    }

    if (type) {
      countSql += ` AND booking_type = ${countParamIndex}`
      countParams.push(type)
    }

    const countResult = await queryOne(countSql, countParams)
    const total = parseInt(countResult?.total || '0', 10)

    return NextResponse.json({
      success: true,
      data: bookings,
      total,
      pagination: {
        limit,
        offset,
        hasMore: offset + bookings.length < total
      }
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bookings',
      message: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * POST /api/bookings
 * Crear nueva reserva
 */
export async function POST(request: NextRequest) {
  try {
    // Obtener user ID del token JWT
    const userId = await getUserIdFromToken(request)

    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized'
      }, { status: 401 })
    }

    const body = await request.json()

    const {
      provider,        // amadeus, kiwi, expedia, booking
      booking_type,    // flight, hotel, package
      offer_id,        // ID de la oferta a reservar
      traveler_info,   // Información de viajeros
      contact_info,    // Email, teléfono
      payment_info,    // Opcional: Info de pago
      special_requests, // Opcional: Peticiones especiales
      cost_center_id   // Opcional: Centro de costo para tracking
    } = body

    // Validaciones
    if (!provider || !booking_type || !offer_id || !traveler_info || !contact_info) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: provider, booking_type, offer_id, traveler_info, contact_info'
      }, { status: 400 })
    }

    // Crear reserva según proveedor
    let bookingResult

    switch (provider.toLowerCase()) {
      case 'amadeus':
        bookingResult = await createAmadeusBooking({
          offerId: offer_id,
          travelerInfo: traveler_info,
          contactInfo: contact_info
        })
        break

      case 'kiwi':
        bookingResult = await createKiwiBooking({
          bookingToken: offer_id,
          passengers: traveler_info,
          contact: contact_info
        })
        break

      case 'expedia':
        bookingResult = await createExpediaBooking({
          offerId: offer_id,
          travelerInfo: traveler_info,
          contactInfo: contact_info
        })
        break

      case 'booking':
      case 'database':
        // Booking.com y database no permiten reservas directas
        // Generar reserva "pending" para aprobación manual
        bookingResult = {
          bookingReference: `PENDING-${Date.now()}`,
          status: 'pending_confirmation',
          provider: provider,
          details: {
            offer_id,
            traveler_info,
            contact_info,
            special_requests
          }
        }
        break

      default:
        return NextResponse.json({
          success: false,
          error: `Unsupported provider: ${provider}`
        }, { status: 400 })
    }

    // Guardar en base de datos
    const booking = await insertOne('bookings', {
      user_id: userId,
      booking_type: booking_type,
      booking_reference: bookingResult.bookingReference,
      provider: provider,
      status: bookingResult.status || 'confirmed',
      total_amount: body.total_amount || 0,
      currency: body.currency || 'MXN',
      booking_details: JSON.stringify(bookingResult.details || {}),
      traveler_info: JSON.stringify(traveler_info),
      contact_info: JSON.stringify(contact_info),
      payment_info: payment_info ? JSON.stringify(payment_info) : null,
      special_requests: special_requests || null,
      cost_center_id: cost_center_id ? parseInt(cost_center_id) : null, // 🔥 NUEVO
      confirmed_at: bookingResult.status === 'confirmed' ? new Date() : null
    })

    // TODO: Enviar email de confirmación
    // await sendBookingConfirmationEmail(booking)

    // TODO: Generar voucher PDF
    // await generateVoucherPDF(booking)

    return NextResponse.json({
      success: true,
      data: {
        id: booking.id,
        booking_reference: booking.booking_reference,
        status: booking.status,
        provider: booking.provider,
        booking_type: booking.booking_type,
        total_amount: booking.total_amount,
        currency: booking.currency,
        created_at: booking.created_at,
        traveler_info: JSON.parse(booking.traveler_info),
        contact_info: JSON.parse(booking.contact_info),
        details: JSON.parse(booking.booking_details)
      },
      message: 'Booking created successfully'
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create booking',
      message: (error as Error).message
    }, { status: 500 })
  }
}

/**
 * Helper: Crear reserva en Amadeus
 */
async function createAmadeusBooking(data: any) {
  if (!process.env.AMADEUS_API_KEY || !process.env.AMADEUS_API_SECRET) {
    throw new Error('Amadeus credentials not configured')
  }

  const amadeus = new AmadeusAdapter(
    process.env.AMADEUS_API_KEY,
    process.env.AMADEUS_API_SECRET,
    process.env.AMADEUS_SANDBOX === 'true'
  )

  return await amadeus.createBooking(data)
}

/**
 * Helper: Crear reserva en Kiwi
 */
async function createKiwiBooking(data: any) {
  if (!process.env.KIWI_API_KEY) {
    throw new Error('Kiwi API key not configured')
  }

  const kiwi = new KiwiAdapter(process.env.KIWI_API_KEY)

  return await kiwi.createBooking(data)
}

/**
 * Helper: Crear reserva en Expedia
 */
async function createExpediaBooking(data: any) {
  if (!process.env.EXPEDIA_API_KEY || !process.env.EXPEDIA_API_SECRET) {
    throw new Error('Expedia credentials not configured')
  }

  const expedia = new ExpediaAdapter(
    process.env.EXPEDIA_API_KEY,
    process.env.EXPEDIA_API_SECRET,
    process.env.EXPEDIA_SANDBOX === 'true'
  )

  return await expedia.createBooking(data)
}

/**
 * Helper: Obtener user ID del token JWT
 */
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
