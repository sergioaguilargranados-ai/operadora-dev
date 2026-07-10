"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Bell, Calendar as CalendarIcon, ChevronDown, ChevronRight, MapPin, Loader2 } from "lucide-react"
import { useAuth } from '@/contexts/AuthContext'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"
import { ItineraryRouteMap } from "@/components/mobile/ItineraryRouteMap"

export default function MobileItineraryListPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useAuth()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  
  const [loading, setLoading] = useState(true)
  const [itinerary, setItinerary] = useState<any>(null)
  const [tours, setTours] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // 1. Obtener el itinerario actual
        const resItinerary = await fetch(`/api/itineraries/${params.id}`)
        const dataItinerary = await resItinerary.json()
        
        if (dataItinerary.success && dataItinerary.data) {
          let dbItinerary = dataItinerary.data
          if (typeof dbItinerary.days === 'string') {
            try {
              dbItinerary.days = JSON.parse(dbItinerary.days)
            } catch (e) {
              dbItinerary.days = []
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
            
            setItinerary({
              title: pkg.name,
              destination: pkg.region,
              description: pkg.description,
              days: generatedDays
            })
          }
        }

        // 2. Obtener todas las reservas del usuario para el selector
        if (user?.id) {
          const token = localStorage.getItem('token') || ''
          const resBookings = await fetch(`/api/bookings?userId=${user.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (resBookings.ok) {
            const dataBookings = await resBookings.json()
            const bookingsList = dataBookings.data || []
            
            // Extraer solo aquellas reservas que tengan un tour_id en special_requests
            const userToursMap = new Map()
            bookingsList.forEach((b: any) => {
              try {
                const details = typeof b.special_requests === 'string' ? JSON.parse(b.special_requests) : (b.special_requests || {})
                if (details.tour_id && !userToursMap.has(details.tour_id)) {
                  userToursMap.set(details.tour_id, {
                    tour_id: details.tour_id,
                    name: b.service_name || details.tour_name || 'Viaje',
                    date: new Date(b.travel_date || b.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
                  })
                }
              } catch(e) {}
            })
            setTours(Array.from(userToursMap.values()))
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

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-24">
      
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 bg-[#FDFDFD] z-30">
        <button onClick={() => router.push('/mobile')} className="text-black hover:text-gray-600 p-2 -ml-2">
          <ChevronLeft className="w-7 h-7" />
        </button>
        <MobileLogo
          variant="dark"
          size="md"
          logoUrl={customLogoUrl}
        />
        <button onClick={() => router.push('/mobile/notificaciones')} className="text-black hover:text-gray-600 p-2 -mr-2">
          <Bell className="w-6 h-6" />
        </button>
      </div>

      {/* Title */}
      <div className="px-6 pt-4 pb-6">
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-2">Itinerario</h1>
        <p className="text-sm text-gray-500">
          Consulta el detalle de tu viaje día por día.
        </p>
      </div>

      {/* Trip Selector */}
      <div className="px-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center flex-shrink-0">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 overflow-hidden">
            <Select 
              value={params.id} 
              onValueChange={(val) => {
                if(val !== params.id) router.push(`/mobile/itinerario/${val}`)
              }}
            >
              <SelectTrigger className="w-full border-0 p-0 h-auto focus:ring-0 shadow-none bg-transparent text-left">
                <div className="flex flex-col items-start truncate w-full pr-2">
                  <h2 className="font-serif font-bold text-gray-900 text-lg truncate w-full">{itinerary?.title || "Mi Viaje"}</h2>
                  <p className="text-xs text-gray-500">
                    {tours.find(t => t.tour_id === params.id)?.date || "Fecha de viaje"}
                  </p>
                </div>
              </SelectTrigger>
              <SelectContent>
                {tours.map((tour, idx) => (
                  <SelectItem key={idx} value={tour.tour_id}>
                    {tour.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Ruta del Viaje (Mapa Minimalista) */}
      {days.length > 0 && (
        <div className="px-4 mb-6">
          <ItineraryRouteMap 
            cities={days.map((d: any) => d.places?.[0]?.name || d.title).filter(Boolean)} 
          />
        </div>
      )}

      {/* Days List */}
      <div className="px-4 space-y-4">
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
              className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60 flex flex-col gap-3 cursor-pointer hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 group"
            >
              {/* Subtle background gradient for each card */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-60 -z-10 transition-transform group-hover:scale-150"></div>
              
              <div className="flex gap-4">
                <img src={day.hero_image || "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?auto=format&fit=crop&w=400&q=80"} alt={day.title} className="w-24 h-24 rounded-2xl object-cover flex-shrink-0 shadow-sm" />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full mb-1 inline-block">
                      Día {day.day || index + 1}
                    </p>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-black transition-colors">
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                  <h3 className="font-serif font-bold text-gray-900 text-xl leading-tight mb-1">{day.title}</h3>
                  <div className="flex items-center gap-1 text-gray-500 mb-2">
                    <MapPin className="w-3 h-3 text-blue-400" />
                    <span className="text-xs">{day.places?.[0]?.name || "Ubicación"}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-end justify-between gap-4 mt-2">
                <p className="text-xs text-gray-600 leading-relaxed flex-1 line-clamp-2 bg-white/50 p-2 rounded-xl border border-gray-50">
                  {day.description || day.desc || `Disfruta de ${day.title} y sus maravillas.`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
