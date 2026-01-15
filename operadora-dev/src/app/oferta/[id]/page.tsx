"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PageHeader } from "@/components/PageHeader"
import { Logo } from "@/components/Logo"
import { ArrowLeft, Calendar, Tag, MapPin } from "lucide-react"

export default function OfertaDetallePage() {
  const router = useRouter()
  const params = useParams()
  const [oferta, setOferta] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOferta = async () => {
      try {
        const res = await fetch(`/api/promotions/${params.id}`)
        const data = await res.json()
        if (data.success) {
          setOferta(data.data)
        }
      } catch (error) {
        console.error('Error loading oferta:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOferta()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!oferta) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
        <div className="container mx-auto px-4 py-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
          <p className="text-center mt-8">Oferta no encontrada</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header translúcido */}
      <PageHeader showBackButton={true} backButtonHref="/" />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-6">Detalle de tu oferta especial</h1>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Imagen */}
          <div className="relative h-[400px] rounded-lg overflow-hidden">
            <img
              src={oferta.image_url}
              alt={oferta.title}
              className="w-full h-full object-cover"
            />
            {oferta.discount_percentage && (
              <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-lg font-bold">
                {oferta.discount_percentage}% OFF
              </div>
            )}
            {oferta.badge_text && (
              <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {oferta.badge_text}
              </div>
            )}
          </div>

          {/* Detalles */}
          <div>
            <h1 className="text-4xl font-bold mb-4">{oferta.title}</h1>
            <p className="text-xl text-muted-foreground mb-6">{oferta.description}</p>

            <div className="space-y-4 mb-8">
              {oferta.discount_percentage && (
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold">Ahorra hasta {oferta.discount_percentage}%</span>
                </div>
              )}

              {oferta.valid_until && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Válido hasta: {new Date(oferta.valid_until).toLocaleDateString()}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="capitalize">{oferta.category}</span>
              </div>
            </div>

            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
              onClick={() => {
                // Guardar datos en localStorage
                localStorage.setItem('reserva_temp', JSON.stringify({
                  servicio: {
                    ...oferta,
                    precio: oferta.price || oferta.discount_price || 0
                  },
                  pasajeros: 1,
                  tipo: 'oferta'
                }))
                // Redirigir a confirmación
                router.push('/confirmar-reserva?tipo=oferta')
              }}
            >
              Reservar Ahora
            </Button>
          </div>
        </div>

        {/* Información adicional */}
        <Card className="p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4">Detalles de la Oferta</h2>
          <div className="prose max-w-none">
            <p>Esta es una oferta especial disponible por tiempo limitado. Aprovecha este descuento exclusivo y vive una experiencia inolvidable.</p>
            <h3>Incluye:</h3>
            <ul>
              <li>Mejor precio garantizado</li>
              <li>Cancelación flexible</li>
              <li>Soporte 24/7</li>
              <li>Sin costos ocultos</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
