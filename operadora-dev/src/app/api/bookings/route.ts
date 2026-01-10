import { NextRequest, NextResponse } from 'next/server'
import { query, queryOne, insertOne } from '@/lib/db'

/**
 * GET /api/bookings
 * Listar reservas del usuario
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get('userId') || '1'
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    const sql = `
      SELECT
        id,
        booking_type as type,
        destination as service_name,
        booking_reference,
        booking_status as status,
        total_price,
        currency,
        payment_status,
        lead_traveler_name,
        lead_traveler_email,
        created_at
      FROM bookings
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT $2 OFFSET $3
    `

    const result = await query(sql, [userId, limit, offset])
    const bookings = result.rows || []

    return NextResponse.json({
      success: true,
      data: bookings,
      total: bookings.length
    })

  } catch (error: any) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch bookings',
      message: error.message
    }, { status: 500 })
  }
}

/**
 * POST /api/bookings
 * Crear nueva reserva
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      type,
      service_name,
      total_price,
      currency,
      status,
      payment_status,
      details,
      user_id,
      tenant_id
    } = body

    // Generar referencia de reserva
    const bookingReference = `AS-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Insertar en base de datos (estructura BD producción - todos los campos NOT NULL)
    const priceValue = total_price || 0
    const booking = await insertOne('bookings', {
      user_id: user_id || 1,
      tenant_id: tenant_id || 1,
      booking_type: type || 'general',
      booking_reference: bookingReference,
      booking_status: status || 'pending',
      payment_status: payment_status || 'pending',
      currency: currency || 'MXN',
      exchange_rate: 1,
      original_price: priceValue,
      subtotal: priceValue,
      tax: 0,
      service_fee: 0,
      total_price: priceValue,
      destination: details?.destination || service_name || 'Servicio',
      lead_traveler_name: details?.contacto?.nombre || 'Viajero',
      lead_traveler_email: details?.contacto?.email || '',
      lead_traveler_phone: details?.contacto?.telefono || '',
      adults: details?.pasajeros || 1,
      children: 0,
      special_requests: JSON.stringify(details || {}),
      created_at: new Date()
    })

    // Devolver en formato compatible con checkout
    return NextResponse.json({
      success: true,
      booking: {
        id: booking.id,
        type: booking.booking_type,
        service_name: booking.destination,
        total_price: parseFloat(booking.total_price) || 0,
        currency: booking.currency,
        status: booking.booking_status,
        payment_status: booking.payment_status,
        booking_reference: booking.booking_reference,
        details: details,
        created_at: booking.created_at
      },
      id: booking.id,
      message: 'Reserva creada exitosamente'
    }, { status: 201 })

  } catch (error: any) {
    console.error('Error creating booking:', error)
    return NextResponse.json({
      success: false,
      error: 'Error al crear reserva',
      message: error.message,
      details: error.toString()
    }, { status: 500 })
  }
}
