import api from './api'

interface CreatePaymentIntentParams {
    bookingId: number
    userId: number
    tenantId: number
    amount: number // in cents
    currency: string
    description?: string
}

interface CreatePayPalOrderParams {
    bookingId: number
    userId: number
    tenantId: number
    amount: string // "100.00"
    currency: string
    description?: string
    returnUrl?: string
    cancelUrl?: string
}

interface CreateMercadoPagoPreferenceParams {
    bookingId: number | string
    userId: number
    tenantId: number
    amount: number | string
    currency: string
    title: string
    description?: string
    returnUrl?: string
}

const PaymentsService = {
    // Stripe
    createPaymentIntent: async (params: CreatePaymentIntentParams) => {
        try {
            const { data } = await api.post('/payments/stripe/create-payment-intent', params)
            return data
        } catch (error) {
            console.error('Error creating Stripe Payment Intent:', error)
            throw error
        }
    },

    // PayPal
    createPayPalOrder: async (params: CreatePayPalOrderParams) => {
        try {
            const { data } = await api.post('/payments/paypal/create-order', params)
            return data
        } catch (error) {
            console.error('Error creating PayPal Order:', error)
            throw error
        }
    },

    // Mercado Pago
    createMercadoPagoPreference: async (params: CreateMercadoPagoPreferenceParams) => {
        try {
            const { data } = await api.post('/payments/mercadopago/create-preference', params)
            return data
        } catch (error) {
            console.error('Error creating MercadoPago Preference:', error)
            throw error
        }
    }
}

export default PaymentsService
