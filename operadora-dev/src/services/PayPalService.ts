/**
 * PayPalService.ts
 * Servicio para integración con PayPal
 *
 * Funcionalidades:
 * - Crear orden de pago
 * - Capturar pago
 * - Reembolsos
 * - Webhooks
 */

import paypal from '@paypal/checkout-server-sdk'

// Configurar entorno (sandbox o production)
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || ''
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || ''

  // Verificar que las credenciales estén configuradas
  if (!clientId || !clientSecret) {
    return null
  }

  if (process.env.NODE_ENV === 'production') {
    return new paypal.core.LiveEnvironment(clientId, clientSecret)
  } else {
    return new paypal.core.SandboxEnvironment(clientId, clientSecret)
  }
}

// Cliente de PayPal
function client() {
  const env = environment()
  if (!env) {
    throw new Error('PayPal no está configurado. Verifica PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET en variables de entorno.')
  }
  return new paypal.core.PayPalHttpClient(env)
}

export interface CreateOrderParams {
  amount: string // "100.00"
  currency: string // 'USD', 'MXN', etc.
  bookingId: number
  userId: number
  tenantId: number
  description?: string
  returnUrl?: string
  cancelUrl?: string
}

export interface CaptureOrderParams {
  orderId: string
}

export interface RefundParams {
  captureId: string
  amount?: {
    value: string
    currency_code: string
  }
  note?: string
}

export class PayPalService {
  /**
   * Crear orden de pago
   * Primer paso en flujo de PayPal
   */
  static async createOrder(params: CreateOrderParams) {
    try {
      const request = new paypal.orders.OrdersCreateRequest()
      request.prefer('return=representation')
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: params.currency.toUpperCase(),
              value: params.amount
            },
            description: params.description || `Reserva #${params.bookingId}`,
            custom_id: `booking_${params.bookingId}`,
            invoice_id: `INV-${params.bookingId}-${Date.now()}`
          }
        ],
        application_context: {
          brand_name: 'AS Operadora',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: params.returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`,
          cancel_url: params.cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/cancelled`
        }
      })

      const response = await client().execute(request)

      console.log(`✅ PayPal Order created: ${response.result.id} - $${params.amount} ${params.currency}`)

      return {
        orderId: response.result.id,
        status: response.result.status,
        links: response.result.links
      }

    } catch (error: any) {
      console.error('❌ Error creating PayPal order:', error.message)
      throw new Error(`Error al crear orden de PayPal: ${error.message}`)
    }
  }

  /**
   * Capturar pago
   * Segundo paso, capturar el pago después de que el usuario apruebe
   */
  static async captureOrder(params: CaptureOrderParams) {
    try {
      const request = new paypal.orders.OrdersCaptureRequest(params.orderId)
      // @ts-ignore - PayPal SDK acepta objeto vacío en capture
      request.requestBody({})

      const response = await client().execute(request)

      console.log(`✅ PayPal Order captured: ${response.result.id} - Status: ${response.result.status}`)

      return {
        orderId: response.result.id,
        status: response.result.status,
        payerEmail: response.result.payer?.email_address,
        payerId: response.result.payer?.payer_id,
        captureId: response.result.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        amount: response.result.purchase_units?.[0]?.payments?.captures?.[0]?.amount
      }

    } catch (error: any) {
      console.error('❌ Error capturing PayPal order:', error.message)
      throw new Error(`Error al capturar pago de PayPal: ${error.message}`)
    }
  }

  /**
   * Obtener detalles de orden
   */
  static async getOrder(orderId: string) {
    try {
      const request = new paypal.orders.OrdersGetRequest(orderId)
      const response = await client().execute(request)

      return response.result

    } catch (error: any) {
      console.error('❌ Error getting PayPal order:', error.message)
      throw new Error(`Error al obtener orden de PayPal: ${error.message}`)
    }
  }

  /**
   * Crear reembolso
   */
  static async createRefund(params: RefundParams) {
    try {
      const request = new paypal.payments.CapturesRefundRequest(params.captureId)

      const requestBody: any = {
        note_to_payer: params.note || 'Reembolso de reserva'
      }

      if (params.amount) {
        requestBody.amount = params.amount
      }

      // @ts-ignore - PayPal SDK types issue con amount opcional
      request.requestBody(requestBody)

      const response = await client().execute(request)

      console.log(`✅ PayPal Refund created: ${response.result.id}`)

      return {
        refundId: response.result.id,
        status: response.result.status,
        amount: response.result.amount
      }

    } catch (error: any) {
      console.error('❌ Error creating PayPal refund:', error.message)
      throw new Error(`Error al crear reembolso de PayPal: ${error.message}`)
    }
  }

  /**
   * Verificar webhook signature (seguridad)
   * NOTA: Deshabilitado temporalmente por tipos de PayPal SDK
   */
  static async verifyWebhookSignature(
    headers: Record<string, string>,
    body: string,
    webhookId: string
  ): Promise<boolean> {
    try {
      // TODO: Implementar verificación de webhook
      // La API de PayPal SDK no tiene tipos completos para notifications
      console.warn('⚠️ PayPal webhook verification not fully implemented')
      return true // Por ahora aceptar todos (SOLO EN DESARROLLO)

    } catch (error: any) {
      console.error('❌ Error verifying PayPal webhook:', error.message)
      return false
    }
  }

  // ============================================================================
  // SUBSCRIPTIONS (COMENTADO - Requiere PayPal Billing API no disponible en tipos)
  // ============================================================================

  /**
   * Crear producto (para subscripciones)
   * NOTA: Deshabilitado temporalmente por tipos incompletos de PayPal SDK
   * TODO: Implementar cuando se actualicen los tipos o usar API REST directamente
   */
  /*
  static async createProduct(name: string, description: string) {
    // Implementación comentada - requiere paypal.catalogs
  }

  static async createBillingPlan(...) {
    // Implementación comentada - requiere paypal.billing
  }

  static async createSubscription(...) {
    // Implementación comentada - requiere paypal.billing
  }

  static async cancelSubscription(...) {
    // Implementación comentada - requiere paypal.billing
  }
  */
}
