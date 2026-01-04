"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Logo } from "@/components/Logo"
import {
  ArrowLeft, Plane, Calendar, Users, MapPin, CreditCard,
  CheckCircle2, User, Mail, Phone, Building, Star
} from "lucide-react"
import Link from "next/link"

function ConfirmarReservaContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Tipo de servicio: vuelo, oferta, paquete
  const tipo = searchParams.get('tipo') || 'vuelo'

  // Datos del servicio (pasados por URL como JSON)
  const [servicioData, setServicioData] = useState<any>(null)
  const [pasajeros, setPasajeros] = useState(1)
  const [loading, setLoading] = useState(false)

  // Datos del formulario
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    email: '',
    telefono: '',
    // Pasajeros adicionales
    pasajeros: [{ nombre: '', apellido: '', edad: '' }]
  })

  useEffect(() => {
    // Cargar datos del servicio desde localStorage
    const selectedService = localStorage.getItem('selected_service')
    const oldFormat = localStorage.getItem('reserva_temp')

    if (selectedService) {
      try {
        const data = JSON.parse(selectedService)
        setServicioData(data.service)
        setPasajeros(data.searchParams?.adults || data.searchParams?.guests || 1)
      } catch (error) {
        console.error('Error parsing selected_service:', error)
      }
    } else if (oldFormat) {
      // Soporte para formato antiguo
      try {
        const data = JSON.parse(oldFormat)
        setServicioData(data.servicio)
        setPasajeros(data.pasajeros || 1)
      } catch (error) {
        console.error('Error loading from localStorage:', error)
      }
    }
  }, [searchParams])

  const calcularTotal = () => {
    if (!servicioData) return 0
    const precioBase = servicioData.price || servicioData.precio || servicioData.total_price || servicioData.price_per_night || 0

    // Para hoteles, multiplicar por número de noches si está disponible
    if (tipo === 'hotel') {
      return precioBase // Ya incluye todo
    }

    // Para vuelos, el precio ya incluye todos los pasajeros
    if (tipo === 'flight') {
      return precioBase
    }

    return precioBase * pasajeros
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validaciones
      if (!formData.nombreCompleto || !formData.email || !formData.telefono) {
        toast({
          title: "Campos requeridos",
          description: "Por favor completa todos los campos obligatorios",
          variant: "destructive"
        })
        setLoading(false)
        return
      }

      // Crear reserva en la base de datos
      const reservaData = {
        type: tipo,
        service_name: servicioData?.aerolinea || servicioData?.details?.airline || servicioData?.title || 'Servicio',
        total_price: calcularTotal(),
        currency: servicioData?.currency || 'MXN',
        status: 'pending',
        payment_status: 'pending',
        details: {
          ...servicioData,
          pasajeros: pasajeros,
          contacto: {
            nombre: formData.nombreCompleto,
            email: formData.email,
            telefono: formData.telefono
          },
          pasajerosInfo: formData.pasajeros
        },
        user_id: 1, // TODO: Obtener del contexto de autenticación
        tenant_id: 1 // TODO: Obtener del contexto
      }

      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservaData)
      })

      if (!res.ok) {
        throw new Error('Error al crear la reserva')
      }

      const data = await res.json()
      const bookingId = data.booking?.id || data.id

      // Limpiar localStorage
      localStorage.removeItem('reserva_temp')
      localStorage.removeItem('selected_service')

      // Ir a checkout
      router.push(`/checkout/${bookingId}`)

    } catch (error: any) {
      console.error('Error:', error)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la reserva",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!servicioData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">No hay datos de reserva</p>
          <Button onClick={() => router.push('/')}>Volver al inicio</Button>
        </div>
      </div>
    )
  }

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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>

        <h1 className="text-3xl font-bold mb-2">Confirmar Reserva</h1>
        <p className="text-muted-foreground mb-8">Revisa los detalles y completa tu información</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                Información de Contacto
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="nombreCompleto">Nombre Completo *</Label>
                  <Input
                    id="nombreCompleto"
                    placeholder="Juan Pérez García"
                    value={formData.nombreCompleto}
                    onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Correo Electrónico *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefono">Teléfono *</Label>
                    <Input
                      id="telefono"
                      type="tel"
                      placeholder="+52 55 1234 5678"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <Separator className="my-6" />

                <h3 className="text-lg font-semibold mb-4">Número de Pasajeros</h3>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPasajeros(Math.max(1, pasajeros - 1))}
                  >
                    -
                  </Button>
                  <span className="text-lg font-semibold w-12 text-center">{pasajeros}</span>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPasajeros(Math.min(9, pasajeros + 1))}
                  >
                    +
                  </Button>
                  <span className="text-sm text-muted-foreground">pasajero{pasajeros > 1 ? 's' : ''}</span>
                </div>
              </form>
            </Card>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Resumen</h2>

              {/* Detalles del servicio - Vuelos */}
              {tipo === 'flight' && servicioData.details && (
                <div className="space-y-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Plane className="w-5 h-5 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <p className="font-semibold text-lg mb-2">
                        {servicioData.details?.airline || 'Vuelo'}
                      </p>

                      {/* Vuelo de ida */}
                      {servicioData.details?.outbound && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-2">
                          <p className="text-xs text-muted-foreground mb-1">Ida · {servicioData.details.outbound.date}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold">
                              {servicioData.details.outbound.origin}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-semibold">
                              {servicioData.details.outbound.destination}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {servicioData.details.outbound.departureTime} - {servicioData.details.outbound.arrivalTime}
                            {' · '}
                            {servicioData.details.outbound.stops === 0 ? 'Directo' : `${servicioData.details.outbound.stops} escala(s)`}
                            {' · '}
                            {servicioData.details.outbound.duration}
                          </p>
                        </div>
                      )}

                      {/* Vuelo de regreso */}
                      {servicioData.details?.inbound && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">Regreso · {servicioData.details.inbound.date}</p>
                          <div className="flex items-center gap-2 text-sm">
                            <span className="font-semibold">
                              {servicioData.details.inbound.origin}
                            </span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-semibold">
                              {servicioData.details.inbound.destination}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {servicioData.details.inbound.departureTime} - {servicioData.details.inbound.arrivalTime}
                            {' · '}
                            {servicioData.details.inbound.stops === 0 ? 'Directo' : `${servicioData.details.inbound.stops} escala(s)`}
                            {' · '}
                            {servicioData.details.inbound.duration}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tipo === 'hotel' && servicioData.details && (
                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-blue-600 mt-1" />
                    <div>
                      <p className="font-semibold text-lg">{servicioData.details.name || 'Hotel'}</p>
                      <p className="text-sm text-muted-foreground">
                        {servicioData.details.city || servicioData.details.address}
                      </p>
                      {servicioData.details.starRating && (
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: servicioData.details.starRating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {tipo === 'oferta' && (
                <div className="space-y-3 mb-6">
                  <img
                    src={servicioData.image_url}
                    alt={servicioData.title}
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <h3 className="font-semibold">{servicioData.title}</h3>
                  <p className="text-sm text-muted-foreground">{servicioData.description}</p>
                </div>
              )}

              <Separator className="my-4" />

              {/* Desglose de precio */}
              <div className="space-y-2">
                {tipo === 'flight' ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Precio del vuelo ({pasajeros} pasajero{pasajeros > 1 ? 's' : ''})</span>
                      <span>${(servicioData.price || 0).toLocaleString()} {servicioData.currency || 'MXN'}</span>
                    </div>
                    {servicioData.details?.outbound && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Ida: {servicioData.details.outbound.origin} → {servicioData.details.outbound.destination}</span>
                      </div>
                    )}
                    {servicioData.details?.inbound && (
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Regreso: {servicioData.details.inbound.origin} → {servicioData.details.inbound.destination}</span>
                      </div>
                    )}
                  </>
                ) : tipo === 'hotel' ? (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Precio por noche</span>
                      <span>${(servicioData.price_per_night || servicioData.price || 0).toLocaleString()} {servicioData.currency || 'MXN'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Habitaciones: {pasajeros}</span>
                      <span>{pasajeros} hab.</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between text-sm">
                      <span>Precio por persona</span>
                      <span>${(servicioData.precio || servicioData.price || 0).toLocaleString()} MXN</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Pasajeros</span>
                      <span>x {pasajeros}</span>
                    </div>
                  </>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">${calcularTotal().toLocaleString()} {servicioData.currency || 'MXN'}</span>
                </div>
              </div>

              <Button
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                size="lg"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Proceder al Pago
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center mt-4">
                Al continuar aceptas nuestros términos y condiciones
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmarReservaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando...</div>}>
      <ConfirmarReservaContent />
    </Suspense>
  )
}
