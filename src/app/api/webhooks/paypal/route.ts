import { NextRequest, NextResponse } from 'next/server'
import { PayPalService } from '@/services/PayPalService'
import { query } from '@/lib/db'

/**
 * POST /api/webhooks/paypal
 * Webhook para recibir eventos de PayPal
 *
 * Eventos manejados:
 * - PAYMENT.CAPTURE.COMPLETED - Pago capturado exitosamente
 * - PAYMENT.CAPTURE.DENIED - Pago denegado
 * - PAYMENT.CAPTURE.REFUNDED - Reembolso procesado
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const event = JSON.parse(body)

    const headers: Record<string, string> = {
      'paypal-transmission-id': request.headers.get('paypal-transmission-id') || '',
      'paypal-transmission-time': request.headers.get('paypal-transmission-time') || '',
      'paypal-cert-url': request.headers.get('paypal-cert-url') || '',
      'paypal-auth-algo': request.headers.get('paypal-auth-algo') || '',
      'paypal-transmission-sig': request.headers.get('paypal-transmission-sig') || ''
    }

    // Verificar firma del webhook (si está configurado)
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    if (webhookId) {
      const isValid = await PayPalService.verifyWebhookSignature(headers, body, webhookId)
      if (!isValid) {
        console.error('❌ Invalid PayPal webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    console.log(`📨 PayPal webhook received: ${event.event_type}`)

    // Manejar evento según tipo
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handleCaptureCompleted(event.resource)
        break

      case 'PAYMENT.CAPTURE.DENIED':
        await handleCaptureDenied(event.resource)
        break

      case 'PAYMENT.CAPTURE.REFUNDED':
        await handleCaptureRefunded(event.resource)
        break

      case 'CHECKOUT.ORDER.APPROVED':
        await handleOrderApproved(event.resource)
        break

      default:
        console.log(`ℹ️ Unhandled PayPal event type: ${event.event_type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

/**
 * Extraer booking_id de custom_id o invoice_id
 * Formato: booking_123 o INV-123-timestamp
 */
function extractBookingId(resource: any): number | null {
  // Intentar de custom_id
  const customId = resource.custom_id || resource.purchase_units?.[0]?.custom_id
  if (customId) {
    const match = customId.match(/booking_(\d+)/)
    if (match) return parseInt(match[1])
  }

  // Intentar de invoice_id
  const invoiceId = resource.invoice_id || resource.purchase_units?.[0]?.invoice_id
  if (invoiceId) {
    const match = invoiceId.match(/INV-(\d+)/)
    if (match) return parseInt(match[1])
  }

  return null
}

/**
 * Manejar pago capturado exitosamente
 */
async function handleCaptureCompleted(resource: any) {
  try {
    const captureId = resource.id
    const orderId = resource.supplementary_data?.related_ids?.order_id
    const amount = resource.amount?.value || 0
    const currency = resource.amount?.currency_code || 'USD'

    // Buscar booking_id en transacciones existentes
    let bookingId: number | null = null

    if (orderId) {
      const txResult = await query(
        'SELECT booking_id FROM payment_transactions WHERE transaction_id = $1',
        [orderId]
      )
      if (txResult.rows?.[0]) {
        bookingId = txResult.rows[0].booking_id
      }
    }

    if (!bookingId) {
      bookingId = extractBookingId(resource)
    }

    if (!bookingId) {
      console.warn('⚠️ No booking_id found in PayPal capture')
      return
    }

    // Actualizar transacción
    try {
      await query(`
        UPDATE payment_transactions
        SET status = 'completed',
            payment_details = $1,
            completed_at = NOW(),
            updated_at = NOW()
        WHERE transaction_id = $2 OR booking_id = $3
      `, [
        JSON.stringify({ capture_id: captureId, amount, currency }),
        orderId,
        bookingId
      ])
    } catch (dbErr: any) {
      console.warn('⚠️ Could not update payment_transactions:', dbErr.message)
    }

    // Actualizar reserva
    await query(`
      UPDATE bookings
      SET booking_status = 'confirmed',
          payment_status = 'paid',
          confirmed_at = NOW()
      WHERE id = $1
    `, [bookingId])

    console.log(`✅ PayPal capture completed: Booking #${bookingId} - $${amount} ${currency}`)

  } catch (error: any) {
    console.error('Error handling PAYMENT.CAPTURE.COMPLETED:', error)
  }
}

/**
 * Manejar orden aprobada (usuario aprobó en PayPal)
 */
async function handleOrderApproved(resource: any) {
  try {
    const orderId = resource.id
    const bookingId = extractBookingId(resource)

    if (!bookingId) {
      console.warn('⚠️ No booking_id found in order approved')
      return
    }

    // Actualizar transacción como procesando
    try {
      await query(`
        UPDATE payment_transactions
        SET status = 'processing',
            updated_at = NOW()
        WHERE transaction_id = $1
      `, [orderId])
    } catch (dbErr: any) {
      console.warn('⚠️ Could not update payment_transactions:', dbErr.message)
    }

    console.log(`📋 PayPal order approved: Booking #${bookingId} - Order ${orderId}`)

  } catch (error: any) {
    console.error('Error handling CHECKOUT.ORDER.APPROVED:', error)
  }
}

/**
 * Manejar pago denegado
 */
async function handleCaptureDenied(resource: any) {
  try {
    const orderId = resource.supplementary_data?.related_ids?.order_id
    let bookingId: number | null = null

    if (orderId) {
      const txResult = await query(
        'SELECT booking_id FROM payment_transactions WHERE transaction_id = $1',
        [orderId]
      )
      if (txResult.rows?.[0]) {
        bookingId = txResult.rows[0].booking_id
      }
    }

    if (!bookingId) {
      bookingId = extractBookingId(resource)
    }

    if (!bookingId) {
      console.warn('⚠️ No booking_id found in denied capture')
      return
    }

    // Actualizar transacción
    try {
      await query(`
        UPDATE payment_transactions
        SET status = 'failed',
            error_message = 'Payment denied by PayPal',
            updated_at = NOW()
        WHERE transaction_id = $1 OR booking_id = $2
      `, [orderId, bookingId])
    } catch (dbErr: any) {
      console.warn('⚠️ Could not update payment_transactions:', dbErr.message)
    }

    // Actualizar reserva
    await query(`
      UPDATE bookings
      SET payment_status = 'failed'
      WHERE id = $1
    `, [bookingId])

    console.log(`❌ PayPal capture denied: Booking #${bookingId}`)

  } catch (error: any) {
    console.error('Error handling PAYMENT.CAPTURE.DENIED:', error)
  }
}

/**
 * Manejar reembolso
 */
async function handleCaptureRefunded(resource: any) {
  try {
    const captureId = resource.id

    // Buscar transacción por capture_id en payment_details
    const txResult = await query(`
      SELECT booking_id FROM payment_transactions
      WHERE payment_details::text LIKE $1
    `, [`%${captureId}%`])

    if (!txResult.rows?.[0]) {
      console.warn(`⚠️ No transaction found for refund capture: ${captureId}`)
      return
    }

    const bookingId = txResult.rows[0].booking_id

    // Actualizar transacción
    try {
      await query(`
        UPDATE payment_transactions
        SET status = 'refunded',
            updated_at = NOW()
        WHERE booking_id = $1
      `, [bookingId])
    } catch (dbErr: any) {
      console.warn('⚠️ Could not update payment_transactions:', dbErr.message)
    }

    // Actualizar reserva
    await query(`
      UPDATE bookings
      SET booking_status = 'cancelled',
          payment_status = 'refunded',
          cancelled_at = NOW(),
          cancellation_reason = 'PayPal refund processed'
      WHERE id = $1
    `, [bookingId])

    console.log(`💰 PayPal refund processed: Booking #${bookingId}`)

  } catch (error: any) {
    console.error('Error handling PAYMENT.CAPTURE.REFUNDED:', error)
  }
}

// GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'PayPal webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}
