"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Logo } from "@/components/Logo"
import { MapPin, Plane, Hotel, Car, Calendar, Users, ChevronLeft, Check } from "lucide-react"

export default function PaqueteDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [packageData, setPackageData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const res = await fetch(`/api/featured-packages?limit=100`)
        const data = await res.json()

        if (data.success && data.data) {
          const found = data.data.find((item: any) => item.id === parseInt(id))
          if (found) {
            setPackageData(found)
          }
        }
      } catch (error) {
        console.error('Error loading package:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPackage()
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

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Paquete no encontrado</h2>
          <p className="text-muted-foreground mb-6">
            El paquete que buscas no está disponible.
          </p>
          <Button onClick={() => router.push('/')}>
            Volver al inicio
          </Button>
        </Card>
      </div>
    )
  }

  const packageName = packageData.package_name || packageData.destination
  const includes = packageData.includes?.split('+').map((item: string) => item.trim()) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-50">
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
        <h1 className="text-3xl font-bold mb-6">Detalle de tu paquete</h1>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            <div className="relative h-[400px] rounded-xl overflow-hidden">
              <img
                src={packageData.image_url}
                alt={packageName}
                className="w-full h-full object-cover"
              />
              {packageData.nights && (
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="font-semibold text-sm">{packageData.nights} noches</p>
                </div>
              )}
            </div>

            {/* Title and Location */}
            <div>
              <h1 className="text-3xl font-bold mb-2">{packageName}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{packageData.destination}</span>
              </div>
            </div>

            {/* Description */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Descripción del paquete</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {packageData.description || `Descubre ${packageData.destination} con este increíble paquete vacacional
                que incluye todo lo que necesitas para unas vacaciones perfectas.`}
              </p>

              <div className="space-y-3">
                <h3 className="font-semibold">El paquete incluye:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {includes.map((item: string, index: number) => (
                    <div key={index} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* What's Included Icons */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Servicios incluidos</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Plane className="w-8 h-8 text-[#0066FF] mx-auto mb-2" />
                  <p className="text-sm font-semibold">Vuelo</p>
                  <p className="text-xs text-muted-foreground">Ida y vuelta</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Hotel className="w-8 h-8 text-[#0066FF] mx-auto mb-2" />
                  <p className="text-sm font-semibold">Hotel</p>
                  <p className="text-xs text-muted-foreground">{packageData.nights || 5} noches</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Car className="w-8 h-8 text-[#0066FF] mx-auto mb-2" />
                  <p className="text-sm font-semibold">Traslados</p>
                  <p className="text-xs text-muted-foreground">Aeropuerto-Hotel</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="w-8 h-8 text-[#0066FF] mx-auto mb-2" />
                  <p className="text-sm font-semibold">Asistencia</p>
                  <p className="text-xs text-muted-foreground">24/7</p>
                </div>
              </div>
            </Card>

            {/* Itinerary Sample */}
            <Card className="p-6">
              <h2 className="text-xl font-bold mb-4">Itinerario sugerido</h2>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#0066FF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Llegada y check-in</h3>
                    <p className="text-sm text-muted-foreground">
                      Traslado del aeropuerto al hotel. Tarde libre para explorar.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#0066FF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    2-{packageData.nights - 1 || 4}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Días de actividades</h3>
                    <p className="text-sm text-muted-foreground">
                      Disfruta de las atracciones locales, playas, tours y experiencias únicas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#0066FF] text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {packageData.nights || 5}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Check-out y regreso</h3>
                    <p className="text-sm text-muted-foreground">
                      Traslado al aeropuerto y vuelo de regreso.
                    </p>
                  </div>
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
                    ${Number(packageData.price).toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    {packageData.currency || 'MXN'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">por persona</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-sm mb-2">Incluye:</h3>
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {includes.map((item: string, index: number) => (
                    <li key={index}>• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="text-sm font-medium mb-1 block">Fecha de salida</label>
                  <div className="flex items-center gap-2 p-3 border rounded-lg">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Seleccionar fecha</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Pasajeros</label>
                  <div className="p-3 border rounded-lg">
                    <span className="text-sm">2 adultos</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full h-12 bg-[#0066FF] hover:bg-[#0052CC] text-white font-semibold mb-3"
                onClick={() => {
                  // Guardar datos en localStorage
                  localStorage.setItem('reserva_temp', JSON.stringify({
                    servicio: {
                      ...packageData,
                      precio: Number(packageData.price),
                      title: packageName,
                      incluye: includes
                    },
                    pasajeros: 2, // Valor por defecto
                    tipo: 'paquete'
                  }))
                  // Redirigir a confirmación
                  router.push('/confirmar-reserva?tipo=paquete')
                }}
              >
                Reservar paquete
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://wa.me/5215512345678', '_blank')}
              >
                Contactar a asesor
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Pago seguro • Mejor precio garantizado
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
