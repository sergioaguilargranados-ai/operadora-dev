"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PageHeader } from '@/components/PageHeader'
import { PortalIntranetLayout } from '@/components/layout/PortalIntranetLayout'
import {
  Calendar,
  MapPin,
  Users,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
  Plane,
  Clock,
  Compass,
  FileText,
  HelpCircle,
  QrCode,
  Utensils,
  Map,
  ShoppingBag,
  Info
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { generateItineraryPDF } from '@/lib/pdfGenerator'
import { motion, AnimatePresence } from 'framer-motion'

interface Booking {
  id: number
  booking_reference: string
  booking_type: string
  status: string
  total_price: number
  currency: string
  payment_status: string
  lead_traveler_name: string
  lead_traveler_email: string
  destination: string
  service_name: string
  created_at: string
  check_in?: string
  check_out?: string
  details?: any
  traveler_info?: any
  custom_itinerary?: any
}

export default function ClientItinerariesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null)
  
  // Detalle del itinerario cargado dinámicamente al expandir
  const [expandedBookingDetail, setExpandedBookingDetail] = useState<Booking | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [generatingPDFId, setGeneratingPDFId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadBookings()
  }, [isAuthenticated])

  const loadBookings = async () => {
    try {
      const token = localStorage.getItem('as_token')
      const userId = user?.id || 'all'
      // Buscamos todas las reservas del usuario actual
      const res = await fetch(`/api/bookings?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setBookings(data.data || [])
      }
    } catch (e) {
      console.error('Error cargando reservas:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleExpand = async (bookingId: number) => {
    if (expandedBookingId === bookingId) {
      setExpandedBookingId(null)
      setExpandedBookingDetail(null)
      return
    }

    setExpandedBookingId(bookingId)
    setLoadingDetail(true)
    setExpandedBookingDetail(null)

    try {
      const token = localStorage.getItem('as_token')
      const res = await fetch(`/api/bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) {
        const data = await res.json()
        setExpandedBookingDetail(data.booking || data.data)
      } else {
        toast({ title: 'Error', description: 'No se pudieron cargar los detalles del itinerario.', variant: 'destructive' })
        setExpandedBookingId(null)
      }
    } catch (err) {
      console.error('Error fetching itinerary details:', err)
      toast({ title: 'Error', description: 'No se pudieron obtener los detalles.', variant: 'destructive' })
      setExpandedBookingId(null)
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDownloadPDF = async (bDetail: Booking) => {
    setGeneratingPDFId(bDetail.id)
    try {
      const refCode = bDetail.booking_reference || `IT-${bDetail.id}`
      const travelDateStr = bDetail.details?.fecha_inicio || bDetail.check_in || bDetail.created_at
      
      const dataForPDF = {
        ...bDetail.custom_itinerary,
        booking_reference: bDetail.booking_reference,
        lead_traveler_name: bDetail.traveler_info?.name || bDetail.lead_traveler_name,
        lead_traveler_email: bDetail.traveler_info?.email || bDetail.lead_traveler_email,
        lead_traveler_phone: bDetail.traveler_info?.phone || bDetail.lead_traveler_phone,
        check_in: bDetail.check_in || bDetail.details?.fecha_inicio,
        check_out: bDetail.check_out || bDetail.details?.fecha_fin,
        adults: bDetail.adults || 2,
        children: bDetail.details?.ninos || 0,
        created_at: bDetail.created_at
      }

      const pdf = await generateItineraryPDF(dataForPDF)
      pdf.save(`Itinerario_AS_${refCode}.pdf`)
      
      toast({
        title: '¡Descarga Exitosa!',
        description: `El PDF de tu itinerario ${refCode} ha sido generado.`
      })
    } catch (err) {
      console.error('Error generating PDF:', err)
      toast({
        title: 'Error de generación',
        description: 'No pudimos estructurar el PDF de tu itinerario.',
        variant: 'destructive'
      })
    } finally {
      setGeneratingPDFId(null)
    }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-slate-900 mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Cargando tus itinerarios...</p>
        </div>
      </div>
    )
  }

  return (
    <PortalIntranetLayout>
      <div className="space-y-6">
        
        {/* BREADCRUMB */}
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Inicio</span>
          <span>&gt;</span>
          <span className="font-semibold text-slate-700">Tus Itinerarios</span>
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 font-serif">Tus Itinerarios</h1>
            <p className="text-xs text-slate-500 mt-1">Revisa el plan día por día de tus reservas enriquecidas con Inteligencia Artificial.</p>
          </div>
          
          <Button 
            onClick={() => router.push('/mis-reservas')}
            className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-xl"
          >
            Mis Reservaciones
          </Button>
        </div>

        {/* LISTADO DE ITINERARIOS EN TABLA POR RENGLÓN */}
        <Card className="border-gray-200/80 shadow-sm rounded-2xl bg-white overflow-hidden">
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Compass className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No tienes itinerarios activos</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Los itinerarios de tus reservas confirmadas aparecerán automáticamente aquí una vez generados.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {bookings.map((booking) => {
                const isExpanded = expandedBookingId === booking.id
                const details = typeof booking.special_requests === 'string' 
                  ? (booking.special_requests.startsWith('{') ? JSON.parse(booking.special_requests) : {})
                  : (booking.special_requests || {})

                const destName = booking.service_name || booking.destination || details.destination || details.tour_name || 'Viaje'
                const travelDateStr = details.fecha_inicio ? formatDate(details.fecha_inicio) : formatDate(booking.created_at)
                const paxCount = details.pasajeros || booking.adults || 2

                return (
                  <div key={booking.id} className="transition-all duration-300">
                    
                    {/* FILA / RENGLÓN */}
                    <div 
                      onClick={() => handleToggleExpand(booking.id)}
                      className={`flex flex-col md:flex-row justify-between items-start md:items-center p-5 cursor-pointer hover:bg-slate-50/60 transition-colors gap-4 ${
                        isExpanded ? 'bg-slate-50/40 border-b border-gray-100' : ''
                      }`}
                    >
                      {/* Información Básica */}
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 flex-shrink-0">
                          <Plane className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-sm md:text-base">
                            {destName}
                          </h3>
                          <div className="flex items-center gap-4 text-[11px] text-slate-500 mt-1">
                            <span className="font-bold text-slate-800">AS-{booking.booking_reference}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {travelDateStr}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {paxCount} {paxCount === 1 ? 'Persona' : 'Personas'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Estatus e Indicador */}
                      <div className="flex items-center gap-4 self-end md:self-auto flex-shrink-0">
                        <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-bold text-[10px] px-2.5 py-0.5 rounded-full hover:bg-blue-50">
                          IA Enriquecido
                        </Badge>
                        
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* VISTA DESPLEGADA (MOCKUP DEL PDF PREMIUM EN PANTALLA) */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden border-t border-slate-100 bg-white"
                        >
                          <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto">
                            {loadingDetail && (
                              <div className="py-12 flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                <p className="text-xs text-slate-500">Cargando detalles de tu itinerario...</p>
                              </div>
                            )}

                            {!loadingDetail && expandedBookingDetail && (
                              <>
                                {/* BOTÓN DESCARGAR ITINERARIO */}
                                <div className="flex justify-end gap-2 border-b border-gray-100 pb-4">
                                  <Button
                                    size="sm"
                                    onClick={() => handleDownloadPDF(expandedBookingDetail)}
                                    disabled={generatingPDFId === expandedBookingDetail.id}
                                    className="text-xs font-bold bg-[#003366] hover:bg-slate-800 text-white rounded-xl flex items-center gap-1.5 h-9 px-4"
                                  >
                                    {generatingPDFId === expandedBookingDetail.id ? (
                                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                                    ) : (
                                      <Download className="w-4 h-4 text-white" />
                                    )}
                                    Descargar Itinerario PDF Premium
                                  </Button>
                                </div>

                                {/* CABECERA DE ITINERARIO (3 COLUMNAS COMO EL PDF) */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
                                  
                                  {/* Columna 1: Info Reserva */}
                                  <div className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase text-[#003366] tracking-wider">Información de la Reserva</h4>
                                    <div className="text-xs space-y-1.5 font-medium text-slate-600">
                                      <p className="flex justify-between"><span className="text-slate-400">Localizador:</span> <span className="font-extrabold text-slate-900">AS-{expandedBookingDetail.booking_reference}</span></p>
                                      <p className="flex justify-between"><span className="text-slate-400">Titular:</span> <span className="font-bold text-slate-900">{expandedBookingDetail.traveler_info?.name || expandedBookingDetail.lead_traveler_name}</span></p>
                                      <p className="flex justify-between"><span className="text-slate-400">Email:</span> <span className="font-bold text-slate-900">{expandedBookingDetail.traveler_info?.email || expandedBookingDetail.lead_traveler_email}</span></p>
                                      <p className="flex justify-between"><span className="text-slate-400">Huéspedes:</span> <span className="font-bold text-slate-900">{expandedBookingDetail.adults || 2} adultos</span></p>
                                      <p className="flex justify-between"><span className="text-slate-400">Destino:</span> <span className="font-bold text-slate-900">{expandedBookingDetail.destination || destName}</span></p>
                                    </div>
                                  </div>

                                  {/* Columna 2: Foto Destino Ovalada */}
                                  <div className="flex justify-center items-center">
                                    <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-[#D4AF37] shadow-sm flex-shrink-0">
                                      <img 
                                        src={expandedBookingDetail.custom_itinerary?.hero_image || "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&w=400&q=80"} 
                                        alt="Destino" 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>

                                  {/* Columna 3: Resumen del viaje */}
                                  <div className="space-y-3">
                                    <h4 className="text-[10px] font-black uppercase text-[#003366] tracking-wider">Resumen del Viaje</h4>
                                    <div className="text-xs space-y-1.5 font-medium text-slate-600">
                                      <p className="flex justify-between"><span className="text-slate-400">Salida:</span> <span className="font-bold text-slate-900">{formatDate(expandedBookingDetail.check_in || expandedBookingDetail.details?.fecha_inicio || expandedBookingDetail.created_at)}</span></p>
                                      <p className="flex justify-between"><span className="text-slate-400">Regreso:</span> <span className="font-bold text-slate-900">{formatDate(expandedBookingDetail.check_out || expandedBookingDetail.details?.fecha_fin)}</span></p>
                                      <p className="flex justify-between">
                                        <span className="text-slate-400">Noches:</span> 
                                        <span className="font-bold text-slate-900">
                                          {expandedBookingDetail.check_in && expandedBookingDetail.check_out
                                            ? Math.ceil((new Date(expandedBookingDetail.check_out).getTime() - new Date(expandedBookingDetail.check_in).getTime()) / (1000*60*60*24))
                                            : (expandedBookingDetail.custom_itinerary?.days?.length || 1)
                                          } noches
                                        </span>
                                      </p>
                                      <p className="flex justify-between"><span className="text-slate-400">Transporte:</span> <span className="font-bold text-slate-900">Vuelo comercial</span></p>
                                      <p className="flex justify-between"><span className="text-slate-400">Alimentos:</span> <span className="font-bold text-slate-900">Desayuno incluido</span></p>
                                    </div>
                                  </div>
                                </div>

                                {/* DESCRIPCIÓN ACERCA DEL VIAJE */}
                                {expandedBookingDetail.custom_itinerary?.description && (
                                  <div className="bg-slate-50/30 p-5 rounded-2xl border border-slate-100 text-xs text-slate-600 leading-relaxed">
                                    <h4 className="font-bold text-slate-900 mb-1.5 text-sm">Descripción del itinerario:</h4>
                                    <p className="whitespace-pre-wrap">{expandedBookingDetail.custom_itinerary.description}</p>
                                  </div>
                                )}

                                {/* TIMELINE DE DÍAS (MAQUETA DEL PDF DÍA A DÍA) */}
                                <div className="space-y-8 relative pl-10 before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                                  {expandedBookingDetail.custom_itinerary?.days && expandedBookingDetail.custom_itinerary.days.map((day: any, dIdx: number) => (
                                    <div key={dIdx} className="relative group space-y-4">
                                      
                                      {/* Badge Día */}
                                      <span className="absolute -left-12 top-0 w-8 h-8 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center font-bold text-xs text-slate-700 shadow-2xs group-hover:bg-[#003366] group-hover:text-white transition-colors duration-300">
                                        {dIdx + 1}
                                      </span>

                                      {/* Info del día */}
                                      <div className="space-y-1">
                                        <h3 className="font-serif font-black text-slate-950 text-base md:text-lg">
                                          {day.title || `Día ${dIdx + 1}`}
                                        </h3>
                                        <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                                          <span>{day.date ? formatDate(day.date) : `Plan Día ${dIdx + 1}`}</span>
                                          {day.places?.[0]?.name && day.places?.[0]?.name !== 'Ubicación' && (
                                            <>
                                              <span>•</span>
                                              <span className="flex items-center text-slate-500">
                                                <MapPin className="w-3 h-3 text-[#003366] mr-0.5" />
                                                {day.places[0].name}
                                              </span>
                                            </>
                                          )}
                                        </p>
                                      </div>

                                      {/* Tarjeta del día */}
                                      <Card className="p-5 border-gray-100/90 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-2xl bg-[#FDFDFD]">
                                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                                          {day.description || day.desc || `Disfruta del día en tu destino con actividades sugeridas.`}
                                        </p>

                                        {/* Actividades del día */}
                                        {day.activities && day.activities.length > 0 && (
                                          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3.5">
                                            {day.activities.map((act: any, aIdx: number) => (
                                              <div key={aIdx} className="flex items-start gap-3">
                                                <div className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-[#003366] flex items-center gap-1 mt-0.5">
                                                  <Clock className="w-3 h-3" />
                                                  {act.time || '10:00'}
                                                </div>
                                                <div className="flex-1">
                                                  <h5 className="font-bold text-slate-900 text-xs">{act.title}</h5>
                                                  {act.description && (
                                                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{act.description}</p>
                                                  )}
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </Card>
                                    </div>
                                  ))}
                                </div>

                                {/* NOTAS, RECOMENDACIONES Y QR */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-slate-100">
                                  
                                  {/* Notas e Importante */}
                                  <div className="md:col-span-3 space-y-4">
                                    {expandedBookingDetail.custom_itinerary?.notes && (
                                      <div className="space-y-1">
                                        <h5 className="text-[10px] font-black uppercase text-[#003366]">Notas Importantes</h5>
                                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                                          {expandedBookingDetail.custom_itinerary.notes}
                                        </p>
                                      </div>
                                    )}

                                    {expandedBookingDetail.custom_itinerary?.recommendations && (
                                      <div className="space-y-1">
                                        <h5 className="text-[10px] font-black uppercase text-[#003366]">Recomendaciones de Viaje</h5>
                                        <p className="text-xs text-slate-500 leading-relaxed whitespace-pre-wrap">
                                          {expandedBookingDetail.custom_itinerary.recommendations}
                                        </p>
                                      </div>
                                    )}

                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 text-xs">
                                      <Info className="w-5 h-5 text-[#003366] shrink-0 mt-0.5" />
                                      <div>
                                        <p className="font-bold text-blue-900">¿Quieres ver este itinerario en tu móvil?</p>
                                        <p className="text-blue-700 mt-0.5 leading-relaxed">
                                          Escanea el código QR de la derecha desde tu teléfono para abrir la versión interactiva PWA que funciona sin conexión a internet durante tu viaje.
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* QR Code */}
                                  <div className="flex flex-col items-center justify-center p-4 border border-slate-100 rounded-3xl bg-slate-50/50 text-center">
                                    <QrCode className="w-12 h-12 text-[#003366] mb-2" />
                                    <h6 className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">Código de Acceso</h6>
                                    <p className="text-[9px] text-slate-400 mt-0.5">Escanea para tu versión PWA interactiva</p>
                                  </div>

                                </div>
                              </>
                            )}

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                  </div>
                )
              })}
            </div>
          )}
        </Card>

      </div>
    </PortalIntranetLayout>
  )
}
