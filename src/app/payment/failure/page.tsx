'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

function PaymentFailureContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parámetros comunes
  const source = searchParams.get('source') || 'unknown'
  const externalReference = searchParams.get('external_reference') || ''
  const status = searchParams.get('status') || 'failed'
  const collectionStatus = searchParams.get('collection_status') || ''

  // Extraer bookingId del external_reference (formato: booking_97_user_1_tenant_1)
  const bookingIdMatch = externalReference.match(/booking_(\d+)/)
  const bookingId = bookingIdMatch ? bookingIdMatch[1] : null

  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    // Countdown para redirigir al checkout
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (bookingId) {
            router.push(`/checkout/${bookingId}`)
          } else {
            router.push('/mis-reservas')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [bookingId, router])

  const getErrorMessage = () => {
    switch (collectionStatus) {
      case 'rejected':
        return 'El pago fue rechazado por el procesador de pagos.'
      case 'cancelled':
        return 'El pago fue cancelado.'
      case 'pending':
        return 'El pago está pendiente de confirmación.'
      case 'null':
        return 'El proceso de pago fue cancelado o no se completó.'
      default:
        return 'No se pudo completar el proceso de pago.'
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          {/* Icono de error */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Mensaje */}
          <h1 className="text-3xl font-bold text-red-600 mb-3">
            Pago no completado
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            {getErrorMessage()}
          </p>

          {/* Detalles */}
          {bookingId && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">Número de reserva</p>
              <p className="text-2xl font-bold text-gray-900">#{bookingId}</p>
            </div>
          )}

          {/* Info */}
          <div className="space-y-3 mb-6 text-left bg-yellow-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="text-yellow-600 mt-1">⚠️</div>
              <div>
                <p className="font-medium">Tu reserva sigue activa</p>
                <p className="text-sm text-gray-600">
                  Puedes intentar el pago nuevamente
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">💳</div>
              <div>
                <p className="font-medium">Prueba otro método de pago</p>
                <p className="text-sm text-gray-600">
                  Aceptamos tarjetas, PayPal y Mercado Pago
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-gray-600 mt-1">📞</div>
              <div>
                <p className="font-medium">¿Necesitas ayuda?</p>
                <p className="text-sm text-gray-600">
                  Contáctanos y te asistiremos con tu reserva
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {bookingId && (
              <Button
                onClick={() => router.push(`/checkout/${bookingId}`)}
                size="lg"
              >
                Intentar de nuevo
              </Button>
            )}
            <Button
              onClick={() => router.push('/mis-reservas')}
              variant="outline"
              size="lg"
            >
              Ver mis reservas
            </Button>
            <Button
              onClick={() => router.push('/contacto')}
              variant="ghost"
              size="lg"
            >
              Contactar soporte
            </Button>
          </div>

          {/* Countdown */}
          <p className="text-sm text-gray-500 mt-6">
            Redirigiendo {bookingId ? 'al checkout' : 'a tus reservas'} en {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </Card>

        {/* Razones comunes */}
        <div className="mt-6 text-center">
          <h3 className="font-semibold mb-3">Razones comunes de rechazo</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">💳</div>
              <p className="font-medium mb-1">Fondos insuficientes</p>
              <p className="text-gray-600 text-xs">
                Verifica el saldo de tu tarjeta
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">🔒</div>
              <p className="font-medium mb-1">Bloqueo de seguridad</p>
              <p className="text-gray-600 text-xs">
                Contacta a tu banco para autorizar
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">📝</div>
              <p className="font-medium mb-1">Datos incorrectos</p>
              <p className="text-gray-600 text-xs">
                Verifica los datos de tu tarjeta
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <PaymentFailureContent />
    </Suspense>
  )
}
