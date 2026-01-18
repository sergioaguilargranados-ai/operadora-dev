import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/services/StripeService'
import { query } from '@/lib/db'

/**
 * POST /api/payments/stripe/create-payment-intent
 * Crear Payment Intent para iniciar pago con Stripe
 *
 * Body:
 * {
 *   bookingId: number
 *   userId: number
 *   tenantId: number
 *   amount: number // en centavos (10000 = $100.00)
 *   currency: string // 'usd', 'mxn'
 *   description?: string
 * }
 *
 * Response:
 * {
 *   success: true
 *   clientSecret: string
 *   paymentIntentId: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, userId, tenantId, amount, currency, description } = body

    // Validaciones
    if (!bookingId || !userId || !tenantId || !amount || !currency) {
      return NextResponse.json(
        {
          success: false,
          error: 'Faltan parámetros requeridos'
        },
        { status: 400 }
      )
    }

    if (amount < 50) {
      return NextResponse.json(
        {
          success: false,
          error: 'El monto mínimo es $0.50'
        },
        { status: 400 }
      )
    }

    // Verificar que la reserva existe y pertenece al usuario
    const booking = await query(
      `SELECT id, user_id, tenant_id, total_price, booking_status, payment_status
       FROM bookings
       WHERE id = $1
         AND user_id = $2
         AND tenant_id = $3`,
      [bookingId, userId, tenantId]
    )

    if (!booking.rows || booking.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Reserva no encontrada'
        },
        { status: 404 }
      )
    }

    const bookingData = booking.rows[0]

    // Verificar que la reserva no esté ya pagada
    if (bookingData.payment_status === 'paid' || bookingData.booking_status === 'confirmed') {
      return NextResponse.json(
        {
          success: false,
          error: 'La reserva ya está pagada'
        },
        { status: 400 }
      )
    }

    // Crear Payment Intent
    const paymentIntent = await StripeService.createPaymentIntent({
      amount,
      currency,
      bookingId,
      userId,
      tenantId,
      description: description || `Reserva #${bookingId} - AS Operadora`
    })

    // Guardar payment_intent_id en la tabla de transacciones (opcional)
    try {
      await query(
        `INSERT INTO payment_transactions (
          booking_id,
          user_id,
          tenant_id,
          amount,
          currency,
          status,
          payment_method,
          transaction_id,
          created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
        [
          bookingId,
          userId,
          tenantId,
          amount / 100, // Convertir de centavos a dólares
          currency.toUpperCase(),
          'pending',
          'stripe',
          paymentIntent.id
        ]
      )
    } catch (dbError: any) {
      // Si la tabla no existe, loguear pero continuar
      console.warn('⚠️ No se pudo guardar transacción en BD:', dbError.message)
    }

    return NextResponse.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    })

  } catch (error: any) {
    console.error('Error creating payment intent:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al crear intento de pago',
        details: error.message
      },
      { status: 500 }
    )
  }
}
