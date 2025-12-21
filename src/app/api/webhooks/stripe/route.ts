import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/services/StripeService'
import { query } from '@/lib/db'
import NotificationService from '@/services/NotificationService'

/**
 * POST /api/webhooks/stripe
 * Webhook para recibir eventos de Stripe
 *
 * Eventos manejados:
 * - payment_intent.succeeded - Pago exitoso
 * - payment_intent.payment_failed - Pago fallido
 * - charge.refunded - Reembolso procesado
 * - customer.subscription.created - Subscripción creada
 * - customer.subscription.deleted - Subscripción cancelada
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    // Verificar firma del webhook
    const event = StripeService.verifyWebhookSignature(payload, signature)

    console.log(`📨 Stripe webhook received: ${event.type}`)

    // Manejar evento según tipo
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object)
        break

      case 'charge.refunded':
        await handleChargeRefunded(event.data.object)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}

/**
 * Manejar pago exitoso
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    const bookingId = parseInt(paymentIntent.metadata.booking_id)
    const userId = parseInt(paymentIntent.metadata.user_id)
    const tenantId = parseInt(paymentIntent.metadata.tenant_id)

    // Actualizar transacción
    await query(
      `UPDATE payment_transactions
       SET status = 'completed',
           paid_at = NOW(),
           updated_at = NOW()
       WHERE transaction_id = $1
         AND payment_method = 'stripe'`,
      [paymentIntent.id]
    )

    // Actualizar reserva
    await query(
      `UPDATE bookings
       SET status = 'confirmed',
           payment_status = 'paid',
           updated_at = NOW()
       WHERE id = $1`,
      [bookingId]
    )

    // Obtener datos del usuario para enviar email
    const user = await query(
      'SELECT email, name FROM users WHERE id = $1',
      [userId]
    )

    if (user.rows && user.rows.length > 0) {
      const userData = user.rows[0]

      // Enviar email de confirmación
      await NotificationService.sendBookingConfirmation(
        userData.email,
        {
          bookingReference: `BK-${bookingId}`,
          userName: userData.name,
          bookingType: 'flight', // TODO: Get from booking
          totalAmount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          details: {
            bookingId,
            serviceName: 'Reserva confirmada',
            date: new Date().toISOString()
          }
        }
      )
    }

    console.log(`✅ Payment succeeded: Booking #${bookingId}`)

  } catch (error: any) {
    console.error('Error handling payment_intent.succeeded:', error)
  }
}

/**
 * Manejar pago fallido
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const bookingId = parseInt(paymentIntent.metadata.booking_id)

    // Actualizar transacción
    await query(
      `UPDATE payment_transactions
       SET status = 'failed',
           error_message = $1,
           updated_at = NOW()
       WHERE transaction_id = $2
         AND payment_method = 'stripe'`,
      [paymentIntent.last_payment_error?.message || 'Payment failed', paymentIntent.id]
    )

    // Actualizar reserva
    await query(
      `UPDATE bookings
       SET payment_status = 'failed',
           updated_at = NOW()
       WHERE id = $1`,
      [bookingId]
    )

    console.log(`❌ Payment failed: Booking #${bookingId}`)

  } catch (error: any) {
    console.error('Error handling payment_intent.payment_failed:', error)
  }
}

/**
 * Manejar reembolso
 */
async function handleChargeRefunded(charge: any) {
  try {
    const paymentIntentId = charge.payment_intent

    // Actualizar transacción
    await query(
      `UPDATE payment_transactions
       SET status = 'refunded',
           refunded_at = NOW(),
           updated_at = NOW()
       WHERE transaction_id = $1
         AND payment_method = 'stripe'`,
      [paymentIntentId]
    )

    // Actualizar reserva
    const transaction = await query(
      'SELECT booking_id FROM payment_transactions WHERE transaction_id = $1',
      [paymentIntentId]
    )

    if (transaction.rows && transaction.rows.length > 0) {
      const bookingId = transaction.rows[0].booking_id

      await query(
        `UPDATE bookings
         SET status = 'cancelled',
             payment_status = 'refunded',
             updated_at = NOW()
         WHERE id = $1`,
        [bookingId]
      )

      console.log(`💰 Refund processed: Booking #${bookingId}`)
    }

  } catch (error: any) {
    console.error('Error handling charge.refunded:', error)
  }
}

/**
 * Manejar creación de subscripción
 */
async function handleSubscriptionCreated(subscription: any) {
  try {
    const tenantId = parseInt(subscription.metadata.tenant_id)

    await query(
      `INSERT INTO subscriptions (
        tenant_id,
        stripe_subscription_id,
        status,
        created_at
      ) VALUES ($1, $2, $3, NOW())
      ON CONFLICT (stripe_subscription_id) DO NOTHING`,
      [tenantId, subscription.id, subscription.status]
    )

    console.log(`✅ Subscription created: ${subscription.id} for tenant ${tenantId}`)

  } catch (error: any) {
    console.error('Error handling customer.subscription.created:', error)
  }
}

/**
 * Manejar cancelación de subscripción
 */
async function handleSubscriptionDeleted(subscription: any) {
  try {
    await query(
      `UPDATE subscriptions
       SET status = 'cancelled',
           cancelled_at = NOW(),
           updated_at = NOW()
       WHERE stripe_subscription_id = $1`,
      [subscription.id]
    )

    console.log(`❌ Subscription cancelled: ${subscription.id}`)

  } catch (error: any) {
    console.error('Error handling customer.subscription.deleted:', error)
  }
}
