"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/Logo"
import { MapPin, Star, Wifi, Car, Coffee, Utensils, ChevronLeft, Calendar } from "lucide-react"

export default function HospedajeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [accommodation, setAccommodation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAccommodation = async () => {
      try {
        // Try different possible sources
        const endpoints = [
          `/api/homepage/accommodation-favorites`,
          `/api/homepage/weekend-deals`,
          `/api/unique-stays`
        ]

        for (const endpoint of endpoints) {
          const res = await fetch(endpoint)
          const data = await res.json()

          if (data.success && data.data) {
            const found = Array.isArray(data.data)
              ? data.data.find((item: any) => item.id === parseInt(id))
              : (data.data.id === parseInt(id) ? data.data : null)

            if (found) {
              setAccommodation(found)
              break
            }
          }
        }
      } catch (error) {
        console.error('Error loading accommodation:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchAccommodation()
    }
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0066FF] mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!accommodation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Hospedaje no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            El hospedaje que buscas no está disponible.
          </p>
          <Button onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
        </Card>
      </div>
    )
  }

  const title = accommodation.title || accommodation.property_name
  const pricePerNight = accommodation.price_per_night || accommodation.price_from
  const imageUrl = accommodation.image_url

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <Logo className="py-2" />
          </Link>
        </div>
      </header>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver
        </Button>
      </div>

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Detalle de tu hospedaje</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <img
                src={imageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title and Rating */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{accommodation.location}</span>
                  </div>
                </div>
                {accommodation.rating && (
                  <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-2 rounded-lg">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="font-bold">{Number(accommodation.rating).toFixed(1)}</span>
                  </div>
                )}
              </div>

              {accommodation.total_reviews && (
                <p className="text-sm text-muted-foreground">
                  {accommodation.total_reviews} reseñas
                </p>
              )}
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Acerca de este alojamiento</h2>
              <p className="text-muted-foreground leading-relaxed">
                {accommodation.description || `Disfruta de una estancia increíble en ${title}.
                Ubicado en ${accommodation.location}, este alojamiento ofrece todas las comodidades
                que necesitas para unas vacaciones perfectas.`}
              </p>
            </Card>

            {/* Amenities */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Servicios destacados</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <Wifi className="w-5 h-5 text-[#0066FF]" />
                  <span className="text-sm">WiFi gratis</span>
                </div>
                <div className="flex items-center gap-3">
                  <Car className="w-5 h-5 text-[#0066FF]" />
                  <span className="text-sm">Estacionamiento</span>
                </div>
                <div className="flex items-center gap-3">
                  <Coffee className="w-5 h-5 text-[#0066FF]" />
                  <span className="text-sm">Desayuno incluido</span>
                </div>
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-[#0066FF]" />
                  <span className="text-sm">Restaurante</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-bold text-[#0066FF]">
                    ${Number(pricePerNight).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    {accommodation.currency || 'MXN'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">por noche</p>
              </div>

              {accommodation.discount_percentage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-red-700 font-semibold text-sm">
                    ¡Ahorra {accommodation.discount_percentage}% en esta reserva!
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">Check-in / Check-out</label>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Seleccionar fechas</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Huéspedes</label>
                  <div className="p-3 border rounded-lg">
                    <span className="text-sm">2 adultos</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold"
                onClick={() => {
                  // Guardar datos en localStorage
                  localStorage.setItem('reserva_temp', JSON.stringify({
                    servicio: {
                      ...accommodation,
                      precio: Number(accommodation?.price_per_night || accommodation?.price || 0),
                      title: accommodation?.name || 'Hospedaje'
                    },
                    pasajeros: 2, // Valor por defecto
                    tipo: 'hospedaje'
                  }))
                  // Redirigir a confirmación
                  router.push('/confirmar-reserva?tipo=hospedaje')
                }}
              >
                Reservar ahora
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                No se hará ningún cargo por el momento
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
