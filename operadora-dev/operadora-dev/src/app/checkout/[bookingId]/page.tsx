'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import StripeCheckoutForm from '@/components/StripeCheckoutForm'

// Inicializar Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface Booking {
  id: number
  type: string
  service_name: string
  total_price: number
  currency: string
  status: string
  payment_status: string
  details: any
}

export default function CheckoutPage({
  params
}: {
  params: Promise<{ bookingId: string }>
}) {
  const resolvedParams = use(params)
  const bookingId = parseInt(resolvedParams.bookingId)
  const router = useRouter()
  const { toast } = useToast()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal'>('stripe')
  const [clientSecret, setClientSecret] = useState('')
  const [paypalOrderId, setPaypalOrderId] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchBooking()
  }, [bookingId])

  const fetchBooking = async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (!res.ok) throw new Error('Error al cargar reserva')

      const data = await res.json()
      setBooking(data.booking)

      // Verificar si ya está pagada
      if (data.booking.payment_status === 'paid') {
        toast({
          title: 'Reserva ya pagada',
          description: 'Esta reserva ya ha sido pagada'
        })
        router.push(`/reserva/${bookingId}`)
        return
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStripePayment = async () => {
    if (!booking) return

    setProcessing(true)

    try {
      // Crear Payment Intent
      const res = await fetch('/api/payments/stripe/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          userId: 1, // TODO: Get from auth context
          tenantId: 1, // TODO: Get from auth context
          amount: Math.round(booking.total_price * 100), // Convertir a centavos
          currency: booking.currency,
          description: `Reserva #${booking.id} - ${booking.service_name}`
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al crear pago')
      }

      const data = await res.json()
      setClientSecret(data.clientSecret)

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  const handlePayPalPayment = async () => {
    if (!booking) return

    setProcessing(true)

    try {
      // Crear orden de PayPal
      const res = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking.id,
          userId: 1, // TODO: Get from auth context
          tenantId: 1, // TODO: Get from auth context
          amount: booking.total_price.toFixed(2),
          currency: booking.currency,
          description: `Reserva #${booking.id} - ${booking.service_name}`
        })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Error al crear orden')
      }

      const data = await res.json()
      setPaypalOrderId(data.orderId)

      // Redirigir a PayPal
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl
      }

    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando checkout...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="container mx-auto py-8">
        <Card className="p-8 text-center">
          <p className="text-gray-600">Reserva no encontrada</p>
          <Button onClick={() => router.push('/mis-reservas')} className="mt-4">
            Ver mis reservas
          </Button>
        </Card>
      </div>
    )
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#2563eb'
    }
  }

  const options = {
    clientSecret,
    appearance
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-gray-600">Completa tu pago para confirmar la reserva</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Resumen de la reserva */}
          <div className="md:col-span-1">
            <Card className="p-6 sticky top-4">
              <h3 className="font-semibold mb-4">Resumen de reserva</h3>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <Badge variant="secondary">{booking.type}</Badge>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Servicio</p>
                  <p className="font-medium">{booking.service_name}</p>
                </div>

                <Separator />

                <div>
                  <p className="text-sm text-gray-600">Reserva #</p>
                  <p className="font-mono">{booking.id}</p>
                </div>

                <Separator />

                <div className="pt-2">
                  <div className="flex justify-between items-center">
                    <p className="text-lg font-semibold">Total</p>
                    <p className="text-2xl font-bold text-blue-600">
                      ${booking.total_price.toFixed(2)} {booking.currency.toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500 pt-2">
                  <p>✅ Confirmación instantánea</p>
                  <p>✅ Pago seguro</p>
                  <p>✅ Sin cargos ocultos</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Formulario de pago */}
          <div className="md:col-span-2">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Método de pago</h3>

              {/* Selector de método de pago */}
              <div className="flex gap-3 mb-6">
                <Button
                  variant={paymentMethod === 'stripe' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('stripe')}
                  className="flex-1"
                >
                  💳 Tarjeta de crédito/débito
                </Button>
                <Button
                  variant={paymentMethod === 'paypal' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('paypal')}
                  className="flex-1"
                >
                  <img
                    src="https://www.paypalobjects.com/webstatic/icon/pp258.png"
                    alt="PayPal"
                    className="h-5 mr-2"
                  />
                  PayPal
                </Button>
              </div>

              <Separator className="my-6" />

              {/* Formulario Stripe */}
              {paymentMethod === 'stripe' && (
                <div>
                  {!clientSecret ? (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">
                        Haz clic para continuar con el pago
                      </p>
                      <Button
                        onClick={handleStripePayment}
                        disabled={processing}
                        size="lg"
                      >
                        {processing ? 'Procesando...' : 'Continuar al pago'}
                      </Button>
                    </div>
                  ) : (
                    <Elements stripe={stripePromise} options={options}>
                      <StripeCheckoutForm
                        bookingId={booking.id}
                        amount={booking.total_price}
                        currency={booking.currency}
                      />
                    </Elements>
                  )}

                  <div className="mt-6 flex items-center justify-center gap-3 text-xs text-gray-500">
                    <img src="https://stripe.com/img/v3/home/social.png" alt="Stripe" className="h-4" />
                    <p>Pago seguro con Stripe</p>
                    <Badge variant="secondary" className="text-xs">SSL</Badge>
                  </div>
                </div>
              )}

              {/* Botón PayPal */}
              {paymentMethod === 'paypal' && (
                <div>
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">
                      Serás redirigido a PayPal para completar el pago
                    </p>
                    <Button
                      onClick={handlePayPalPayment}
                      disabled={processing}
                      size="lg"
                      className="bg-[#0070ba] hover:bg-[#005ea6]"
                    >
                      {processing ? 'Redirigiendo...' : 'Pagar con PayPal'}
                    </Button>
                  </div>

                  <div className="mt-6 flex items-center justify-center gap-3 text-xs text-gray-500">
                    <img src="https://www.paypalobjects.com/webstatic/icon/pp258.png" alt="PayPal" className="h-4" />
                    <p>Pago seguro con PayPal</p>
                    <Badge variant="secondary" className="text-xs">Protección al comprador</Badge>
                  </div>
                </div>
              )}
            </Card>

            {/* Info adicional */}
            <div className="mt-6 text-sm text-gray-600 text-center">
              <p>Al completar el pago aceptas nuestros términos y condiciones</p>
              <p className="mt-2">
                ¿Necesitas ayuda? <a href="/contacto" className="text-blue-600 hover:underline">Contáctanos</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
