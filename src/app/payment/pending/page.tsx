'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Clock } from 'lucide-react'

function PaymentPendingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Parámetros comunes
  const source = searchParams.get('source') || 'unknown'
  const externalReference = searchParams.get('external_reference') || ''
  const paymentId = searchParams.get('payment_id') || ''

  // Extraer bookingId del external_reference (formato: booking_97_user_1_tenant_1)
  const bookingIdMatch = externalReference.match(/booking_(\d+)/)
  const bookingId = bookingIdMatch ? bookingIdMatch[1] : null

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 text-center">
          {/* Icono de pendiente */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          {/* Mensaje */}
          <h1 className="text-3xl font-bold text-yellow-600 mb-3">
            Pago pendiente
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Tu pago está siendo procesado. Te notificaremos cuando se confirme.
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
              <div className="text-yellow-600 mt-1">⏳</div>
              <div>
                <p className="font-medium">Procesando tu pago</p>
                <p className="text-sm text-gray-600">
                  Esto puede tomar unos minutos
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-blue-600 mt-1">📧</div>
              <div>
                <p className="font-medium">Te enviaremos un email</p>
                <p className="text-sm text-gray-600">
                  Cuando el pago sea confirmado
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="text-green-600 mt-1">✅</div>
              <div>
                <p className="font-medium">Tu reserva está guardada</p>
                <p className="text-sm text-gray-600">
                  Puedes verificar el estado en "Mis Reservas"
                </p>
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/mis-reservas')}
              size="lg"
            >
              Ver mis reservas
            </Button>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              size="lg"
            >
              Volver al inicio
            </Button>
          </div>
        </Card>

        {/* Información adicional */}
        <div className="mt-6 text-center">
          <h3 className="font-semibold mb-3">¿Qué significa "pendiente"?</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">💳</div>
              <p className="font-medium mb-1">Pago en proceso</p>
              <p className="text-gray-600 text-xs">
                El banco está verificando
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">🏦</div>
              <p className="font-medium mb-1">OXXO / SPEI</p>
              <p className="text-gray-600 text-xs">
                Esperando depósito
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 border">
              <div className="text-2xl mb-2">⏰</div>
              <p className="font-medium mb-1">24-48 horas</p>
              <p className="text-gray-600 text-xs">
                Tiempo máximo de espera
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function PaymentPendingPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    }>
      <PaymentPendingContent />
    </Suspense>
  )
}
