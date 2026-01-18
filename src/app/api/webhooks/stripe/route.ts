import { NextRequest, NextResponse } from 'next/server'
import { StripeService } from '@/services/StripeService'
import { query } from '@/lib/db'

/**
 * POST /api/webhooks/stripe
 * Webhook para recibir eventos de Stripe
 *
 * Eventos manejados:
 * - payment_intent.succeeded - Pago exitoso
 * - payment_intent.payment_failed - Pago fallido
 * - charge.refunded - Reembolso procesado
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.text()
    const signature = request.headers.get('stripe-signature') || ''

    // Verificar firma del webhook
    let event
    try {
      event = StripeService.verifyWebhookSignature(payload, signature)
    } catch (err: any) {
      console.error('❌ Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

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

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Error processing Stripe webhook:', error)
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}

/**
 * Manejar pago exitoso
 */
async function handlePaymentIntentSucceeded(paymentIntent: any) {
  try {
    const bookingId = paymentIntent.metadata?.booking_id ? parseInt(paymentIntent.metadata.booking_id) : null
    const userId = paymentIntent.metadata?.user_id ? parseInt(paymentIntent.metadata.user_id) : 1
    const tenantId = paymentIntent.metadata?.tenant_id ? parseInt(paymentIntent.metadata.tenant_id) : 1

    if (!bookingId) {
      console.warn('⚠️ No booking_id in payment intent metadata')
      return
    }

    // Guardar/actualizar transacción
    try {
      await query(`
        INSERT INTO payment_transactions (
          booking_id, user_id, tenant_id, amount, currency, status,
          payment_method, transaction_id, payment_details, completed_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, 'completed', 'stripe', $6, $7, NOW(), NOW())
        ON CONFLICT (transaction_id)
        DO UPDATE SET
          status = 'completed',
          payment_details = $7,
          completed_at = NOW(),
          updated_at = NOW()
      `, [
        bookingId,
        userId,
        tenantId,
        paymentIntent.amount / 100,
        paymentIntent.currency.toUpperCase(),
        paymentIntent.id,
        JSON.stringify({
          payment_method_types: paymentIntent.payment_method_types,
          receipt_email: paymentIntent.receipt_email,
          charges: paymentIntent.latest_charge
        })
      ])
    } catch (dbErr: any) {
      console.warn('⚠️ Could not save to payment_transactions:', dbErr.message)
    }

    // Actualizar reserva (usando estructura BD producción)
    await query(`
      UPDATE bookings
      SET booking_status = 'confirmed',
          payment_status = 'paid',
          confirmed_at = NOW()
      WHERE id = $1
    `, [bookingId])

    console.log(`✅ Stripe payment succeeded: Booking #${bookingId} - $${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()}`)

  } catch (error: any) {
    console.error('Error handling payment_intent.succeeded:', error)
  }
}

/**
 * Manejar pago fallido
 */
async function handlePaymentIntentFailed(paymentIntent: any) {
  try {
    const bookingId = paymentIntent.metadata?.booking_id ? parseInt(paymentIntent.metadata.booking_id) : null

    if (!bookingId) {
      console.warn('⚠️ No booking_id in failed payment intent metadata')
      return
    }

    const errorMessage = paymentIntent.last_payment_error?.message || 'Payment failed'

    // Actualizar transacción
    try {
      await query(`
        UPDATE payment_transactions
        SET status = 'failed',
            error_code = $1,
            error_message = $2,
            updated_at = NOW()
        WHERE transaction_id = $3
      `, [
        paymentIntent.last_payment_error?.code || 'unknown',
        errorMessage,
        paymentIntent.id
      ])
    } catch (dbErr: any) {
      console.warn('⚠️ Could not update payment_transactions:', dbErr.message)
    }

    // Actualizar reserva
    await query(`
      UPDATE bookings
      SET payment_status = 'failed'
      WHERE id = $1
    `, [bookingId])

    console.log(`❌ Stripe payment failed: Booking #${bookingId} - ${errorMessage}`)

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

    // Buscar transacción por payment_intent_id
    const transactionResult = await query(
      'SELECT booking_id FROM payment_transactions WHERE transaction_id = $1',
      [paymentIntentId]
    )

    if (!transactionResult.rows || transactionResult.rows.length === 0) {
      console.warn(`⚠️ No transaction found for refund: ${paymentIntentId}`)
      return
    }

    const bookingId = transactionResult.rows[0].booking_id

    // Actualizar transacción
    try {
      await query(`
        UPDATE payment_transactions
        SET status = 'refunded',
            updated_at = NOW()
        WHERE transaction_id = $1
      `, [paymentIntentId])
    } catch (dbErr: any) {
      console.warn('⚠️ Could not update payment_transactions:', dbErr.message)
    }

    // Actualizar reserva
    await query(`
      UPDATE bookings
      SET booking_status = 'cancelled',
          payment_status = 'refunded',
          cancelled_at = NOW(),
          cancellation_reason = 'Refund processed'
      WHERE id = $1
    `, [bookingId])

    console.log(`💰 Stripe refund processed: Booking #${bookingId}`)

  } catch (error: any) {
    console.error('Error handling charge.refunded:', error)
  }
}

// GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Stripe webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}
