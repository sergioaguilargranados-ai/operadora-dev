"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Download,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Users,
  CreditCard,
  FileText,
  Plane,
  Hotel,
  Package,
  CheckCircle,
  Clock,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import PDFService from '@/services/PDFService'
import { useToast } from '@/hooks/use-toast'

export default function BookingDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    loadBookingDetails()
  }, [isAuthenticated, params.id])

  const loadBookingDetails = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/bookings/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setBooking(data.data)
      } else if (response.status === 404) {
        toast({
          title: 'Reserva no encontrada',
          description: 'No se pudo encontrar la reserva solicitada',
          variant: 'destructive'
        })
        router.push('/mis-reservas')
      }
    } catch (error) {
      console.error('Error loading booking:', error)
      toast({
        title: 'Error',
        description: 'No se pudo cargar la reserva',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadVoucher = async () => {
    if (!booking) return

    setGeneratingPDF(true)
    try {
      const travelerInfo = JSON.parse(booking.traveler_info || '[]')
      const contactInfo = JSON.parse(booking.contact_info || '{}')
      const bookingDetails = JSON.parse(booking.booking_details || '{}')

      const voucherData = {
        bookingReference: booking.booking_reference,
        customerName: travelerInfo[0]?.name || contactInfo.name || 'Cliente',
        customerEmail: contactInfo.email || '',
        bookingType: booking.booking_type,
        status: booking.status,
        totalAmount: parseFloat(booking.total_amount),
        currency: booking.currency,
        createdAt: booking.created_at,
        confirmedAt: booking.confirmed_at,
        details: bookingDetails
      }

      const pdf = PDFService.generateBookingVoucher(voucherData)
      PDFService.downloadPDF(pdf, `voucher_${booking.booking_reference}.pdf`)

      toast({
        title: 'Voucher descargado',
        description: 'El voucher se ha descargado correctamente'
      })
    } catch (error) {
      console.error('Error generating voucher:', error)
      toast({
        title: 'Error',
        description: 'No se pudo generar el voucher',
        variant: 'destructive'
      })
    } finally {
      setGeneratingPDF(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: any }> = {
      confirmed: {
        label: 'Confirmada',
        className: 'bg-green-100 text-green-800',
        icon: CheckCircle
      },
      pending: {
        label: 'Pendiente',
        className: 'bg-yellow-100 text-yellow-800',
        icon: Clock
      },
      cancelled: {
        label: 'Cancelada',
        className: 'bg-red-100 text-red-800',
        icon: X
      },
      pending_confirmation: {
        label: 'Por confirmar',
        className: 'bg-blue-100 text-blue-800',
        icon: AlertCircle
      }
    }

    const badge = badges[status] || badges.pending
    const Icon = badge.icon

    return (
      <Badge className={`${badge.className} gap-1 px-3 py-1`}>
        <Icon className="w-4 h-4" />
        {badge.label}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      flight: Plane,
      hotel: Hotel,
      package: Package
    }
    return icons[type] || Package
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency || 'MXN'
    }).format(amount || 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando detalles de la reserva...</p>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Reserva no encontrada</h2>
          <Button onClick={() => router.push('/mis-reservas')}>
            Volver a mis reservas
          </Button>
        </div>
      </div>
    )
  }

  const TypeIcon = getTypeIcon(booking.booking_type)
  const travelerInfo = JSON.parse(booking.traveler_info || '[]')
  const contactInfo = JSON.parse(booking.contact_info || '{}')
  const bookingDetails = JSON.parse(booking.booking_details || '{}')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-soft">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <div className="flex gap-2">
              {booking.status === 'confirmed' && (
                <Button
                  onClick={handleDownloadVoucher}
                  disabled={generatingPDF}
                  className="gap-2"
                >
                  {generatingPDF ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Descargar Voucher
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Título y Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <TypeIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">
                  Reserva #{booking.booking_reference}
                </h1>
                <p className="text-muted-foreground">
                  {booking.booking_type === 'flight' ? 'Vuelo' :
                   booking.booking_type === 'hotel' ? 'Hotel' : 'Paquete'}
                </p>
              </div>
            </div>
            {getStatusBadge(booking.status)}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Detalles del servicio */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 border-none shadow-soft">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <TypeIcon className="w-5 h-5" />
                  Detalles del Servicio
                </h2>
                <Separator className="my-4" />

                {booking.booking_type === 'flight' && bookingDetails.outbound && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Origen</p>
                        <p className="font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {bookingDetails.outbound.origin}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Destino</p>
                        <p className="font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {bookingDetails.outbound.destination}
                        </p>
                      </div>
                    </div>

                    {bookingDetails.airline && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Aerolínea</p>
                        <p className="font-semibold">{bookingDetails.airline}</p>
                      </div>
                    )}

                    {bookingDetails.outbound.departureTime && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Salida</p>
                          <p className="font-semibold flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {bookingDetails.outbound.departureTime}
                          </p>
                        </div>
                        {bookingDetails.outbound.arrivalTime && (
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Llegada</p>
                            <p className="font-semibold flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {bookingDetails.outbound.arrivalTime}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {booking.booking_type === 'hotel' && bookingDetails.name && (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Hotel</p>
                      <p className="font-semibold text-lg">{bookingDetails.name}</p>
                    </div>

                    {bookingDetails.city && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Ubicación</p>
                        <p className="font-semibold flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {bookingDetails.city}
                        </p>
                      </div>
                    )}

                    {bookingDetails.address && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Dirección</p>
                        <p className="font-semibold">{bookingDetails.address}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* Información de viajeros */}
            {travelerInfo.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 border-none shadow-soft">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Viajeros
                  </h2>
                  <Separator className="my-4" />

                  <div className="space-y-4">
                    {travelerInfo.map((traveler: any, index: number) => (
                      <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <p className="font-semibold mb-2">
                          Viajero {index + 1}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Nombre:</span>
                            <span className="ml-2 font-medium">{traveler.name}</span>
                          </div>
                          {traveler.email && (
                            <div>
                              <span className="text-muted-foreground">Email:</span>
                              <span className="ml-2 font-medium">{traveler.email}</span>
                            </div>
                          )}
                          {traveler.phone && (
                            <div>
                              <span className="text-muted-foreground">Teléfono:</span>
                              <span className="ml-2 font-medium">{traveler.phone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Solicitudes especiales */}
            {booking.special_requests && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 border-none shadow-soft">
                  <h2 className="text-xl font-semibold mb-4">Solicitudes Especiales</h2>
                  <Separator className="my-4" />
                  <p className="text-muted-foreground">{booking.special_requests}</p>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Resumen de pago */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 border-none shadow-soft sticky top-24">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Resumen
                </h2>
                <Separator className="my-4" />

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Proveedor</p>
                    <p className="font-semibold capitalize">{booking.provider}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Fecha de Reserva</p>
                    <p className="font-semibold flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      {formatDate(booking.created_at)}
                    </p>
                  </div>

                  {booking.confirmed_at && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Confirmada</p>
                      <p className="font-semibold flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        {formatDate(booking.confirmed_at)}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(parseFloat(booking.total_amount), booking.currency)}
                    </p>
                  </div>

                  {booking.payment_status && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Estado de Pago</p>
                      <Badge className="capitalize">{booking.payment_status}</Badge>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                <div className="space-y-2">
                  {booking.status === 'confirmed' && (
                    <Button
                      onClick={handleDownloadVoucher}
                      disabled={generatingPDF}
                      className="w-full gap-2"
                    >
                      {generatingPDF ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generando...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Descargar Voucher
                        </>
                      )}
                    </Button>
                  )}

                  <Button variant="outline" className="w-full gap-2">
                    <Mail className="w-4 h-4" />
                    Enviar por Email
                  </Button>

                  {booking.status === 'confirmed' && (
                    <Button variant="outline" className="w-full gap-2 text-red-600 hover:bg-red-50">
                      <X className="w-4 h-4" />
                      Cancelar Reserva
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>

            {/* Información de contacto */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 border-none shadow-soft">
                <h3 className="font-semibold mb-4">¿Necesitas ayuda?</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span>soporte@asoperadora.com</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>+52 55 1234 5678</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}
