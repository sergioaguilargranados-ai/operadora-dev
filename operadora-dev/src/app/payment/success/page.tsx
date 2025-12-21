'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function PaymentSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')

  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    if (!bookingId) {
      router.push('/mis-reservas')
      return
    }

    // Countdown para redirigir
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push(`/reserva/${bookingId}`)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [bookingId, router])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          {/* Icono de éxito */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
              <svg
                className="w-10 h-10 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          {/* Mensaje */}
          <h1 className="text-3xl font-bold text-green-600 mb-3">
            ¡Pago exitoso!
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Tu reserva ha sido confirmada exitosamente
          </p>

          {/* Detalles */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-2">Número de reserva</p>
            <p className="text-2xl font-bold text-gray-900">#{bookingId}</p>
          </div>

          {/* Info */}
          <div className="space-y-3 mb-6 text-left">
            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-1">✅</div>
              <div>
                <p className="font-medium">Email de confirmación enviado</p>
                <p className="text-sm text-gray-600">
                  Revisa tu bandeja de entrada
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-1">✅</div>
              <div>
                <p className="font-medium">Pago procesado</p>
                <p className="text-sm text-gray-600">
                  Recibirás un recibo por email
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-1">✅</div>
              <div>
                <p className="font-medium">Reserva confirmada</p>
                <p className="text-sm text-gray-600">
                  Puedes ver los detalles en "Mis Reservas"
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push(`/reserva/${bookingId}`)}
              size="lg"
            >
              Ver detalles de reserva
            </Button>
            <Button
              onClick={() => router.push('/mis-reservas')}
              variant="outline"
              size="lg"
            >
              Ir a mis reservas
            </Button>
          </div>

          {/* Countdown */}
          <p className="text-sm text-gray-500 mt-6">
            Redirigiendo a tu reserva en {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>
        </Card>

        {/* Siguiente pasos */}
        <div className="mt-6 text-center">
          <h3 className="font-semibold mb-3">¿Qué sigue?</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">📧</div>
              <p className="font-medium mb-1">Revisa tu email</p>
              <p className="text-gray-600 text-xs">
                Confirmación y voucher
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">📱</div>
              <p className="font-medium mb-1">Guarda tu voucher</p>
              <p className="text-gray-600 text-xs">
                Disponible en tu reserva
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">✈️</div>
              <p className="font-medium mb-1">¡Disfruta tu viaje!</p>
              <p className="text-gray-600 text-xs">
                Estamos aquí para ayudarte
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}
