'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface StripeCheckoutFormProps {
  bookingId: number
  amount: number
  currency: string
}

export default function StripeCheckoutForm({
  bookingId,
  amount,
  currency
}: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const { toast } = useToast()

  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setErrorMessage('')

    try {
      // Confirmar pago
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?bookingId=${bookingId}`
        },
        redirect: 'if_required'
      })

      if (error) {
        setErrorMessage(error.message || 'Error al procesar el pago')
        toast({
          title: 'Error en el pago',
          description: error.message,
          variant: 'destructive'
        })
        return
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Confirmar pago en backend
        const res = await fetch('/api/payments/stripe/confirm-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id
          })
        })

        if (!res.ok) {
          throw new Error('Error al confirmar pago')
        }

        toast({
          title: '¡Pago exitoso!',
          description: 'Tu reserva ha sido confirmada'
        })

        // Redirigir a página de éxito
        setTimeout(() => {
          router.push(`/reserva/${bookingId}`)
        }, 1500)
      }

    } catch (error: any) {
      console.error('Error processing payment:', error)
      setErrorMessage(error.message || 'Error al procesar el pago')
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={!stripe || processing}
          className="w-full"
          size="lg"
        >
          {processing ? (
            <span className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Procesando pago...
            </span>
          ) : (
            `Pagar $${amount.toFixed(2)} ${currency.toUpperCase()}`
          )}
        </Button>

        <p className="text-xs text-center text-gray-500">
          🔒 Pago seguro encriptado con SSL
        </p>
      </div>
    </form>
  )
}
