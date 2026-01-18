/**
 * MercadoPagoService.ts
 * Servicio para integración con Mercado Pago
 *
 * Funcionalidades:
 * - Crear preferencia de pago
 * - Procesar pagos
 * - Reembolsos
 * - Webhooks
 *
 * Documentación: https://www.mercadopago.com.mx/developers/es/docs
 */

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'

// Configuración de Mercado Pago
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || ''

const client = accessToken ? new MercadoPagoConfig({
  accessToken,
  options: { timeout: 5000 }
}) : null

export interface CreatePreferenceParams {
  bookingId: number
  userId: number
  tenantId: number
  amount: number
  currency: string
  title: string
  description?: string
  quantity?: number
  returnUrl?: string
  notificationUrl?: string
}

export interface PreferenceResponse {
  preferenceId: string
  initPoint: string
  sandboxInitPoint: string
}

export interface PaymentInfo {
  id: number
  status: string
  statusDetail: string
  paymentMethodId: string
  paymentTypeId: string
  transactionAmount: number
  currencyId: string
  dateCreated: string
  dateApproved: string | null
  externalReference: string
  payer: {
    id: number
    email: string
    firstName: string
    lastName: string
  }
}

export interface RefundParams {
  paymentId: number
  amount?: number // Opcional, si no se especifica se reembolsa todo
}

export class MercadoPagoService {
  /**
   * Verificar que Mercado Pago está configurado
   */
  private static checkConfig(): void {
    if (!client) {
      throw new Error('Mercado Pago no está configurado. Verifica MERCADOPAGO_ACCESS_TOKEN en variables de entorno.')
    }
  }

  /**
   * Crear preferencia de pago
   * Primer paso para procesar un pago con Mercado Pago
   */
  static async createPreference(params: CreatePreferenceParams): Promise<PreferenceResponse> {
    this.checkConfig()

    try {
      const preference = new Preference(client!)

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

      const preferenceData = {
        items: [
          {
            id: `booking_${params.bookingId}`,
            title: params.title,
            description: params.description || `Reserva #${params.bookingId}`,
            quantity: params.quantity || 1,
            currency_id: params.currency.toUpperCase() === 'USD' ? 'USD' : 'MXN',
            unit_price: params.amount
          }
        ],
        payer: {
          // Se puede agregar info del cliente aquí
        },
        back_urls: {
          success: params.returnUrl || `${baseUrl}/payment/success?source=mercadopago`,
          failure: `${baseUrl}/payment/failure?source=mercadopago`,
          pending: `${baseUrl}/payment/pending?source=mercadopago`
        },
        auto_return: 'approved' as const,
        external_reference: `booking_${params.bookingId}_user_${params.userId}_tenant_${params.tenantId}`,
        notification_url: params.notificationUrl || `${baseUrl}/api/payments/mercadopago/webhook`,
        statement_descriptor: 'AS OPERADORA',
        expires: true,
        expiration_date_from: new Date().toISOString(),
        expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 horas
        metadata: {
          booking_id: params.bookingId,
          user_id: params.userId,
          tenant_id: params.tenantId
        }
      }

      const response = await preference.create({ body: preferenceData })

      console.log(`✅ MercadoPago Preference created: ${response.id} - $${params.amount} ${params.currency}`)

      return {
        preferenceId: response.id!,
        initPoint: response.init_point!,
        sandboxInitPoint: response.sandbox_init_point!
      }

    } catch (error: any) {
      console.error('❌ Error creating MercadoPago preference:', error.message)
      throw new Error(`Error al crear preferencia de pago: ${error.message}`)
    }
  }

  /**
   * Obtener información de un pago
   */
  static async getPayment(paymentId: number): Promise<PaymentInfo> {
    this.checkConfig()

    try {
      const payment = new Payment(client!)
      const response = await payment.get({ id: paymentId })

      return {
        id: response.id!,
        status: response.status!,
        statusDetail: response.status_detail!,
        paymentMethodId: response.payment_method_id!,
        paymentTypeId: response.payment_type_id!,
        transactionAmount: response.transaction_amount!,
        currencyId: response.currency_id!,
        dateCreated: response.date_created!,
        dateApproved: response.date_approved || null,
        externalReference: response.external_reference || '',
        payer: {
          id: typeof response.payer?.id === 'number' ? response.payer.id : 0,
          email: response.payer?.email || '',
          firstName: response.payer?.first_name || '',
          lastName: response.payer?.last_name || ''
        }
      }

    } catch (error: any) {
      console.error('❌ Error getting MercadoPago payment:', error.message)
      throw new Error(`Error al obtener pago: ${error.message}`)
    }
  }

  /**
   * Crear reembolso
   */
  static async createRefund(params: RefundParams): Promise<any> {
    this.checkConfig()

    try {
      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/${params.paymentId}/refunds`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify(
            params.amount ? { amount: params.amount } : {}
          )
        }
      )

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear reembolso')
      }

      const refund = await response.json()

      console.log(`✅ MercadoPago Refund created: ${refund.id}`)

      return {
        refundId: refund.id,
        status: refund.status,
        amount: refund.amount,
        dateCreated: refund.date_created
      }

    } catch (error: any) {
      console.error('❌ Error creating MercadoPago refund:', error.message)
      throw new Error(`Error al crear reembolso: ${error.message}`)
    }
  }

  /**
   * Verificar firma de webhook (IPN)
   */
  static verifyWebhookSignature(
    xSignature: string,
    xRequestId: string,
    dataId: string
  ): boolean {
    try {
      const crypto = require('crypto')
      const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET || ''

      if (!secret) {
        console.warn('⚠️ MERCADOPAGO_WEBHOOK_SECRET no configurado, aceptando webhook')
        return true
      }

      // Separar ts y hash del header x-signature
      const parts = xSignature.split(',')
      let ts = ''
      let hash = ''

      for (const part of parts) {
        const [key, value] = part.split('=')
        if (key === 'ts') ts = value
        if (key === 'v1') hash = value
      }

      // Construir el manifest
      const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

      // Calcular HMAC
      const hmac = crypto.createHmac('sha256', secret)
      hmac.update(manifest)
      const calculatedHash = hmac.digest('hex')

      return calculatedHash === hash

    } catch (error: any) {
      console.error('❌ Error verifying webhook signature:', error.message)
      return false
    }
  }

  /**
   * Procesar notificación de webhook (IPN)
   */
  static async processWebhookNotification(
    type: string,
    dataId: string
  ): Promise<{ success: boolean; paymentInfo?: PaymentInfo }> {
    this.checkConfig()

    try {
      // Solo procesamos notificaciones de pago
      if (type !== 'payment') {
        console.log(`ℹ️ Webhook type ${type} ignorado`)
        return { success: true }
      }

      // Obtener información del pago
      const paymentInfo = await this.getPayment(parseInt(dataId))

      console.log(`📩 MercadoPago Webhook: Payment ${dataId} - Status: ${paymentInfo.status}`)

      return { success: true, paymentInfo }

    } catch (error: any) {
      console.error('❌ Error processing webhook:', error.message)
      return { success: false }
    }
  }

  /**
   * Mapear estado de MP a estado interno
   */
  static mapPaymentStatus(mpStatus: string): string {
    const statusMap: Record<string, string> = {
      'approved': 'completed',
      'pending': 'pending',
      'in_process': 'pending',
      'rejected': 'failed',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'refunded'
    }

    return statusMap[mpStatus] || 'pending'
  }

  /**
   * Listar pagos (para dashboard)
   */
  static async listPayments(
    filters?: {
      beginDate?: string
      endDate?: string
      status?: string
      limit?: number
      offset?: number
    }
  ): Promise<any[]> {
    this.checkConfig()

    try {
      const params = new URLSearchParams()
      if (filters?.beginDate) params.append('begin_date', filters.beginDate)
      if (filters?.endDate) params.append('end_date', filters.endDate)
      if (filters?.status) params.append('status', filters.status)
      params.append('limit', (filters?.limit || 50).toString())
      params.append('offset', (filters?.offset || 0).toString())

      const response = await fetch(
        `https://api.mercadopago.com/v1/payments/search?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Error al listar pagos')
      }

      const data = await response.json()
      return data.results || []

    } catch (error: any) {
      console.error('❌ Error listing MercadoPago payments:', error.message)
      throw new Error(`Error al listar pagos: ${error.message}`)
    }
  }
}
