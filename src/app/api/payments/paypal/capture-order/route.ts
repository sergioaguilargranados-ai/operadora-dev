import { NextRequest, NextResponse } from 'next/server'
import { PayPalService } from '@/services/PayPalService'
import { query } from '@/lib/db'
import NotificationService from '@/services/NotificationService'
import { emailService } from '@/services/EmailService'

/**
 * POST /api/payments/paypal/capture-order
 * Capturar pago de PayPal después de que el usuario apruebe
 *
 * Body:
 * {
 *   orderId: string
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
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: 'orderId es requerido'
        },
        { status: 400 }
      )
    }

    // Capturar orden en PayPal
    const capture = await PayPalService.captureOrder({ orderId })

    if (capture.status !== 'COMPLETED') {
      return NextResponse.json(
        {
          success: false,
          error: 'El pago no ha sido completado',
          status: capture.status
        },
        { status: 400 }
      )
    }

    // Obtener datos de la transacción de BD
    const transaction = await query(
      `SELECT booking_id, user_id, tenant_id, amount, currency
       FROM payment_transactions
       WHERE transaction_id = $1
         AND payment_method = 'paypal'`,
      [orderId]
    )

    if (!transaction.rows || transaction.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Transacción no encontrada'
        },
        { status: 404 }
      )
    }

    const txn = transaction.rows[0]
    const bookingId = txn.booking_id
    const userId = txn.user_id
    const tenantId = txn.tenant_id

    // Actualizar transacción en BD
    await query(
      `UPDATE payment_transactions
       SET status = 'completed',
           paid_at = NOW(),
           payer_email = $1,
           payer_id = $2,
           capture_id = $3,
           updated_at = NOW()
       WHERE transaction_id = $4
         AND payment_method = 'paypal'`,
      [
        capture.payerEmail,
        capture.payerId,
        capture.captureId,
        orderId
      ]
    )

    // Actualizar estado de reserva
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

      // Enviar emails de confirmación
      try {
        await emailService.sendPaymentConfirmation(
          bookingId,
          booking.customer_email,
          booking.total_price,
          booking.currency
        )

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

    console.log(`✅ PayPal payment captured: Booking #${bookingId}`)

    return NextResponse.json({
      success: true,
      status: 'completed',
      bookingId,
      message: 'Pago confirmado exitosamente'
    })

  } catch (error: any) {
    console.error('Error capturing PayPal order:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Error al capturar pago de PayPal',
        details: error.message
      },
      { status: 500 }
    )
  }
}
