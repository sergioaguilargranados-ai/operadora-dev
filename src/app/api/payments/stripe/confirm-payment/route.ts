import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/services/StripeService'
import { query } from '@/lib/db'
import { emailService } from '@/services/EmailService'

/**
 * POST /api/payments/stripe/confirm-payment
 * Confirmar pago de Stripe después de que el usuario complete el pago
 *
 * Body:
 * {
 *   paymentIntentId: string
 * }
 *
 * Response:
 * {
 *   success: true
 *   status: string
 *   bookingId: number
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { paymentIntentId } = body

    if (!paymentIntentId) {
      return NextResponse.json(
        {
          success: false,
          error: 'paymentIntentId es requerido'
        },
        { status: 400 }
      )
    }

    // Obtener Payment Intent de Stripe
    const paymentIntent = await StripeService.getPaymentIntent(paymentIntentId)

    // Verificar que el pago fue exitoso
    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        {
          success: false,
          error: 'El pago no ha sido completado',
          status: paymentIntent.status
        },
        { status: 400 }
      )
    }

    const bookingId = parseInt(paymentIntent.metadata.booking_id)
    const userId = parseInt(paymentIntent.metadata.user_id)
    const tenantId = parseInt(paymentIntent.metadata.tenant_id)

    // Actualizar transacción en BD
    await query(
      `UPDATE payment_transactions
       SET status = $1,
           paid_at = NOW(),
           updated_at = NOW()
       WHERE transaction_id = $2
         AND payment_method = 'stripe'`,
      ['completed', paymentIntentId]
    )

    // Actualizar estado de reserva a 'confirmed'
    await query(
      `UPDATE bookings
       SET status = 'confirmed',
           payment_status = 'paid',
           updated_at = NOW()
       WHERE id = $1
         AND user_id = $2
         AND tenant_id = $3`,
      [bookingId, userId, tenantId]
    )

    // Obtener datos de la reserva para enviar email
    const bookingResult = await query(
      `SELECT b.*,
              COALESCE(u.name, b.details->>'contacto'->>'nombre', 'Cliente') as customer_name,
              COALESCE(u.email, b.details->>'contacto'->>'email', '') as customer_email
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       WHERE b.id = $1`,
      [bookingId]
    )

    if (bookingResult.rows.length > 0) {
      const booking = bookingResult.rows[0]

      // Enviar email de confirmación de pago
      try {
        await emailService.sendPaymentConfirmation(
          bookingId,
          booking.customer_email,
          booking.total_price,
          booking.currency
        )

        // Enviar email de confirmación de reserva
        await emailService.sendBookingConfirmation({
          bookingId: booking.id,
          customerName: booking.customer_name,
          customerEmail: booking.customer_email,
          serviceName: booking.service_name,
          totalPrice: booking.total_price,
          currency: booking.currency,
          bookingDate: booking.created_at,
          details: booking.details || {}
        })

        console.log(`📧 Emails sent for booking #${bookingId}`)
      } catch (emailError) {
        console.error('Error sending emails:', emailError)
        // No fallar la transacción si el email falla
      }
    }

    console.log(`✅ Payment confirmed: Booking #${bookingId} paid via Stripe`)

    return NextResponse.json({
      success: true,
      status: 'succeeded',
      bookingId,
      message: 'Pago confirmado exitosamente'
    })

  } catch (error: any) {
    console.error('Error confirming payment:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al confirmar pago',
        details: error.message
      },
      { status: 500 }
    )
  }
}
