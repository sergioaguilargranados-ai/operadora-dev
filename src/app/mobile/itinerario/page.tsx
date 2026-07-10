"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ChevronRight, Calendar as CalendarIcon, Users, MapPin, Search } from "lucide-react"
import { useWhiteLabel } from "@/contexts/WhiteLabelContext"
import { MobileLogo } from "@/components/mobile/MobileLogo"

export default function MobileTripsListPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { logoUrl, logoMobileUrl } = useWhiteLabel()
  const customLogoUrl = logoMobileUrl || logoUrl || null
  
  const [loading, setLoading] = useState(true)
  const [upcomingTours, setUpcomingTours] = useState<any[]>([])
  const [pastTours, setPastTours] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming')

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push('/mobile/login')
      return
    }

    if (!user) return

    const fetchTours = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token') || ''
        const isAdmin = ['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(user?.role || '')
        const url = isAdmin ? '/api/bookings?userId=all' : `/api/bookings?userId=${user.id}`
        
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (res.ok) {
          const data = await res.json()
          const bookingsList = data.data || []
          
          const userToursMap = new Map()
          bookingsList.forEach((b: any) => {
            try {
              const details = typeof b.special_requests === 'string' ? JSON.parse(b.special_requests) : (b.special_requests || {})
              if (details.tour_id && !userToursMap.has(details.tour_id)) {
                
                const tripDate = new Date(b.travel_date || b.created_at)
                const now = new Date()
                
                userToursMap.set(details.tour_id, {
                  tour_id: details.tour_id,
                  name: b.service_name || details.tour_name || 'Viaje',
                  dateStr: tripDate.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }),
                  dateObj: tripDate,
                  pax: b.pax || details.pax || 2,
                  isPast: tripDate < now,
                  image: details.image_url || "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=400&q=80"
                })
              }
            } catch(e) {}
          })
          
          const allTours = Array.from(userToursMap.values())
          setUpcomingTours(allTours.filter(t => !t.isPast))
          setPastTours(allTours.filter(t => t.isPast))
        }
      } catch (error) {
        console.error("Error fetching tours:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTours()
  }, [user, isAuthenticated, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    )
  }

  const currentList = activeTab === 'upcoming' ? upcomingTours : pastTours

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-24">
      {/* Header */}
      <div className="px-4 pt-6 pb-2 flex items-center justify-center sticky top-0 bg-[#FDFDFD] z-30 border-b border-gray-100 shadow-sm">
        <MobileLogo variant="dark" size="md" logoUrl={customLogoUrl} />
      </div>

      {/* Title */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">Mis viajes</h1>
        <p className="text-sm text-gray-500">
          Consulta y organiza todos los viajes que tienes planeados en un solo lugar.
        </p>
      </div>

      {/* Tabs */}
      <div className="px-6 mb-6">
        <div className="flex bg-gray-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('upcoming')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'upcoming' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Próximos
          </button>
          <button 
            onClick={() => setActiveTab('past')}
            className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${activeTab === 'past' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pasados
          </button>
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-4">
        {currentList.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No tienes viajes {activeTab === 'upcoming' ? 'próximos' : 'pasados'}.</p>
            {activeTab === 'upcoming' && (
              <button 
                onClick={() => router.push('/mobile')}
                className="mt-4 px-6 py-2 bg-black text-white rounded-full text-sm font-medium"
              >
                Explorar destinos
              </button>
            )}
          </div>
        ) : (
          currentList.map((tour, index) => (
            <div 
              key={index}
              onClick={() => router.push(`/mobile/itinerario/${tour.tour_id}`)}
              className="bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <img 
                src={tour.image} 
                alt={tour.name} 
                className="w-24 h-32 rounded-2xl object-cover flex-shrink-0" 
              />
              <div className="flex-1 flex flex-col justify-center py-1">
                <h3 className="font-serif font-bold text-gray-900 text-lg leading-tight mb-2 pr-6 relative">
                  {tour.name}
                  <ChevronRight className="w-5 h-5 text-gray-400 absolute right-0 top-0.5 group-hover:text-black transition-colors" />
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <CalendarIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-xs">{tour.dateStr}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-xs">{tour.pax} personas</span>
                  </div>
                </div>
                
                <div className="mt-3">
                  <span className={`inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                    tour.isPast 
                      ? "bg-gray-100 text-gray-600" 
                      : "bg-green-50 text-green-700"
                  }`}>
                    {tour.isPast ? 'Viaje completado' : 'Próximo viaje'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}
