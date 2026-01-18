/**
 * API Route: POST /api/payments/mercadopago/webhook
 * Webhook para notificaciones IPN de Mercado Pago
 */

import { NextRequest, NextResponse } from 'next/server'
import { MercadoPagoService } from '@/services/MercadoPagoService'
import { query } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    // Headers de verificación
    const xSignature = req.headers.get('x-signature') || ''
    const xRequestId = req.headers.get('x-request-id') || ''

    // Obtener el body
    const body = await req.json()

    console.log('📩 MercadoPago Webhook received:', JSON.stringify(body, null, 2))

    const { type, data } = body

    // Verificar que tenemos los datos necesarios
    if (!type || !data?.id) {
      console.log('ℹ️ Webhook sin data.id, ignorando')
      return NextResponse.json({ received: true })
    }

    // Verificar firma (opcional pero recomendado)
    if (xSignature) {
      const isValid = MercadoPagoService.verifyWebhookSignature(
        xSignature,
        xRequestId,
        data.id.toString()
      )

      if (!isValid) {
        console.warn('⚠️ Firma de webhook inválida (continuando en modo desarrollo)')
      }
    }

    // Procesar la notificación
    const result = await MercadoPagoService.processWebhookNotification(type, data.id.toString())

    if (result.success && result.paymentInfo) {
      const payment = result.paymentInfo

      // Extraer booking_id del external_reference
      // Formato: booking_123_user_1_tenant_1
      const refParts = payment.externalReference.split('_')
      const bookingId = refParts[1] ? parseInt(refParts[1]) : null
      const userId = refParts[3] ? parseInt(refParts[3]) : 1
      const tenantId = refParts[5] ? parseInt(refParts[5]) : 1

      if (bookingId) {
        // Mapear estado de MP a estado interno
        const internalStatus = MercadoPagoService.mapPaymentStatus(payment.status)

        // Guardar/actualizar transacción
        try {
          await query(`
            INSERT INTO payment_transactions (
              booking_id, user_id, tenant_id, amount, currency, status,
              payment_method, transaction_id, payment_details, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, 'mercadopago', $7, $8, NOW())
            ON CONFLICT (transaction_id)
            DO UPDATE SET
              status = $6,
              payment_details = $8,
              completed_at = CASE WHEN $6 = 'completed' THEN NOW() ELSE payment_transactions.completed_at END,
              updated_at = NOW()
          `, [
            bookingId,
            userId,
            tenantId,
            payment.transactionAmount,
            payment.currencyId,
            internalStatus,
            `mp_${payment.id}`,
            JSON.stringify({
              status: payment.status,
              status_detail: payment.statusDetail,
              payment_method_id: payment.paymentMethodId,
              payment_type_id: payment.paymentTypeId,
              payer: payment.payer
            })
          ])
        } catch (dbErr: any) {
          console.warn('⚠️ Could not save to payment_transactions:', dbErr.message)
        }

        // Actualizar estado de la reserva según el resultado
        if (internalStatus === 'completed') {
          await query(`
            UPDATE bookings
            SET booking_status = 'confirmed',
                payment_status = 'paid',
                confirmed_at = NOW()
            WHERE id = $1
          `, [bookingId])

          console.log(`✅ MercadoPago payment approved: Booking #${bookingId} - $${payment.transactionAmount} ${payment.currencyId}`)
        } else if (internalStatus === 'failed') {
          await query(`
            UPDATE bookings
            SET payment_status = 'failed'
            WHERE id = $1
          `, [bookingId])

          console.log(`❌ MercadoPago payment failed: Booking #${bookingId} - ${payment.statusDetail}`)
        } else if (internalStatus === 'refunded') {
          await query(`
            UPDATE bookings
            SET booking_status = 'cancelled',
                payment_status = 'refunded',
                cancelled_at = NOW(),
                cancellation_reason = 'MercadoPago refund'
            WHERE id = $1
          `, [bookingId])

          console.log(`💰 MercadoPago refund processed: Booking #${bookingId}`)
        } else {
          console.log(`ℹ️ MercadoPago payment pending: Booking #${bookingId} - Status: ${payment.status}`)
        }
      }
    }

    // Siempre responder 200 para que MP no reintente
    return NextResponse.json({ received: true })

  } catch (error: any) {
    console.error('Error processing MercadoPago webhook:', error)

    // Responder 200 para evitar reintentos
    return NextResponse.json({ received: true, error: error.message })
  }
}

// GET para verificar que el endpoint existe
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'MercadoPago webhook endpoint active',
    timestamp: new Date().toISOString()
  })
}
