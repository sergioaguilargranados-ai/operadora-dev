// Build: 21 Jul 2026 - 13:55 CST - v2.426
"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  ChevronLeft, Bell, Calendar as CalendarIcon, ChevronRight, MapPin, Loader2, 
  Bookmark, CheckCircle2, Bed, Tag, Users, Plane, ClipboardList, Info, 
  Shield, Download, FileText, Smartphone, Globe
} from "lucide-react"
import NotificationBell from "@/components/mobile/NotificationBell"
import { useAuth } from '@/contexts/AuthContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { ItineraryRouteMap } from "@/components/mobile/ItineraryRouteMap"
import { useToast } from "@/hooks/use-toast"

export default function MobileItineraryListPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  
  const [loading, setLoading] = useState(true)
  const [itinerary, setItinerary] = useState<any>(null)
  const [tours, setTours] = useState<any[]>([])
  const [activeBooking, setActiveBooking] = useState<any>(null)
  const [profileDocs, setProfileDocs] = useState<any[]>([])
  const [isBookmarked, setIsBookmarked] = useState(false)
  const searchParams = useSearchParams()
  const tabParam = searchParams?.get('tab') as 'resumen' | 'itinerario' | 'documentos' | null
  const [activeTab, setActiveTab] = useState<'resumen' | 'itinerario' | 'documentos'>(tabParam || 'resumen')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 1. Obtener el itinerario actual
        const resItinerary = await fetch(`/api/itineraries/${params.id}`)
        const dataItinerary = await resItinerary.json()
        
        let dbItinerary: any = null
        if (dataItinerary.success && dataItinerary.data) {
          dbItinerary = dataItinerary.data
          if (typeof dbItinerary.days === 'string') {
            try {
              dbItinerary.days = JSON.parse(dbItinerary.days)
            } catch (e) {
              dbItinerary.days = []
            }
          }

          // Reparar si el Día 1 guardado es en realidad la descripción de MegaTravel
          if (dbItinerary.days && dbItinerary.days.length > 0) {
            const first = dbItinerary.days[0]
            const second = dbItinerary.days.length > 1 ? dbItinerary.days[1] : null
            const fTitle = (first.title || '').toUpperCase()
            const sTitle = (second?.title || '').toUpperCase()
            
            if (
              (fTitle.includes('DÍAS') && fTitle.includes('NOCHES')) ||
              (fTitle.length > 50 && !fTitle.startsWith('DÍA') && !fTitle.startsWith('DIA')) ||
              (sTitle.includes('DÍA 1') || sTitle.includes('DIA 1'))
            ) {
              if (!dbItinerary.description) {
                dbItinerary.description = first.title + (first.description ? " " + first.description : "")
              }
              if (dbItinerary.days.length > 1) {
                dbItinerary.days.shift()
              }
            }
          }
          setItinerary(dbItinerary)
        } else {
          // Fallback a MegaTravel si no existe itinerario personalizado
          const resGroup = await fetch(`/api/groups/${params.id}`)
          const dataGroup = await resGroup.json()
          if (dataGroup.success && dataGroup.data) {
            const pkg = dataGroup.data
            const generatedDays = (pkg.itinerary || []).map((dayItem: any, index: number) => ({
              day: dayItem.day || index + 1,
              title: dayItem.title || `Día ${index + 1}`,
              desc: dayItem.description || '',
              description: dayItem.description || '',
              hero_image: pkg.images?.main || '',
              places: [{ name: pkg.region || 'Ubicación' }]
            }))
            
            let pkgDesc = pkg.description || ''
            if (generatedDays.length > 0) {
              const first = generatedDays[0]
              const second = generatedDays.length > 1 ? generatedDays[1] : null
              const fTitle = (first.title || '').toUpperCase()
              const sTitle = (second?.title || '').toUpperCase()
              
              if (
                (fTitle.includes('DÍAS') && fTitle.includes('NOCHES')) ||
                (fTitle.length > 50 && !fTitle.startsWith('DÍA') && !fTitle.startsWith('DIA')) ||
                (sTitle.includes('DÍA 1') || sTitle.includes('DIA 1'))
              ) {
                if (!pkgDesc) {
                  pkgDesc = first.title + (first.description ? " " + first.description : "")
                }
                if (generatedDays.length > 1) {
                  generatedDays.shift()
                }
              }
            }

            dbItinerary = {
              title: pkg.name,
              destination: pkg.region,
              description: pkgDesc,
              days: generatedDays,
              hero_image: pkg.images?.main
            }
            setItinerary(dbItinerary)
          }
        }

        // 2. Obtener todas las reservas del usuario para el selector y datos activos
        if (user?.id) {
          const token = localStorage.getItem('token') || ''
          
          // Obtener documentos de perfil del usuario
          try {
            const resProfile = await fetch(`/api/mobile/profile?user_id=${user.id}&t=${Date.now()}`)
            const dataProfile = await resProfile.json()
            if (dataProfile.success && dataProfile.data?.documents) {
              setProfileDocs(dataProfile.data.documents)
            }
          } catch(pe) {
            console.error("Error fetching user documents:", pe)
          }

          const resBookings = await fetch(`/api/bookings?userId=${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (resBookings.ok) {
            const dataBookings = await resBookings.json()
            const bookingsList = dataBookings.data || []
            
            const userToursMap = new Map()
            let matchedBooking = null
            
            bookingsList.forEach((b: any) => {
              try {
                const details = typeof b.special_requests === 'string' ? JSON.parse(b.special_requests) : (b.special_requests || {})
                const tripId = details.tour_id || b.id.toString()
                
                const dateObj = new Date(b.travel_date || details.fecha_inicio || b.created_at)
                const bookingData = {
                  tour_id: tripId,
                  name: b.service_name || details.tour_name || details.destination || 'Viaje',
                  dateStr: dateObj.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }),
                  dateObj: dateObj,
                  pax: b.pax || details.pax || details.pasajeros || b.adults || 2,
                  booking_reference: b.booking_reference || `AS-${b.id || '987654'}`,
                  image: details.image_url || dbItinerary?.hero_image || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"
                }

                if (!userToursMap.has(tripId)) {
                  userToursMap.set(tripId, bookingData)
                }

                if (tripId === params.id) {
                  matchedBooking = bookingData
                }
              } catch(e) {}
            })

            setTours(Array.from(userToursMap.values()))
            if (matchedBooking) {
              setActiveBooking(matchedBooking)
            } else if (userToursMap.has(params.id)) {
              setActiveBooking(userToursMap.get(params.id))
            } else {
              // Fallback default info
              setActiveBooking({
                tour_id: params.id,
                name: dbItinerary?.title || 'Mi Viaje',
                dateStr: '15 - 24 de junio, 2026',
                dateObj: new Date('2026-06-15T00:00:00'),
                pax: 2,
                booking_reference: 'AS-123456',
                image: dbItinerary?.hero_image || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"
              })
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [params.id, user?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const days = itinerary?.days || []

  // Calcular días restantes para el viaje
  const getDaysRemainingText = (dateObj: Date | null) => {
    if (!dateObj) return "";
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const tripDate = new Date(dateObj)
    tripDate.setHours(0, 0, 0, 0)
    
    const diffTime = tripDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays > 0) {
      return `⏳ En ${diffDays} día${diffDays > 1 ? 's' : ''}`
    } else if (diffDays === 0) {
      return "✨ ¡Hoy es tu viaje!"
    } else {
      return "✅ Completado"
    }
  }

  const isTripPast = activeBooking?.dateObj ? (new Date(activeBooking.dateObj) < new Date()) : false

  // Alojamientos simulados premium basados en el destino del viaje
  const getMockHotels = () => {
    const title = (itinerary?.title || itinerary?.destination || '').toLowerCase()
    if (title.includes('grecia') || title.includes('atenas')) {
      return [
        {
          name: "AthenaWas Hotel",
          city: "Atenas, Grecia",
          dates: "15 - 17 de junio, 2026",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Santorini Palace",
          city: "Santorini, Grecia",
          dates: "17 - 20 de junio, 2026",
          image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=400&q=80"
        }
      ]
    } else if (title.includes('paris') || title.includes('francia') || title.includes('romántic')) {
      return [
        {
          name: "Hôtel Le Marais",
          city: "París, Francia",
          dates: "3 - 5 de marzo, 2024",
          image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=400&q=80"
        },
        {
          name: "Hôtel Des Arts Montmartre",
          city: "París, Francia",
          dates: "5 - 8 de marzo, 2024",
          image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=400&q=80"
        }
      ]
    } else {
      // General fallback
      return [
        {
          name: "Grand Plaza Hotel",
          city: itinerary?.destination || "Ciudad Destino",
          dates: activeBooking?.dateStr || "Próximas fechas",
          image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"
        }
      ]
    }
  }

  const handleDownload = (docName: string) => {
    toast({
      title: "Descargando documento",
      description: `Iniciando la descarga de: ${docName}`
    })
    
    // Simular descarga de archivo creando un enlace temporal
    setTimeout(() => {
      const link = document.createElement('a')
      link.href = "#"
      link.setAttribute('download', `${docName.toLowerCase().replace(/\s+/g, '_')}.pdf`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }, 1000)
  }

  // Validar si el documento personal existe en la cuenta del usuario
  const getPersonalDocStatus = (docType: string) => {
    const found = profileDocs.find(d => d.name.toLowerCase().includes(docType.toLowerCase()))
    if (found && found.url) {
      return { status: "Vigente", color: "bg-green-50 text-green-700 border border-green-200", action: () => window.open(found.url, '_blank') }
    }
    
    if (docType.toLowerCase().includes('visa') && !(itinerary?.destination || '').toLowerCase().includes('eeuu') && !(itinerary?.destination || '').toLowerCase().includes('estados unidos')) {
      return { status: "No aplica", color: "bg-gray-100 text-gray-600 border border-gray-200", action: null }
    }
    
    return { status: "Pendiente", color: "bg-amber-50 text-amber-700 border border-amber-200", action: () => router.push('/mobile/perfil') }
  }

  const mockHotels = getMockHotels()

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-24">
      
      {/* Top Navigation */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between bg-white z-30 relative">
        <button onClick={() => router.push('/mobile/itinerario')} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <MobileLogo variant="dark" size="sm" logoUrl={customLogoUrl} />
        <button 
          onClick={() => {
            setIsBookmarked(!isBookmarked)
            toast({
              title: isBookmarked ? "Marcador eliminado" : "Viaje guardado",
              description: isBookmarked ? "Removido de favoritos" : "Guardado en tus favoritos"
            })
          }} 
          className="p-2 -mr-2 text-black hover:text-gray-600"
        >
          <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-black' : ''}`} />
        </button>
      </div>

      {/* Selector de Viajes */}
      <div className="px-4 mb-4">
        <div className="bg-gray-50 rounded-2xl p-2 border border-gray-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 pl-2">Seleccionando viaje:</span>
          <Select 
            value={params.id} 
            onValueChange={(val) => {
              if (val !== params.id) router.push(`/mobile/itinerario/${val}`)
            }}
          >
            <SelectTrigger className="w-[180px] border-0 h-8 focus:ring-0 shadow-none bg-transparent font-bold text-xs text-gray-900 justify-end gap-1">
              <SelectValue placeholder="Selecciona viaje" />
            </SelectTrigger>
            <SelectContent>
              {tours.map((tour, idx) => (
                <SelectItem key={idx} value={tour.tour_id} className="text-xs">
                  {tour.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hero Card Image */}
      <div className="px-4 mb-4">
        <div className="relative rounded-3xl overflow-hidden shadow-lg h-56">
          <img 
            src={activeBooking?.image || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=800&q=80"} 
            alt={itinerary?.title || "Viaje"} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Floating days remaining tag */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur px-3.5 py-1.5 rounded-full shadow-sm text-xs font-bold text-gray-900">
            {getDaysRemainingText(activeBooking?.dateObj || null)}
          </div>
        </div>
      </div>

      {/* Title & Info */}
      <div className="px-6 pb-6 text-center">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2 leading-tight">
          {itinerary?.title || "Mi Viaje"}
        </h1>
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <CalendarIcon className="w-3.5 h-3.5" />
          <span>{activeBooking?.dateStr || "Fechas de viaje"}</span>
          <span className="mx-1">•</span>
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{itinerary?.destination || "Destino"}</span>
        </p>
      </div>

      {/* Tab Segmented Bar */}
      <div className="px-4 mb-6">
        <div className="flex bg-gray-100 p-1.5 rounded-full">
          {(['resumen', 'itinerario', 'documentos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 text-xs font-bold rounded-full transition-all ${
                activeTab === tab 
                  ? 'bg-black text-white shadow-sm' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'resumen' ? 'Resumen' : tab === 'itinerario' ? 'Itinerario' : 'Documentos'}
            </button>
          ))}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="px-4">
        
        {/* PESTAÑA RESUMEN */}
        {activeTab === 'resumen' && (
          <div className="space-y-6">
            
            {/* Resumen del viaje Box */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
              <h3 className="font-serif font-bold text-lg text-gray-900">Resumen del viaje</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {itinerary?.description || "Descubre los paisajes increíbles, monumentos históricos y la mejor gastronomía en esta aventura diseñada para ti."}
              </p>
              
              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-50">
                <div className="flex flex-col items-center text-center p-1.5">
                  <Plane className="w-5 h-5 text-gray-800 mb-1" strokeWidth={1.5} />
                  <span className="text-[10px] text-gray-400">Duración</span>
                  <span className="text-[11px] font-bold text-gray-800 mt-0.5">{days.length} días</span>
                </div>
                <div className="flex flex-col items-center text-center p-1.5 border-l border-gray-50">
                  <Bed className="w-5 h-5 text-gray-800 mb-1" strokeWidth={1.5} />
                  <span className="text-[10px] text-gray-400">Alojamiento</span>
                  <span className="text-[11px] font-bold text-gray-800 mt-0.5">{mockHotels.length} hoteles</span>
                </div>
                <div className="flex flex-col items-center text-center p-1.5 border-l border-gray-50">
                  <Users className="w-5 h-5 text-gray-800 mb-1" strokeWidth={1.5} />
                  <span className="text-[10px] text-gray-400">Personas</span>
                  <span className="text-[11px] font-bold text-gray-800 mt-0.5">{activeBooking?.pax || 2} adultos</span>
                </div>
                <div className="flex flex-col items-center text-center p-1.5 border-l border-gray-50">
                  <Tag className="w-5 h-5 text-gray-800 mb-1" strokeWidth={1.5} />
                  <span className="text-[10px] text-gray-400">Reserva</span>
                  <span className="text-[10px] font-bold text-gray-800 mt-0.5 truncate max-w-full">
                    {activeBooking?.booking_reference || "AS-123456"}
                  </span>
                </div>
              </div>
            </div>

            {/* Próximos pasos Timeline */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-serif font-bold text-lg text-gray-900">Próximos pasos</h3>
                {isTripPast && (
                  <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                    Completado
                  </span>
                )}
              </div>
              
              <div className="space-y-4 relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                {/* Paso 1: Pago */}
                <div className="relative">
                  <span className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border bg-white ${
                    isTripPast || activeBooking?.booking_reference ? 'border-green-500 text-green-600' : 'border-gray-300'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white" />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900">Pago confirmado</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {activeBooking?.dateStr ? `Confirmado el ${activeBooking.dateStr.split(',')[0]}` : "Confirmado"}
                  </p>
                </div>

                {/* Paso 2: Documentos */}
                <div className="relative">
                  <span className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border bg-white ${
                    isTripPast ? 'border-green-500 text-green-600' : 'border-gray-300'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white" />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900">Documentos de viaje</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isTripPast ? "Entregados" : "Disponibles 7 días antes de tu viaje"}
                  </p>
                </div>

                {/* Paso 3: Check-in */}
                <div className="relative">
                  <span className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border bg-white ${
                    isTripPast ? 'border-green-500 text-green-600' : 'border-gray-300'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white" />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900">Check-in de vuelos</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isTripPast ? "Completado" : "Disponible 24 horas antes del vuelo"}
                  </p>
                </div>

                {/* Paso 4: Viaje */}
                <div className="relative">
                  <span className={`absolute -left-6 top-0.5 w-4.5 h-4.5 rounded-full flex items-center justify-center border bg-white ${
                    isTripPast ? 'border-green-500 text-green-600' : 'border-gray-300'
                  }`}>
                    <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white" />
                  </span>
                  <h4 className="text-xs font-bold text-gray-900">{isTripPast ? "Viaje completado" : "Recordatorio de viaje"}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isTripPast ? "Esperamos que hayas disfrutado tu viaje." : "Te avisaremos antes de tu viaje"}
                  </p>
                </div>
              </div>
            </div>

            {/* Alojamiento Section */}
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-lg text-gray-900 px-2">Alojamiento</h3>
              
              <div className="space-y-3">
                {mockHotels.map((hotel, index) => (
                  <div key={index} className="bg-white rounded-3xl p-3 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex gap-4">
                    <img 
                      src={hotel.image} 
                      alt={hotel.name} 
                      className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-serif font-bold text-gray-900 text-base leading-tight mb-1">{hotel.name}</h4>
                      <p className="text-[10px] text-gray-500 flex items-center gap-1 mb-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {hotel.city}
                      </p>
                      <p className="text-[10px] font-bold text-gray-800">{hotel.dates}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
        )}

        {/* PESTAÑA ITINERARIO */}
        {activeTab === 'itinerario' && (
          <div className="space-y-6">
            
            {/* Ruta del Viaje (Mapa Minimalista) */}
            {days.length > 0 && (
              <ItineraryRouteMap 
                cities={(() => {
                  const mappedCities = days.map((d: any) => {
                    const placeName = d.places?.[0]?.name;
                    return (placeName && placeName !== 'Ubicación') ? placeName : null;
                  }).filter(Boolean);
                  
                  return mappedCities.length > 0 ? mappedCities : (itinerary?.destination ? [itinerary.destination] : []);
                })()} 
              />
            )}

            {/* Descripción General */}
            {itinerary?.description && (
              <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-sm border border-gray-100 p-5">
                <h3 className="font-bold text-gray-900 mb-2">Acerca del Viaje</h3>
                <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {itinerary.description?.replace(/El\s+mejor\s+Viaje\s*!!/gi, '¡El mejor viaje!').replace(/[¿¡]?El mejor viaje\s*[!?]+/gi, '¡El mejor viaje!')}
                </p>
              </div>
            )}

            {/* Lista de Días */}
            <div className="space-y-4">
              {days.length === 0 ? (
                <div className="text-center py-12 bg-white/70 backdrop-blur-lg rounded-3xl shadow-sm border border-gray-100">
                  <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Aún no hay días configurados en este itinerario.</p>
                </div>
              ) : (
                days.map((day: any, index: number) => (
                  <div 
                    key={index}
                    onClick={() => router.push(`/mobile/itinerario/${params.id}/dia/${index}`)}
                    className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col gap-3 cursor-pointer hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-60 -z-10 transition-transform group-hover:scale-150"></div>
                    
                    <div className="flex gap-4">
                      <img src={day.hero_image || "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=400&q=80"} alt={day.title} className="w-20 h-20 rounded-2xl object-cover flex-shrink-0 shadow-sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                            Día {index + 1}
                          </p>
                          <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black transition-colors">
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" />
                          </div>
                        </div>
                        <h3 className="font-serif font-bold text-gray-900 text-lg leading-tight mb-1 truncate">{day.title}</h3>
                        <div className="flex items-center gap-1 text-gray-500 mb-2">
                          <MapPin className="w-3 h-3 text-blue-400" />
                          <span className="text-[10px] truncate">{day.places?.[0]?.name || "Ubicación"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-[11px] text-gray-600 leading-relaxed bg-white/50 p-2 rounded-xl border border-gray-50 line-clamp-2">
                      {day.description || day.desc || `Disfruta de ${day.title} y sus maravillas.`}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* PESTAÑA DOCUMENTOS */}
        {activeTab === 'documentos' && (
          <div className="space-y-6">
            
            <p className="text-xs text-gray-500 px-2">
              Aquí encontrarás todos los documentos importantes para tu viaje.
            </p>

            {/* Documentos Personales */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
              <h3 className="font-serif font-bold text-lg text-gray-900">Documentos personales</h3>
              
              <div className="space-y-3">
                {[
                  { name: "Pasaporte", desc: "Válido hasta el 15 de diciembre, 2028", icon: <Globe className="w-5 h-5 text-gray-800" />, type: "pasaporte" },
                  { name: "Identificación oficial", desc: "INE o Licencia de conducir", icon: <FileText className="w-5 h-5 text-gray-800" />, type: "ine" },
                  { name: "Visa Schengen", desc: "No requerido para mexicanos", icon: <Shield className="w-5 h-5 text-gray-800" />, type: "visa" }
                ].map((doc, idx) => {
                  const check = getPersonalDocStatus(doc.type)
                  return (
                    <div 
                      key={idx} 
                      onClick={() => check.action && check.action()}
                      className={`flex items-center justify-between p-3 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors ${check.action ? 'cursor-pointer' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                          {doc.icon}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900">{doc.name}</h4>
                          <p className="text-[10px] text-gray-400">{doc.desc}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${check.color}`}>
                        {check.status}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Documentos de viaje */}
            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] space-y-4">
              <h3 className="font-serif font-bold text-lg text-gray-900">Documentos del viaje</h3>
              
              <div className="space-y-3">
                {[
                  { name: "Vuelos", detail: `${itinerary?.destination || 'Atenas'} - ${activeBooking?.dateStr ? activeBooking.dateStr.split('de')[0] : '15 jun.'}`, icon: <Plane className="w-5 h-5 text-gray-800" /> },
                  { name: "Reserva de hotel", detail: `${mockHotels.length} hoteles`, icon: <Bed className="w-5 h-5 text-gray-800" /> },
                  { name: "Seguro de viaje", detail: `Cobertura activa`, icon: <Shield className="w-5 h-5 text-gray-800" /> },
                  { name: "Itinerario completo", detail: "Plan día por día", icon: <ClipboardList className="w-5 h-5 text-gray-800" /> }
                ].map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl border border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                        {doc.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{doc.name}</h4>
                        <p className="text-[10px] text-gray-400">{doc.detail}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownload(doc.name)}
                      className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-800 transition-colors"
                      title={`Descargar ${doc.name}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Info Tip Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-blue-800 mb-0.5">Consejo para tu viaje</h4>
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  Asegúrate de llevar tus documentos en físico y digital. Te recomendamos tener copias de seguridad.
                </p>
              </div>
            </div>

          </div>
        )}

      </div>
      
    </div>
  )
}
