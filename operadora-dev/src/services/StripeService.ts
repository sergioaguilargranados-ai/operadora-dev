/**
 * StripeService.ts
 * Servicio para integración con Stripe
 *
 * Funcionalidades:
 * - Crear Payment Intent (iniciar pago)
 * - Confirmar pago
 * - Procesar webhooks
 * - Reembolsos
 * - Subscripciones (empresas)
 */

import Stripe from 'stripe'

// Inicializar Stripe con la clave secreta solo si está disponible
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ''
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2025-11-17.clover',
  typescript: true
}) : null

export interface CreatePaymentIntentParams {
  amount: number // En centavos (ej: 10000 = $100.00)
  currency: string // 'usd', 'mxn', etc.
  bookingId: number
  userId: number
  tenantId: number
  description?: string
  metadata?: Record<string, string>
}

export interface ConfirmPaymentParams {
  paymentIntentId: string
  paymentMethodId: string
}

export interface RefundParams {
  paymentIntentId: string
  amount?: number // Opcional, si no se especifica se reembolsa todo
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
}

export interface CreateSubscriptionParams {
  customerId: string
  priceId: string
  tenantId: number
  metadata?: Record<string, string>
}

export class StripeService {
  /**
   * Verificar que Stripe está configurado
   */
  private static checkStripeConfig(): void {
    if (!stripe) {
      throw new Error('Stripe no está configurado. Verifica STRIPE_SECRET_KEY en variables de entorno.')
    }
  }

  /**
   * Crear Payment Intent
   * Primer paso para procesar un pago
   */
  static async createPaymentIntent(params: CreatePaymentIntentParams): Promise<Stripe.PaymentIntent> {
    this.checkStripeConfig()

    try {
      const paymentIntent = await stripe!.paymentIntents.create({
        amount: params.amount,
        currency: params.currency.toLowerCase(),
        description: params.description || `Reserva #${params.bookingId}`,
        metadata: {
          booking_id: params.bookingId.toString(),
          user_id: params.userId.toString(),
          tenant_id: params.tenantId.toString(),
          ...params.metadata
        },
        automatic_payment_methods: {
          enabled: true,
          allow_redirects: 'never' // Solo métodos directos (no redirect a banco)
        }
      })

      console.log(`✅ Payment Intent created: ${paymentIntent.id} - $${params.amount / 100} ${params.currency}`)

      return paymentIntent

    } catch (error: any) {
      console.error('❌ Error creating payment intent:', error.message)
      throw new Error(`Error al crear intento de pago: ${error.message}`)
    }
  }

  /**
   * Confirmar Payment Intent
   * Segundo paso, confirmar el pago con el método de pago
   */
  static async confirmPayment(params: ConfirmPaymentParams): Promise<Stripe.PaymentIntent> {
    this.checkStripeConfig()

    try {
      const paymentIntent = await stripe!.paymentIntents.confirm(params.paymentIntentId, {
        payment_method: params.paymentMethodId,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`
      })

      console.log(`✅ Payment confirmed: ${paymentIntent.id} - Status: ${paymentIntent.status}`)

      return paymentIntent

    } catch (error: any) {
      console.error('❌ Error confirming payment:', error.message)
      throw new Error(`Error al confirmar pago: ${error.message}`)
    }
  }

  /**
   * Obtener detalles de Payment Intent
   */
  static async getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    this.checkStripeConfig()

    try {
      const paymentIntent = await stripe!.paymentIntents.retrieve(paymentIntentId)
      return paymentIntent
    } catch (error: any) {
      console.error('❌ Error getting payment intent:', error.message)
      throw new Error(`Error al obtener intento de pago: ${error.message}`)
    }
  }

  /**
   * Crear reembolso
   */
  static async createRefund(params: RefundParams): Promise<Stripe.Refund> {
    this.checkStripeConfig()

    try {
      const refund = await stripe!.refunds.create({
        payment_intent: params.paymentIntentId,
        amount: params.amount, // Si no se especifica, reembolsa todo
        reason: params.reason || 'requested_by_customer'
      })

      console.log(`✅ Refund created: ${refund.id} - $${refund.amount / 100}`)

      return refund

    } catch (error: any) {
      console.error('❌ Error creating refund:', error.message)
      throw new Error(`Error al crear reembolso: ${error.message}`)
    }
  }

  /**
   * Crear cliente (para subscripciones)
   */
  static async createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<Stripe.Customer> {
    this.checkStripeConfig()

    try {
      const customer = await stripe!.customers.create({
        email,
        name,
        metadata
      })

      console.log(`✅ Customer created: ${customer.id} - ${email}`)

      return customer

    } catch (error: any) {
      console.error('❌ Error creating customer:', error.message)
      throw new Error(`Error al crear cliente: ${error.message}`)
    }
  }

  /**
   * Crear subscripción (para empresas)
   */
  static async createSubscription(params: CreateSubscriptionParams): Promise<Stripe.Subscription> {
    this.checkStripeConfig()

    try {
      const subscription = await stripe!.subscriptions.create({
        customer: params.customerId,
        items: [{ price: params.priceId }],
        metadata: {
          tenant_id: params.tenantId.toString(),
          ...params.metadata
        },
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent']
      })

      console.log(`✅ Subscription created: ${subscription.id}`)

      return subscription

    } catch (error: any) {
      console.error('❌ Error creating subscription:', error.message)
      throw new Error(`Error al crear subscripción: ${error.message}`)
    }
  }

  /**
   * Cancelar subscripción
   */
  static async cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    this.checkStripeConfig()

    try {
      const subscription = await stripe!.subscriptions.cancel(subscriptionId)

      console.log(`✅ Subscription cancelled: ${subscription.id}`)

      return subscription

    } catch (error: any) {
      console.error('❌ Error cancelling subscription:', error.message)
      throw new Error(`Error al cancelar subscripción: ${error.message}`)
    }
  }

  /**
   * Verificar firma de webhook (seguridad)
   */
  static verifyWebhookSignature(payload: string, signature: string): Stripe.Event {
    this.checkStripeConfig()

    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

      const event = stripe!.webhooks.constructEvent(payload, signature, webhookSecret)

      return event

    } catch (error: any) {
      console.error('❌ Webhook signature verification failed:', error.message)
      throw new Error('Firma de webhook inválida')
    }
  }

  /**
   * Listar transacciones (para dashboard)
   */
  static async listPayments(limit: number = 100): Promise<Stripe.ApiList<Stripe.PaymentIntent>> {
    this.checkStripeConfig()

    try {
      const payments = await stripe!.paymentIntents.list({
        limit
      })

      return payments

    } catch (error: any) {
      console.error('❌ Error listing payments:', error.message)
      throw new Error(`Error al listar pagos: ${error.message}`)
    }
  }

  /**
   * Obtener balance de cuenta (para conciliación)
   */
  static async getBalance(): Promise<Stripe.Balance> {
    this.checkStripeConfig()

    try {
      const balance = await stripe!.balance.retrieve()
      return balance
    } catch (error: any) {
      console.error('❌ Error getting balance:', error.message)
      throw new Error(`Error al obtener balance: ${error.message}`)
    }
  }
}
