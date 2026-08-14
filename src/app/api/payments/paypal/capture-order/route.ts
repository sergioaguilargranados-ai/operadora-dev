import { NextRequest, NextResponse } from 'next/server'
import { PayPalService } from '@/services/PayPalService'
import { query } from '@/lib/db'
import NotificationService from '@/services/NotificationService'
import { emailService } from '@/services/EmailService'
import { StoreOrderService } from '@/services/StoreOrderService'

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

    // Si la reserva es de la tienda móvil, procesar orden y referidos
    await StoreOrderService.handleStoreOrderPayment(bookingId)

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

      // Enviar correo de confirmación de pago con nuevo template
      try {
        const { sendPaymentConfirmationEmail } = await import('@/lib/emailHelper');
        await sendPaymentConfirmationEmail({
          name: booking.customer_name,
          email: booking.customer_email,
          bookingId: booking.id,
          amount: parseFloat(txn.amount),
          currency: txn.currency,
          paymentDate: new Date().toLocaleDateString('es-MX', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          paymentMethod: 'PayPal',
          transactionId: orderId,
          serviceName: booking.destination || booking.service_name,
          travelDate: booking.details?.fecha_inicio || booking.details?.checkIn || '',
          invoiceAvailable: true
        });

        console.log(`📧 Correo de confirmación de pago enviado para reserva #${bookingId}`);
      } catch (emailError) {
        console.error('⚠️ Error enviando correo de confirmación de pago:', emailError);
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
