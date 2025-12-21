import { NextRequest, NextResponse } from 'next/server'
import { PayPalService } from '@/services/PayPalService'
import { query } from '@/lib/db'

/**
 * POST /api/webhooks/paypal
 * Webhook para recibir eventos de PayPal
 *
 * Eventos manejados:
 * - PAYMENT.CAPTURE.COMPLETED - Pago capturado
 * - PAYMENT.CAPTURE.DENIED - Pago denegado
 * - PAYMENT.CAPTURE.REFUNDED - Reembolso procesado
 * - BILLING.SUBSCRIPTION.CREATED - Subscripción creada
 * - BILLING.SUBSCRIPTION.CANCELLED - Subscripción cancelada
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const event = JSON.parse(body)

    const headers = {
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
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        )
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

      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(event.resource)
        break

      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(event.resource)
        break

      default:
        console.log(`⚠️ Unhandled PayPal event type: ${event.event_type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Error processing PayPal webhook:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

/**
 * Manejar pago capturado
 */
async function handleCaptureCompleted(resource: any) {
  try {
    const orderId = resource.supplementary_data?.related_ids?.order_id

    if (!orderId) {
      console.warn('No order_id found in capture')
      return
    }

    // Actualizar transacción
    await query(
      `UPDATE payment_transactions
       SET status = 'completed',
           paid_at = NOW(),
           capture_id = $1,
           updated_at = NOW()
       WHERE transaction_id = $2
         AND payment_method = 'paypal'`,
      [resource.id, orderId]
    )

    // Obtener booking_id
    const transaction = await query(
      'SELECT booking_id FROM payment_transactions WHERE transaction_id = $1',
      [orderId]
    )

    if (transaction.rows && transaction.rows.length > 0) {
      const bookingId = transaction.rows[0].booking_id

      // Actualizar reserva
      await query(
        `UPDATE bookings
         SET status = 'confirmed',
             payment_status = 'paid',
             updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      )

      console.log(`✅ PayPal capture completed: Booking #${bookingId}`)
    }

  } catch (error: any) {
    console.error('Error handling PAYMENT.CAPTURE.COMPLETED:', error)
  }
}

/**
 * Manejar pago denegado
 */
async function handleCaptureDenied(resource: any) {
  try {
    const orderId = resource.supplementary_data?.related_ids?.order_id

    if (!orderId) {
      console.warn('No order_id found in denied capture')
      return
    }

    // Actualizar transacción
    await query(
      `UPDATE payment_transactions
       SET status = 'failed',
           error_message = 'Payment denied',
           updated_at = NOW()
       WHERE transaction_id = $1
         AND payment_method = 'paypal'`,
      [orderId]
    )

    // Obtener booking_id
    const transaction = await query(
      'SELECT booking_id FROM payment_transactions WHERE transaction_id = $1',
      [orderId]
    )

    if (transaction.rows && transaction.rows.length > 0) {
      const bookingId = transaction.rows[0].booking_id

      // Actualizar reserva
      await query(
        `UPDATE bookings
         SET payment_status = 'failed',
             updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      )

      console.log(`❌ PayPal capture denied: Booking #${bookingId}`)
    }

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

    // Actualizar transacción
    await query(
      `UPDATE payment_transactions
       SET status = 'refunded',
           refunded_at = NOW(),
           updated_at = NOW()
       WHERE capture_id = $1
         AND payment_method = 'paypal'`,
      [captureId]
    )

    // Obtener booking_id
    const transaction = await query(
      'SELECT booking_id FROM payment_transactions WHERE capture_id = $1',
      [captureId]
    )

    if (transaction.rows && transaction.rows.length > 0) {
      const bookingId = transaction.rows[0].booking_id

      // Actualizar reserva
      await query(
        `UPDATE bookings
         SET status = 'cancelled',
             payment_status = 'refunded',
             updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      )

      console.log(`💰 PayPal refund processed: Booking #${bookingId}`)
    }

  } catch (error: any) {
    console.error('Error handling PAYMENT.CAPTURE.REFUNDED:', error)
  }
}

/**
 * Manejar creación de subscripción
 */
async function handleSubscriptionCreated(resource: any) {
  try {
    const tenantId = resource.custom_id ? parseInt(resource.custom_id) : null

    if (!tenantId) {
      console.warn('No tenant_id found in subscription')
      return
    }

    await query(
      `INSERT INTO subscriptions (
        tenant_id,
        paypal_subscription_id,
        status,
        created_at
      ) VALUES ($1, $2, $3, NOW())
      ON CONFLICT (paypal_subscription_id) DO NOTHING`,
      [tenantId, resource.id, resource.status]
    )

    console.log(`✅ PayPal subscription created: ${resource.id} for tenant ${tenantId}`)

  } catch (error: any) {
    console.error('Error handling BILLING.SUBSCRIPTION.CREATED:', error)
  }
}

/**
 * Manejar cancelación de subscripción
 */
async function handleSubscriptionCancelled(resource: any) {
  try {
    await query(
      `UPDATE subscriptions
       SET status = 'cancelled',
           cancelled_at = NOW(),
           updated_at = NOW()
       WHERE paypal_subscription_id = $1`,
      [resource.id]
    )

    console.log(`❌ PayPal subscription cancelled: ${resource.id}`)

  } catch (error: any) {
    console.error('Error handling BILLING.SUBSCRIPTION.CANCELLED:', error)
  }
}
