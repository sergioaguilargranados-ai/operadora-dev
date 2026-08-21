"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/PageHeader'
import {
  Download,
  Phone,
  Mail,
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
  Loader2,
  ChevronDown,
  ChevronUp,
  User,
  Edit2,
  PhoneCall,
  Info
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import PDFService from '@/services/PDFService'
import { useToast } from '@/hooks/use-toast'

function safeParseJSON(value: any, fallback: any = {}) {
  if (value === null || value === undefined) return fallback
  if (typeof value === 'object') return value
  try { return JSON.parse(value) } catch { return fallback }
}

export default function BookingDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<any>(null)
  const [generatingPDF, setGeneratingPDF] = useState(false)

  // Submenú Modificar Reserva (Mockup #6)
  const [showModificarMenu, setShowModificarMenu] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadBookingDetails()
  }, [isAuthenticated, authLoading, params.id])

  const loadBookingDetails = async () => {
    try {
      const token = localStorage.getItem('as_token')
      const response = await fetch(`/api/bookings/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setBooking(data.data || data.booking)
      } else {
        toast({ title: 'Reserva no encontrada', variant: 'destructive' })
        router.push('/mis-reservas')
      }
    } catch (error) {
      console.error('Error loading booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadVoucher = async () => {
    if (!booking) return
    setGeneratingPDF(true)
    try {
      const travelerInfo = safeParseJSON(booking.traveler_info, {})
      const bookingDetails = safeParseJSON(booking.details || booking.booking_details, {})

      const voucherData = {
        bookingReference: booking.booking_reference,
        customerName: travelerInfo.name || booking.lead_traveler_name || 'Cliente',
        customerEmail: travelerInfo.email || booking.lead_traveler_email || '',
        bookingType: booking.booking_type || 'general',
        status: booking.status,
        totalAmount: parseFloat(booking.total_price || booking.total_amount) || 0,
        currency: booking.currency || 'MXN',
        createdAt: booking.created_at,
        details: bookingDetails
      }

      const pdf = PDFService.generateBookingVoucher(voucherData)
      PDFService.downloadPDF(pdf, `Reserva_${booking.booking_reference}.pdf`)
      toast({ title: 'Voucher descargado' })
    } catch {
      toast({ title: 'Error al generar PDF', variant: 'destructive' })
    } finally {
      setGeneratingPDF(false)
    }
  }

  const handleDownloadReceipt = async () => {
    if (!booking) return
    setGeneratingPDF(true)
    try {
      const travelerInfo = safeParseJSON(booking.traveler_info, {})
      
      const receiptData = {
        transactionId: booking.payment_intent_id || booking.payment_id || `TRX-${booking.booking_reference}`,
        bookingReference: booking.booking_reference,
        customerName: travelerInfo.name || booking.lead_traveler_name || 'Cliente',
        customerEmail: travelerInfo.email || booking.lead_traveler_email || '',
        amount: parseFloat(booking.total_price || booking.total_amount) || 0,
        currency: booking.currency || 'MXN',
        paymentMethod: booking.payment_method || 'Tarjeta',
        status: booking.payment_status || booking.status,
        paidAt: booking.paid_at || booking.updated_at || booking.created_at,
        serviceName: booking.service_name || booking.destination || 'Servicio Turístico',
        bookingType: booking.booking_type || 'general'
      }

      const pdf = PDFService.generatePaymentReceipt(receiptData)
      PDFService.downloadPDF(pdf, `Recibo_${booking.booking_reference}.pdf`)
      toast({ title: 'Recibo descargado' })
    } catch (error) {
      toast({ title: 'Error al generar recibo', variant: 'destructive' })
    } finally {
      setGeneratingPDF(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-slate-900 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Cargando reserva...</p>
        </div>
      </div>
    )
  }

  if (!booking) return null

  const refCode = `AS-${booking.booking_reference}`
  const customerName = booking.lead_traveler_name || 'María Fernanda López González'

  const details = booking.details || safeParseJSON(booking.special_requests, {})
  const destination = booking.service_name || booking.destination || details.destination || 'Destino'
  const itinerary = booking.custom_itinerary
  const days = itinerary?.days || []
  const startDateStr = details.fecha_inicio || booking.check_in || details.travel_date || (booking.created_at ? new Date(booking.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Próximamente')
  const pax = details.pasajeros || booking.adults || 2

  return (
    <div className="min-h-screen bg-slate-50/60 pb-12">
      <PageHeader showBackButton={true} backButtonHref="/mis-reservas" />

      <main className="container mx-auto px-4 py-6 max-w-6xl space-y-6">
        
        {/* BREADCRUMB */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Inicio</span>
          <span>&gt;</span>
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/mis-reservas')}>Tus Reservas</span>
          <span>&gt;</span>
          <span className="font-semibold text-slate-700">{refCode}</span>
        </div>

        {/* HEADER DE RESERVA CON LOCALIZADOR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-extrabold text-slate-900">Reserva {refCode}</h1>
              {getStatusBadge(booking.status || 'pending')}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Reservada el {booking.created_at ? new Date(booking.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Reciente'}
            </p>
          </div>

          <Card className="px-5 py-3 border-gray-200/80 shadow-2xs rounded-xl bg-white flex items-center gap-8 text-xs">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-slate-400 font-medium">Cliente</p>
                <p className="font-bold text-slate-800">{customerName}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-slate-400 font-medium">Localizador</p>
                <p className="font-bold text-slate-800">{refCode}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* LAYOUT PRINCIPAL DE 2 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ━━━━ COLUMNA IZQUIERDA (70%) ━━━━ */}
          <div className="lg:col-span-2 space-y-6">

            {/* Resumen de tu reserva */}
            <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-5">
              <h2 className="text-lg font-bold text-slate-900">Resumen de tu reserva</h2>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50/80 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center text-white">
                    <Plane className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{destination}</h3>
                    <p className="text-xs text-slate-500">{booking.booking_type === 'tour' || booking.booking_type === 'group' ? 'Tour / Paquete Turístico' : 'Viaje Personalizado'}</p>
                    <p className="text-xs font-semibold text-slate-700 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {destination}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 text-center text-xs w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div>
                    <p className="text-slate-400 font-medium">Fecha de Salida</p>
                    <p className="font-bold text-slate-800 mt-0.5">{startDateStr}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Duración</p>
                    <p className="font-bold text-slate-800 mt-0.5">{days.length > 0 ? `${days.length} días` : 'Confirmando'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Viajeros</p>
                    <p className="font-bold text-slate-800 mt-0.5">{pax} personas</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Itinerario */}
            <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {itinerary?.title || 'Itinerario de Viaje'}
                </h2>
                {days.length > 0 && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-bold">
                    {days.length} Días Enriquecidos con IA
                  </span>
                )}
              </div>

              {days.length > 0 ? (
                <div className="space-y-3">
                  {days.slice(0, 5).map((d: any, i: number) => (
                    <div key={i} className="p-4 bg-slate-50/80 rounded-xl border border-gray-100 flex items-start justify-between text-xs gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{d.title || `Día ${i + 1}`}</p>
                          <p className="text-slate-500 mt-1 line-clamp-2">{d.description || d.desc || (d.activities?.[0]?.description) || ''}</p>
                          {d.foods && d.foods.length > 0 && (
                            <p className="text-xs text-amber-700 font-medium mt-1">🍽️ {d.foods.map((f: any) => f.name).join(', ')}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {days.length > 5 && (
                    <p className="text-xs text-center text-slate-500">Y {days.length - 5} días más en tu itinerario...</p>
                  )}
                  <Button 
                    onClick={() => router.push(`/mobile/itinerario/${booking.id}`)}
                    className="w-full mt-2 bg-black text-white hover:bg-gray-800 font-bold rounded-xl h-11"
                  >
                    📱 Ver Itinerario Interactivo Completo en la PWA
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-xl">
                  <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600 text-sm font-medium">Generando itinerario con IA en segundo plano...</p>
                </div>
              )}
            </Card>

            {/* Información importante */}
            <Card className="p-6 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-500" />
                Información importante
              </h3>
              <ul className="list-disc list-inside space-y-1.5 text-slate-600">
                <li>Presenta tu identificación oficial y tarjeta de crédito al momento del check-in.</li>
                <li>Los horarios de vuelos y traslados están sujetos a cambios. Te notificaremos cualquier actualización.</li>
              </ul>
            </Card>

          </div>

          {/* ━━━━ COLUMNA DERECHA (30%): GESTIONAR RESERVA - Mockups #5 y #6 ━━━━ */}
          <div className="space-y-6">

            {/* Card Gestionar reserva */}
            <Card className="p-5 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Gestionar reserva</h3>

              <div className="space-y-1 pt-1">
                
                {/* Pagar Saldo Pendiente */}
                {booking.payment_status !== 'paid' && (
                  <button 
                    onClick={() => router.push(`/checkout/${booking.id}`)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-xs mb-2"
                  >
                    <span className="flex items-center gap-2.5">
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      Pagar Saldo / Abonar
                    </span>
                    <span className="text-[10px] bg-amber-400 text-slate-900 px-1.5 py-0.5 rounded-md font-extrabold">
                      PENDIENTE
                    </span>
                  </button>
                )}

                {/* Descargar itinerario */}
                <button 
                  onClick={handleDownloadVoucher}
                  disabled={generatingPDF}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Descargar itinerario
                </button>

                {/* Modificar reserva (Submenú Mockup #6) */}
                <div>
                  <button 
                    onClick={() => setShowModificarMenu(!showModificarMenu)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      <Edit2 className="w-4 h-4 text-slate-500" />
                      Modificar reserva
                    </span>
                    {showModificarMenu ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                  </button>

                  {/* Submenú desplegable (Mockup #6) */}
                  {showModificarMenu && (
                    <div className="ml-4 pl-4 border-l-2 border-slate-200 space-y-2 py-2 text-xs bg-slate-50/60 rounded-r-xl">
                      <p className="font-semibold text-slate-800 px-2">¿Qué deseas modificar?</p>
                      
                      <button 
                        onClick={() => toast({ title: "Solicitud iniciada", description: "Un agente te contactará para cambiar nombres." })}
                        className="w-full text-left px-2 py-1.5 hover:bg-white rounded-lg transition-colors"
                      >
                        <p className="font-semibold text-slate-800">Modificar nombre</p>
                        <p className="text-[10px] text-slate-500">Cambia el nombre del titular o de los viajeros.</p>
                      </button>

                      <button 
                        onClick={() => toast({ title: "Solicitud iniciada", description: "Un agente te asistirá con el cambio de fecha." })}
                        className="w-full text-left px-2 py-1.5 hover:bg-white rounded-lg transition-colors"
                      >
                        <p className="font-semibold text-slate-800">Modificar fechas</p>
                        <p className="text-[10px] text-slate-500">Cambia las fechas de tu viaje.</p>
                      </button>

                      <button 
                        onClick={() => router.push('/ayuda')}
                        className="w-full text-left px-2 py-1.5 hover:bg-white rounded-lg transition-colors"
                      >
                        <p className="font-semibold text-slate-800 flex items-center gap-1">
                          <PhoneCall className="w-3 h-3 text-slate-500" />
                          Call Center (dudas)
                        </p>
                        <p className="text-[10px] text-slate-500">¿Tienes dudas? Nuestro equipo te ayuda.</p>
                      </button>
                    </div>
                  )}
                </div>

                {/* Cancelar reserva */}
                <button 
                  onClick={() => toast({ title: "Políticas de cancelación", description: "Comunícate con soporte para procesar la cancelación." })}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <X className="w-4 h-4 text-slate-500" />
                  Cancelar reserva
                </button>

                {/* Facturación */}
                <button 
                  onClick={() => router.push(`/facturacion/${booking.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  Facturación
                </button>

                {/* Descargar recibo */}
                <button 
                  onClick={handleDownloadReceipt}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  <Download className="w-4 h-4 text-slate-500" />
                  Descargar recibo
                </button>

              </div>
            </Card>

            {/* Contacto del hotel */}
            <Card className="p-5 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">Contacto del hotel</h3>
              
              <div className="space-y-2 text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>+00 0000 0000</span>
                </div>
                <div className="flex items-center gap-2 truncate">
                  <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className="truncate">hotel@asoperadora.com</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full text-xs font-semibold border-slate-900 text-slate-900 hover:bg-slate-50 rounded-xl"
              >
                Ver más información del hotel
              </Button>
            </Card>

            {/* ¿Necesitas ayuda? */}
            <Card className="p-5 border-gray-200/80 shadow-sm rounded-2xl bg-white space-y-3 text-xs">
              <h3 className="font-bold text-slate-900 text-sm">¿Necesitas ayuda?</h3>
              <p className="text-slate-500">Estamos aquí para ayudarte 24/7.</p>
              <Button 
                onClick={() => router.push('/ayuda')}
                className="w-full text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
              >
                Contactar soporte
              </Button>
            </Card>

          </div>

        </div>

      </main>
    </div>
  )
}
